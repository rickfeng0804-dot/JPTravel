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
}

export interface Activity {
  time: string;
  activity: string;
  description: string;
  location: string;
  costEstimate?: string;
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface ItineraryResult {
  title: string;
  summary: string;
  days: DayPlan[];
}

export enum AppState {
  INPUT = 'INPUT',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
