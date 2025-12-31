'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';

interface StaffSupply {
  _id: string;
  name: string;
  description?: string;
  category: string;
  status: string;
  urgency: string;
  quantity?: number;
  unit?: string;
  minQuantity?: number;
  requestedBy?: string;
  requestedByName?: string;
  approvedBy?: string;
  approvedAt?: string;
  purchasedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<string, string> = {
  limpeza: 'Limpeza',
  piscina: 'Piscina',
  jardim: 'Jardim',
  cozinha: 'Cozinha',
  banheiro: 'Banheiro',
  geral: 'Geral',
};

const statusLabels: Record<string, string> = {
  ok: 'OK',
  low: 'Baixo',
  critical: 'Crítico',
  'out-of-stock': 'Em Falta',
};

const statusColors: Record<string, string> = {
  ok: 'bg-green-100 text-green-700',
  low: 'bg-yellow-100 text-yellow-700',
  critical: 'bg-orange-100 text-orange-700',
  'out-of-stock': 'bg-red-100 text-red-700',
};

const urgencyLabels: Record<string, string> = {
  normal: 'Normal',
  urgent: 'Urgente',
};

export default function AdminMateriaisPage() {
  const [supplies, setSupplies] = useState<StaffSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<StaffSupply | null>(null);
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'geral',
    status: 'ok',
    urgency: 'normal',
    quantity: '',
    unit: '',
    minQuantity: '',
    notes: '',
  });

  const fetchSupplies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set('status', filter.status);
      if (filter.category) params.set('category', filter.category);

      const res = await fetch(`/api/staff/supplies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSupplies(data);
      }
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      quantity: formData.quantity ? Number(formData.quantity) : undefined,
      minQuantity: formData.minQuantity ? Number(formData.minQuantity) : undefined,
      _id: editingSupply?._id,
    };

    const method = editingSupply ? 'PUT' : 'POST';
    const res = await fetch('/api/staff/supplies', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      fetchSupplies();
      closeModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;

    const res = await fetch(`/api/staff/supplies?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchSupplies();
    }
  };

  const handleMarkAsPurchased = async (id: string) => {
    const res = await fetch('/api/staff/supplies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: id,
        status: 'ok',
        purchasedAt: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      fetchSupplies();
    }
  };

  const openModal = (supply?: StaffSupply) => {
    if (supply) {
      setEditingSupply(supply);
      setFormData({
        name: supply.name,
        description: supply.description || '',
        category: supply.category,
        status: supply.status,
        urgency: supply.urgency,
        quantity: supply.quantity?.toString() || '',
        unit: supply.unit || '',
        minQuantity: supply.minQuantity?.toString() || '',
        notes: supply.notes || '',
      });
    } else {
      setEditingSupply(null);
      setFormData({
        name: '',
        description: '',
        category: 'geral',
        status: 'ok',
        urgency: 'normal',
        quantity: '',
        unit: '',
        minQuantity: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupply(null);
  };

  const filteredSupplies = supplies.filter((supply) =>
    supply.name.toLowerCase().includes(search.toLowerCase()) ||
    supply.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    total: supplies.length,
    ok: supplies.filter(s => s.status === 'ok').length,
    low: supplies.filter(s => s.status === 'low').length,
    critical: supplies.filter(s => s.status === 'critical').length,
    outOfStock: supplies.filter(s => s.status === 'out-of-stock').length,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
          <p className="text-gray-500 mt-1">Gerencie o estoque e lista de compras</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Material
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-600">OK</p>
          <p className="text-2xl font-bold text-green-700">{stats.ok}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <p className="text-sm text-yellow-600">Baixo</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.low}</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <p className="text-sm text-orange-600">Crítico</p>
          <p className="text-2xl font-bold text-orange-700">{stats.critical}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-600">Em Falta</p>
          <p className="text-2xl font-bold text-red-700">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar materiais..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Todos os Status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Todas as Categorias</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Supplies List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredSupplies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum material encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Material</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Categoria</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Urgência</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Qtd</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Solicitado por</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSupplies.map((supply) => (
                  <tr key={supply._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{supply.name}</p>
                        {supply.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">{supply.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {categoryLabels[supply.category] || supply.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[supply.status]}`}>
                        {statusLabels[supply.status] || supply.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {supply.urgency === 'urgent' ? (
                        <span className="flex items-center gap-1 text-red-600">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">Urgente</span>
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {supply.quantity ? `${supply.quantity} ${supply.unit || ''}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {supply.requestedByName || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {supply.status !== 'ok' && (
                          <button
                            onClick={() => handleMarkAsPurchased(supply._id)}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Marcar como comprado"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => openModal(supply)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Editar pedido"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(supply._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Excluir pedido"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tooltip */}
      <Tooltip id="tooltip" />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingSupply ? 'Editar Pedido de Material' : 'Novo Pedido de Material'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(urgencyLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="un, kg, L..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Atual</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qtd Mínima</label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  {editingSupply ? 'Salvar' : 'Criar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
