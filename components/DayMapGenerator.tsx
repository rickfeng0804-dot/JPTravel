import React, { useState } from 'react';
import { generateDayMap } from '../services/geminiService';
import { Map, Loader2, Download, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { DayPlan } from '../types';

interface DayMapGeneratorProps {
  dayPlan: DayPlan;
  destination: string;
}

const DayMapGenerator: React.FC<DayMapGeneratorProps> = ({ dayPlan, destination }) => {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMap = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Extract main activities (sightseeing/food) for the map to avoid clutter
      const mainActivities = dayPlan.activities
        .filter(a => ['sightseeing', 'food', 'shopping'].includes(a.type))
        .map(a => a.activity);
      
      // If list is too long, take top 5
      const limitedActivities = mainActivities.slice(0, 5);

      const url = await generateDayMap(dayPlan.day, dayPlan.theme, limitedActivities, destination);
      setMapUrl(url);
    } catch (err) {
      console.error(err);
      setError("地圖繪製失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!mapUrl) return;
    const link = document.createElement('a');
    link.href = mapUrl;
    link.download = `Day${dayPlan.day}_TravelMap_${destination}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 border-t border-emerald-100 pt-6">
      {!mapUrl ? (
        <div className="flex flex-col items-center justify-center p-6 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-200">
           <h4 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">
             <Map className="w-5 h-5" />
             AI 旅遊地圖繪製
           </h4>
           <p className="text-sm text-gray-500 mb-4 text-center">
             將今日的行程繪製成一張精美的吉卜力風格手繪地圖，方便收藏與分享。
           </p>
           
           {isLoading ? (
             <div className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-full shadow-sm font-medium">
               <Loader2 className="w-5 h-5 animate-spin" />
               正在繪製地圖中...
             </div>
           ) : (
             <button 
               onClick={handleGenerateMap}
               className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
             >
               <ImageIcon className="w-5 h-5" />
               繪製今日行程地圖
             </button>
           )}
           
           {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl shadow-md border border-emerald-100 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
             <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <Map className="w-5 h-5 text-emerald-600" />
                Day {dayPlan.day} 旅遊手繪地圖
             </h4>
             <div className="flex gap-2 w-full sm:w-auto">
               <button 
                 onClick={handleGenerateMap}
                 disabled={isLoading}
                 className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 title="重新繪製"
               >
                 <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                 {isLoading ? '繪製中' : '重新繪製'}
               </button>
               <button 
                 onClick={handleDownload}
                 disabled={isLoading}
                 className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
               >
                 <Download className="w-4 h-4" />
                 儲存
               </button>
             </div>
          </div>
          
          <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-inner group bg-gray-50 min-h-[200px]">
            {isLoading && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 transition-all">
                  <div className="bg-white p-4 rounded-full shadow-xl">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                  <p className="mt-4 text-emerald-800 font-bold bg-white/80 px-3 py-1 rounded-lg">正在為您重新繪製地圖...</p>
               </div>
            )}
            <img 
              src={mapUrl} 
              alt={`Day ${dayPlan.day} Map`} 
              className="w-full h-auto object-cover max-h-[500px]" 
            />
            {/* Overlay hint only when not loading */}
            {!isLoading && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />}
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
             * AI 生成地圖僅供視覺參考，非精確導航地圖
          </p>
        </div>
      )}
    </div>
  );
};

export default DayMapGenerator;