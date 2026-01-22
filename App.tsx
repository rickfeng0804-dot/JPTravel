import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import HeroInput from './components/HeroInput';
import ItineraryDisplay from './components/ItineraryDisplay';
import { generateItinerary } from './services/geminiService';
import { TripFormData, ItineraryResult, AppState } from './types';
import { CloudSun } from 'lucide-react';

// 更新 Logo 為 AI 科技化機器人圖示
const LOGO_IMAGE_URL = "data:image/jpeg;base64,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";
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