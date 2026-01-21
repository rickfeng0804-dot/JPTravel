import { GoogleGenAI, Type } from "@google/genai";
import { TripFormData, ItineraryResult, DayPlan } from "../types";

// Initialize the client. 
// NOTE: Process.env.API_KEY is handled by the runtime environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates the text-based itinerary using Gemini 3 Pro.
 */
export const generateItinerary = async (formData: TripFormData): Promise<ItineraryResult> => {
  const prompt = `
    請以「資深日本在地導遊」的身分，為前往 ${formData.destination} 的旅行制定一份深度且道地的行程表。
    
    詳細資訊：
    - 天數：${formData.days} 天
    - 人數：${formData.travelers} 人
    - 出發日期：${formData.startDate}
    - 興趣/景點：${formData.interests}
    - 美食偏好：${formData.foodPreferences}
    - 住宿風格：${formData.accommodation}
    - 交通方式：${formData.transportation}
    
    **航班與時間限制 (極重要)：**
    - 出發航班時間：${formData.departureTime}
    - 預計飛行時間：${formData.flightDuration} 小時
    - 回程航班時間：${formData.returnTime}

    **購物與伴手禮需求：**
    - ${formData.souvenirPreferences ? `使用者想購買：${formData.souvenirPreferences}` : '請推薦當地特色土特產與必買禮品'}
    
    **核心規劃重點 (請優先考慮)：**
    1. **發掘在地靈魂**：除了必去地標外，請優先穿插**私房景點 (Hidden Gems)**、**私房絕景**或**季節限定的祭典/活動 (Matsuri)** (若日期相符)。
    2. **深度體驗**：根據興趣 "${formData.interests}"，安排能與當地文化互動的體驗 (例如：參拜神社的正確方式、體驗傳統工藝、逛在地市集等)。
    3. **味蕾探險**：根據美食偏好 "${formData.foodPreferences}"，請推薦**在地人愛去的隱藏版美食**、老舖或特色屋台，避免僅列出連鎖觀光餐廳。
    4. **流暢動線**：確保私房景點與主要行程之間的交通動線順暢，將在地體驗自然融入每日行程。

    **規劃規則：**
    1. **第一天行程**：
       - 請計算預計抵達時間 (假設目的地日本時區比出發地快1小時，且需加上入境與交通時間約1.5小時)。
       - **第一天的活動請務必在「預計抵達並完成入境後」才開始**。
    2. **最後一天行程**：
       - **所有活動必須在回程航班起飛前「3小時」結束**，並安排前往機場的交通。
       - 例如：若回程是 15:00，則行程請在 12:00 前結束，並開始前往機場。
    3. **所有輸出內容必須使用「繁體中文 (Traditional Chinese)」**。
    4. 請提供一個吸引人的標題、簡短的行程摘要 (請提及本次行程的獨特亮點)。
    5. 每日行程需包含時間、具體地點名稱、活動說明及預算估算。
       - **活動說明中，若該地點為私房景點或特殊體驗，請特別標註其獨特之處**。
    6. **請額外提供一份「必買土特產及禮品清單」**，請推薦具當地文化特色、老舖限定或具有故事性的商品 (5-8項)，而非一般機場常見禮盒。
    7. **請額外提供一份「必吃美食清單」**，推薦具當地特色、隱藏版美食或老舖 (5-8項)，這些可以是具體的菜色名稱或特定名店。
    8. **每個活動請標記類型 (type)**，只能是以下之一：
       - 'sightseeing': 觀光景點、參觀
       - 'food': 用餐、咖啡廳、小吃
       - 'transport': 交通移動、搭車、飛機
       - 'shopping': 購物、逛街
       - 'accommodation': 飯店入住、休息
       - 'other': 其他
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "旅行的創意標題 (繁體中文)" },
          summary: { type: Type.STRING, description: "行程摘要與氛圍描述 (繁體中文)" },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                theme: { type: Type.STRING, description: "當日主題 (例如：巷弄散策、祭典巡禮) (繁體中文)" },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING, description: "時間 (例如：09:00)" },
                      activity: { type: Type.STRING, description: "活動或地點名稱 (繁體中文)" },
                      description: { type: Type.STRING, description: "活動內容、實用建議、私房亮點介紹 (繁體中文)" },
                      location: { type: Type.STRING, description: "具體地點/區域 (繁體中文)" },
                      costEstimate: { type: Type.STRING, description: "預估費用 (例如：500 TWD / 2000 JPY)" },
                      type: { 
                        type: Type.STRING, 
                        description: "活動類型",
                        enum: ["sightseeing", "food", "transport", "shopping", "accommodation", "other"]
                      }
                    },
                    required: ["time", "activity", "description", "location", "type"]
                  }
                }
              },
              required: ["day", "theme", "activities"]
            }
          },
          recommendedSouvenirs: {
            type: Type.ARRAY,
            description: "推薦的土特產與禮品清單 (著重在地限定與特色)",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "商品名稱" },
                description: { type: Type.STRING, description: "商品介紹、特色與購買理由" },
                bestPlaceToBuy: { type: Type.STRING, description: "推薦購買地點 (例如：本店、特定市集)" },
                estimatedPrice: { type: Type.STRING, description: "參考價格" }
              },
              required: ["name", "description", "bestPlaceToBuy", "estimatedPrice"]
            }
          },
          recommendedFood: {
            type: Type.ARRAY,
            description: "推薦的必吃美食清單",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "美食名稱" },
                description: { type: Type.STRING, description: "口感特色或必吃理由" },
                bestPlaceToEat: { type: Type.STRING, description: "推薦店家或區域" },
                estimatedPrice: { type: Type.STRING, description: "參考價格" }
              },
              required: ["name", "description", "bestPlaceToEat", "estimatedPrice"]
            }
          }
        },
        required: ["title", "summary", "days", "recommendedSouvenirs", "recommendedFood"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No itinerary generated.");
  
  return JSON.parse(text) as ItineraryResult;
};