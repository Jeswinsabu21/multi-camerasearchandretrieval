import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapPoint } from './map-types';

type Props = {
  points: MapPoint[];
  locate: { lat: number; lng: number } | null;
};

function numberedIcon(index: number) {
  return L.divIcon({
    className: 'map-marker',
    html: `<span>${index + 1}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export default function MovementMap({ points, locate }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const locateRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView([20.5937, 78.9629], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);
    points.forEach((point, index) => {
      const marker = L.marker([point.lat, point.lng], { icon: numberedIcon(index) });
      marker.bindPopup(
        `<strong>${index + 1}. ${point.label}</strong>${point.detail ? `<br/>${point.detail}` : ''}${point.time ? `<br/>${point.time}` : ''}`,
      );
      marker.addTo(layer);
    });
    if (latLngs.length > 1) {
      L.polyline(latLngs, { color: '#1d4ed8', weight: 3, opacity: 0.85, dashArray: '1 6', lineCap: 'round' }).addTo(layer);
      map.fitBounds(L.latLngBounds(latLngs).pad(0.25));
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 15);
    }
  }, [points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !locate) return;
    locateRef.current?.remove();
    locateRef.current = L.marker([locate.lat, locate.lng], {
      icon: L.divIcon({ className: 'map-marker map-marker-locate', html: '<span>◎</span>', iconSize: [26, 26], iconAnchor: [13, 13] }),
    }).addTo(map);
    locateRef.current.bindPopup(`Entered position<br/>${locate.lat.toFixed(5)}, ${locate.lng.toFixed(5)}`).openPopup();
    map.setView([locate.lat, locate.lng], 16);
  }, [locate]);

  return <div ref={containerRef} className="movement-map" role="application" aria-label="Movement route map" />;
}
