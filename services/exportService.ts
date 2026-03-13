import * as XLSX from 'xlsx';
import { ItineraryResult, DayPlan } from '../types';

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

  // Start the table data from row 5 (A5) to make room for title and summary
  const itineraryWorksheet = XLSX.utils.json_to_sheet(itineraryRows, { origin: "A5" });
  
  // Add Title and Summary at the top (A1 and A2)
  XLSX.utils.sheet_add_aoa(itineraryWorksheet, [
    ["行程標題", itinerary.title],
    ["行程摘要", itinerary.summary],
    [], // Spacer
    []  // Spacer
  ], { origin: "A1" });
  
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


  // --- Sheet 2: 必吃美食清單 ---
  const foodRows: any[] = [];
  if (itinerary.recommendedFood && itinerary.recommendedFood.length > 0) {
    itinerary.recommendedFood.forEach((item) => {
      foodRows.push({
        '美食名稱': item.name,
        '參考價格': item.estimatedPrice,
        '推薦店家/區域': item.bestPlaceToEat,
        '特色介紹': item.description
      });
    });
  } else {
    foodRows.push({'提示': '本次行程未產生美食清單'});
  }

  const foodWorksheet = XLSX.utils.json_to_sheet(foodRows);
  const wscolsFood = [
    { wch: 25 }, // Name
    { wch: 15 }, // Price
    { wch: 30 }, // Place
    { wch: 50 }, // Description
  ];
  foodWorksheet['!cols'] = wscolsFood;


  // --- Sheet 3: 伴手禮清單 ---
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
  XLSX.utils.book_append_sheet(workbook, foodWorksheet, "必吃美食清單");
  XLSX.utils.book_append_sheet(workbook, shoppingWorksheet, "伴手禮清單");
  
  // Generate filename based on the itinerary title
  const safeTitle = itinerary.title.replace(/[^\w\s\u4e00-\u9fa5]/gi, '_').trim();
  const fileName = `JapanTrip_${safeTitle}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(workbook, fileName);
};

/**
 * Exports a single day's itinerary to an Excel file.
 */
export const exportDayItineraryToExcel = (day: DayPlan, tripTitle: string) => {
  const rows: any[] = [];
  
  day.activities.forEach((activity) => {
    rows.push({
      '時間': activity.time,
      '活動項目': activity.activity,
      '地點': activity.location,
      '活動說明': activity.description,
      '預算估算': activity.costEstimate || '-'
    });
  });

  // Start table at A4
  const worksheet = XLSX.utils.json_to_sheet(rows, { origin: "A4" });

  // Add Header Info at A1
  XLSX.utils.sheet_add_aoa(worksheet, [
    ["行程", tripTitle],
    ["日期/主題", `Day ${day.day}: ${day.theme}`],
    [] // Spacer
  ], { origin: "A1" });

  // Column widths
  const wscols = [
    { wch: 12 }, // Time
    { wch: 25 }, // Activity
    { wch: 25 }, // Location
    { wch: 60 }, // Description
    { wch: 15 }, // Cost
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  const sheetName = `Day ${day.day}`;
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const safeTitle = tripTitle.replace(/[^\w\s\u4e00-\u9fa5]/gi, '_').trim();
  const fileName = `Day${day.day}_${safeTitle}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};