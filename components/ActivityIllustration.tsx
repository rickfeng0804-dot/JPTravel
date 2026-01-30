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

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const url = await generateActivityIllustration(activity, location, description);
      setImageUrl(url);
    } catch (error) {
      console.error("Failed to generate image", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (imageUrl) {
    return (
      <div className="mt-4 rounded-xl overflow-hidden shadow-md border border-emerald-100 animate-fade-in group relative">
        <img src={imageUrl} alt={activity} className="w-full h-48 md:h-56 object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Sparkles className="w-3 h-3" /> AI Generated
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button 
        onClick={handleGenerate}
        disabled={isLoading}
        className="flex items-center gap-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full md:w-auto justify-center md:justify-start"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI 繪圖中...
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4" />
            看 AI 示意圖
          </>
        )}
      </button>
    </div>
  );
};

export default ActivityIllustration;