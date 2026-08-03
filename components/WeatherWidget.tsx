import React, { useEffect, useState } from 'react';
import { CloudSun, Thermometer, Shirt, Umbrella, RefreshCw, ExternalLink, Sparkles, Wind, CheckCircle2 } from 'lucide-react';
import { fetchWeatherAdvice, WeatherWidgetData } from '../services/geminiService';

interface WeatherWidgetProps {
  destination: string;
  days: number;
  startDate?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ destination, days, startDate }) => {
  const [weatherData, setWeatherData] = useState<WeatherWidgetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const loadWeather = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchWeatherAdvice(destination || '日本', days, startDate);
      setWeatherData(data);
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, [destination, days, startDate]);

  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50/50 to-emerald-50 rounded-2xl p-5 md:p-6 shadow-sm border border-sky-100/80 mb-6 relative overflow-hidden transition-all print:hidden">
      {/* Background Glow Decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-sky-100/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-500 text-white rounded-xl shadow-sm shadow-sky-200">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 text-base md:text-lg">
                當地氣候與穿搭小幫手
              </h3>
              <span className="bg-sky-100 text-sky-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-sky-200">
                <Sparkles className="w-3 h-3 text-sky-600" /> Google Search 即時連網
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {destination} · 共 {days} 天行程氣候即時情報
            </p>
          </div>
        </div>

        <button
          onClick={loadWeather}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-white hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 shadow-sm transition-all disabled:opacity-50 hover:shadow"
          title="重新整理天氣資訊"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>更新情報</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 text-sky-700 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
          <p className="text-sm font-medium">正在透過 Google 搜尋取得 {destination} 最新氣候與穿搭建議...</p>
        </div>
      ) : error || !weatherData ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          無法載入即時天氣資訊，請稍後點擊「更新情報」重試。
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Weather Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Temp */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-sky-100/80 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">預測氣溫</span>
                <span className="text-base font-bold text-gray-800">{weatherData.temperatureRange}</span>
              </div>
            </div>

            {/* Condition */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-sky-100/80 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">天氣概況</span>
                <span className="text-base font-bold text-gray-800">{weatherData.weatherCondition}</span>
              </div>
            </div>

            {/* Rain Chance / Notice */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-sky-100/80 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Umbrella className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">降雨/天候提醒</span>
                <span className="text-sm font-bold text-gray-800 line-clamp-1">{weatherData.rainChanceOrTip}</span>
              </div>
            </div>
          </div>

          {/* Clothing Advice Section */}
          <div className="bg-white/90 p-4 rounded-xl border border-sky-100/80 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Shirt className="w-4 h-4 text-emerald-600" />
              <span>穿搭提示建議</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {weatherData.clothingAdvice}
            </p>
          </div>

          {/* Packing Tips */}
          {weatherData.packingTips && weatherData.packingTips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-sky-900 mr-1 flex items-center gap-1">
                🎒 推薦隨身攜帶：
              </span>
              {weatherData.packingTips.map((tip, idx) => (
                <span
                  key={idx}
                  className="bg-white text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-sky-100 shadow-sm flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {tip}
                </span>
              ))}
            </div>
          )}

          {/* Grounding Sources Citation */}
          {weatherData.sources && weatherData.sources.length > 0 && (
            <div className="pt-2 border-t border-sky-100/60 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
              <span className="font-semibold text-gray-500">搜尋參考來源：</span>
              {weatherData.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 hover:underline truncate max-w-[200px]"
                >
                  {src.title}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
