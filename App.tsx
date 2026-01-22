import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import HeroInput from './components/HeroInput';
import ItineraryDisplay from './components/ItineraryDisplay';
import { generateItinerary } from './services/geminiService';
import { TripFormData, ItineraryResult, AppState } from './types';
import { CloudSun } from 'lucide-react';

// 更新 Logo 為 AI 科技化機器人圖示
const LOGO_IMAGE_URL = "data:image/jpeg;base64,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"
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
      
      {/* Background Ambience - Hidden when printing */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden print:hidden">
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

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 print:p-0 print:w-full print:max-w-none">
        {/* Header Logo - Hidden when printing */}
        <header className="flex justify-center mb-12 print:hidden">
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
        
        {/* Footer - Hidden when printing */}
        <footer className="text-center text-emerald-800/40 text-sm mt-20 font-medium print:hidden">
          <p>© {new Date().getFullYear()} 園長揪團遊日本 AI. Powered by Google Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;