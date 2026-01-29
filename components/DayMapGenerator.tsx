import React, { useEffect, useState } from 'react';
import { Map, ExternalLink, Loader2 } from 'lucide-react';
import { DayPlan } from '../types';
import { toDataURL } from 'qrcode';

interface DayMapGeneratorProps {
  dayPlan: DayPlan;
  destination: string;
}

const DayMapGenerator: React.FC<DayMapGeneratorProps> = ({ dayPlan, destination }) => {
  const [mapData, setMapData] = useState<{ stops: string[], mapUrl: string, qrCodeUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generate = async () => {
        setIsLoading(true);
        // Filter activities that have meaningful locations
        const validActivities = dayPlan.activities.filter(a => 
            ['sightseeing', 'food', 'shopping', 'accommodation'].includes(a.type) && 
            a.location && a.location !== '無' && a.location !== 'TBD'
        );

        // Deduplicate consecutive locations (e.g., stay at same place)
        const uniqueActivities = validActivities.filter((item, pos, arr) => 
            !pos || item.location !== arr[pos - 1].location
        );

        if (uniqueActivities.length < 1) {
            setMapData(null);
            setIsLoading(false);
            return;
        }

        // Helper to format location for Google Maps
        const formatLoc = (act: typeof uniqueActivities[0]) => {
             // 優先使用經緯度，確保導航精準度並縮短網址長度
             // Prioritize coordinates for precision and shorter URLs
             if (act.geo && act.geo.lat && act.geo.lng) {
                 return `${act.geo.lat},${act.geo.lng}`;
             }
             // Fallback: Combine location + destination context + "Japan"
             return `${act.location} ${destination} 日本`;
        };

        const origin = encodeURIComponent(formatLoc(uniqueActivities[0]));
        const destAct = uniqueActivities[uniqueActivities.length - 1];
        const destinationLoc = encodeURIComponent(formatLoc(destAct));
        
        const waypoints = uniqueActivities.slice(1, -1)
            .map(act => encodeURIComponent(formatLoc(act)))
            .join('|');

        let mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destinationLoc}&travelmode=transit`;
        if (waypoints) {
            mapUrl += `&waypoints=${waypoints}`;
        }

        try {
            // Use client-side QR code generation to handle longer URLs reliably
            const qrCodeUrl = await toDataURL(mapUrl, { width: 256, margin: 1, color: { dark: '#000000', light: '#ffffff' } });
            setMapData({
                stops: uniqueActivities.map(a => a.location),
                mapUrl,
                qrCodeUrl
            });
        } catch (e) {
            console.error("QR Generation failed", e);
        }
        setIsLoading(false);
    };

    generate();
  }, [dayPlan, destination]);

  if (!mapData && !isLoading) return null;

  return (
    <div className="mt-6 border-t border-emerald-100 pt-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 animate-fade-in">
           <div className="flex flex-col md:flex-row gap-8">
              {/* Route List */}
              <div className="flex-1">
                 <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-lg">
                    <Map className="w-5 h-5 text-red-500" />
                    Day {dayPlan.day} 導航路線
                 </h4>
                 
                 <div className="relative pl-4 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {mapData?.stops.map((stop, idx) => (
                      <div key={idx} className="relative flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 ${idx === 0 || idx === (mapData?.stops.length || 0) - 1 ? 'border-red-500 text-red-500' : 'border-gray-400 text-gray-400'}`}>
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-full truncate">
                            {stop}
                          </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Action / QR Code */}
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 border border-gray-100">
                 {isLoading ? (
                    <div className="flex flex-col items-center text-gray-400 py-8">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-xs">產生路線QR Code...</span>
                    </div>
                 ) : mapData && (
                 <>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4">
                      <img src={mapData.qrCodeUrl} alt="Google Maps Route QR" className="w-32 h-32 md:w-40 md:h-40" />
                    </div>
                    <p className="text-xs text-gray-500 mb-4 text-center">
                      手機掃描 QR Code <br/> 直接在 Google Maps App 開啟路線
                    </p>
                    <a 
                      href={mapData.mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg hover:shadow-red-200 w-full md:w-auto justify-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      開啟 Google Maps 導航
                    </a>
                 </>
                 )}
              </div>
           </div>
        </div>
    </div>
  );
};

export default DayMapGenerator;