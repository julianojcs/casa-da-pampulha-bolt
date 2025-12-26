'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Property {
  _id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: { lat: number; lng: number };
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  airbnbUrl: string;
  airbnbCalendarUrl: string;
  heroImage: string;
  heroImages: string[];
  welcomeMessage: string;
  isActive: boolean;
}

const emptyProperty: Omit<Property, '_id'> = {
  name: '',
  tagline: '',
  description: '',
  address: '',
  city: '',
  state: '',
  country: 'Brasil',
  zipCode: '',
  coordinates: { lat: 0, lng: 0 },
  maxGuests: 12,
  bedrooms: 4,
  beds: 7,
  bathrooms: 5,
  checkInTime: '15:00',
  checkOutTime: '11:00',
  minNights: 3,
  airbnbUrl: '',
  airbnbCalendarUrl: '',
  heroImage: '',
  heroImages: [],
  welcomeMessage: '',
  isActive: true,
};

export default function AdminPropriedadePage() {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<Property, '_id'>>(emptyProperty);
  const [saving, setSaving] = useState(false);
  const [heroImageInput, setHeroImageInput] = useState('');

  useEffect(() => {
    fetchProperty();
  }, []);

  const fetchProperty = async () => {
    try {
      const response = await fetch('/api/property');
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
        setFormData({
          name: data.name || '',
          tagline: data.tagline || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'Brasil',
          zipCode: data.zipCode || '',
          coordinates: data.coordinates || { lat: 0, lng: 0 },
          maxGuests: data.maxGuests || 12,
          bedrooms: data.bedrooms || 4,
          beds: data.beds || 7,
          bathrooms: data.bathrooms || 5,
          checkInTime: data.checkInTime || '15:00',
          checkOutTime: data.checkOutTime || '11:00',
          minNights: data.minNights || 3,
          airbnbUrl: data.airbnbUrl || '',
          airbnbCalendarUrl: data.airbnbCalendarUrl || '',
          heroImage: data.heroImage || '',
          heroImages: data.heroImages || [],
          welcomeMessage: data.welcomeMessage || '',
          isActive: data.isActive ?? true,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar propriedade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success('Propriedade atualizada!');
      fetchProperty();
    } catch (error) {
      toast.error('Erro ao salvar propriedade');
    } finally {
      setSaving(false);
    }
  };

  const addHeroImage = () => {
    if (heroImageInput.trim()) {
      setFormData({
        ...formData,
        heroImages: [...formData.heroImages, heroImageInput.trim()],
      });
      setHeroImageInput('');
    }
  };

  const removeHeroImage = (index: number) => {
    setFormData({
      ...formData,
      heroImages: formData.heroImages.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Configurações da Propriedade</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Informações Básicas */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Capacidade */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Capacidade</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Hóspedes</label>
              <input
                type="number"
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Camas</label>
              <input
                type="number"
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Horários e Reserva */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Horários e Reserva</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
              <input
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
              <input
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo Noites</label>
              <input
                type="number"
                value={formData.minNights}
                onChange={(e) => setFormData({ ...formData, minNights: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Airbnb</label>
              <input
                type="url"
                value={formData.airbnbUrl}
                onChange={(e) => setFormData({ ...formData, airbnbUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Calendário Airbnb</label>
              <input
                type="url"
                value={formData.airbnbCalendarUrl}
                onChange={(e) => setFormData({ ...formData, airbnbCalendarUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Imagens */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Imagens</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Principal</label>
            <input
              type="text"
              value={formData.heroImage}
              onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
              placeholder="/gallery/imagem.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagens do Carrossel</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={heroImageInput}
                onChange={(e) => setHeroImageInput(e.target.value)}
                placeholder="/gallery/imagem.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addHeroImage}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Adicionar
              </button>
            </div>
            {formData.heroImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.heroImages.map((img, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                    {img}
                    <button type="button" onClick={() => removeHeroImage(index)}>
                      <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mensagem de Boas-vindas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Boas-vindas</label>
          <textarea
            value={formData.welcomeMessage}
            onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
