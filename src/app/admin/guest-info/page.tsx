'use client';

import { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ScrollableFilter } from '@/components/ScrollableFilter';
import { SortableContainer, SortableRow, SortableCard } from '@/components/SortableTable';
import { IconPicker, DynamicIcon } from '@/components/IconPicker';

interface GuestInfo {
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

const emptyItem: Omit<GuestInfo, '_id'> = {
  type: 'checkin',
  title: '',
  content: '',
  icon: 'clock',
  order: 0,
  isRestricted: false,
  isActive: true,
};

export default function AdminGuestInfoPage() {
  const [items, setItems] = useState<GuestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GuestInfo | null>(null);
  const [formData, setFormData] = useState<Omit<GuestInfo, '_id'>>(emptyItem);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/guest-info?includeRestricted=true');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
      toast.error('Erro ao carregar informações');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: GuestInfo) => {
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
        ? `/api/guest-info?id=${editingItem._id}`
        : '/api/guest-info';

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
      const response = await fetch(`/api/guest-info?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Item excluído!');
      fetchItems();
    } catch (error) {
      toast.error('Erro ao excluir item');
    }
  };

  // Define type order for sorting
  const typeOrder = ['checkin', 'checkout', 'rule', 'instruction'];

  const filteredItems = filterType
    ? items.filter((item) => item.type === filterType).sort((a, b) => a.order - b.order)
    : items.sort((a, b) => {
        // Sort by type first, then by order
        const typeIndexA = typeOrder.indexOf(a.type);
        const typeIndexB = typeOrder.indexOf(b.type);
        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
        return a.order - b.order;
      });

  const handleReorder = async (reorderedItems: GuestInfo[]) => {
    const previousItems = [...items];

    // Atualiza localmente primeiro
    setItems(reorderedItems);

    try {
      const response = await fetch('/api/admin/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'guest-info',
          items: reorderedItems.map((item, index) => ({ _id: item._id, order: index + 1 }))
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar ordem');
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      setItems(previousItems);
      toast.error('Erro ao salvar ordem');
    }
  };

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
      <div>
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-gray-800">Informações ao Hóspede</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            <PlusIcon className="h-5 w-5" />
            Novo Item
          </button>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">📋 Sobre esta página</h2>
          <p className="text-sm text-blue-800 mb-2">
            Gerencie todas as informações destinadas aos hóspedes: check-in, check-out, regras da casa e instruções gerais.
            Estas informações são exibidas na área restrita do site após o hóspede fazer login.
          </p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li><strong>Check-in:</strong> Informações sobre horários, procedimentos e local de chegada</li>
            <li><strong>Check-out:</strong> Horários e procedimentos de saída, devolução de chaves</li>
            <li><strong>Regras:</strong> Normas da casa que os hóspedes devem seguir</li>
            <li><strong>Instruções:</strong> Orientações gerais sobre uso de equipamentos, Wi-Fi, etc.</li>
          </ul>
        </div>
      </div>

      {/* Filtro por tipo */}
      <ScrollableFilter
        options={types}
        value={filterType}
        onChange={setFilterType}
        allLabel="Todos"
      />

      {/* Lista de Items */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <SortableContainer
            items={filteredItems}
            onReorder={handleReorder}
            disabled={!filterType}
          >
            {(sortedItems) => (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">Ícone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conteúdo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restrito</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <PlusIcon className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-lg font-medium text-gray-700 mb-1">
                            {filterType ? 'Nenhum item deste tipo ainda' : 'Nenhuma informação cadastrada'}
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            {filterType ? `Clique em "Novo Item" para adicionar ${getTypeLabel(filterType).toLowerCase()}` : 'Comece criando informações de check-in, check-out ou regras da casa'}
                          </p>
                          <button
                            onClick={() => openModal()}
                            className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                          >
                            + Criar primeiro item
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedItems.map((item) => (
                      <SortableRow key={item._id} id={item._id} disabled={!filterType}>
                        <td className="px-4 py-4 text-center">
                          <DynamicIcon name={item.icon} className="h-5 w-5 text-amber-600 mx-auto" />
                        </td>
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
                      </SortableRow>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </SortableContainer>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          <SortableContainer
            items={filteredItems}
            onReorder={handleReorder}
            disabled={!filterType}
          >
            {(sortedItems) => (
              <div className="divide-y divide-gray-200">
                {sortedItems.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <PlusIcon className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-lg font-medium text-gray-700 mb-1">
                        {filterType ? 'Nenhum item deste tipo ainda' : 'Nenhuma informação cadastrada'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {filterType ? `Clique em "Novo Item" para adicionar ${getTypeLabel(filterType).toLowerCase()}` : 'Comece criando informações de check-in, check-out ou regras'}
                      </p>
                      <button
                        onClick={() => openModal()}
                        className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                      >
                        + Criar primeiro item
                      </button>
                    </div>
                  </div>
                ) : (
                  sortedItems.map((item) => (
                    <SortableCard key={item._id} id={item._id} disabled={!filterType}>
                      <div className="flex items-start justify-between gap-3 flex-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadgeColor(item.type)}`}>
                              {getTypeLabel(item.type)}
                            </span>
                            {item.isRestricted && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Restrito
                              </span>
                            )}
                            <span className="text-xs text-gray-400">Ordem: {item.order}</span>
                          </div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => openModal(item)}
                            className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </SortableCard>
                  ))
                )}
              </div>
            )}
          </SortableContainer>
        </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                    <span className="text-xs text-gray-500 ml-1">(categoria da informação)</span>
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                    <span className="text-xs text-gray-500 ml-1">(ordem de exibição)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                  <span className="text-xs text-gray-500 ml-1">(ex: "Horário de Check-in", "Chaves")</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Horário de Check-in"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo
                  <span className="text-xs text-gray-500 ml-1">(descrição detalhada)</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  placeholder="Ex: O check-in pode ser realizado das 14h às 22h. As chaves estarão na caixa de correio."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <IconPicker
                    value={formData.icon}
                    onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
                    label="Ícone (opcional)"
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
                    <span className="text-sm text-gray-700">
                      Restrito
                      <span className="text-xs text-gray-500 ml-1">(visível apenas para hóspedes logados)</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">
                      Ativo
                      <span className="text-xs text-gray-500 ml-1">(exibir no site)</span>
                    </span>
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
