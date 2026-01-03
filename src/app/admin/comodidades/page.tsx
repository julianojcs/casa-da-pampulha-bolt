'use client';

import { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { IconPicker, DynamicIcon } from '@/components/IconPicker';
import { ScrollableFilter } from '@/components/ScrollableFilter';
import { SortableContainer, SortableRow, SortableCard } from '@/components/SortableTable';

interface Amenity {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  isActive: boolean;
  // Highlight fields
  isHighlight: boolean;
  highlightColor: string;
  highlightDescription: string;
}

const categories = [
  { value: 'Lazer', label: 'Lazer' },
  { value: 'Conforto', label: 'Conforto' },
  { value: 'Tecnologia', label: 'Tecnologia' },
  { value: 'Serviços', label: 'Serviços' },
  { value: 'Segurança', label: 'Segurança' },
];

const highlightColors = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'amber', label: 'Âmbar', class: 'bg-amber-500' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-500' },
  { value: 'teal', label: 'Turquesa', class: 'bg-teal-500' },
  { value: 'rose', label: 'Rosa', class: 'bg-rose-500' },
];

const emptyAmenity: Omit<Amenity, '_id'> = {
  name: '',
  description: '',
  icon: '',
  category: 'Lazer',
  order: 0,
  isActive: true,
  isHighlight: false,
  highlightColor: 'blue',
  highlightDescription: '',
};

export default function AdminComodidadesPage() {
  const colorToTextClass = (color?: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'amber': return 'text-amber-600';
      case 'purple': return 'text-purple-600';
      case 'teal': return 'text-teal-600';
      case 'rose': return 'text-rose-600';
      default: return 'text-amber-600';
    }
  };

  const colorToBgClass = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'amber': return 'bg-amber-500';
      case 'purple': return 'bg-purple-500';
      case 'teal': return 'bg-teal-500';
      case 'rose': return 'bg-rose-500';
      default: return 'bg-amber-500';
    }
  };
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState<Omit<Amenity, '_id'>>(emptyAmenity);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  // Estado para modal de visualização de ícone
  const [viewingAmenity, setViewingAmenity] = useState<Amenity | null>(null);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const response = await fetch(`/api/amenities?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
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
        isHighlight: amenity.isHighlight || false,
        highlightColor: amenity.highlightColor || 'blue',
        highlightDescription: amenity.highlightDescription || '',
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
      await fetchAmenities();
      closeModal();
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

  const handleReorder = async (reorderedItems: Amenity[]) => {
    try {
      const response = await fetch('/api/admin/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'amenities',
          items: reorderedItems.map((item) => ({ _id: item._id, order: item.order })),
        }),
      });

      if (!response.ok) throw new Error('Erro ao reordenar');

      toast.success('Ordem atualizada!');
      setAmenities(reorderedItems);
    } catch (error) {
      toast.error('Erro ao reordenar comodidades');
      throw error;
    }
  };

  // Filtrar amenities por categoria
  const filteredAmenities = amenities
    .filter(a => !filterCategory || a.category === filterCategory)
    .sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Comodidades</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <PlusIcon className="h-5 w-5" />
          Nova Comodidade
        </button>
      </div>

      {/* Filtro por Categoria */}
      <ScrollableFilter
        options={categories}
        value={filterCategory}
        onChange={setFilterCategory}
        allLabel="Todas"
      />

      {/* Lista de Comodidades - Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <SortableContainer
          items={filteredAmenities}
          onReorder={handleReorder}
          disabled={!!filterCategory}
        >
          {(sortedItems) => (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ícone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedItems.map((amenity) => (
                  <SortableRow key={amenity._id} id={amenity._id} disabled={!!filterCategory}>
                    <td className="px-6 py-4" style={{ cursor: 'default' }}>
                      <button
                        onClick={() => setViewingAmenity(amenity)}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors cursor-pointer ${amenity.isHighlight ? `${colorToBgClass(amenity.highlightColor)}` : 'bg-amber-100 hover:bg-amber-200'}`}
                        title="Ver detalhes da Comodidade"
                      >
                        <DynamicIcon name={amenity.icon} className={`h-5 w-5 ${amenity.isHighlight ? 'text-white' : 'text-amber-600'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4" style={{ cursor: 'default' }}>
                      <div className="font-medium text-gray-900">{amenity.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{amenity.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500" style={{ cursor: 'default' }}>{amenity.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500" style={{ cursor: 'default' }}>{amenity.order}</td>
                    <td className="px-6 py-4" style={{ cursor: 'default' }}>
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full w-fit ${
                          amenity.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {amenity.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        {amenity.isHighlight && (
                          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 w-fit">
                            ⭐ Destaque
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2" style={{ cursor: 'default' }}>
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
                  </SortableRow>
                ))}
              </tbody>
            </table>
          )}
        </SortableContainer>
      </div>

      {/* Lista de Comodidades - Mobile Cards */}
      <div className="md:hidden space-y-4">
        <SortableContainer
          items={filteredAmenities}
          onReorder={handleReorder}
          disabled={!!filterCategory}
        >
          {(sortedItems) => (
            <div className="space-y-4">
              {sortedItems.map((amenity) => (
                <SortableCard key={amenity._id} id={amenity._id} disabled={!!filterCategory}>
                  <div className="bg-white rounded-xl shadow-sm p-4 pl-12" style={{ cursor: 'default' }}>
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => setViewingAmenity(amenity)}
                        className={`flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 transition-colors cursor-pointer ${amenity.isHighlight ? `${colorToBgClass(amenity.highlightColor)}` : 'bg-amber-100 hover:bg-amber-200'}`}
                        title="Ver detalhes da Comodidade"
                      >
                        <DynamicIcon name={amenity.icon} className={`h-6 w-6 ${amenity.isHighlight ? 'text-white' : 'text-amber-600'}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{amenity.name}</h3>
                          <div className="flex flex-col gap-1 items-end">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              amenity.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {amenity.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                            {amenity.isHighlight && (
                              <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                                ⭐ Destaque
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{amenity.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{amenity.category}</span>
                          <span>Ordem: {amenity.order}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <button
                        onClick={() => openModal(amenity)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-amber-600 border border-amber-600 rounded-lg hover:bg-amber-50"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(amenity._id)}
                        className="px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </SortableCard>
              ))}
            </div>
          )}
        </SortableContainer>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
              <h2 className="text-xl font-bold">
                {editingAmenity ? 'Editar Comodidade' : 'Nova Comodidade'}
              </h2>
              <button onClick={closeModal}>
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <IconPicker
                  value={formData.icon}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                />
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

              {/* Highlight Section */}
              <div className="border-t pt-4 mt-4">
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.isHighlight}
                    onChange={(e) => setFormData({ ...formData, isHighlight: e.target.checked })}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">⭐ Exibir como Destaque</span>
                </label>

                {formData.isHighlight && (
                  <div className="space-y-4 bg-amber-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Destaque</label>
                      <div className="flex flex-wrap gap-2">
                        {highlightColors.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, highlightColor: color.value })}
                            className={`w-8 h-8 rounded-full ${color.class} ${
                              formData.highlightColor === color.value
                                ? 'ring-2 ring-offset-2 ring-gray-800'
                                : ''
                            }`}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição do Destaque
                      </label>
                      <textarea
                        value={formData.highlightDescription}
                        onChange={(e) => setFormData({ ...formData, highlightDescription: e.target.value })}
                        rows={2}
                        placeholder="Texto adicional exibido na seção de destaques"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
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

      {/* Modal de Visualização do Detalhe da Comodidade */}
      {viewingAmenity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingAmenity(null)}>
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Detalhes da Comodidade</h2>
              <button onClick={() => setViewingAmenity(null)}>
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
              <div className="p-6 text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${viewingAmenity.isHighlight ? colorToBgClass(viewingAmenity.highlightColor) : 'bg-amber-100'}`}>
                <DynamicIcon name={viewingAmenity.icon} className={`h-12 w-12 ${viewingAmenity.isHighlight ? 'text-white' : 'text-amber-600'}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{viewingAmenity.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{viewingAmenity.description}</p>
              {viewingAmenity.isHighlight && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                  <p className="text-xs text-gray-500 mb-1">Descrição do Destaque:</p>
                  <p className="text-sm text-gray-700 mb-3">{viewingAmenity.highlightDescription || '—'}</p>
                  <p className="text-xs text-gray-500 mb-1">Cor do Destaque:</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full ${colorToBgClass(viewingAmenity.highlightColor)}`} aria-hidden="true" />
                    <span className="text-sm text-gray-700 capitalize">{viewingAmenity.highlightColor}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 text-sm">
                <span className={`px-3 py-1 rounded-full ${viewingAmenity.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {viewingAmenity.isActive ? 'Ativo' : 'Inativo'}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  {viewingAmenity.category}
                </span>
                {viewingAmenity.isHighlight && (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                    ⭐ Destaque
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setViewingAmenity(null);
                  openModal(viewingAmenity);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                <PencilIcon className="h-4 w-4" />
                Editar Comodidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
