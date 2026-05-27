"use client";
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultLat = 15.894488;
const defaultLng = 108.245788;

export default function Map({ onLocationChange }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Fix leaflet marker icon issue in Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([defaultLat, defaultLng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      markerRef.current = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(mapRef.current);

      mapRef.current.on('click', function (e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        updateMarkerPosition(lat, lng);
      });

      markerRef.current.on('dragend', function (e) {
        const lat = markerRef.current.getLatLng().lat.toFixed(6);
        const lng = markerRef.current.getLatLng().lng.toFixed(6);
        updateMarkerPosition(lat, lng);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const updateMarkerPosition = (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };

  return <div id="map" style={{ height: '300px', width: '100%', zIndex: 1 }}></div>;
}
