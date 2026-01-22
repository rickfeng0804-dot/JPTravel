import React, { useState } from 'react';
import { Train, Map, ExternalLink, Info } from 'lucide-react';
import { DayPlan } from '../types';

interface DayMapGeneratorProps {
  dayPlan: DayPlan;
  destination: string;
}

type MapType = 'google' | 'official';

// 定義各地區官方地圖資訊
const REGION_MAPS: Record<string, { name: string, url: string, keywords: string[], color: string }> = {
  tokyo: {
    name: 'JR 東日本 - 東京近郊路線圖',
    url: 'https://www.jreast.co.jp/multi/zh-CHT/routemaps/pdf/map_tokyo.pdf',
    keywords: ['東京', '橫濱', '千葉', '鎌倉', '箱根', '輕井澤', '迪士尼', 'Tokyo', 'Yokohama', 'Kamakura', 'Hakone'],
    color: 'bg-green-600'
  },
  kansai: {
    name: 'JR 西日本 - 關西地區路線圖',
    url: 'https://www.westjr.co.jp/global/tc/timetable/pdf/map_c_kansai.pdf',
    keywords: ['大阪', '京都', '奈良', '神戶', '宇治', '姬路', '和歌山', 'Osaka', 'Kyoto', 'Nara', 'Kobe', '環球影城'],
    color: 'bg-blue-600'
  },
  hokkaido: {
    name: 'JR 北海道 - 鐵路路線圖',
    url: 'https://www.jrhokkaido.co.jp/global/pdf/cn/route_map.pdf',
    keywords: ['北海道', '札幌', '函館', '小樽', '富良野', '旭川', 'Hokkaido', 'Sapporo'],
    color: 'bg-emerald-500'
  },
  kyushu: {
    name: 'JR 九州 - 鐵路路線圖',
    url: 'https://www.jrkyushu.co.jp/chinese/pdf/work_03.pdf',
    keywords: ['九州', '福岡', '博多', '由布院', '別府', '熊本', '長崎', 'Kyushu', 'Fukuoka', 'Hakata'],
    color: 'bg-red-600'
  },
  central: {
    name: 'JR 東海 - 路線圖',
    url: 'https://railway.jr-central.co.jp/route-map/_pdf/map_whole.pdf',
    keywords: ['名古屋', '高山', '白川鄉', '合掌村', 'Nagoya', 'Takayama'],
    color: 'bg-orange-500'
  },
  japan: {
    name: 'Japan Rail Pass 全國鐵路圖',
    url: 'https://japanrailpass.net/pdf/network_map_zh.pdf',
    keywords: [],
    color: 'bg-gray-600'
  }
};

const DayMapGenerator: React.FC<DayMapGeneratorProps> = ({ dayPlan, destination }) => {
  const [activeTab, setActiveTab] = useState<MapType>('google');

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

  // --- Official Map Logic ---
  const getOfficialMap = () => {
    const destLower = destination.toLowerCase();
    
    // Check specific regions first
    for (const key in REGION_MAPS) {
      if (key === 'japan') continue;
      const mapInfo = REGION_MAPS[key];
      if (mapInfo.keywords.some(k => destLower.includes(k.toLowerCase()))) {
        return mapInfo;
      }
    }
    
    // Fallback to general map
    return REGION_MAPS.japan;
  };

  const officialMap = getOfficialMap();

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
            onClick={() => setActiveTab('official')}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'official' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Train className="w-4 h-4" />
            官方鐵道路線圖
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

      {/* --- OFFICIAL MAP TAB --- */}
      {activeTab === 'official' && (
        <div className="animate-fade-in">
           <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full ${officialMap.color} flex items-center justify-center mb-4 shadow-lg text-white`}>
                 <Train className="w-8 h-8" />
              </div>
              
              <h4 className="text-xl font-bold text-gray-800 mb-2">{officialMap.name}</h4>
              <p className="text-gray-500 text-sm max-w-md mb-6">
                檢視 {destination} 地區的官方鐵路路線圖 (PDF)，獲取最準確的車站與轉乘資訊，避免 AI 生成地圖的亂碼問題。
              </p>

              <div className="flex flex-col w-full max-w-sm gap-3">
                <a 
                  href={officialMap.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 px-6 py-4 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all ${officialMap.color}`}
                >
                  <ExternalLink className="w-5 h-5" />
                  下載/瀏覽官方路線圖 (PDF)
                </a>
              </div>
              
              <div className="mt-6 flex items-start gap-2 text-xs text-left bg-blue-50 p-3 rounded-lg text-blue-800 border border-blue-100 max-w-lg">
                 <Info className="w-4 h-4 shrink-0 mt-0.5" />
                 <p>此連結將開啟 JR 官方網站提供的最新版路線圖。請注意，部分官方地圖檔案較大，建議在網路良好的環境下開啟。</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DayMapGenerator;