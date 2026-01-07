'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { XMarkIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';
import { TransferList, TransferListItem } from '@/components/TransferList';

// Dynamic import for LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg h-[250px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600" />
    </div>
  ),
});

// Tab configuration
const tabs = [
  { id: 'basic', label: 'Informações Básicas' },
  { id: 'content', label: 'Conteúdo do Site' },
  { id: 'gallery', label: 'Galeria' },
  { id: 'address', label: 'Localização' },
  { id: 'capacity', label: 'Capacidade' },
  { id: 'contact', label: 'Contatos' },
  { id: 'passwords', label: 'Senhas e Acessos' },
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
  phone: string;
  phoneVisibility: 'public' | 'restricted' | 'private';
  whatsapp: string;
  email: string;
  doorPasswords: { location: string; password: string; notes?: string }[];
  doorPasswordConfig: {
    showToGuests: boolean;
    addHashSuffix: boolean;
    hashSuffixNote: string;
  };
  wifiPasswords: { network: string; password: string }[];
  heroTagline: string;
  heroSubtitle: string;
  heroHighlights: string[];
  aboutTitle: string;
  aboutDescription: string[];
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
  phone: '',
  phoneVisibility: 'restricted',
  whatsapp: '',
  email: '',
  doorPasswords: [],
  doorPasswordConfig: {
    showToGuests: true,
    addHashSuffix: false,
    hashSuffixNote: 'Tecle # depois da senha',
  },
  wifiPasswords: [],
  heroTagline: '',
  heroSubtitle: '',
  heroHighlights: [],
  aboutTitle: '',
  aboutDescription: [],
  galleryCategories: [],
};

export default function AdminPropriedadePage() {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<Property, '_id'>>(emptyProperty);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tab scroll state
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll availability
  const checkScrollButtons = useCallback(() => {
    const container = tabsContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
    }
  }, []);

  // Scroll tabs
  const scrollTabs = useCallback((direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  // Setup scroll listeners
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [checkScrollButtons]);

  // Gallery categories state
  const [allCategories, setAllCategories] = useState<TransferListItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<TransferListItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
    fetchCategories();
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
          phone: data.phone || '',
          phoneVisibility: data.phoneVisibility || 'restricted',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          doorPasswords: data.doorPasswords || [],
          doorPasswordConfig: data.doorPasswordConfig || {
            showToGuests: true,
            addHashSuffix: false,
            hashSuffixNote: 'Tecle # depois da senha',
          },
          wifiPasswords: data.wifiPasswords || [],
          heroTagline: data.heroTagline || '',
          heroSubtitle: data.heroSubtitle || '',
          heroHighlights: data.heroHighlights || [],
          aboutTitle: data.aboutTitle || '',
          aboutDescription: data.aboutDescription || [],
          galleryCategories: data.galleryCategories || [],
        });
      }
    } catch (error) {
      console.error('Erro ao carregar propriedade:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/gallery-categories');
      if (response.ok) {
        const data = await response.json();
        const items: TransferListItem[] = data.map((cat: { _id: string; name: string; isDefault: boolean }) => ({
          id: cat._id,
          name: cat.name,
          isDefault: cat.isDefault,
        }));
        setAllCategories(items);

        // Separate into active (selected) and inactive based on property's galleryCategories
        const propertyRes = await fetch('/api/property');
        if (propertyRes.ok) {
          const propData = await propertyRes.json();
          const activeNames = new Set(propData.galleryCategories || []);
          setSelectedCategories(items.filter(item => activeNames.has(item.name)));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update gallery categories from TransferList selection
      const updatedFormData = {
        ...formData,
        galleryCategories: selectedCategories.map(cat => cat.name),
      };

      const response = await fetch('/api/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
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

  const removeHeroImage = (index: number) => {
    setFormData({
      ...formData,
      heroImages: formData.heroImages.filter((_, i) => i !== index),
    });
  };

  // Category handlers
  const handleAddCategory = useCallback(async (name: string): Promise<TransferListItem | null> => {
    try {
      const response = await fetch('/api/gallery-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isActive: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar categoria');
        return null;
      }

      const newCat = await response.json();
      const newItem: TransferListItem = {
        id: newCat._id,
        name: newCat.name,
        isDefault: newCat.isDefault,
      };

      setAllCategories(prev => [...prev, newItem]);
      toast.success('Categoria criada!');
      return newItem;
    } catch (error) {
      toast.error('Erro ao criar categoria');
      return null;
    }
  }, []);

  const handleDeleteCategory = useCallback(async (item: TransferListItem): Promise<void> => {
    try {
      const response = await fetch(`/api/gallery-categories?id=${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Erro ao excluir categoria');
        return;
      }

      const result = await response.json();
      setAllCategories(prev => prev.filter(cat => cat.id !== item.id));
      setSelectedCategories(prev => prev.filter(cat => cat.id !== item.id));
      toast.success(`Categoria excluída! Itens movidos para "${result.reassignedTo}"`);
    } catch (error) {
      toast.error('Erro ao excluir categoria');
    }
  }, []);

  const handleSetDefaultCategory = useCallback(async (item: TransferListItem): Promise<void> => {
    try {
      const response = await fetch(`/api/gallery-categories?id=${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        toast.error('Erro ao definir categoria padrão');
        return;
      }

      // Update local state
      setAllCategories(prev => prev.map(cat => ({
        ...cat,
        isDefault: cat.id === item.id,
      })));
      setSelectedCategories(prev => prev.map(cat => ({
        ...cat,
        isDefault: cat.id === item.id,
      })));

      toast.success(`"${item.name}" definida como categoria padrão`);
    } catch (error) {
      toast.error('Erro ao definir categoria padrão');
    }
  }, []);

  const handleCategoriesChange = useCallback((items: TransferListItem[]) => {
    setSelectedCategories(items);
  }, []);

  // Allow pasting combined coordinates ("lat, lng") into either coord input
  const handleCoordsPaste = useCallback((text: string): boolean => {
    if (!text) return false;
    const matches = Array.from(text.matchAll(/(-?\d+(?:[\.,]\d+)?)/g)).map(m => m[1].replace(',', '.'));
    if (matches.length >= 2) {
      const lat = parseFloat(matches[0]);
      const lng = parseFloat(matches[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setFormData(prev => ({ ...prev, coordinates: { lat, lng } }));
        return true;
      }
    }
    return false;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Propriedade</label>
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
                  placeholder="Ex: Sua casa de férias em BH"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Geral</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
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
              <p className="text-xs text-gray-500 mt-1">A logo será exibida no cabeçalho do site</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Boas-vindas</label>
              <textarea
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                rows={3}
                placeholder="Mensagem exibida para os hóspedes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gray-50 rounded-lg p-4 md:p-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Seção Hero (Página Inicial)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline do Hero</label>
                  <input
                    type="text"
                    value={formData.heroTagline}
                    onChange={(e) => setFormData({ ...formData, heroTagline: e.target.value })}
                    placeholder="Ex: Sua casa de férias perfeita"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo do Hero</label>
                  <input
                    type="text"
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                    placeholder="Ex: Piscina aquecida • Jacuzzi • Playground"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-gray-50 rounded-lg p-4 md:p-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Seção &quot;Sobre a Casa&quot;</h3>
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
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg self-start"
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

            {/* Images */}
            <div className="bg-gray-50 rounded-lg p-4 md:p-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Imagens</h3>
              <div className="space-y-4">
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
                <div>
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
                          <span className="max-w-[150px] truncate">{img.split('/').pop()}</span>
                          <button type="button" onClick={() => removeHeroImage(index)}>
                            <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-red-500" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Gerencie as categorias da galeria de fotos. As categorias ativas serão exibidas na galeria pública.
            </p>
            {categoriesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <TransferList
                availableItems={allCategories}
                selectedItems={selectedCategories}
                onSelectedChange={handleCategoriesChange}
                onAddItem={handleAddCategory}
                onDeleteItem={handleDeleteCategory}
                onSetDefault={handleSetDefaultCategory}
                availableTitle="Categorias Inativas"
                selectedTitle="Categorias Ativas"
                allowAdd={true}
                allowDelete={true}
                allowSetDefault={true}
                addPlaceholder="Nova categoria..."
                showOrder={true}
                enableSort={true}
              />
            )}
          </div>
        );

      case 'address':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, complemento"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Coordenadas GPS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.coordinates.lat || ''}
                    onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 } })}
                    onPaste={(e) => {
                      const text = e.clipboardData?.getData('text') || '';
                      const handled = handleCoordsPaste(text);
                      if (handled) e.preventDefault();
                    }}
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
                    onPaste={(e) => {
                      const text = e.clipboardData?.getData('text') || '';
                      const handled = handleCoordsPaste(text);
                      if (handled) e.preventDefault();
                    }}
                    placeholder="Ex: -43.9688"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Dica: No Google Maps, clique com o botão direito no local e copie as coordenadas. Cole em qualquer campo acima.
              </p>
            </div>

            {/* Location Map */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Localização no Mapa</h3>
              <LocationPicker
                lat={formData.coordinates.lat || undefined}
                lng={formData.coordinates.lng || undefined}
                address={formData.address}
                onLocationChange={(lat, lng) => setFormData({ ...formData, coordinates: { lat, lng } })}
              />
              <p className="text-xs text-gray-500 mt-2">
                Arraste o marcador para ajustar a localização exata da propriedade.
              </p>
            </div>
          </div>
        );

      case 'capacity':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Capacidade</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hóspedes</label>
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

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Horários e Reserva</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo de Noites</label>
                  <input
                    type="number"
                    value={formData.minNights}
                    onChange={(e) => setFormData({ ...formData, minNights: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Links Externos</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL do Airbnb</label>
                  <input
                    type="url"
                    value={formData.airbnbUrl}
                    onChange={(e) => setFormData({ ...formData, airbnbUrl: e.target.value })}
                    placeholder="https://www.airbnb.com.br/rooms/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL do Calendário iCal</label>
                  <input
                    type="url"
                    value={formData.airbnbCalendarUrl}
                    onChange={(e) => setFormData({ ...formData, airbnbCalendarUrl: e.target.value })}
                    placeholder="URL de exportação do calendário"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
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
                  <option value="restricted">Restrito (hóspedes com reserva)</option>
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
        );

      case 'passwords':
        return (
          <div className="space-y-8">
            {/* WiFi Passwords */}
            <div className="bg-gray-50 rounded-lg p-4 md:p-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Senhas de WiFi</h3>
              <div className="space-y-3">
                {formData.wifiPasswords.map((wifi, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 bg-white p-3 rounded-lg border border-gray-200">
                    <input
                      type="text"
                      value={wifi.network}
                      onChange={(e) => {
                        const updated = [...formData.wifiPasswords];
                        updated[index] = { ...updated[index], network: e.target.value };
                        setFormData({ ...formData, wifiPasswords: updated });
                      }}
                      placeholder="Nome da rede"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          wifiPasswords: formData.wifiPasswords.filter((_, i) => i !== index)
                        });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-center"
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

            {/* Door Passwords */}
            <div className="bg-gray-50 rounded-lg p-4 md:p-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Senhas das Portas</h3>
              <div className="space-y-3">
                {formData.doorPasswords.map((door, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                      <input
                        type="text"
                        value={door.location}
                        onChange={(e) => {
                          const updated = [...formData.doorPasswords];
                          updated[index] = { ...updated[index], location: e.target.value };
                          setFormData({ ...formData, doorPasswords: updated });
                        }}
                        placeholder="Local (ex: Portão Principal)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            doorPasswords: formData.doorPasswords.filter((_, i) => i !== index)
                          });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-center"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={door.password}
                        onChange={(e) => {
                          const updated = [...formData.doorPasswords];
                          updated[index] = { ...updated[index], password: e.target.value };
                          setFormData({ ...formData, doorPasswords: updated });
                        }}
                        placeholder="Senha"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      />
                    </div>
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
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Configuração de exibição</h4>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.doorPasswordConfig.showToGuests}
                    onChange={(e) => setFormData({
                      ...formData,
                      doorPasswordConfig: { ...formData.doorPasswordConfig, showToGuests: e.target.checked }
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-600">
                    Mostrar senha temporária para hóspedes
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.doorPasswordConfig.addHashSuffix}
                    onChange={(e) => setFormData({
                      ...formData,
                      doorPasswordConfig: { ...formData.doorPasswordConfig, addHashSuffix: e.target.checked }
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-600">
                    Exigir símbolo # depois da senha
                  </span>
                </label>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Configurações da Propriedade</h1>

      <form onSubmit={handleSubmit}>
        {/* Desktop Tabs */}
        <div className="hidden md:block bg-white rounded-t-xl shadow-sm border-b relative">
          {/* Left scroll arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-white via-white to-transparent flex items-center justify-start pl-1 hover:pl-2 transition-all"
              aria-label="Scroll tabs para esquerda"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
            </button>
          )}

          <nav
            ref={tabsContainerRef}
            className="flex overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            aria-label="Tabs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-600 bg-amber-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 hover:bg-gray-50/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right scroll arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-white via-white to-transparent flex items-center justify-end pr-1 hover:pr-2 transition-all"
              aria-label="Scroll tabs para direita"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-t-xl shadow-sm text-left"
          >
            <span className="font-medium text-gray-700">
              {tabs.find(t => t.id === activeTab)?.label}
            </span>
            <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {mobileMenuOpen && (
            <div className="absolute z-10 w-full bg-white shadow-lg rounded-b-xl border-t">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-50 text-amber-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl md:rounded-xl shadow-sm p-4 md:p-6 min-h-[400px]">
          {renderTabContent()}
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium shadow-sm"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
