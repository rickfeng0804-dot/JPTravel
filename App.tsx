import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import HeroInput from './components/HeroInput';
import ItineraryDisplay from './components/ItineraryDisplay';
import { generateItinerary } from './services/geminiService';
import { TripFormData, ItineraryResult, AppState } from './types';
import { CloudSun } from 'lucide-react';

// 更新 Logo 為 AI 科技化機器人圖示
const LOGO_IMAGE_URL = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";
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