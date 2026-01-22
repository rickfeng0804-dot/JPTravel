import React, { useState } from 'react';
import { generateTransportationMap } from '../services/geminiService';
import { Train, RefreshCw, Download, Loader2, Map, ExternalLink, QrCode } from 'lucide-react';
import { DayPlan } from '../types';

interface DayMapGeneratorProps {
  dayPlan: DayPlan;
  destination: string;
}

type MapType = 'google' | 'transport';

const DayMapGenerator: React.FC<DayMapGeneratorProps> = ({ dayPlan, destination }) => {
  const [activeTab, setActiveTab] = useState<MapType>('google');

  // State for Transport Map (AI Generated)
  const [transportMapUrl, setTransportMapUrl] = useState<string | null>(null);
  const [transportVariant, setTransportVariant] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Google Maps Logic ---
  const getGoogleMapsData = () => {
    // Filter activities that have meaningful locations
    const stops = dayPlan.activities
      .filter(a => 
        ['sightseeing', 'food', 'shopping', 'accommodation'].includes(a.type) && 
        a.location && 
        a.location !== '無' && 
        a.location !== 'TBD'
      )
      .map(a => a.location);

    // Remove duplicates consecutively (e.g., stay at same place)
    const uniqueStops = stops.filter((item, pos, arr) => !pos || item !== arr[pos - 1]);

    if (uniqueStops.length < 1) return null;

    const origin = encodeURIComponent(uniqueStops[0]);
    const destinationLoc = encodeURIComponent(uniqueStops[uniqueStops.length - 1]);
    const waypoints = uniqueStops.slice(1, -1).map(p => encodeURIComponent(p)).join('|');

    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destinationLoc}&waypoints=${waypoints}&travelmode=transit`;
    
    // Generate QR Code URL (using a free API for simplicity)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mapUrl)}`;

    return { stops: uniqueStops, mapUrl, qrCodeUrl };
  };

  const googleData = getGoogleMapsData();

  // Handle AI Transport Map Generation
  const handleGenerateTransportMap = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mainActivities = dayPlan.activities
        .filter(a => ['sightseeing', 'food', 'shopping', 'transport'].includes(a.type))
        .map(a => a.activity);
      
      const limitedActivities = mainActivities.slice(0, 5);
      const newVariant = transportVariant + 1;
      setTransportVariant(newVariant);
      
      const url = await generateTransportationMap(dayPlan.day, dayPlan.theme, limitedActivities, destination, newVariant);
      setTransportMapUrl(url);
    } catch (err) {
      console.error(err);
      setError("地圖生成失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTransport = () => {
    if (!transportMapUrl) return;
    const link = document.createElement('a');
    link.href = transportMapUrl;
    link.download = `Day${dayPlan.day}_TransportMap_${destination}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 border-t border-emerald-100 pt-6">
      
      {/* Tabs */}
      <div className="flex justify-center mb-6 overflow-x-auto">
        <div className="bg-emerald-50/50 p-1 rounded-full border border-emerald-100 flex gap-1 min-w-max">
           <button
            onClick={() => setActiveTab('google')}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'google' 
                ? 'bg-red-500 text-white shadow-md' 
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <Map className="w-4 h-4" />
            Google Maps 路線
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
            AI 路線示意圖
          </button>
        </div>
      </div>

      {/* --- GOOGLE MAPS TAB --- */}
      {activeTab === 'google' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 animate-fade-in">
           <div className="flex flex-col md:flex-row gap-8">
              {/* Route List */}
              <div className="flex-1">
                 <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-lg">
                    <Map className="w-5 h-5 text-red-500" />
                    Day {dayPlan.day} 導航路線
                 </h4>
                 
                 {googleData ? (
                   <div className="relative pl-4 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                      {googleData.stops.map((stop, idx) => (
                        <div key={idx} className="relative flex items-center gap-3">
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 ${idx === 0 || idx === googleData.stops.length - 1 ? 'border-red-500 text-red-500' : 'border-gray-400 text-gray-400'}`}>
                              <span className="text-[10px] font-bold">{idx + 1}</span>
                           </div>
                           <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-full">
                              {stop}
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <p className="text-gray-500 text-sm">無法取得足夠的地點資訊來建立路線。</p>
                 )}
              </div>

              {/* Action / QR Code */}
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 border border-gray-100">
                 {googleData ? (
                   <>
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4">
                        <img src={googleData.qrCodeUrl} alt="Google Maps Route QR" className="w-32 h-32 md:w-40 md:h-40" />
                      </div>
                      <p className="text-xs text-gray-500 mb-4 text-center">
                        手機掃描 QR Code <br/> 直接在 Google Maps App 開啟路線
                      </p>
                      <a 
                        href={googleData.mapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg hover:shadow-red-200 w-full md:w-auto justify-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                        開啟 Google Maps 導航
                      </a>
                   </>
                 ) : (
                   <div className="text-center text-gray-400">
                     <Map className="w-12 h-12 mx-auto mb-2 opacity-30" />
                     尚無路線資料
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* --- TRANSPORT MAP TAB (AI GENERATION) --- */}
      {activeTab === 'transport' && (
        <div className="animate-fade-in">
          {!transportMapUrl ? (
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed bg-blue-50/30 border-blue-200">
               <h4 className="font-bold mb-2 flex items-center gap-2 text-blue-800">
                 <Train className="w-5 h-5" />
                 AI 交通路線圖繪製
               </h4>
               <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
                 產生今日行程的交通動線示意圖，標示車站與轉乘點，讓移動更清晰。
               </p>
               
               {isLoading ? (
                 <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm font-medium text-gray-600">
                   <Loader2 className="w-5 h-5 animate-spin" />
                   正在生成中...
                 </div>
               ) : (
                 <button 
                   onClick={handleGenerateTransportMap}
                   className="flex items-center gap-2 px-6 py-2.5 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-95 bg-blue-600 hover:bg-blue-700"
                 >
                   <Train className="w-5 h-5" />
                   繪製交通路線圖
                 </button>
               )}
               
               {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl shadow-md border border-blue-100 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                 <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <Train className="w-5 h-5 text-blue-600" />
                    Day {dayPlan.day} 交通路線地圖
                 </h4>
                 <div className="flex gap-2 w-full sm:w-auto">
                   <button 
                     onClick={handleGenerateTransportMap}
                     disabled={isLoading}
                     className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     title="重新生成"
                   >
                     <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                     {isLoading ? '處理中' : '重新生成'}
                   </button>
                   <button 
                     onClick={handleDownloadTransport}
                     disabled={isLoading}
                     className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 bg-blue-100 hover:bg-blue-200 text-blue-800"
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
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                      <p className="mt-4 text-gray-800 font-bold bg-white/80 px-3 py-1 rounded-lg">正在為您重新生成...</p>
                   </div>
                )}
                <img 
                  src={transportMapUrl} 
                  alt={`Day ${dayPlan.day} Transport Map`} 
                  className="w-full h-auto object-cover max-h-[500px]" 
                />
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">
                 * AI 生成地圖僅供視覺參考，非精確導航地圖
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayMapGenerator;