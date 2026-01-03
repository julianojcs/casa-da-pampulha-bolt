'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinIcon } from '@heroicons/react/24/solid';

// Fix for default marker icons in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom draggable marker icon
const draggableIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerProps {
  lat?: number;
  lng?: number;
  address?: string;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

// Geocode address using Nominatim
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'CasaDaPampulha/1.0' } }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to recenter map
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  address,
  onLocationChange,
  height = '250px'
}: LocationPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const defaultCenter: [number, number] = [-19.8516, -43.9688]; // Pampulha, BH

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update position when lat/lng props change
  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  // Handle marker drag
  const handleMarkerDrag = useCallback((e: L.DragEndEvent) => {
    const marker = e.target;
    const newPos = marker.getLatLng();
    setPosition([newPos.lat, newPos.lng]);
    onLocationChange(newPos.lat, newPos.lng);
  }, [onLocationChange]);

  // Handle map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  // Geocode address button
  const handleGeocodeAddress = async () => {
    if (!address) return;
    setIsGeocoding(true);
    const coords = await geocodeAddress(address);
    setIsGeocoding(false);
    if (coords) {
      setPosition([coords.lat, coords.lng]);
      onLocationChange(coords.lat, coords.lng);
    }
  };

  if (!isClient) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Localização no Mapa
        </label>
        {address && (
          <button
            type="button"
            onClick={handleGeocodeAddress}
            disabled={isGeocoding}
            className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 disabled:opacity-50"
          >
            <MapPinIcon className="h-3 w-3" />
            {isGeocoding ? 'Buscando...' : 'Buscar pelo endereço'}
          </button>
        )}
      </div>
      
      <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationChange={handleMapClick} />
          {position && <MapRecenter center={position} />}
          {position && (
            <Marker
              position={position}
              icon={draggableIcon}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDrag,
              }}
            />
          )}
        </MapContainer>
      </div>
      
      <p className="text-xs text-gray-500">
        💡 Clique no mapa ou arraste o marcador para definir a localização exata.
      </p>
    </div>
  );
}
