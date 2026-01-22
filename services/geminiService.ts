import { GoogleGenAI, Type } from "@google/genai";
import { TripFormData, ItineraryResult, DayPlan } from "../types";

// Initialize the client. 
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

    **核心規劃重點：**
    1. **第一天行程**：請計算預計抵達時間。第一天的活動請務必在「預計抵達並完成入境後」才開始。
    2. **最後一天行程**：所有活動必須在回程航班起飛前「3小時」結束。
    3. **所有輸出內容必須使用「繁體中文 (Traditional Chinese)」**。
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
          }
        },
        required: ["title", "summary", "days", "recommendedSouvenirs", "recommendedFood"]
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
 * Generates a focused transportation route map.
 */
export const generateTransportationMap = async (day: number, theme: string, activities: string[], destination: string, variant: number = 0): Promise<string> => {
  const prompt = `Minimalist illustrated transit map for ${destination}: ${activities.join(' to ')}. Clean lines, icons.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "4:3" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Failed to generate transportation map");
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