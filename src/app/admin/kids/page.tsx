'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface KidsArea {
  _id: string;
  title: string;
  description: string;
  features: string[];
  images: string[];
  isActive: boolean;
}

const emptyKidsArea: Omit<KidsArea, '_id'> = {
  title: '',
  description: '',
  features: [],
  images: [],
  isActive: true,
};

export default function AdminKidsPage() {
  const [kidsArea, setKidsArea] = useState<KidsArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<KidsArea, '_id'>>(emptyKidsArea);
  const [saving, setSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    fetchKidsArea();
  }, []);

  const fetchKidsArea = async () => {
    try {
      const response = await fetch('/api/kids');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setKidsArea(data);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            features: data.features || [],
            images: data.images || [],
            isActive: data.isActive ?? true,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar área kids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/kids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success('Área Kids atualizada!');
      fetchKidsArea();
    } catch (error) {
      toast.error('Erro ao salvar área kids');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
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
      <h1 className="text-2xl font-bold text-gray-800">Área Kids / Playground</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recursos / Brinquedos</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Ex: Pula-pula grande"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Adicionar
            </button>
          </div>
          {formData.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                  {feature}
                  <button type="button" onClick={() => removeFeature(index)}>
                    <XMarkIcon className="h-4 w-4 hover:text-red-600" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Imagens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagens</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="/gallery/imagem.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Adicionar
            </button>
          </div>
          {formData.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded text-sm">
                  {image}
                  <button type="button" onClick={() => removeImage(index)}>
                    <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-red-600" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">Área ativa</label>
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
