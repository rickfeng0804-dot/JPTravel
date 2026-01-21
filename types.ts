export interface TripFormData {
  destination: string;
  days: number;
  travelers: number;
  startDate: string;
  interests: string;
  foodPreferences: string;
  accommodation: string;
  transportation: string;
  // 新增航班資訊
  departureTime: string;
  flightDuration: string;
  returnTime: string;
  // 新增購物清單需求
  souvenirPreferences: string;
}

export type ActivityType = 'sightseeing' | 'food' | 'transport' | 'shopping' | 'accommodation' | 'other';

export interface Activity {
  time: string;
  activity: string;
  description: string;
  location: string;
  costEstimate?: string;
  type: ActivityType;
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

export interface ItineraryResult {
  title: string;
  summary: string;
  destination?: string; // Added for map generation context
  days: DayPlan[];
  recommendedSouvenirs: SouvenirItem[];
  recommendedFood: FoodItem[];
}

export enum AppState {
  INPUT = 'INPUT',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}