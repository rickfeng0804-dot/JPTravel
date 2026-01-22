import React, { useState } from 'react';
import { generateTransportationMap } from '../services/geminiService';
import { Train, Camera, Upload, X, Plus, Trash2, RefreshCw, Download, Loader2 } from 'lucide-react';
import { DayPlan } from '../types';

interface DayMapGeneratorProps {
  dayPlan: DayPlan;
  destination: string;
}

type MapType = 'scenic' | 'transport';

const DayMapGenerator: React.FC<DayMapGeneratorProps> = ({ dayPlan, destination }) => {
  const [activeTab, setActiveTab] = useState<MapType>('scenic');
  
  // State for Uploaded Images (Scenic)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // State for Transport Map (AI Generated)
  const [transportMapUrl, setTransportMapUrl] = useState<string | null>(null);
  const [transportVariant, setTransportVariant] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const remainingSlots = 8 - uploadedImages.length;
      
      if (files.length > remainingSlots) {
        alert(`最多只能上傳 8 張照片。您目前只能再上傳 ${remainingSlots} 張。`);
      }

      const filesToProcess = files.slice(0, remainingSlots);

      filesToProcess.forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

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
            <Camera className="w-4 h-4" />
            上傳景點照片 ({uploadedImages.length}/8)
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

      {/* --- SCENIC PHOTOS TAB (UPLOAD) --- */}
      {activeTab === 'scenic' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
             <div>
               <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Day {dayPlan.day} 旅遊回憶錄
               </h4>
               <p className="text-sm text-gray-500 mt-1">上傳您的旅行照片，記錄美好時刻。</p>
             </div>
             
             {uploadedImages.length > 0 && (
               <button 
                  onClick={() => setUploadedImages([])}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
               >
                 <Trash2 className="w-3.5 h-3.5" />
                 清空
               </button>
             )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Render Uploaded Images */}
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Upload Button (Show if less than 8) */}
            {uploadedImages.length < 8 && (
              <label className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center text-emerald-600 hover:text-emerald-700 group">
                <div className="p-3 bg-emerald-100 rounded-full mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold">新增照片</span>
                <span className="text-[10px] opacity-60 mt-0.5">{uploadedImages.length}/8</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
          
          {uploadedImages.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              尚未上傳照片，點擊上方區塊開始上傳
            </div>
          )}
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