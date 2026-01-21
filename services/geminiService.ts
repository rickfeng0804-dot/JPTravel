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
    請為前往 ${formData.destination} 的旅行制定一份詳細的行程表。
    
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
    
    **規劃規則：**
    1. **第一天行程**：
       - 請計算預計抵達時間 (假設目的地時區比出發地快1小時，且需加上入境與交通時間約1.5小時)。
       - **第一天的活動請務必在「預計抵達並完成入境後」才開始**。
    2. **最後一天行程**：
       - **所有活動必須在回程航班起飛前「3小時」結束**，並安排前往機場的交通。
       - 例如：若回程是 15:00，則行程請在 12:00 前結束，並開始前往機場。
    3. **所有輸出內容必須使用「繁體中文 (Traditional Chinese)」**。
    4. 請提供一個吸引人的標題、簡短的行程摘要。
    5. 每日行程需包含時間、具體地點名稱、活動說明及預算估算。
    6. **請額外提供一份「必買土特產及禮品清單」**，根據目的地與使用者需求推薦5-8項商品。
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
                theme: { type: Type.STRING, description: "當日主題 (例如：古都漫步) (繁體中文)" },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING, description: "時間 (例如：09:00)" },
                      activity: { type: Type.STRING, description: "活動或地點名稱 (繁體中文)" },
                      description: { type: Type.STRING, description: "活動內容、實用建議 (繁體中文)" },
                      location: { type: Type.STRING, description: "具體地點/區域 (繁體中文)" },
                      costEstimate: { type: Type.STRING, description: "預估費用 (例如：500 TWD)" }
                    },
                    required: ["time", "activity", "description", "location"]
                  }
                }
              },
              required: ["day", "theme", "activities"]
            }
          },
          recommendedSouvenirs: {
            type: Type.ARRAY,
            description: "推薦的土特產與禮品清單",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "商品名稱" },
                description: { type: Type.STRING, description: "商品介紹與特色" },
                bestPlaceToBuy: { type: Type.STRING, description: "推薦購買地點" },
                estimatedPrice: { type: Type.STRING, description: "參考價格" }
              },
              required: ["name", "description", "bestPlaceToBuy", "estimatedPrice"]
            }
          }
        },
        required: ["title", "summary", "days", "recommendedSouvenirs"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No itinerary generated.");
  
  return JSON.parse(text) as ItineraryResult;
};
