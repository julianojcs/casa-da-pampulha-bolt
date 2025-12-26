'use client';

import { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Amenity {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  isActive: boolean;
}

const categories = [
  { value: 'Lazer', label: 'Lazer' },
  { value: 'Conforto', label: 'Conforto' },
  { value: 'Tecnologia', label: 'Tecnologia' },
  { value: 'Serviços', label: 'Serviços' },
  { value: 'Segurança', label: 'Segurança' },
];

const emptyAmenity: Omit<Amenity, '_id'> = {
  name: '',
  description: '',
  icon: '',
  category: 'Lazer',
  order: 0,
  isActive: true,
};

export default function AdminComodidadesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState<Omit<Amenity, '_id'>>(emptyAmenity);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const response = await fetch('/api/amenities');
      const data = await response.json();
      setAmenities(data);
    } catch (error) {
      console.error('Erro ao carregar comodidades:', error);
      toast.error('Erro ao carregar comodidades');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setFormData({
        name: amenity.name,
        description: amenity.description,
        icon: amenity.icon,
        category: amenity.category,
        order: amenity.order,
        isActive: amenity.isActive,
      });
    } else {
      setEditingAmenity(null);
      setFormData(emptyAmenity);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAmenity(null);
    setFormData(emptyAmenity);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingAmenity
        ? `/api/amenities?id=${editingAmenity._id}`
        : '/api/amenities';

      const response = await fetch(url, {
        method: editingAmenity ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success(editingAmenity ? 'Comodidade atualizada!' : 'Comodidade criada!');
      closeModal();
      fetchAmenities();
    } catch (error) {
      toast.error('Erro ao salvar comodidade');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta comodidade?')) return;

    try {
      const response = await fetch(`/api/amenities?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Comodidade excluída!');
      fetchAmenities();
    } catch (error) {
      toast.error('Erro ao excluir comodidade');
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Comodidades</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <PlusIcon className="h-5 w-5" />
          Nova Comodidade
        </button>
      </div>

      {/* Lista de Comodidades */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ícone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {amenities.map((amenity) => (
              <tr key={amenity._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{amenity.name}</div>
                  <div className="text-sm text-gray-500">{amenity.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{amenity.category}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{amenity.icon}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{amenity.order}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    amenity.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {amenity.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openModal(amenity)}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(amenity._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingAmenity ? 'Editar Comodidade' : 'Nova Comodidade'}
              </h2>
              <button onClick={closeModal}>
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="pool, wifi, etc"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
