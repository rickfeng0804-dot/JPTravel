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
const PLANE_IMAGE_URL = "data:image/jpeg;base64,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"; 

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