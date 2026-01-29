import React from 'react';
import { Map, ExternalLink } from 'lucide-react';
import { DayPlan } from '../types';

interface DayMapGeneratorProps {
  dayPlan: DayPlan;
  destination: string;
}

const DayMapGenerator: React.FC<DayMapGeneratorProps> = ({ dayPlan, destination }) => {
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

    // Helper to ensure Google Maps searches for the location IN JAPAN at the specific destination
    // This prevents confusion with places like "Songshan" (Taiwan) vs "Matsuyama" (Japan)
    const formatForMaps = (loc: string) => {
        // Combine location + destination context + "Japan" (in Traditional Chinese for better context matching)
        return `${loc} ${destination} 日本`;
    };

    const origin = encodeURIComponent(formatForMaps(uniqueStops[0]));
    const destinationLoc = encodeURIComponent(formatForMaps(uniqueStops[uniqueStops.length - 1]));
    const waypoints = uniqueStops.slice(1, -1).map(p => encodeURIComponent(formatForMaps(p))).join('|');

    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destinationLoc}&waypoints=${waypoints}&travelmode=transit`;
    
    // Generate QR Code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mapUrl)}`;

    return { stops: uniqueStops, mapUrl, qrCodeUrl };
  };

  const googleData = getGoogleMapsData();

  if (!googleData) return null;

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
              </div>

              {/* Action / QR Code */}
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 border border-gray-100">
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
              </div>
           </div>
        </div>
    </div>
  );
};

export default DayMapGenerator;