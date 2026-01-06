'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';
import { TransferList } from '@/components/TransferList';

// Default/suggested gallery categories
const defaultGalleryCategories = [
  'Fachada e Entrada',
  'Áreas Comuns',
  'Sala de Estar',
  'Quartos',
  'Suite Master',
  'Quarto Crianças',
  'Quarto Família',
  'Cozinha',
  'Área Gourmet',
  'Banheiros',
  'Área Externa',
  'Jardim',
  'Piscina/Jacuzzi',
  'Playground',
  'Estacionamento',
  'Arredores',
  'Comodidades',
  'Vizinhança',
  'Loft',
  'Vídeos',
];

interface Property {
  _id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
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
  rating: number;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  airbnbUrl: string;
  airbnbCalendarUrl: string;
  heroImage: string;
  heroImages: string[];
  welcomeMessage: string;
  isActive: boolean;
  // Contatos
  phone: string;
  phoneVisibility: 'public' | 'restricted' | 'private';
  whatsapp: string;
  email: string;
  // Senhas
  doorPasswords: { location: string; password: string; notes?: string }[];
  doorPasswordConfig: {
    showToGuests: boolean;
    addHashSuffix: boolean;
    hashSuffixNote: string;
  };
  wifiPasswords: { network: string; password: string }[];
  // Hero Section - textos dinâmicos
  heroTagline: string;
  heroSubtitle: string;
  heroHighlights: string[];
  // About Section - textos dinâmicos
  aboutTitle: string;
  aboutDescription: string[];
  // Gallery Categories
  galleryCategories: string[];
}

const emptyProperty: Omit<Property, '_id'> = {
  name: '',
  tagline: '',
  description: '',
  logo: '',
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
  rating: 0,
  checkInTime: '15:00',
  checkOutTime: '11:00',
  minNights: 3,
  airbnbUrl: '',
  airbnbCalendarUrl: '',
  heroImage: '',
  heroImages: [],
  welcomeMessage: '',
  isActive: true,
  // Contatos
  phone: '',
  phoneVisibility: 'restricted',
  whatsapp: '',
  email: '',
  // Senhas
  doorPasswords: [],
  doorPasswordConfig: {
    showToGuests: true,
    addHashSuffix: false,
    hashSuffixNote: 'Tecle # depois da senha',
  },
  wifiPasswords: [],
  // Hero Section - textos dinâmicos
  heroTagline: '',
  heroSubtitle: '',
  heroHighlights: [],
  // About Section - textos dinâmicos
  aboutTitle: '',
  aboutDescription: [],
  // Gallery Categories
  galleryCategories: ['Fachada e Entrada', 'Áreas Comuns', 'Quartos', 'Cozinha', 'Banheiros', 'Área Externa', 'Piscina', 'Comodidades', 'Vizinhança'],
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
          logo: data.logo || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'Brasil',
          zipCode: data.zipCode || '',
          coordinates: data.coordinates || { lat: 0, lng: 0 },
          maxGuests: data.maxGuests || null,
          bedrooms: data.bedrooms || null,
          beds: data.beds || null,
          bathrooms: data.bathrooms || null,
          rating: data.rating || null,
          checkInTime: data.checkInTime || '15:00',
          checkOutTime: data.checkOutTime || '11:00',
          minNights: data.minNights || null,
          airbnbUrl: data.airbnbUrl || '',
          airbnbCalendarUrl: data.airbnbCalendarUrl || '',
          heroImage: data.heroImage || '',
          heroImages: data.heroImages || [],
          welcomeMessage: data.welcomeMessage || '',
          isActive: data.isActive ?? true,
          // Contatos
          phone: data.phone || '',
          phoneVisibility: data.phoneVisibility || 'restricted',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          // Senhas
          doorPasswords: data.doorPasswords || [],
          doorPasswordConfig: data.doorPasswordConfig || {
            showToGuests: true,
            addHashSuffix: false,
            hashSuffixNote: 'Tecle # depois da senha',
          },
          wifiPasswords: data.wifiPasswords || [],
          // Hero Section - textos dinâmicos
          heroTagline: data.heroTagline || '',
          heroSubtitle: data.heroSubtitle || '',
          heroHighlights: data.heroHighlights || [],
          // About Section - textos dinâmicos
          aboutTitle: data.aboutTitle || '',
          aboutDescription: data.aboutDescription || [],
          // Gallery Categories
          galleryCategories: data.galleryCategories || ['Fachada e Entrada', 'Áreas Comuns', 'Quartos', 'Cozinha', 'Banheiros', 'Área Externa', 'Piscina', 'Comodidades', 'Vizinhança'],
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

          {/* Logo da Propriedade */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Propriedade</label>
            <div className="flex items-start gap-4">
              <CloudinaryUpload
                folder="assets"
                value={formData.logo}
                onChange={(url: string) => setFormData({ ...formData, logo: url })}
                label={formData.logo ? 'Trocar Logo' : 'Upload da Logo'}
                previewClassName="h-24 w-24"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">A logo será exibida no cabeçalho e em outros locais do site</p>
          </div>
        </div>

        {/* Hero Section - Textos */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Textos da Página Inicial (Hero)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Tagline</label>
              <input
                type="text"
                value={formData.heroTagline}
                onChange={(e) => setFormData({ ...formData, heroTagline: e.target.value })}
                placeholder="Ex: Sua casa de férias perfeita em Belo Horizonte"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtítulo</label>
              <input
                type="text"
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                placeholder="Ex: Piscina aquecida • Jacuzzi • Playground • Vista para a Lagoa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* About Section - Textos */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Textos da Seção "Sobre a Casa"</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
            <input
              type="text"
              value={formData.aboutTitle}
              onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
              placeholder="Ex: Sobre a Casa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Parágrafos da Descrição</label>
            {formData.aboutDescription.map((desc, index) => (
              <div key={index} className="flex gap-2">
                <textarea
                  value={desc}
                  onChange={(e) => {
                    const newDescriptions = [...formData.aboutDescription];
                    newDescriptions[index] = e.target.value;
                    setFormData({ ...formData, aboutDescription: newDescriptions });
                  }}
                  rows={3}
                  placeholder={`Parágrafo ${index + 1}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newDescriptions = formData.aboutDescription.filter((_, i) => i !== index);
                    setFormData({ ...formData, aboutDescription: newDescriptions });
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, aboutDescription: [...formData.aboutDescription, ''] })}
              className="px-4 py-2 text-amber-600 border border-amber-600 rounded-lg hover:bg-amber-50"
            >
              + Adicionar Parágrafo
            </button>
          </div>
        </div>

        {/* Gallery Categories */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Categorias da Galeria de Fotos</h2>
          <p className="text-sm text-gray-500 mb-4">
            Configure as categorias disponíveis para organizar as fotos na galeria. Selecione da lista de sugestões ou adicione novas categorias.
          </p>
          <TransferList
            availableItems={defaultGalleryCategories}
            selectedItems={formData.galleryCategories}
            onSelectedChange={(items: string[]) => setFormData({ ...formData, galleryCategories: items })}
            availableTitle="Sugestões"
            selectedTitle="Categorias Ativas"
          />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.coordinates.lat || ''}
                onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 } })}
                placeholder="Ex: -19.8516"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.coordinates.lng || ''}
                onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 } })}
                placeholder="Ex: -43.9688"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Dica: Acesse o Google Maps, clique com o botão direito no local e copie as coordenadas.
          </p>
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
            <CloudinaryUpload
              folder="gallery"
              value={formData.heroImage}
              onChange={(url) => setFormData({ ...formData, heroImage: url })}
              label=""
              placeholder="Clique para fazer upload da imagem principal"
              previewClassName="h-48 w-full"
              maxSizeKB={3072}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagens do Carrossel</label>
            <CloudinaryUpload
              folder="gallery"
              value=""
              onChange={(url) => {
                if (url) {
                  setFormData({
                    ...formData,
                    heroImages: [...formData.heroImages, url],
                  });
                }
              }}
              label=""
              placeholder="Clique para adicionar imagem ao carrossel"
              previewClassName="h-32 w-full"
              maxSizeKB={3072}
              showPreview={false}
            />
            {formData.heroImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.heroImages.map((img, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                    <span className="max-w-[200px] truncate">{img.split('/').pop()}</span>
                    <button type="button" onClick={() => removeHeroImage(index)}>
                      <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contatos */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Contatos do Anfitrião</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(31) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidade do Telefone</label>
              <select
                value={formData.phoneVisibility}
                onChange={(e) => setFormData({ ...formData, phoneVisibility: e.target.value as 'public' | 'restricted' | 'private' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="public">Público (visível para todos)</option>
                <option value="restricted">Restrito (apenas hóspedes com reserva ativa)</option>
                <option value="private">Privado (não exibir)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="(31) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@exemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Senhas WiFi */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Senhas de WiFi</h2>
          <div className="space-y-3">
            {formData.wifiPasswords.map((wifi, index) => (
              <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
                <input
                  type="text"
                  value={wifi.network}
                  onChange={(e) => {
                    const updated = [...formData.wifiPasswords];
                    updated[index] = { ...updated[index], network: e.target.value };
                    setFormData({ ...formData, wifiPasswords: updated });
                  }}
                  placeholder="Nome da rede"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={wifi.password}
                  onChange={(e) => {
                    const updated = [...formData.wifiPasswords];
                    updated[index] = { ...updated[index], password: e.target.value };
                    setFormData({ ...formData, wifiPasswords: updated });
                  }}
                  placeholder="Senha"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      wifiPasswords: formData.wifiPasswords.filter((_, i) => i !== index)
                    });
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  wifiPasswords: [...formData.wifiPasswords, { network: '', password: '' }]
                });
              }}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              + Adicionar rede WiFi
            </button>
          </div>
        </div>

        {/* Senhas das Portas */}
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Senhas das Portas</h2>
          <div className="space-y-3">
            {formData.doorPasswords.map((door, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={door.location}
                    onChange={(e) => {
                      const updated = [...formData.doorPasswords];
                      updated[index] = { ...updated[index], location: e.target.value };
                      setFormData({ ...formData, doorPasswords: updated });
                    }}
                    placeholder="Local (ex: Portão Principal, Área de Lazer)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={door.password}
                      onChange={(e) => {
                        const updated = [...formData.doorPasswords];
                        updated[index] = { ...updated[index], password: e.target.value };
                        setFormData({ ...formData, doorPasswords: updated });
                      }}
                      placeholder="Senha"
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={door.notes || ''}
                      onChange={(e) => {
                        const updated = [...formData.doorPasswords];
                        updated[index] = { ...updated[index], notes: e.target.value };
                        setFormData({ ...formData, doorPasswords: updated });
                      }}
                      placeholder="Observações (opcional)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      doorPasswords: formData.doorPasswords.filter((_, i) => i !== index)
                    });
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  doorPasswords: [...formData.doorPasswords, { location: '', password: '', notes: '' }]
                });
              }}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              + Adicionar senha de porta
            </button>
          </div>

          {/* Door Password Configuration */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Configuração de exibição da senha temporária</h4>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showToGuests"
                checked={formData.doorPasswordConfig.showToGuests}
                onChange={(e) => setFormData({
                  ...formData,
                  doorPasswordConfig: { ...formData.doorPasswordConfig, showToGuests: e.target.checked }
                })}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="showToGuests" className="text-sm text-gray-600">
                Mostrar senha temporária para hóspedes
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="addHashSuffix"
                checked={formData.doorPasswordConfig.addHashSuffix}
                onChange={(e) => setFormData({
                  ...formData,
                  doorPasswordConfig: { ...formData.doorPasswordConfig, addHashSuffix: e.target.checked }
                })}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="addHashSuffix" className="text-sm text-gray-600">
                Exigir símbolo # depois da senha
              </label>
            </div>

            {formData.doorPasswordConfig.addHashSuffix && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem sobre o símbolo #
                </label>
                <input
                  type="text"
                  value={formData.doorPasswordConfig.hashSuffixNote}
                  onChange={(e) => setFormData({
                    ...formData,
                    doorPasswordConfig: { ...formData.doorPasswordConfig, hashSuffixNote: e.target.value }
                  })}
                  placeholder="Tecle # depois da senha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
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
