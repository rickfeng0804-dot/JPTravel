import { GoogleGenAI, Type } from "@google/genai";
import { TripFormData, ItineraryResult, DayPlan } from "../types";

// Initialize the client. 
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates the text-based itinerary using Gemini 3 Pro.
 */
export const generateItinerary = async (formData: TripFormData): Promise<ItineraryResult> => {
  // Construct a string detailing day-by-day preferences if they exist
  let dayPreferencesString = "";
  if (formData.dayPreferences && formData.dayPreferences.length > 0) {
    const details = formData.dayPreferences
      .filter(p => p.location.trim() !== "" || p.accommodation.trim() !== "")
      .map(p => {
        const loc = p.location ? `指定地點: ${p.location}` : "";
        const acc = p.accommodation ? `指定住宿: ${p.accommodation}` : "";
        return `    - Day ${p.day}: ${loc} ${acc}`;
      })
      .join("\n");
    
    if (details) {
      dayPreferencesString = `\n    **每日詳細指定 (必須嚴格遵守):**\n${details}`;
    }
  }

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
    ${dayPreferencesString}
    
    **航班與時間限制 (極重要)：**
    - 出發航班時間：${formData.departureTime}
    - 預計飛行時間：${formData.flightDuration} 小時
    - 回程航班時間：${formData.returnTime}

    **核心規劃重點：**
    1. **第一天行程**：請計算預計抵達時間。第一天的活動請務必在「預計抵達並完成入境後」才開始。
    2. **最後一天行程**：所有活動必須在回程航班起飛前「3小時」結束。
    3. **交通與移動細節 (Travel Logistics)**：
       - 對於每一個活動(除了當天第一個活動)，請計算**從上一個地點移動到此地點**的交通方式。
       - 請明確指出建議的**交通工具與路線名稱** (例如: "搭乘 JR 山手線", "搭乘東京地鐵銀座線", "步行", "計程車")。
       - **尖峰時刻警告**：若移動時間落在平日早上 7:30-9:00 或 傍晚 17:00-19:30，且位於大城市(如東京、大阪)，請務必標記「尖峰時刻警告」，並在說明中建議避開或預留更多時間。
    4. **行程順暢度**：請確保每日行程的地理位置順暢，不要來回奔波。
    5. **繁體中文輸出**：所有文字說明請使用繁體中文。
    6. **地理座標**：請盡可能精確提供每個景點或活動地點的經緯度 (lat, lng)。

    **重要提醒功能 (Critical):**
    請務必檢查使用者的旅遊日期 (${formData.startDate} 起共 ${formData.days} 天) 是否遇到：
    - 日本國定假日 (如：黃金週、盂蘭盆節、新年、白銀週、國定休日)。
    - 當地大型祭典或活動 (如：祇園祭、花火大會、雪祭等)。
    - 特殊季節現象 (如：梅雨季、颱風季、賞櫻/賞楓預測)。
    若有遇到，請在 'specialAlerts' 欄位中詳細列出，並說明注意事項。
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
                theme: { type: Type.STRING, description: "當日主題 (繁體中文)" },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING, description: "時間" },
                      activity: { type: Type.STRING, description: "活動或地點名稱" },
                      description: { type: Type.STRING, description: "活動內容" },
                      location: { type: Type.STRING, description: "具體地點" },
                      costEstimate: { type: Type.STRING, description: "預估費用" },
                      type: { 
                        type: Type.STRING, 
                        enum: ["sightseeing", "food", "transport", "shopping", "accommodation", "other"]
                      },
                      geo: {
                        type: Type.OBJECT,
                        description: "地點的經緯度座標",
                        properties: {
                          lat: { type: Type.NUMBER },
                          lng: { type: Type.NUMBER }
                        },
                        required: ["lat", "lng"]
                      },
                      travelSuggestion: {
                        type: Type.OBJECT,
                        description: "從上一個行程點移動到此地點的交通建議 (當天第一個行程可為null)",
                        properties: {
                           mode: { type: Type.STRING, enum: ['train', 'bus', 'walk', 'taxi', 'other'], description: "主要交通方式" },
                           duration: { type: Type.STRING, description: "預估移動時間 (例如: 15分鐘)" },
                           details: { type: Type.STRING, description: "詳細路線或建議 (例如: 搭乘 JR 山手線外回)" },
                           rushHourWarning: { type: Type.BOOLEAN, description: "是否會遇到上下班尖峰擁擠時段" }
                        },
                        required: ["mode", "duration", "details", "rushHourWarning"]
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
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                bestPlaceToBuy: { type: Type.STRING },
                estimatedPrice: { type: Type.STRING }
              },
              required: ["name", "description", "bestPlaceToBuy", "estimatedPrice"]
            }
          },
          recommendedFood: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                bestPlaceToEat: { type: Type.STRING },
                estimatedPrice: { type: Type.STRING }
              },
              required: ["name", "description", "bestPlaceToEat", "estimatedPrice"]
            }
          },
          specialAlerts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["holiday", "festival", "weather", "tip"], description: "提醒類型" },
                title: { type: Type.STRING, description: "標題 (例如: 黃金週提醒)" },
                date: { type: Type.STRING, description: "相關日期 (可選)" },
                description: { type: Type.STRING, description: "詳細說明與建議" }
              },
              required: ["type", "title", "description"]
            },
            description: "針對此日期區間的特殊提醒清單"
          }
        },
        required: ["title", "summary", "days", "recommendedSouvenirs", "recommendedFood", "specialAlerts"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No itinerary generated.");
  
  const result = JSON.parse(text) as ItineraryResult;
  result.destination = formData.destination;
  
  return result;
};

/**
 * Generates an activity illustration.
 */
export const generateActivityIllustration = async (activity: string, location: string, description: string): Promise<string> => {
  const prompt = `Japanese anime style illustration of ${activity} in ${location}. Scenic background, vibrant colors, no text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Failed to generate image");
};

/**
 * Generates a photorealistic travel photo for a specific day.
 */
export const generateDayMap = async (day: number, theme: string, activities: string[], destination: string, variant: number = 0): Promise<string> => {
  const prompt = `8k photorealistic travel photo of ${destination} showing ${activities.join(', ')}. Theme: ${theme}. Professional lighting, no text.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "4:3" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Failed to generate photo");
};

/**
 * Generates a beautiful vertical (9:16) schedule poster image for a day.
 */
export const generateDayScheduleImage = async (dayPlan: DayPlan, destination: string): Promise<string> => {
  const activityList = dayPlan.activities.map(a => `${a.time} - ${a.activity}`).join('\n');
  
  const prompt = `
    Create a beautiful, vertical 9:16 aspect ratio travel itinerary poster for Day ${dayPlan.day} in ${destination}.
    
    **Title:** DAY ${dayPlan.day} - ${dayPlan.theme}
    **Location:** ${destination}
    **Schedule to visualize:**
    ${activityList}
    
    **Visual Style:**
    - Magazine-style layout, modern and clean.
    - Top half should be a stunning scenic photography of ${destination}.
    - Bottom half should have a clean white or semi-transparent background with the schedule text clearly and artistically laid out.
    - Use high-quality typography.
    - Colors: Emerald, white, and soft grey accents.
    - DO NOT use messy fonts, ensure it looks like a professional IG Story travel guide.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "9:16",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Failed to generate schedule poster");
};

/**
 * Generates a Studio Ghibli style cover image for the itinerary.
 */
export const generateItineraryCoverImage = async (title: string, destination: string): Promise<string> => {
  const prompt = `
    Studio Ghibli style, Hayao Miyazaki anime landscape art for a travel destination: ${destination}.
    
    Context Title: ${title}
    
    Visual Style:
    - Hand-painted watercolor background texture.
    - Lush green nature, summer vibes, vibrant blue sky with giant fluffy cumulus clouds.
    - Peaceful, nostalgic, and magical atmosphere.
    - Wide panoramic shot of the location's most iconic scenery in anime style.
    - No text, no words.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Failed to generate cover image");
};