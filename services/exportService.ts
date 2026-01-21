import * as XLSX from 'xlsx';
import { ItineraryResult } from '../types';

export const exportItineraryToExcel = (itinerary: ItineraryResult) => {
  const rows: any[] = [];

  // Flatten the itinerary structure for the spreadsheet
  itinerary.days.forEach((day) => {
    day.activities.forEach((activity) => {
      rows.push({
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
    rows.push({});
  });

  // Create a new workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  
  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "行程規劃");
  
  // Set column widths (approximate character width)
  const wscols = [
    { wch: 8 },  // Day
    { wch: 25 }, // Theme
    { wch: 12 }, // Time
    { wch: 25 }, // Activity
    { wch: 25 }, // Location
    { wch: 60 }, // Description
    { wch: 15 }, // Cost
  ];
  worksheet['!cols'] = wscols;

  // Generate filename based on the itinerary title
  const safeTitle = itinerary.title.replace(/[^\w\s\u4e00-\u9fa5]/gi, '_').trim();
  const fileName = `GhibliTrip_${safeTitle}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(workbook, fileName);
};
