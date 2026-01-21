import React from 'react';
import { ItineraryResult, DayPlan, Activity, SouvenirItem, FoodItem } from '../types';
import { MapPin, ArrowLeft, FileSpreadsheet, ShoppingBag, Gift, Utensils, Camera, Train, Bed, Download } from 'lucide-react';
import { exportItineraryToExcel, exportDayItineraryToExcel } from '../services/exportService';

interface ItineraryDisplayProps {
  itinerary: ItineraryResult;
  onReset: () => void;
}

// 定義不同活動類型的樣式設定
const ACTIVITY_STYLES: Record<string, { icon: React.ReactNode, color: string, bg: string, border: string, ring: string, label: string }> = {
  sightseeing: { 
    icon: <Camera className="w-4 h-4" />, 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-100',
    ring: 'ring-emerald-200',
    label: '景點'
  },
  food: { 
    icon: <Utensils className="w-4 h-4" />, 
    color: 'text-orange-700', 
    bg: 'bg-orange-50', 
    border: 'border-orange-100',
    ring: 'ring-orange-200',
    label: '美食'
  },
  transport: { 
    icon: <Train className="w-4 h-4" />, 
    color: 'text-blue-700', 
    bg: 'bg-blue-50', 
    border: 'border-blue-100',
    ring: 'ring-blue-200',
    label: '交通'
  },
  shopping: { 
    icon: <ShoppingBag className="w-4 h-4" />, 
    color: 'text-pink-700', 
    bg: 'bg-pink-50', 
    border: 'border-pink-100',
    ring: 'ring-pink-200',
    label: '購物'
  },
  accommodation: { 
    icon: <Bed className="w-4 h-4" />, 
    color: 'text-indigo-700', 
    bg: 'bg-indigo-50', 
    border: 'border-indigo-100',
    ring: 'ring-indigo-200',
    label: '住宿'
  },
  other: { 
    icon: <MapPin className="w-4 h-4" />, 
    color: 'text-gray-700', 
    bg: 'bg-gray-100', 
    border: 'border-gray-200',
    ring: 'ring-gray-300',
    label: '其他'
  }
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onReset }) => {
  
  const handleExportExcel = () => {
    exportItineraryToExcel(itinerary);
  };

  const handleExportDay = (day: DayPlan) => {
    exportDayItineraryToExcel(day, itinerary.title);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-emerald-50">
        <button onClick={onReset} className="flex items-center text-gray-600 hover:text-emerald-600 font-semibold transition-colors self-start md:self-auto">
          <ArrowLeft className="w-5 h-5 mr-2" />
          重新規劃
        </button>
        
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center">{itinerary.title}</h1>
         
        <button 
          onClick={handleExportExcel} 
          className="flex items-center px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-sm font-semibold transition-colors"
          title="匯出完整行程表至 Excel"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          匯出完整 Excel
        </button>
      </div>

      <div className="bg-white/90 rounded-3xl p-8 shadow-lg border border-emerald-50 mb-8 text-center">
        <h2 className="text-3xl font-bold text-emerald-800 mb-4 font-serif">{itinerary.title}</h2>
        <p className="text-lg text-gray-600 italic leading-relaxed max-w-3xl mx-auto">{itinerary.summary}</p>
      </div>

      <div className="space-y-8">
        {itinerary.days.map((day: DayPlan) => {
            return (
              <div key={day.day} className="bg-white/90 rounded-3xl overflow-hidden shadow-xl border border-emerald-100 transform transition-all hover:shadow-2xl">
                
                {/* Day Header */}
                <div className="bg-emerald-600 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between text-white gap-4">
                  <div>
                    <h3 className="font-bold text-2xl md:text-3xl font-serif flex items-center gap-2">
                       Day {day.day}
                    </h3>
                    <p className="text-emerald-100 font-medium mt-1">{day.theme}</p>
                  </div>
                  
                  {/* Single Day Export Button */}
                  <button 
                    onClick={() => handleExportDay(day)}
                    className="flex items-center px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs md:text-sm font-medium transition-colors border border-white/20 backdrop-blur-sm"
                    title={`匯出 Day ${day.day} 行程`}
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    匯出此日行程
                  </button>
                </div>

                {/* Activities Content - Full Width */}
                <div className="p-6 md:p-8 space-y-8 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 md:left-10 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                    {day.activities.map((act: Activity, idx) => {
                        const styleKey = act.type || 'other';
                        const style = ACTIVITY_STYLES[styleKey] || ACTIVITY_STYLES['other'];

                        return (
                          <div key={idx} className="relative pl-10 md:pl-12 group">
                              {/* Timeline Dot (Visualized by Type) */}
                              <div className={`absolute left-2 md:left-4 top-2 w-4 h-4 rounded-full bg-white ring-[3px] ${style.ring} group-hover:scale-110 transition-transform`}>
                                <div className={`w-full h-full rounded-full opacity-60 ${style.bg.replace('bg-', 'bg-')}`}></div>
                              </div>
                              
                              {/* Header: Time & Activity Name */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                  {/* Time Badge with Type Icon */}
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold font-mono border ${style.bg} ${style.color} ${style.border}`}>
                                      {style.icon}
                                      {act.time}
                                  </span>
                                  <h4 className="text-xl font-bold text-gray-800">{act.activity}</h4>
                              </div>
                              
                              <div className="flex items-start text-sm text-gray-500 mb-3 ml-1">
                                  <MapPin className="w-3.5 h-3.5 mt-0.5 mr-1 shrink-0 text-red-400" />
                                  {act.location}
                              </div>
                              
                              {/* Description Card */}
                              <div className={`p-4 rounded-xl border ${style.bg} ${style.border} bg-opacity-40 group-hover:bg-opacity-70 transition-colors`}>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {act.description}
                                </p>
                                {act.costEstimate && (
                                    <div className="mt-2 pt-2 border-t border-gray-200/50 text-xs text-gray-500 font-medium text-right flex justify-end items-center gap-1">
                                      <span className="bg-white/50 px-2 py-0.5 rounded">
                                        預算: {act.costEstimate}
                                      </span>
                                    </div>
                                )}
                              </div>
                          </div>
                        );
                    })}
                </div>
              </div>
            );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        {/* Food Section */}
        {itinerary.recommendedFood && itinerary.recommendedFood.length > 0 && (
          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-3xl p-8 shadow-lg border border-red-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <Utensils className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-800 font-serif">必吃美食清單</h3>
                <p className="text-red-600/80 text-sm">園長精選在地好味道</p>
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              {itinerary.recommendedFood.map((item: FoodItem, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                      <span className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded-full whitespace-nowrap">
                        {item.estimatedPrice}
                      </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{item.description}</p>
                  <div className="flex items-center text-xs text-red-600 font-medium border-t border-red-50 pt-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    推薦店家: {item.bestPlaceToEat}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Souvenir Section */}
        {itinerary.recommendedSouvenirs && itinerary.recommendedSouvenirs.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-lg border border-orange-100 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-full">
                <ShoppingBag className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-orange-800 font-serif">必買伴手禮清單</h3>
                <p className="text-orange-600/80 text-sm">園長推薦土特產</p>
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              {itinerary.recommendedSouvenirs.map((item: SouvenirItem, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-orange-400" />
                        {item.name}
                      </h4>
                      <span className="text-xs font-mono bg-orange-100 text-orange-800 px-2 py-1 rounded-full whitespace-nowrap">
                        {item.estimatedPrice}
                      </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{item.description}</p>
                  <div className="flex items-center text-xs text-orange-600 font-medium border-t border-orange-50 pt-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    推薦地點: {item.bestPlaceToBuy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ItineraryDisplay;