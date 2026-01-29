import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { ItineraryResult, DAY_COLORS } from '../types';

interface TripMapProps {
  itinerary: ItineraryResult;
}

// Fix for default marker icons in some build environments (pointing to CDN to be safe)
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Color markers for different days
const createDayIcon = (day: number) => {
  // Use shared color palette, cycling if more days than colors
  const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
  
  return L.divIcon({
    className: 'custom-day-marker',
    // Increased size to 28px and added thicker white border for better contrast
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${day}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const TripMap: React.FC<TripMapProps> = ({ itinerary }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([35.6762, 139.6503], 5); // Default Tokyo
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    
    // Clear existing layers (if itinerary updates)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const markers: L.Marker[] = [];
    const bounds = L.latLngBounds([]);

    // Iterate days and activities
    itinerary.days.forEach(day => {
      day.activities.forEach(act => {
        if (act.geo && typeof act.geo.lat === 'number' && typeof act.geo.lng === 'number') {
          // Validate logical coordinates
          if (act.geo.lat !== 0 && act.geo.lng !== 0) {
             const marker = L.marker([act.geo.lat, act.geo.lng], { icon: createDayIcon(day.day) })
              .addTo(map)
              .bindPopup(`
                <div class="font-sans">
                  <strong style="color: ${DAY_COLORS[(day.day - 1) % DAY_COLORS.length]}">Day ${day.day}</strong> - ${act.time}<br/>
                  <span class="text-lg font-bold">${act.activity}</span><br/>
                  <span class="text-gray-500 text-sm">${act.location}</span>
                </div>
              `);
            markers.push(marker);
            bounds.extend([act.geo.lat, act.geo.lng]);
          }
        }
      });
    });

    // Fit bounds if we have markers
    if (markers.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Cleanup on unmount
    return () => {
      // We generally keep the map instance if the component stays mounted but itinerary changes
      // If we wanted to destroy: map.remove(); mapInstanceRef.current = null;
    };
  }, [itinerary]);

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-inner border border-emerald-100 z-0">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />
    </div>
  );
};

export default TripMap;