import React, { useState } from 'react';
import { Camera, Utensils, Loader2, Image as ImageIcon, Sparkles, RefreshCcw } from 'lucide-react';
import { generateHighlightImage } from '../services/geminiService';

interface FeaturedGalleryProps {
  highlights: string[];
  destination: string;
}

const FeaturedGallery: React.FC<FeaturedGalleryProps> = ({ highlights, destination }) => {
  const [images, setImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  const handleGenerate = async (index: number, description: string) => {
    setLoading(prev => ({ ...prev, [index]: true }));
    try {
      const url = await generateHighlightImage(description, destination);
      setImages(prev => ({ ...prev, [index]: url }));
    } catch (error) {
      console.error("Failed to generate image", error);
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleGenerateAll = async () => {
    // Generate one by one to avoid rate limits or overwhelming the user/UI
    for (let i = 0; i < highlights.length; i++) {
        if (!images[i]) {
            await handleGenerate(i, highlights[i]);
        }
    }
  };

  return (
    <div className="bg-white/90 rounded-3xl overflow-hidden shadow-lg border border-emerald-50 mb-8 p-6 md:p-8 animate-fade-in print:break-inside-avoid">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 font-serif flex items-center gap-2">
                <Camera className="w-6 h-6 text-emerald-600" />
                精選美景與美食集錦
            </h2>
            <p className="text-emerald-600/80 text-sm mt-1">
                AI 嚴選 8 個最值得紀錄的精彩瞬間，點擊相框生成照片
            </p>
          </div>
          <button 
            onClick={handleGenerateAll}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full text-sm font-bold transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            全部生成
          </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {highlights.map((highlight, index) => {
            const isFood = highlight.includes('食') || highlight.includes('料理') || highlight.includes('麵') || highlight.includes('飯') || highlight.includes('肉') || highlight.includes('甜點');
            
            return (
                <div 
                    key={index} 
                    className="group relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => !loading[index] && !images[index] && handleGenerate(index, highlight)}
                >
                    {images[index] ? (
                        <div className="w-full h-full relative">
                            <img 
                                src={images[index]} 
                                alt={highlight} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <p className="text-white text-xs font-medium line-clamp-2">{highlight}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center hover:bg-emerald-50 transition-colors">
                             {loading[index] ? (
                                 <div className="flex flex-col items-center text-emerald-500">
                                     <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                     <span className="text-xs font-medium">繪製中...</span>
                                 </div>
                             ) : (
                                 <>
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-emerald-400 group-hover:text-emerald-600 group-hover:scale-110 transition-transform">
                                        {isFood ? <Utensils className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                    </div>
                                    <p className="text-gray-500 text-xs font-medium group-hover:text-emerald-700 line-clamp-3">
                                        {highlight}
                                    </p>
                                    <span className="mt-3 text-[10px] bg-white px-2 py-1 rounded-full text-gray-400 border border-gray-100 group-hover:border-emerald-200 group-hover:text-emerald-500 transition-colors">
                                        點擊生成
                                    </span>
                                 </>
                             )}
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default FeaturedGallery;