
export interface DayPreference {
  day: number;
  location: string; // 指定當天主要地點
  accommodation: string; // 指定當天住宿飯店或區域
}

export interface TripFormData {
  destination: string;
  days: number;
  travelers: number;
  startDate: string;
  interests: string;
  foodPreferences: string;
  accommodation: string; // 整體風格
  transportation: string;
  // 新增航班資訊
  departureTime: string;
  flightDuration: string;
  returnTime: string;
  // 新增購物清單需求
  souvenirPreferences: string;
  // 新增每日詳細偏好
  dayPreferences: DayPreference[];
}

export type ActivityType = 'sightseeing' | 'food' | 'transport' | 'shopping' | 'accommodation' | 'other';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface TravelSuggestion {
  mode: 'train' | 'bus' | 'walk' | 'taxi' | 'other';
  duration: string; // e.g. "15 min"
  details: string; // e.g. "搭乘 JR 山手線 (外回)"
  rushHourWarning: boolean; // 是否為尖峰時刻
}

export interface Activity {
  time: string;
  activity: string;
  description: string;
  location: string;
  costEstimate?: string;
  type: ActivityType;
  geo?: GeoCoordinates; // 新增座標欄位
  travelSuggestion?: TravelSuggestion; // 新增：前往此地點的交通建議 (相對於上一地點)
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface SouvenirItem {
  name: string;
  description: string;
  bestPlaceToBuy: string;
  estimatedPrice: string;
}

export interface FoodItem {
  name: string;
  description: string;
  bestPlaceToEat: string;
  estimatedPrice: string;
}

export interface TravelAlert {
  type: 'holiday' | 'festival' | 'weather' | 'tip';
  title: string;
  date?: string;
  description: string;
}

export interface ItineraryResult {
  title: string;
  summary: string;
  destination?: string; // Added for map generation context
  days: DayPlan[];
  recommendedSouvenirs: SouvenirItem[];
  recommendedFood: FoodItem[];
  specialAlerts: TravelAlert[]; // 新增：特殊提醒 (連假、祭典、活動)
}

export enum AppState {
  INPUT = 'INPUT',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}