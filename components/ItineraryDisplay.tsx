import React, { useState, useEffect, useRef } from 'react';
import { ItineraryResult, DayPlan, Activity, SouvenirItem, FoodItem } from '../types';
import { MapPin, ArrowLeft, ShoppingBag, Gift, Utensils, Camera, Train, Bed, ChevronDown, ChevronUp, BookOpen, Download, Loader2, Sparkles, Image as ImageIcon, FileSpreadsheet, Map, List, Send, FileText } from 'lucide-react';
import ActivityIllustration from './ActivityIllustration';
import DayMapGenerator from './DayMapGenerator';
import TripMap from './TripMap';
import { generateDayScheduleImage, generateItineraryCoverImage } from '../services/geminiService';
import { exportDayItineraryToExcel, exportItineraryToExcel } from '../services/exportService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ItineraryDisplayProps {
  itinerary: ItineraryResult;
  onReset: () => void;
}

const ACTIVITY_STYLES: Record<string, { icon: React.ReactNode, color: string, bg: string, border: string, ring: string, label: string }> = {
  sightseeing: { icon: <Camera className="w-4 h-4" />, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', ring: 'ring-emerald-200', label: '景點' },
  food: { icon: <Utensils className="w-4 h-4" />, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', ring: 'ring-orange-200', label: '美食' },
  transport: { icon: <Train className="w-4 h-4" />, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', ring: 'ring-blue-200', label: '交通' },
  shopping: { icon: <ShoppingBag className="w-4 h-4" />, color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-100', ring: 'ring-pink-200', label: '購物' },
  accommodation: { icon: <Bed className="w-4 h-4" />, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', ring: 'ring-indigo-200', label: '住宿' },
  other: { icon: <MapPin className="w-4 h-4" />, color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', ring: 'ring-gray-300', label: '其他' }
};

type ViewMode = 'list' | 'map';

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onReset }) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [sharingDay, setSharingDay] = useState<number | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isCoverLoading, setIsCoverLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBeforePrint = () => {
      setIsSummaryOpen(true);
      setViewMode('list'); // Force list view for printing
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

  const handleExportExcel = () => {
    exportItineraryToExcel(itinerary);
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsPdfLoading(true);

    try {
        // 1. 強制切換到列表模式並展開摘要，確保內容完整
        setViewMode('list');
        setIsSummaryOpen(true);
        // 等待 React 渲染完成
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. 截圖
        const canvas = await html2canvas(contentRef.current, {
            scale: 2, // 提高解析度
            useCORS: true, // 允許跨域圖片 (如 Gemini 生成的圖片)
            logging: false,
            backgroundColor: '#ffffff'
        });

        // 3. 轉換為 PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        
        // 計算 PDF 尺寸
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // 使用 A4 寬度 (210mm)，高度依比例調整，製作成「長條圖」PDF 以避免內容被切斷
        const pdfWidth = 210; 
        const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

        const pdf = new jsPDF({
            orientation: pdfHeight > pdfWidth ? 'p' : 'l',
            unit: 'mm',
            format: [pdfWidth, pdfHeight] // 自訂尺寸
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${itinerary.title || 'Japan_Trip'}_Itinerary.pdf`);

    } catch (error) {
        console.error("PDF generation failed:", error);
        alert("PDF 產生失敗，請稍後再試。");
    } finally {
        setIsPdfLoading(false);
    }
  };

  const handleShareDay = async (dayPlan: DayPlan) => {
    setSharingDay(dayPlan.day);
    try {
      const imageUrl = await generateDayScheduleImage(dayPlan, itinerary.destination || itinerary.title);
      
      // Try to use native sharing if available (for mobile "Save to Photos")
      if (navigator.share && navigator.canShare) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `Day${dayPlan.day}_Itinerary.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `園長揪團 Day ${dayPlan.day}`,
            text: `Day ${dayPlan.day}: ${dayPlan.theme}`
          });
          return;
        }
      }

      // Fallback: Trigger download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `Day${dayPlan.day}_${itinerary.destination || 'Japan'}_Schedule.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Failed to share day:", error);
      alert("生成分享圖片失敗，請稍後再試。");
    } finally {
      setSharingDay(null);
    }
  };

  const handleGenerateCover = async () => {
    setIsCoverLoading(true);
    try {
      const url = await generateItineraryCoverImage(itinerary.title, itinerary.destination || "Japan");
      setCoverImage(url);
    } catch (error) {
      console.error("Failed to generate cover:", error);
      alert("封面生成失敗，請稍後再試。");
    } finally {
      setIsCoverLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in-up print:space-y-4 print:pb-0">
      <style>{`
        @media print {
          @page { margin: 10mm; size: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-emerald-50 print:hidden">
        <div className="flex w-full md:w-auto justify-between items-center gap-2">
            <button onClick={onReset} className="flex items-center text-gray-600 hover:text-emerald-600 font-semibold transition-colors">
              <ArrowLeft className="w-5 h-5 mr-1" />
              重來
            </button>
            
            <div className="flex gap-2 md:hidden">
                <button onClick={handleDownloadPDF} disabled={isPdfLoading} className="flex items-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50">
                    {isPdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                </button>
                <button onClick={handleExportExcel} className="flex items-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors">
                    <FileSpreadsheet className="w-4 h-4" />
                </button>
            </div>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center truncate max-w-xs md:max-w-md">{itinerary.title}</h1>
        <div className="w-auto hidden md:flex gap-2 justify-end">
             <button 
                onClick={handleDownloadPDF} 
                disabled={isPdfLoading}
                className="flex items-center text-emerald-600 hover:text-emerald-700 font-semibold transition-colors gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
             >
                {isPdfLoading ? (
                   <><Loader2 className="w-4 h-4 animate-spin" /> 轉檔中...</>
                ) : (
                   <><FileText className="w-4 h-4" /> 下載 PDF</>
                )}
            </button>
             <button onClick={handleExportExcel} className="flex items-center text-emerald-600 hover:text-emerald-700 font-semibold transition-colors gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100">
                <FileSpreadsheet className="w-4 h-4" />
                匯出 Excel
            </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex justify-center mb-6 print:hidden">
        <div className="bg-emerald-100/50 p-1 rounded-full border border-emerald-200 flex gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              viewMode === 'list' 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-emerald-600 hover:bg-emerald-200/50'
            }`}
          >
            <List className="w-4 h-4" />
            行程列表
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              viewMode === 'map' 
                ? 'bg-white text-emerald-700 shadow-sm' 
                : 'text-emerald-600 hover:bg-emerald-200/50'
            }`}
          >
            <Map className="w-4 h-4" />
            地圖檢視
          </button>
        </div>
      </div>

      {/* Content Wrapper for PDF Capture */}
      <div ref={contentRef} className="bg-[#f0f9f6]">
        {/* Main Content - Summary Card */}
        <div className={`bg-white/90 rounded-3xl overflow-hidden shadow-lg border border-emerald-50 mb-8 print:border-2 print:bg-white ${viewMode === 'map' ? 'hidden' : ''}`}>
          <button onClick={() => setIsSummaryOpen(!isSummaryOpen)} className="w-full flex items-center justify-between p-6 bg-emerald-50/30 hover:bg-emerald-50 transition-colors text-left print:hidden">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-emerald-100 rounded-lg"><BookOpen className="w-5 h-5 text-emerald-700" /></div>
               <div><h2 className="text-lg font-bold text-emerald-900">行程總覽</h2></div>
            </div>
            {isSummaryOpen ? <ChevronUp className="w-5 h-5 text-emerald-600" /> : <ChevronDown className="w-5 h-5 text-emerald-600" />}
          </button>
          
          <div className={`p-8 pt-6 text-center border-t border-emerald-50/50 animate-fade-in print:block ${isSummaryOpen ? 'block' : 'hidden'}`}>
              
              {/* Cover Image Section */}
              <div className={`relative w-full aspect-video md:aspect-[21/9] bg-emerald-50 mb-8 rounded-2xl overflow-hidden shadow-inner group border border-emerald-100 ${coverImage ? '' : 'print:hidden'}`}>
                {coverImage ? (
                  <>
                    <img 
                      src={coverImage} 
                      alt="Itinerary Cover" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent flex flex-col justify-end p-6 text-left">
                       <span className="text-emerald-200 text-xs font-bold tracking-widest uppercase mb-1 bg-black/20 backdrop-blur w-fit px-2 py-1 rounded">Studio Ghibli Style</span>
                       <h2 className="text-2xl md:text-3xl font-serif font-bold text-white drop-shadow-lg">{itinerary.title}</h2>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                     {isCoverLoading ? (
                       <div className="flex flex-col items-center text-emerald-600">
                          <Loader2 className="w-10 h-10 animate-spin mb-3" />
                          <span className="font-medium">正在繪製吉卜力風格封面...</span>
                       </div>
                     ) : (
                       <div className="text-center">
                          <h3 className="text-emerald-800 font-bold text-xl mb-3">為您的行程增添魔法</h3>
                          <button 
                            onClick={handleGenerateCover}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold shadow-lg hover:shadow-emerald-200/50 hover:scale-105 transition-all"
                          >
                            <Sparkles className="w-5 h-5" />
                            生成吉卜力風格封面
                          </button>
                          <p className="text-xs text-emerald-600/60 mt-3">AI 繪製宮崎駿動畫風格專屬插圖</p>
                       </div>
                     )}
                  </div>
                )}
              </div>

              {/* Default Title */}
              {(!coverImage) && (
                <div className="mb-6">
                  {itinerary.destination && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {itinerary.destination}
                      </div>
                  )}
                  <h2 className="text-3xl font-bold text-emerald-800 font-serif mb-2 print:block">{itinerary.title}</h2>
                </div>
              )}
              
              {/* Print Header Logic */}
              <div className={`hidden print:block mb-6 ${coverImage ? 'print:hidden' : ''}`}>
                 <h1 className="text-3xl font-bold text-emerald-800">{itinerary.title}</h1>
                 <div className="text-sm text-gray-500 mt-2">{itinerary.destination} • 園長揪團遊日本</div>
              </div>

              <p className="text-lg text-gray-600 italic leading-relaxed max-w-3xl mx-auto text-left md:text-center">
                {itinerary.summary}
              </p>
          </div>
        </div>

        {/* --- LIST VIEW --- */}
        {viewMode === 'list' && (
          <div className="space-y-8 print:space-y-6">
            {itinerary.days.map((day: DayPlan) => (
              <div key={day.day} className="bg-white/90 rounded-3xl overflow-hidden shadow-xl border border-emerald-100 print:shadow-none print:border print:bg-white">
                <div className="bg-emerald-600 p-4 md:p-6 flex items-center justify-between text-white">
                  <div>
                    <h3 className="font-bold text-2xl md:text-3xl font-serif">Day {day.day}</h3>
                    <p className="text-emerald-100 font-medium mt-1">{day.theme}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => exportDayItineraryToExcel(day, itinerary.title)}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/30 print:hidden"
                      title="匯出當日行程為 Excel 檔案"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      下載 Excel
                    </button>
                    <button 
                      onClick={() => handleShareDay(day)}
                      disabled={sharingDay === day.day}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/30 disabled:opacity-50 print:hidden"
                    >
                      {sharingDay === day.day ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          製作中
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          分享
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6 md:p-8 relative print:p-4">
                    <div className="absolute left-8 md:left-10 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                    <div className="space-y-8 print:space-y-4">
                      {day.activities.map((act: Activity, idx) => {
                          const style = ACTIVITY_STYLES[act.type || 'other'];
                          return (
                            <div key={idx} className="relative pl-10 md:pl-12 group print:pl-8">
                                <div className={`absolute left-2 md:left-4 top-2 w-4 h-4 rounded-full bg-white ring-[3px] ${style.ring}`}>
                                  <div className={`w-full h-full rounded-full opacity-60 ${style.bg.replace('bg-', 'bg-')}`}></div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold font-mono border ${style.bg} ${style.color} ${style.border}`}>
                                        {style.icon} {act.time}
                                    </span>
                                    <h4 className="text-xl font-bold text-gray-800">{act.activity}</h4>
                                </div>
                                <div className="flex items-start text-sm text-gray-500 mb-3 ml-1">
                                    <MapPin className="w-3.5 h-3.5 mt-0.5 mr-1 shrink-0 text-red-400" />
                                    {act.location}
                                </div>
                                <div className={`p-4 rounded-xl border ${style.bg} ${style.border} bg-opacity-40`}>
                                  <p className="text-gray-700 text-sm leading-relaxed">{act.description}</p>
                                  <div className="print:hidden">
                                    {['sightseeing', 'food', 'accommodation', 'shopping'].includes(act.type) && (
                                      <ActivityIllustration activity={act.activity} location={act.location} description={act.description} />
                                    )}
                                  </div>
                                </div>
                            </div>
                          );
                      })}
                    </div>
                    <div className="print:hidden">
                      <DayMapGenerator dayPlan={day} destination={itinerary.destination || itinerary.title} />
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MAP VIEW --- */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-emerald-100 p-1 animate-fade-in">
            <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
              <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                <Map className="w-5 h-5" />
                行程地圖總覽
              </h3>
              <span className="text-xs text-emerald-600 bg-white px-2 py-1 rounded-md border border-emerald-200">
                {itinerary.days.length} 天行程 • {itinerary.days.reduce((acc, d) => acc + d.activities.filter(a => a.geo).length, 0)} 個景點
              </span>
            </div>
            <div className="p-4">
               <TripMap itinerary={itinerary} />
               <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {itinerary.days.map((day) => (
                    <div key={day.day} className="flex items-center gap-1.5 text-xs font-medium bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'][(day.day - 1) % 7] }}
                      ></div>
                      Day {day.day}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* Footer Lists */}
        <div className={`grid md:grid-cols-2 gap-8 mt-12 print:grid-cols-1 ${viewMode === 'map' ? 'hidden' : ''}`}>
          {itinerary.recommendedFood?.length > 0 && (
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-3xl p-8 shadow-lg border border-red-100 flex flex-col h-full print:bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-full"><Utensils className="w-8 h-8 text-red-600" /></div>
                <div>
                  <h3 className="text-2xl font-bold text-red-800 font-serif">必吃美食清單</h3>
                  <p className="text-red-600/80 text-sm">園長精選在地好味道</p>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                {itinerary.recommendedFood.map((item: FoodItem, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                        <span className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded-full">{item.estimatedPrice}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center text-xs text-red-600 font-medium border-t border-red-50 pt-2"><MapPin className="w-3 h-3 mr-1" />推薦店家: {item.bestPlaceToEat}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {itinerary.recommendedSouvenirs?.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-lg border border-orange-100 flex flex-col h-full print:bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-full"><ShoppingBag className="w-8 h-8 text-orange-600" /></div>
                <div>
                  <h3 className="text-2xl font-bold text-orange-800 font-serif">必買伴手禮清單</h3>
                  <p className="text-orange-600/80 text-sm">園長推薦土特產</p>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                {itinerary.recommendedSouvenirs.map((item: SouvenirItem, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Gift className="w-4 h-4 text-orange-400" />{item.name}</h4>
                        <span className="text-xs font-mono bg-orange-100 text-orange-800 px-2 py-1 rounded-full">{item.estimatedPrice}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center text-xs text-orange-600 font-medium border-t border-orange-50 pt-2"><MapPin className="w-3 h-3 mr-1" />推薦地點: {item.bestPlaceToBuy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryDisplay;