'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface Supply {
  _id: string;
  name: string;
  description?: string;
  category: string;
  status: string;
  urgency: string;
  quantity?: string;
  notes?: string;
  requestedBy?: {
    name: string;
  };
  approvedBy?: {
    name: string;
  };
  createdAt: string;
}

const categories = [
  { value: '', label: 'Todas categorias' },
  { value: 'limpeza', label: '🧹 Limpeza' },
  { value: 'piscina', label: '🏊 Piscina' },
  { value: 'jardim', label: '🌿 Jardim' },
  { value: 'cozinha', label: '🍳 Cozinha' },
  { value: 'banheiro', label: '🚿 Banheiro' },
  { value: 'geral', label: '📦 Geral' },
];

const statusOptions = [
  { value: '', label: 'Todos status' },
  { value: 'ok', label: 'OK' },
  { value: 'low', label: 'Baixo' },
  { value: 'critical', label: 'Crítico' },
  { value: 'out-of-stock', label: 'Esgotado' },
];

export default function MateriaisPage() {
  const { data: session } = useSession();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSupply, setNewSupply] = useState({
    name: '',
    description: '',
    category: 'geral',
    status: 'low',
    urgency: 'normal',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff/supplies');
      if (res.ok) {
        const data = await res.json();
        setSupplies(data);
      }
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSupplies = useMemo(() => {
    return supplies.filter((supply) => {
      const matchesSearch =
        !searchQuery ||
        supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supply.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !filterCategory || supply.category === filterCategory;
      const matchesStatus = !filterStatus || supply.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [supplies, searchQuery, filterCategory, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: supplies.length,
      ok: supplies.filter((s) => s.status === 'ok').length,
      low: supplies.filter((s) => s.status === 'low').length,
      critical: supplies.filter((s) => s.status === 'critical').length,
      outOfStock: supplies.filter((s) => s.status === 'out-of-stock').length,
    };
  }, [supplies]);

  const handleCreateSupply = async () => {
    if (!newSupply.name.trim()) return;

    try {
      const res = await fetch('/api/staff/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupply),
      });
      if (res.ok) {
        const created = await res.json();
        setSupplies((prev) => [created, ...prev]);
        setShowNewModal(false);
        setNewSupply({
          name: '',
          description: '',
          category: 'geral',
          status: 'low',
          urgency: 'normal',
          quantity: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Erro ao criar material:', error);
    }
  };

  const handleUpdateStatus = async (supplyId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/staff/supplies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: supplyId, status: newStatus }),
      });
      if (res.ok) {
        setSupplies((prev) =>
          prev.map((s) =>
            s._id === supplyId ? { ...s, status: newStatus } : s
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'limpeza':
        return '🧹';
      case 'piscina':
        return '🏊';
      case 'jardim':
        return '🌿';
      case 'cozinha':
        return '🍳';
      case 'banheiro':
        return '🚿';
      default:
        return '📦';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'low':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'critical':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'out-of-stock':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ok':
        return 'OK';
      case 'low':
        return 'Baixo';
      case 'critical':
        return 'Crítico';
      case 'out-of-stock':
        return 'Esgotado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500">Carregando materiais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            Materiais
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie o estoque de materiais e faça solicitações
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 self-start sm:self-center"
        >
          <PlusIcon className="h-5 w-5" />
          Solicitar Material
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">{stats.ok}</p>
          <p className="text-xs text-emerald-600">OK</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
          <p className="text-2xl font-bold text-amber-700">{stats.low}</p>
          <p className="text-xs text-amber-600">Baixo</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
          <p className="text-2xl font-bold text-orange-700">{stats.critical}</p>
          <p className="text-xs text-orange-600">Crítico</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
          <p className="text-2xl font-bold text-red-700">{stats.outOfStock}</p>
          <p className="text-xs text-red-600">Esgotado</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar materiais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
              showFilters || filterCategory || filterStatus
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Filtros</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Supplies List */}
      {filteredSupplies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <ShoppingCartIcon className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Nenhum material encontrado
          </h3>
          <p className="text-slate-500">
            {searchQuery || filterCategory || filterStatus
              ? 'Tente ajustar os filtros'
              : 'Não há materiais cadastrados'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSupplies.map((supply) => (
            <div
              key={supply._id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{getCategoryIcon(supply.category)}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">{supply.name}</h3>
                  <p className="text-sm text-slate-500 capitalize">
                    {supply.category}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-lg border ${getStatusStyle(
                    supply.status
                  )}`}
                >
                  {getStatusLabel(supply.status)}
                </span>
              </div>

              {supply.description && (
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {supply.description}
                </p>
              )}

              {supply.quantity && (
                <p className="text-sm text-slate-500 mb-3">
                  Quantidade: <span className="font-medium">{supply.quantity}</span>
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                <select
                  value={supply.status}
                  onChange={(e) => handleUpdateStatus(supply._id, e.target.value)}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg border outline-none cursor-pointer ${getStatusStyle(
                    supply.status
                  )}`}
                >
                  <option value="ok">OK</option>
                  <option value="low">Baixo</option>
                  <option value="critical">Crítico</option>
                  <option value="out-of-stock">Esgotado</option>
                </select>
              </div>

              {supply.urgency === 'urgent' && (
                <div className="mt-3 flex items-center gap-2 text-red-600">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">Urgente</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Supply Modal */}
      {showNewModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowNewModal(false)}
          />
          <div className="fixed inset-x-4 bottom-4 top-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Solicitar Material
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">
                  Nome do Material *
                </label>
                <input
                  type="text"
                  value={newSupply.name}
                  onChange={(e) =>
                    setNewSupply((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Cloro para piscina"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">
                  Descrição
                </label>
                <textarea
                  value={newSupply.description}
                  onChange={(e) =>
                    setNewSupply((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descrição adicional..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">
                    Categoria
                  </label>
                  <select
                    value={newSupply.category}
                    onChange={(e) =>
                      setNewSupply((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    {categories
                      .filter((c) => c.value)
                      .map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">
                    Status
                  </label>
                  <select
                    value={newSupply.status}
                    onChange={(e) =>
                      setNewSupply((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="ok">OK</option>
                    <option value="low">Baixo</option>
                    <option value="critical">Crítico</option>
                    <option value="out-of-stock">Esgotado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">
                    Quantidade
                  </label>
                  <input
                    type="text"
                    value={newSupply.quantity}
                    onChange={(e) =>
                      setNewSupply((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    placeholder="Ex: 5 unidades"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">
                    Urgência
                  </label>
                  <select
                    value={newSupply.urgency}
                    onChange={(e) =>
                      setNewSupply((prev) => ({
                        ...prev,
                        urgency: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">
                  Observações
                </label>
                <textarea
                  value={newSupply.notes}
                  onChange={(e) =>
                    setNewSupply((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Observações adicionais..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <button
                onClick={handleCreateSupply}
                disabled={!newSupply.name.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Solicitar Material
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
