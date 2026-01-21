import React, { useState } from 'react';
import { generateActivityIllustration } from '../services/geminiService';
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ActivityIllustrationProps {
  activity: string;
  location: string;
  description: string;
}

const ActivityIllustration: React.FC<ActivityIllustrationProps> = ({ activity, location, description }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent affecting parent click handlers if any
    setIsLoading(true);
    setError(null);
    try {
      const url = await generateActivityIllustration(activity, location, description);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
      setError("無法產生圖片，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  if (imageUrl) {
    return (
      <div className="mt-4 rounded-xl overflow-hidden shadow-md animate-fade-in relative group border border-emerald-100">
        <img src={imageUrl} alt={activity} className="w-full h-48 md:h-64 object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
           <Sparkles className="w-3 h-3 text-yellow-300" />
           AI 吉卜力風格插畫
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
        {isLoading ? (
            <div className="w-full h-32 md:h-48 bg-emerald-50/50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 text-emerald-600 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm font-medium">正在繪製吉卜力風格插畫...</span>
            </div>
        ) : error ? (
             <div className="text-red-500 text-sm flex items-center mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                ⚠️ {error}
                <button onClick={handleGenerate} className="ml-2 underline hover:text-red-700 font-medium">重試</button>
             </div>
        ) : (
            <button 
                onClick={handleGenerate}
                className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium transition-all border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-300 w-full md:w-auto justify-center md:justify-start"
            >
                <ImageIcon className="w-4 h-4 group-hover:scale-110 transition-transform text-emerald-500" />
                <span>生成吉卜力風格插圖</span>
            </button>
        )}
    </div>
  );
};

export default ActivityIllustration;