'use client';

import { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CheckinInfo {
  _id: string;
  type: string;
  title: string;
  content: string;
  icon: string;
  order: number;
  isRestricted: boolean;
  isActive: boolean;
}

const types = [
  { value: 'checkin', label: 'Check-in' },
  { value: 'checkout', label: 'Check-out' },
  { value: 'rule', label: 'Regra' },
  { value: 'instruction', label: 'Instrução' },
];

const emptyItem: Omit<CheckinInfo, '_id'> = {
  type: 'checkin',
  title: '',
  content: '',
  icon: 'clock',
  order: 0,
  isRestricted: false,
  isActive: true,
};

export default function AdminCheckinPage() {
  const [items, setItems] = useState<CheckinInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CheckinInfo | null>(null);
  const [formData, setFormData] = useState<Omit<CheckinInfo, '_id'>>(emptyItem);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/checkin?includeRestricted=true');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
      toast.error('Erro ao carregar informações');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: CheckinInfo) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        type: item.type,
        title: item.title,
        content: item.content,
        icon: item.icon,
        order: item.order,
        isRestricted: item.isRestricted,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyItem);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(emptyItem);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingItem
        ? `/api/checkin?id=${editingItem._id}`
        : '/api/checkin';

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success(editingItem ? 'Item atualizado!' : 'Item criado!');
      closeModal();
      fetchItems();
    } catch (error) {
      toast.error('Erro ao salvar item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const response = await fetch(`/api/checkin?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Item excluído!');
      fetchItems();
    } catch (error) {
      toast.error('Erro ao excluir item');
    }
  };

  const filteredItems = filterType
    ? items.filter((item) => item.type === filterType)
    : items;

  const getTypeLabel = (type: string) => {
    const found = types.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'checkin': return 'bg-green-100 text-green-800';
      case 'checkout': return 'bg-blue-100 text-blue-800';
      case 'rule': return 'bg-red-100 text-red-800';
      case 'instruction': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-800">Check-in / Check-out</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Item
        </button>
      </div>

      {/* Filtro por tipo */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterType('')}
          className={`px-4 py-2 rounded-lg ${!filterType ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Todos
        </button>
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilterType(type.value)}
            className={`px-4 py-2 rounded-lg ${filterType === type.value ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Lista de Items */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conteúdo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restrito</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum item encontrado
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadgeColor(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.content}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.order}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.isRestricted ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.isRestricted ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(item)}
                      className="text-amber-600 hover:text-amber-800"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </h2>
              <button onClick={closeModal}>
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="clock, key, home..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isRestricted}
                      onChange={(e) => setFormData({ ...formData, isRestricted: e.target.checked })}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">Restrito (só hóspedes)</span>
                  </label>
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
