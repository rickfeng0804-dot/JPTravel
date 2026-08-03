import React, { useEffect, useState, useRef } from 'react';
import { Map as MapIcon, Navigation } from 'lucide-react';
import { DayPlan, DAY_COLORS, GeoCoordinates } from '../types';
import * as L from 'leaflet';

interface DayMapGeneratorProps {
  dayPlan: DayPlan;
  destination: string;
}

interface RouteNode {
    name: string;
    geo?: GeoCoordinates;
}

// Helper function to calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string | null => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    
    if (d < 1) return `${(d * 1000).toFixed(0)}m`;
    return `${d.toFixed(1)}km`;
};

const DayMapGenerator: React.FC<DayMapGeneratorProps> = ({ dayPlan, destination }) => {
  const [routeNodes, setRouteNodes] = useState<RouteNode[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // 1. Calculate Stops
  useEffect(() => {
    // Filter activities that have meaningful locations
    const validActivities = dayPlan.activities.filter(a => 
        ['sightseeing', 'food', 'shopping', 'accommodation'].includes(a.type) && 
        a.location && a.location !== '無' && a.location !== 'TBD'
    );

    // Deduplicate consecutive locations
    const uniqueActivities = validActivities.filter((item, pos, arr) => 
        !pos || item.location !== arr[pos - 1].location
    );

    if (uniqueActivities.length < 1) {
        setRouteNodes([]);
        return;
    }

    setRouteNodes(uniqueActivities.map(a => ({ name: a.location, geo: a.geo })));
  }, [dayPlan, destination]);

  // 2. Render Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Cleanup previous map instance if it exists
    if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
    }

    // Get activities with valid coordinates for the visual map
    const activitiesWithGeo = dayPlan.activities.filter(a => 
        a.geo && a.geo.lat && a.geo.lng && a.location
    );

    // Deduplicate consecutive geo locations
    const routePoints = activitiesWithGeo.filter((item, pos, arr) => 
        !pos || (item.geo!.lat !== arr[pos - 1].geo!.lat && item.geo!.lng !== arr[pos - 1].geo!.lng)
    );

    if (routePoints.length === 0) return;

    // Initialize Map
    const startPoint = routePoints[0].geo!;
    const map = L.map(mapContainerRef.current).setView([startPoint.lat, startPoint.lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Define color for this day
    const dayColor = DAY_COLORS[(dayPlan.day - 1) % DAY_COLORS.length];

    // Create Markers
    const markers: L.Marker[] = [];
    const latLngs: L.LatLngExpression[] = [];

    routePoints.forEach((act, idx) => {
        if (!act.geo) return;
        
        latLngs.push([act.geo.lat, act.geo.lng]);

        const icon = L.divIcon({
            className: 'custom-day-route-marker',
            html: `<div style="background-color: ${dayColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px;">${idx + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });

        const marker = L.marker([act.geo.lat, act.geo.lng], { icon })
            .addTo(map)
            .bindPopup(`<b>${idx + 1}. ${act.activity}</b><br/>${act.location}`);
        markers.push(marker);
    });

    // Draw Polyline (Route)
    if (latLngs.length > 1) {
        L.polyline(latLngs, {
            color: dayColor,
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 10' // Dashed line to represent travel
        }).addTo(map);
    }

    // Fit bounds
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [30, 30] });
    }

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };

  }, [dayPlan]);


  if (routeNodes.length === 0) return null;

  return (
    <div className="mt-6 border-t border-emerald-100 pt-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 animate-fade-in">
           <div className="flex flex-col lg:flex-row gap-8">
              {/* Route List with Distances */}
              <div className="flex-1 min-w-[200px]">
                 <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-lg">
                    <Navigation className="w-5 h-5 text-red-500" />
                    Day {dayPlan.day} 路線順序圖
                 </h4>
                 
                 <div className="space-y-0">
                    {routeNodes.map((node, idx) => {
                      let distanceToNext = null;
                      if (idx < routeNodes.length - 1) {
                          const nextNode = routeNodes[idx + 1];
                          if (node.geo?.lat && node.geo?.lng && nextNode.geo?.lat && nextNode.geo?.lng) {
                              distanceToNext = calculateDistance(node.geo.lat, node.geo.lng, nextNode.geo.lat, nextNode.geo.lng);
                          }
                      }

                      return (
                      <div key={idx} className="relative">
                          {/* Node */}
                          <div className="flex items-center gap-3 relative z-10">
                              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white shrink-0 ${idx === 0 || idx === (routeNodes.length || 0) - 1 ? 'border-red-500 text-red-500 shadow-red-100 shadow-md' : 'border-gray-400 text-gray-400'}`}>
                                <span className="text-xs font-bold">{idx + 1}</span>
                              </div>
                              <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 w-full truncate shadow-sm">
                                {node.name}
                              </div>
                          </div>

                          {/* Connector Line & Distance */}
                          {idx < routeNodes.length - 1 && (
                              <div className="ml-[13px] h-10 border-l-2 border-dashed border-gray-300 my-1 flex items-center pl-4">
                                  {distanceToNext && (
                                      <span className="text-[10px] font-mono text-gray-400 bg-white px-1 py-0.5 rounded border border-gray-100">
                                          ⬇ {distanceToNext}
                                      </span>
                                  )}
                              </div>
                          )}
                      </div>
                    )})}
                 </div>
              </div>

              {/* Visual Map */}
              <div className="flex-[2] flex flex-col gap-4">
                 {/* Leaflet Map Container */}
                 <div className="w-full h-64 md:h-72 rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 relative z-0">
                    <div ref={mapContainerRef} className="w-full h-full z-0" />
                 </div>
              </div>
           </div>
        </div>
    </div>
  );
};

export default DayMapGenerator;