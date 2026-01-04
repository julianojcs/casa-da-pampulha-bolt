'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  MapPinIcon,
  ClockIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';

// Dynamic import for LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg h-[250px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600" />
    </div>
  ),
});

interface Place {
  _id: string;
  name: string;
  description: string;
  address: string;
  category: string;
  rating: number;
  distanceWalk: string;
  distanceCar: string;
  distance: string;
  image: string;
  mapUrl: string;
  isActive: boolean;
  lat?: number;
  lng?: number;
}

const categories = [
  { value: 'attractions', label: 'Atrações' },
  { value: 'restaurants', label: 'Restaurantes' },
  { value: 'bars', label: 'Bares' },
  { value: 'services', label: 'Serviços' },
  { value: 'sports', label: 'Esportes' },
  { value: 'kids', label: 'Crianças' },
];

const emptyPlace: Omit<Place, '_id'> = {
  name: '',
  description: '',
  address: '',
  category: 'attractions',
  rating: 5,
  distanceWalk: '',
  distanceCar: '',
  distance: '',
  image: '',
  mapUrl: '',
  isActive: true,
  lat: undefined,
  lng: undefined,
};

export default function AdminLocaisPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [formData, setFormData] = useState<Omit<Place, '_id'>>(emptyPlace);
  const [saving, setSaving] = useState(false);
  const [previewPlace, setPreviewPlace] = useState<Place | null>(null);

  // Função para extrair número da distância
  const parseDistance = (place: Place): number => {
    const distStr = place.distance || place.distanceCar || place.distanceWalk || '';
    const match = distStr.match(/([\d,.]+)/);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      // Se for em metros (ex: "500m"), converter para km
      if (distStr.toLowerCase().includes('m') && !distStr.toLowerCase().includes('km')) {
        return num / 1000;
      }
      // Se for minutos a pé, estimar distância (5km/h = 83m/min)
      if (distStr.toLowerCase().includes('min')) {
        return (num * 83) / 1000;
      }
      return num;
    }
    return 999; // Sem distância vai pro final
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-amber-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      toast.error('Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (place?: Place) => {
    if (place) {
      setEditingPlace(place);
      setFormData({
        name: place.name,
        description: place.description,
        address: place.address,
        category: place.category,
        rating: place.rating,
        distanceWalk: place.distanceWalk || '',
        distanceCar: place.distanceCar || '',
        distance: place.distance || '',
        image: place.image || '',
        mapUrl: place.mapUrl || '',
        isActive: place.isActive,
        lat: place.lat,
        lng: place.lng,
      });
    } else {
      setEditingPlace(null);
      setFormData(emptyPlace);
    }
    setIsModalOpen(true);
  };

  // Allow pasting combined coordinates ("lat, lng") into either coord input
  const handleCoordsPaste = (text: string) => {
    if (!text) return false;
    const matches = Array.from(text.matchAll(/(-?\d+(?:[\.,]\d+)?)/g)).map(m => m[1].replace(',', '.'));
    if (matches.length >= 2) {
      const lat = parseFloat(matches[0]);
      const lng = parseFloat(matches[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setFormData(prev => ({ ...prev, lat, lng }));
        return true;
      }
    }
    return false;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlace(null);
    setFormData(emptyPlace);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/places', {
        method: editingPlace ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingPlace
            ? { ...formData, _id: editingPlace._id }
            : formData
        ),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success(editingPlace ? 'Local atualizado!' : 'Local criado!');
      closeModal();
      fetchPlaces();
    } catch (error) {
      toast.error('Erro ao salvar local');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este local?')) return;

    try {
      const response = await fetch(`/api/places?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Local excluído!');
      fetchPlaces();
    } catch (error) {
      toast.error('Erro ao excluir local');
    }
  };

  const filteredPlaces = places
    .filter(place => {
      const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           place.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || place.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => parseDistance(a) - parseDistance(b));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Locais</h1>
          <p className="text-gray-500 mt-1">Gerencie os locais do guia local</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Novo Local</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar locais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Todas categorias</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : filteredPlaces.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Local
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distância
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPlaces.map((place) => (
                    <tr key={place._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {place.image && (
                            <button
                              onClick={() => setPreviewPlace(place)}
                              className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer"
                            >
                              <Image
                                src={place.image}
                                alt={place.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <EyeIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{place.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{place.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {categories.find(c => c.value === place.category)?.label || place.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {place.distance || place.distanceCar || place.distanceWalk || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          place.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {place.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openModal(place)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(place._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredPlaces.map((place) => (
                <div key={place._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    {place.image && (
                      <button
                        onClick={() => setPreviewPlace(place)}
                        className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 group"
                      >
                        <Image
                          src={place.image}
                          alt={place.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <EyeIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{place.name}</p>
                          <p className="text-sm text-gray-500 truncate">{place.address}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setPreviewPlace(place)}
                            className="p-2 text-gray-400 hover:text-green-600"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openModal(place)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(place._id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {categories.find(c => c.value === place.category)?.label || place.category}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          place.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {place.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        {(place.distance || place.distanceCar || place.distanceWalk) && (
                          <span className="text-xs text-gray-500">
                            {place.distance || place.distanceCar || place.distanceWalk}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum local encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPlace ? 'Editar Local' : 'Novo Local'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avaliação (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Coordenadas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) || undefined }))}
                    onPaste={(e) => {
                      const text = e.clipboardData?.getData('text') || '';
                      const handled = handleCoordsPaste(text);
                      if (handled) e.preventDefault();
                    }}
                    placeholder="Ex: -19.8516"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) || undefined }))}
                    onPaste={(e) => {
                      const text = e.clipboardData?.getData('text') || '';
                      const handled = handleCoordsPaste(text);
                      if (handled) e.preventDefault();
                    }}
                    placeholder="Ex: -43.9688"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Mapa para ajustar localização */}
                <div className="md:col-span-2">
                  <LocationPicker
                    lat={formData.lat}
                    lng={formData.lng}
                    address={formData.address}
                    onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distância a pé
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 10 min"
                    value={formData.distanceWalk}
                    onChange={(e) => setFormData(prev => ({ ...prev, distanceWalk: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distância de carro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5 min"
                    value={formData.distanceCar}
                    onChange={(e) => setFormData(prev => ({ ...prev, distanceCar: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distância (km)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2.5 km"
                    value={formData.distance}
                    onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem
                  </label>
                  <CloudinaryUpload
                    folder="local-guide"
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    label=""
                    placeholder="Clique para fazer upload da imagem"
                    previewClassName="h-40 w-full"
                    maxSizeKB={2048}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Google Maps
                  </label>
                  <input
                    type="url"
                    placeholder="https://maps.app.goo.gl/..."
                    value={formData.mapUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, mapUrl: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPlace && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreviewPlace(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <div className="relative h-48">
              {previewPlace.image ? (
                <Image
                  src={previewPlace.image}
                  alt={previewPlace.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <MapPinIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => setPreviewPlace(null)}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-1.5 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                  {categories.find(c => c.value === previewPlace.category)?.label}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {previewPlace.name}
                </h3>
                {renderStars(previewPlace.rating)}
              </div>

              <p className="text-gray-600 text-sm mb-3">
                {previewPlace.description}
              </p>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-amber-500" />
                  <span>{previewPlace.address}</span>
                </div>

                {previewPlace.distance && (
                  <div className="flex items-center space-x-2">
                    <MapIcon className="h-4 w-4 text-amber-500" />
                    <span>{previewPlace.distance}</span>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  {previewPlace.distanceWalk && (
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4 text-green-500" />
                      <span>🚶 {previewPlace.distanceWalk}</span>
                    </div>
                  )}
                  {previewPlace.distanceCar && (
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4 text-blue-500" />
                      <span>🚗 {previewPlace.distanceCar}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                {previewPlace.mapUrl && (
                  <a
                    href={previewPlace.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center space-x-1 px-4 py-2 text-amber-600 border border-amber-600 hover:bg-amber-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <MapPinIcon className="h-4 w-4" />
                    <span>Ver no Mapa</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    setPreviewPlace(null);
                    openModal(previewPlace);
                  }}
                  className="flex-1 inline-flex items-center justify-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
