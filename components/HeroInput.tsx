import React, { useState } from 'react';
import { TripFormData } from '../types';
import { Calendar, MapPin, Users, Clock, Heart, Coffee, Train, Home, PlaneTakeoff, PlaneLanding, Timer } from 'lucide-react';

interface HeroInputProps {
  onSubmit: (data: TripFormData) => void;
  isLoading: boolean;
}

// 範例龍貓圖片 URL
const HERO_IMAGE_URL = "https://images.fanpop.com/images/image_uploads/Totoro-my-neighbor-totoro-696264_1024_768.jpg";
// 行李箱圖片
const SUITCASE_IMAGE_URL = "https://cdn-icons-png.flaticon.com/512/3076/3076756.png"; 
// 日本地圖圖片
const MAP_IMAGE_URL = "https://cdn-icons-png.flaticon.com/512/805/805368.png";

const HeroInput: React.FC<HeroInputProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    days: 3,
    travelers: 2,
    startDate: new Date().toISOString().split('T')[0],
    interests: '',
    foodPreferences: '',
    accommodation: '',
    transportation: '',
    departureTime: '09:00',
    flightDuration: '3.5',
    returnTime: '18:00'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // 產生飛行時間選項 (0.5 ~ 12.0 小時)
  const flightDurationOptions = [];
  for (let i = 1; i <= 24; i++) {
    const val = i * 0.5;
    flightDurationOptions.push(val.toFixed(1));
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      
      {/* 裝飾性元素：行李箱 (右下角) */}
      <div className="hidden md:block absolute -bottom-8 -right-12 z-20 animate-float">
         <img 
           src={SUITCASE_IMAGE_URL} 
           alt="Travel Suitcase" 
           className="w-32 h-32 object-contain drop-shadow-2xl opacity-90 rotate-[-5deg]"
         />
      </div>

      {/* 裝飾性元素：地圖 (左上角) */}
      <div className="hidden md:block absolute -top-12 -left-12 z-20 animate-float" style={{ animationDelay: '1.5s' }}>
         <img 
           src={MAP_IMAGE_URL} 
           alt="Japan Map" 
           className="w-28 h-28 object-contain drop-shadow-xl opacity-90 rotate-[10deg]"
         />
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 relative z-10">
        <div className="relative h-64 md:h-80 overflow-hidden group">
           {/* Background Image */}
           <img 
             src={HERO_IMAGE_URL} 
             alt="My Neighbor Totoro" 
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
           />
           {/* Gradient Overlay for Text Readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-800/40 to-transparent"></div>
           
           {/* Content */}
           <div className="absolute bottom-0 left-0 w-full p-8 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif shadow-sm tracking-wide">
                開始您的奇幻旅程
              </h2>
              <p className="text-emerald-100 mt-2 text-lg font-medium drop-shadow-md">
                AI 為您打造專屬的日本旅遊行程
              </p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* 基本資訊區塊 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destination */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-sm">
                <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                目的地
              </label>
              <input
                type="text"
                name="destination"
                required
                placeholder="例如：京都, 大阪, 北海道..."
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-gray-50/50"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-sm">
                <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                出發日期
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-gray-50/50"
              />
            </div>

            {/* Days & Travelers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-semibold text-sm">
                  <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                  天數
                </label>
                <input
                  type="number"
                  name="days"
                  min="1"
                  max="14"
                  value={formData.days}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-gray-50/50"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-semibold text-sm">
                  <Users className="w-4 h-4 mr-2 text-emerald-500" />
                  人數
                </label>
                <input
                  type="number"
                  name="travelers"
                  min="1"
                  max="20"
                  value={formData.travelers}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-gray-50/50"
                />
              </div>
            </div>

             {/* Interests */}
             <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-sm">
                <Heart className="w-4 h-4 mr-2 text-emerald-500" />
                喜好景點 / 風格
              </label>
              <input
                type="text"
                name="interests"
                placeholder="例如：歷史古蹟, 動漫場景, 自然風景..."
                value={formData.interests}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-gray-50/50"
              />
            </div>
          </div>

          {/* 航班資訊區塊 - 新增 */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <h3 className="text-emerald-800 font-bold mb-4 flex items-center text-sm">
              <PlaneTakeoff className="w-4 h-4 mr-2" />
              航班資訊
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 出發時間 */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-semibold text-sm">
                  <PlaneTakeoff className="w-4 h-4 mr-2 text-emerald-500" />
                  出發航班時間
                </label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white"
                />
              </div>

              {/* 飛行時間 */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-semibold text-sm">
                  <Timer className="w-4 h-4 mr-2 text-emerald-500" />
                  飛行時間 (小時)
                </label>
                <select
                  name="flightDuration"
                  value={formData.flightDuration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white appearance-none"
                >
                  {flightDurationOptions.map(opt => (
                    <option key={opt} value={opt}>{opt} 小時</option>
                  ))}
                </select>
              </div>

              {/* 回程時間 */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-semibold text-sm">
                  <PlaneLanding className="w-4 h-4 mr-2 text-emerald-500" />
                  回程航班時間
                </label>
                <input
                  type="time"
                  name="returnTime"
                  value={formData.returnTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-white"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Food */}
              <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-sm">
                <Coffee className="w-4 h-4 mr-2 text-emerald-500" />
                美食偏好
              </label>
              <input
                type="text"
                name="foodPreferences"
                placeholder="拉麵, 甜點, 在地小吃..."
                value={formData.foodPreferences}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-gray-50/50"
              />
            </div>

            {/* Transport */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-sm">
                <Train className="w-4 h-4 mr-2 text-emerald-500" />
                交通工具
              </label>
              <select
                name="transportation"
                value={formData.transportation}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-gray-50/50"
              >
                <option value="">請選擇</option>
                <option value="大眾運輸">大眾運輸 (捷運/公車)</option>
                <option value="租車自駕">租車自駕</option>
                <option value="包車旅遊">包車旅遊</option>
                <option value="步行漫遊">步行漫遊</option>
              </select>
            </div>

            {/* Hotel */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-semibold text-sm">
                <Home className="w-4 h-4 mr-2 text-emerald-500" />
                住宿風格
              </label>
               <select
                name="accommodation"
                value={formData.accommodation}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none bg-gray-50/50"
              >
                <option value="">請選擇</option>
                <option value="經濟實惠">經濟實惠</option>
                <option value="舒適飯店">舒適飯店</option>
                <option value="豪華度假">豪華度假</option>
                <option value="傳統民宿">傳統民宿 (Ryokan/B&B)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                園長規劃中...
              </>
            ) : (
              '開始規劃'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeroInput;
