import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import HeroInput from './components/HeroInput';
import ItineraryDisplay from './components/ItineraryDisplay';
import { generateItinerary } from './services/geminiService';
import { TripFormData, ItineraryResult, AppState } from './types';
import { CloudSun } from 'lucide-react';

// 更新 Logo 為 AI 科技化機器人圖示
const LOGO_IMAGE_URL = "data:image/png;base64,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";
// 飛機圖示 (使用卡通風格飛機模擬旅遊氛圍)
const PLANE_IMAGE_URL = "https://cdn-icons-png.flaticon.com/512/2200/2200326.png"; 

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFormSubmit = async (data: TripFormData) => {
    setAppState(AppState.GENERATING);
    setErrorMsg(null);
    setItinerary(null);

    try {
      // Generate Text Itinerary
      const result = await generateItinerary(data);
      setItinerary(result);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error("Itinerary generation failed", err);
      setErrorMsg(err.message || "發生錯誤，請稍後再試。");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.INPUT);
    setItinerary(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#f0f9f6] text-gray-800 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-emerald-50 to-[#f0f9f6]"></div>
        
        {/* Clouds */}
        <div className="absolute top-[10%] left-[5%] w-64 h-24 bg-white opacity-40 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-[20%] right-[10%] w-96 h-32 bg-white opacity-30 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Animated Airplane */}
        <div className="absolute top-[15%] left-[-10%] w-32 md:w-48 opacity-90 animate-fly-across z-0">
          <img 
            src={PLANE_IMAGE_URL} 
            alt="Travel Plane" 
            className="w-full h-auto drop-shadow-xl opacity-80"
          />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header Logo */}
        <header className="flex justify-center mb-12">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetApp}>
            {/* 更新 Logo 容器樣式：移除 p-1，加粗邊框，讓照片滿版顯示 */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white rotate-3 group-hover:rotate-6 transition-transform z-10 bg-white">
              <img 
                src={LOGO_IMAGE_URL} 
                alt="園長 Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-emerald-800 font-serif drop-shadow-sm">園長揪團遊日本</h1>
              <p className="text-xs text-emerald-600 font-medium tracking-widest uppercase">AI 旅遊規劃</p>
            </div>
          </div>
        </header>

        <main className="w-full relative">
          {appState === AppState.INPUT && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-serif leading-tight">
                  <span className="text-emerald-600">園長</span> 揪團<br/>遊日本
                </h2>
                <p className="text-lg text-gray-600">
                  輸入您的旅遊計畫，讓 AI 園長為您安排最道地的日本旅程。
                </p>
              </div>
              <HeroInput onSubmit={handleFormSubmit} isLoading={false} />
            </div>
          )}

          {appState === AppState.GENERATING && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CloudSun className="w-10 h-10 text-emerald-500 animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-emerald-800 mt-8">園長規劃中...</h3>
              <p className="text-gray-500 mt-2">正在為您搜尋最佳路線與私房景點...</p>
            </div>
          )}

          {appState === AppState.RESULT && itinerary && (
            <ItineraryDisplay 
              itinerary={itinerary} 
              onReset={resetApp}
            />
          )}

          {appState === AppState.ERROR && (
            <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl text-center border-l-8 border-red-400">
              <div className="text-5xl mb-4">😿</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">噢不，系統發生錯誤</h3>
              <p className="text-gray-600 mb-6">{errorMsg}</p>
              <button 
                onClick={resetApp}
                className="px-6 py-2 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors"
              >
                再試一次
              </button>
            </div>
          )}
        </main>
        
        <footer className="text-center text-emerald-800/40 text-sm mt-20 font-medium">
          <p>© {new Date().getFullYear()} 園長揪團遊日本 AI. Powered by Google Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;