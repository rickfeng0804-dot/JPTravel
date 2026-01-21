import React, { useState } from 'react';
import { generateDayMap, generateTransportationMap } from '../services/geminiService';
import { Map, Loader2, Download, Image as ImageIcon, RefreshCw, Train } from 'lucide-react';
import { DayPlan } from '../types';

interface DayMapGeneratorProps {
  dayPlan: DayPlan;
  destination: string;
}

type MapType = 'scenic' | 'transport';

const DayMapGenerator: React.FC<DayMapGeneratorProps> = ({ dayPlan, destination }) => {
  const [activeTab, setActiveTab] = useState<MapType>('scenic');
  
  const [scenicMapUrl, setScenicMapUrl] = useState<string | null>(null);
  const [transportMapUrl, setTransportMapUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scenicVariant, setScenicVariant] = useState(0);
  const [transportVariant, setTransportVariant] = useState(0);

  const handleGenerateMap = async (type: MapType) => {
    setIsLoading(true);
    setError(null);
    try {
      // Extract main activities (sightseeing/food/transport)
      const mainActivities = dayPlan.activities
        .filter(a => ['sightseeing', 'food', 'shopping', 'transport'].includes(a.type))
        .map(a => a.activity);
      
      const limitedActivities = mainActivities.slice(0, 5);

      if (type === 'scenic') {
        const newVariant = scenicVariant + 1;
        setScenicVariant(newVariant);
        const url = await generateDayMap(dayPlan.day, dayPlan.theme, limitedActivities, destination, newVariant);
        setScenicMapUrl(url);
      } else {
        const newVariant = transportVariant + 1;
        setTransportVariant(newVariant);
        const url = await generateTransportationMap(dayPlan.day, dayPlan.theme, limitedActivities, destination, newVariant);
        setTransportMapUrl(url);
      }
    } catch (err) {
      console.error(err);
      setError("地圖繪製失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const currentMapUrl = activeTab === 'scenic' ? scenicMapUrl : transportMapUrl;

  const handleDownload = () => {
    if (!currentMapUrl) return;
    const link = document.createElement('a');
    link.href = currentMapUrl;
    link.download = `Day${dayPlan.day}_${activeTab}Map_${destination}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 border-t border-emerald-100 pt-6">
      
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-emerald-50/50 p-1 rounded-full border border-emerald-100 flex gap-1">
          <button
            onClick={() => setActiveTab('scenic')}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'scenic' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            手繪景點地圖
          </button>
          <button
            onClick={() => setActiveTab('transport')}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'transport' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Train className="w-4 h-4" />
            交通路線地圖
          </button>
        </div>
      </div>

      {!currentMapUrl ? (
        <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed transition-colors ${
          activeTab === 'scenic' 
            ? 'bg-emerald-50/30 border-emerald-200' 
            : 'bg-blue-50/30 border-blue-200'
        }`}>
           <h4 className={`font-bold mb-2 flex items-center gap-2 ${activeTab === 'scenic' ? 'text-emerald-800' : 'text-blue-800'}`}>
             {activeTab === 'scenic' ? <Map className="w-5 h-5" /> : <Train className="w-5 h-5" />}
             {activeTab === 'scenic' ? 'AI 景點地圖繪製' : 'AI 交通路線圖繪製'}
           </h4>
           <p className="text-sm text-gray-500 mb-4 text-center">
             {activeTab === 'scenic' 
               ? '將今日的行程繪製成一張精美的吉卜力風格手繪地圖，方便收藏與分享。' 
               : '產生今日行程的交通動線示意圖，標示車站與轉乘點，讓移動更清晰。'}
           </p>
           
           {isLoading ? (
             <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm font-medium text-gray-600">
               <Loader2 className="w-5 h-5 animate-spin" />
               正在繪製中...
             </div>
           ) : (
             <button 
               onClick={() => handleGenerateMap(activeTab)}
               className={`flex items-center gap-2 px-6 py-2.5 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-95 ${
                 activeTab === 'scenic' 
                   ? 'bg-emerald-600 hover:bg-emerald-700' 
                   : 'bg-blue-600 hover:bg-blue-700'
               }`}
             >
               {activeTab === 'scenic' ? <ImageIcon className="w-5 h-5" /> : <Train className="w-5 h-5" />}
               {activeTab === 'scenic' ? '繪製今日景點地圖' : '繪製交通路線圖'}
             </button>
           )}
           
           {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
      ) : (
        <div className={`bg-white p-4 rounded-2xl shadow-md border animate-fade-in ${
           activeTab === 'scenic' ? 'border-emerald-100' : 'border-blue-100'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
             <h4 className="font-bold text-gray-800 flex items-center gap-2">
                {activeTab === 'scenic' ? <Map className="w-5 h-5 text-emerald-600" /> : <Train className="w-5 h-5 text-blue-600" />}
                Day {dayPlan.day} {activeTab === 'scenic' ? '手繪景點地圖' : '交通路線地圖'}
             </h4>
             <div className="flex gap-2 w-full sm:w-auto">
               <button 
                 onClick={() => handleGenerateMap(activeTab)}
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
                 className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 ${
                   activeTab === 'scenic'
                     ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                     : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                 }`}
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
                    <Loader2 className={`w-8 h-8 animate-spin ${activeTab === 'scenic' ? 'text-emerald-500' : 'text-blue-500'}`} />
                  </div>
                  <p className="mt-4 text-gray-800 font-bold bg-white/80 px-3 py-1 rounded-lg">正在為您重新繪製...</p>
               </div>
            )}
            <img 
              src={currentMapUrl} 
              alt={`Day ${dayPlan.day} ${activeTab} Map`} 
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