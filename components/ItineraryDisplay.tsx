import React from 'react';
import { ItineraryResult, DayPlan, Activity } from '../types';
import { MapPin, Clock, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { exportItineraryToExcel } from '../services/exportService';

interface ItineraryDisplayProps {
  itinerary: ItineraryResult;
  onReset: () => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onReset }) => {
  
  const handleExportExcel = () => {
    exportItineraryToExcel(itinerary);
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
          title="匯出行程表至 Excel"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          匯出 Excel
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
                <div className="bg-emerald-600 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between text-white">
                  <div>
                    <h3 className="font-bold text-2xl md:text-3xl font-serif flex items-center gap-2">
                       Day {day.day}
                    </h3>
                    <p className="text-emerald-100 font-medium mt-1">{day.theme}</p>
                  </div>
                </div>

                {/* Activities Content - Full Width */}
                <div className="p-6 md:p-8 space-y-8 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 md:left-10 top-8 bottom-8 w-0.5 bg-emerald-100"></div>

                    {day.activities.map((act: Activity, idx) => (
                        <div key={idx} className="relative pl-10 md:pl-12 group">
                            {/* Timeline Dot */}
                            <div className="absolute left-2 md:left-4 top-1.5 w-4 h-4 rounded-full bg-emerald-200 ring-4 ring-white group-hover:bg-emerald-500 transition-colors"></div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-2">
                                <span className="text-sm font-bold text-emerald-600 font-mono shrink-0 flex items-center bg-emerald-50 px-2 py-0.5 rounded">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {act.time}
                                </span>
                                <h4 className="text-xl font-bold text-gray-800">{act.activity}</h4>
                            </div>
                            
                            <div className="flex items-start text-sm text-gray-500 mb-3">
                                <MapPin className="w-3.5 h-3.5 mt-0.5 mr-1 shrink-0 text-red-400" />
                                {act.location}
                            </div>
                            
                            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50/80 p-4 rounded-xl border border-gray-100 group-hover:bg-emerald-50/30 transition-colors">
                                {act.description}
                            </p>
                            {act.costEstimate && (
                                <div className="mt-1 text-xs text-gray-400 text-right">
                                預算: {act.costEstimate}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default ItineraryDisplay;
