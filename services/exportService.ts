import * as XLSX from 'xlsx';
import { ItineraryResult } from '../types';

export const exportItineraryToExcel = (itinerary: ItineraryResult) => {
  // --- Sheet 1: 行程規劃 ---
  const itineraryRows: any[] = [];
  itinerary.days.forEach((day) => {
    day.activities.forEach((activity) => {
      itineraryRows.push({
        '天數': `Day ${day.day}`,
        '今日主題': day.theme,
        '時間': activity.time,
        '活動項目': activity.activity,
        '地點': activity.location,
        '活動說明': activity.description,
        '預算估算': activity.costEstimate || '-'
      });
    });
    // Add an empty row for visual separation between days
    itineraryRows.push({});
  });

  const itineraryWorksheet = XLSX.utils.json_to_sheet(itineraryRows);
  
  // Set column widths for Itinerary
  const wscolsItinerary = [
    { wch: 8 },  // Day
    { wch: 25 }, // Theme
    { wch: 12 }, // Time
    { wch: 25 }, // Activity
    { wch: 25 }, // Location
    { wch: 60 }, // Description
    { wch: 15 }, // Cost
  ];
  itineraryWorksheet['!cols'] = wscolsItinerary;


  // --- Sheet 2: 伴手禮清單 ---
  const shoppingRows: any[] = [];
  if (itinerary.recommendedSouvenirs && itinerary.recommendedSouvenirs.length > 0) {
    itinerary.recommendedSouvenirs.forEach((item) => {
      shoppingRows.push({
        '商品名稱': item.name,
        '參考價格': item.estimatedPrice,
        '推薦購買地點': item.bestPlaceToBuy,
        '商品介紹': item.description
      });
    });
  } else {
    shoppingRows.push({'提示': '本次行程未產生購物清單'});
  }

  const shoppingWorksheet = XLSX.utils.json_to_sheet(shoppingRows);

  // Set column widths for Shopping List
  const wscolsShopping = [
    { wch: 25 }, // Name
    { wch: 15 }, // Price
    { wch: 30 }, // Place
    { wch: 50 }, // Description
  ];
  shoppingWorksheet['!cols'] = wscolsShopping;

  // --- Workbook Creation ---
  const workbook = XLSX.utils.book_new();
  
  // Append sheets
  XLSX.utils.book_append_sheet(workbook, itineraryWorksheet, "行程規劃");
  XLSX.utils.book_append_sheet(workbook, shoppingWorksheet, "伴手禮清單");
  
  // Generate filename based on the itinerary title
  const safeTitle = itinerary.title.replace(/[^\w\s\u4e00-\u9fa5]/gi, '_').trim();
  const fileName = `GhibliTrip_${safeTitle}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(workbook, fileName);
};
