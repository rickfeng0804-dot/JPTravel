import React, { useState } from 'react';
import { getMapCode } from '../services/geminiService';
import { MapPin, Search, Loader2 } from 'lucide-react';

const MapCodeConverter: React.FC = () => {
  const [location, setLocation] = useState('');
  const [mapCode, setMapCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!location.trim()) return;
    setLoading(true);
    setMapCode(null);
    try {
      const code = await getMapCode(location);
      setMapCode(code);
    } catch (error) {
      console.error("Failed to get Map Code", error);
      setMapCode("查詢失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 max-w-2xl mx-auto mt-12 border border-emerald-100">
      <div className="flex items-center gap-2 mb-4 text-emerald-800">
        <MapPin className="w-5 h-5" />
        <h3 className="font-bold text-lg">日本 Map Code 導航小幫手</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        輸入日本景點或地址，自動查詢導航專用的 Map Code。
      </p>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="輸入景點名稱 (例如: 金閣寺)"
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !location.trim()}
          className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          查詢
        </button>
      </div>

      {mapCode && (
        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center animate-fade-in">
          <p className="text-sm text-emerald-600 mb-1 font-medium">Map Code</p>
          <p className="text-3xl font-mono font-bold text-emerald-800 tracking-wider select-all cursor-pointer" title="點擊複製">
            {mapCode}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapCodeConverter;
