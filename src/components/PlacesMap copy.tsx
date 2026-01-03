'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IPlace, Category, placeCategories } from '@/types';
import { StarIcon, MapPinIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { HomeIcon, NavigationIcon, MapIcon, RouteIcon } from 'lucide-react';

// Fix for default marker icons in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored markers
const createColoredIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Special home/residence marker
const homeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [41, 41]
});

const categoryColors: Record<string, string> = {
  attractions: 'violet',
  restaurants: 'orange',
  bars: 'yellow',
  services: 'blue',
  sports: 'green',
  kids: 'red',
  all: 'grey',
};

// Geocode address using Nominatim (OpenStreetMap)
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

// Fetch route from OSRM (free routing service)
async function fetchRoute(
  start: [number, number],
  end: [number, number]
): Promise<[number, number][] | null> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
      );
    }
  } catch (error) {
    console.error('Routing error:', error);
  }
  return null;
}

interface ResidenceInfo {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface PlacesMapProps {
  places: IPlace[];
  selectedCategory?: Category;
  center?: [number, number];
  zoom?: number;
  onPlaceClick?: (place: IPlace) => void;
  residence?: ResidenceInfo;
}

// Component to fit map bounds to markers (includes residence)
function FitBounds({ places, residenceCoords }: { places: IPlace[]; residenceCoords?: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    const validPlaces = places.filter(p => p.lat && p.lng);
    const points: [number, number][] = validPlaces.map(p => [p.lat!, p.lng!]);
    if (residenceCoords) {
      points.push(residenceCoords);
    }
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, places, residenceCoords]);

  return null;
}

// Place with geocoded coordinates
interface PlaceWithCoords extends IPlace {
  resolvedLat?: number;
  resolvedLng?: number;
}

export default function PlacesMap({
  places,
  selectedCategory = 'all',
  center = [-19.8516, -43.9688], // Pampulha, BH
  zoom = 14,
  onPlaceClick,
  residence
}: PlacesMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [residenceCoords, setResidenceCoords] = useState<[number, number] | undefined>(
    residence?.lat && residence?.lng ? [residence.lat, residence.lng] : undefined
  );
  const [geocodedPlaces, setGeocodedPlaces] = useState<PlaceWithCoords[]>([]);
  const [activeRoute, setActiveRoute] = useState<[number, number][] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Geocode residence address if no coordinates
  useEffect(() => {
    if (residence && !residence.lat && !residence.lng && residence.address) {
      geocodeAddress(residence.address).then((coords) => {
        if (coords) {
          setResidenceCoords([coords.lat, coords.lng]);
        }
      });
    } else if (residence?.lat && residence?.lng) {
      setResidenceCoords([residence.lat, residence.lng]);
    }
  }, [residence]);

  // Geocode places without coordinates
  useEffect(() => {
    const geocodePlaces = async () => {
      const results: PlaceWithCoords[] = await Promise.all(
        places.map(async (place) => {
          if (place.lat && place.lng) {
            return { ...place, resolvedLat: place.lat, resolvedLng: place.lng };
          }
          if (place.address) {
            const coords = await geocodeAddress(place.address);
            if (coords) {
              return { ...place, resolvedLat: coords.lat, resolvedLng: coords.lng };
            }
          }
          return place;
        })
      );
      setGeocodedPlaces(results);
    };
    geocodePlaces();
  }, [places]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!mapContainerRef.current) return;

    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Show route on map
  const showRouteOnMap = async (placeCoords: [number, number]) => {
    if (!residenceCoords) return;
    setRouteLoading(true);
    const route = await fetchRoute(residenceCoords, placeCoords);
    setRouteLoading(false);
    if (route) {
      setActiveRoute(route);
    }
  };

  // Open Google Maps directions
  const openGoogleMapsDirections = (place: IPlace) => {
    const destLat = place.lat || (place as PlaceWithCoords).resolvedLat;
    const destLng = place.lng || (place as PlaceWithCoords).resolvedLng;
    if (!destLat || !destLng) return;

    let url: string;
    if (residenceCoords) {
      url = `https://www.google.com/maps/dir/${residenceCoords[0]},${residenceCoords[1]}/${destLat},${destLng}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
    }
    window.open(url, '_blank');
  };

  if (!isClient) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  const filteredPlaces = geocodedPlaces.filter(place => {
    if (selectedCategory !== 'all' && place.category !== selectedCategory) {
      return false;
    }
    return place.resolvedLat && place.resolvedLng;
  });

  const renderStars = (rating: number) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-3 w-3 ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div
      ref={mapContainerRef}
      className={`rounded-xl overflow-hidden shadow-lg relative z-0 ${
        isFullscreen ? 'w-screen h-screen' : 'w-full h-[400px]'
      }`}
    >
      <MapContainer
        center={residenceCoords || center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds places={filteredPlaces} residenceCoords={residenceCoords} />

        {/* Residence Marker */}
        {residenceCoords && (
          <Marker position={residenceCoords} icon={homeIcon}>
            <Popup>
              <div className="min-w-[180px] text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <HomeIcon className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-gray-800">{residence?.name || 'Casa da Pampulha'}</h3>
                </div>
                <p className="text-xs text-gray-600">{residence?.address}</p>
                <div className="mt-2 px-2 py-1 bg-amber-100 rounded text-xs text-amber-700 font-medium">
                  📍 Sua hospedagem
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {activeRoute && (
          <Polyline
            positions={activeRoute}
            color="#f59e0b"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        {/* Place Markers */}
        {filteredPlaces.map((place) => (
          <Marker
            key={place._id}
            position={[place.resolvedLat!, place.resolvedLng!]}
            icon={createColoredIcon(categoryColors[place.category] || 'grey')}
            eventHandlers={{
              click: () => onPlaceClick?.(place),
            }}
          >
            <Popup>
              <div className="min-w-[220px]">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{place.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(place.rating)}
                      <span className="text-xs text-gray-500 ml-1">
                        {placeCategories.find(c => c.id === place.category)?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{place.description}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <MapPinIcon className="h-3 w-3 text-amber-500" />
                  <span className="truncate">{place.address}</span>
                </div>
                {place.distance && (
                  <div className="text-xs text-gray-500 mb-2">
                    📍 {place.distance}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-gray-100">
                  {residenceCoords && (
                    <button
                      onClick={() => showRouteOnMap([place.resolvedLat!, place.resolvedLng!])}
                      disabled={routeLoading}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 bg-amber-100 text-amber-700 rounded text-xs font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
                    >
                      <RouteIcon className="h-3 w-3" />
                      {routeLoading ? 'Carregando...' : 'Ver rota no mapa'}
                    </button>
                  )}
                  <button
                    onClick={() => openGoogleMapsDirections(place)}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    <NavigationIcon className="h-3 w-3" />
                    Navegar (Google Maps)
                  </button>
                  {place.mapUrl && (
                    <a
                      href={place.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 px-2 py-1.5 text-gray-600 rounded text-xs hover:bg-gray-100 transition-colors"
                    >
                      <MapIcon className="h-3 w-3" />
                      Ver no Google Maps →
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-colors"
        title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
      >
        {isFullscreen ? (
          <ArrowsPointingInIcon className="h-5 w-5 text-gray-700" />
        ) : (
          <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Clear Route Button */}
      {activeRoute && (
        <button
          onClick={() => setActiveRoute(null)}
          className="absolute top-4 right-16 z-[1000] bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-colors"
          title="Limpar rota"
        >
          <XMarkIcon className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000] text-xs">
        <div className="font-medium text-gray-700 mb-2">Legenda</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFD700' }} />
            <span className="text-gray-600 font-medium">Residência</span>
          </div>
          {placeCategories.filter(c => c.id !== 'all').map((cat) => (
            <div key={cat.id} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getMarkerColor(categoryColors[cat.id]) }}
              />
              <span className="text-gray-600">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to get actual color from marker name
function getMarkerColor(colorName: string): string {
  const colors: Record<string, string> = {
    violet: '#9B59B6',
    orange: '#F39C12',
    yellow: '#F1C40F',
    blue: '#3498DB',
    green: '#2ECC71',
    red: '#E74C3C',
    grey: '#95A5A6',
  };
  return colors[colorName] || colors.grey;
}
