'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  Squares2X2Icon,
  ListBulletIcon,
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

interface Product {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  measurementUnit?: string;
  brand?: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const [newSupply, setNewSupply] = useState({
    name: '',
    description: '',
    category: 'geral',
    status: 'low',
    urgency: 'normal',
    quantity: '',
    notes: '',
  });

  // Filtered products for searchable dropdown
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  // Click outside handler for product dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSupplies();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?active=true');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleProductSelect = (productId: string) => {
    setShowProductDropdown(false);
    setProductSearch('');
    if (productId === 'custom') {
      setIsCustomProduct(true);
      setSelectedProductId('');
      setNewSupply({
        name: '',
        description: '',
        category: 'geral',
        status: 'low',
        urgency: 'normal',
        quantity: '',
        notes: '',
      });
    } else {
      setIsCustomProduct(false);
      setSelectedProductId(productId);
      const product = products.find(p => p._id === productId);
      if (product) {
        setNewSupply({
          ...newSupply,
          name: product.name,
          description: product.description || '',
          category: product.category,
        });
      }
    }
  };

  const resetModal = () => {
    setSelectedProductId('');
    setIsCustomProduct(false);
    setEditingSupply(null);
    setProductSearch('');
    setShowProductDropdown(false);
    setNewSupply({
      name: '',
      description: '',
      category: 'geral',
      status: 'low',
      urgency: 'normal',
      quantity: '',
      notes: '',
    });
    setShowNewModal(false);
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
    if (!newSupply.name.trim() || saving) return;

    setSaving(true);
    try {
      const res = await fetch('/api/staff/supplies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupply),
      });
      if (res.ok) {
        const created = await res.json();
        setSupplies((prev) => [created, ...prev]);
        resetModal();
        toast.success('Material solicitado com sucesso!');
      } else {
        toast.error('Erro ao solicitar material');
      }
    } catch (error) {
      console.error('Erro ao criar material:', error);
      toast.error('Erro ao solicitar material');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSupply = (supply: Supply) => {
    setEditingSupply(supply);
    setIsCustomProduct(true);
    setNewSupply({
      name: supply.name,
      description: supply.description || '',
      category: supply.category,
      status: supply.status,
      urgency: supply.urgency,
      quantity: supply.quantity || '',
      notes: supply.notes || '',
    });
    setShowNewModal(true);
  };

  const handleUpdateSupply = async () => {
    if (!editingSupply || !newSupply.name.trim() || saving) return;

    setSaving(true);
    try {
      const res = await fetch('/api/staff/supplies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingSupply._id, ...newSupply }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSupplies((prev) =>
          prev.map((s) => (s._id === editingSupply._id ? updated : s))
        );
        resetModal();
        toast.success('Material atualizado com sucesso!');
      } else {
        toast.error('Erro ao atualizar material');
      }
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      toast.error('Erro ao atualizar material');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupply = async (supplyId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return;

    try {
      const res = await fetch('/api/staff/supplies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: supplyId }),
      });
      if (res.ok) {
        setSupplies((prev) => prev.filter((s) => s._id !== supplyId));
        toast.success('Solicitação excluída com sucesso!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao excluir solicitação');
      }
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast.error('Erro ao excluir solicitação');
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
        toast.success('Status atualizado!');
      } else {
        toast.error('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar material:', error);
      toast.error('Erro ao atualizar status');
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
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Visualização em grade"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Visualização em lista"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30"
          >
            <PlusIcon className="h-5 w-5" />
            Solicitar Material
          </button>
        </div>
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
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredSupplies.map((supply) => {
            const product = products.find(p => p.name === supply.name);
            return (
              <div
                key={supply._id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="aspect-square bg-slate-100 relative">
                  {product?.image ? (
                    <Image
                      src={product.image}
                      alt={supply.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">{getCategoryIcon(supply.category)}</span>
                    </div>
                  )}
                  {supply.urgency === 'urgent' && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-3 w-3" />
                      Urgente
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{supply.name}</h3>
                  <p className="text-xs text-slate-500 capitalize mb-2">{supply.category}</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-lg border ${getStatusStyle(supply.status)}`}
                  >
                    {getStatusLabel(supply.status)}
                  </span>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => handleEditSupply(supply)}
                      className="flex-1 p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupply(supply._id)}
                      className="flex-1 p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <TrashIcon className="h-4 w-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredSupplies.map((supply) => {
              const product = products.find(p => p.name === supply.name);
              return (
                <div
                  key={supply._id}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Image */}
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {product?.image ? (
                      <Image
                        src={product.image}
                        alt={supply.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">{getCategoryIcon(supply.category)}</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">{supply.name}</h3>
                      {supply.urgency === 'urgent' && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          Urgente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 capitalize">{supply.category}</p>
                    {supply.description && (
                      <p className="text-sm text-slate-600 truncate">{supply.description}</p>
                    )}
                  </div>
                  {/* Status */}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-lg border ${getStatusStyle(supply.status)}`}
                  >
                    {getStatusLabel(supply.status)}
                  </span>
                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditSupply(supply)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupply(supply._id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New/Edit Supply Modal */}
      {showNewModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={resetModal}
          />
          <div className="fixed inset-x-4 bottom-4 top-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingSupply ? 'Editar Material' : 'Solicitar Material'}
              </h2>
              <button
                onClick={resetModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Product Selection - only show for new supplies */}
              {!editingSupply && (
              <div ref={productDropdownRef} className="relative">
                <label className="text-sm font-medium text-slate-600 mb-1 block">
                  Selecione o Produto *
                </label>
                <div
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer flex items-center gap-3"
                >
                  {selectedProductId ? (
                    <>
                      {products.find(p => p._id === selectedProductId)?.image ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <Image
                            src={products.find(p => p._id === selectedProductId)?.image || ''}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">{getCategoryIcon(products.find(p => p._id === selectedProductId)?.category || 'geral')}</span>
                        </div>
                      )}
                      <span className="flex-1 text-slate-800">
                        {products.find(p => p._id === selectedProductId)?.name}
                        {products.find(p => p._id === selectedProductId)?.brand && (
                          <span className="text-slate-500 ml-1">({products.find(p => p._id === selectedProductId)?.brand})</span>
                        )}
                      </span>
                    </>
                  ) : isCustomProduct ? (
                    <span className="flex-1 text-slate-800">➕ Produto personalizado</span>
                  ) : (
                    <span className="flex-1 text-slate-400">Selecione um produto...</span>
                  )}
                  <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${showProductDropdown ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown */}
                {showProductDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-72 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar produto..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    {/* Product List */}
                    <div className="max-h-52 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleProductSelect(product._id)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                        >
                          {product.image ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">{getCategoryIcon(product.category)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">{product.name}</p>
                            <p className="text-xs text-slate-500 capitalize">
                              {product.category}
                              {product.brand && ` • ${product.brand}`}
                            </p>
                          </div>
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <p className="text-center text-slate-500 text-sm py-4">Nenhum produto encontrado</p>
                      )}
                      {/* Custom product option */}
                      <button
                        type="button"
                        onClick={() => handleProductSelect('custom')}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 transition-colors text-left border-t border-slate-100"
                      >
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <PlusIcon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="font-medium text-emerald-700">Adicionar produto personalizado</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Custom Product Name - only show if custom selected or editing */}
              {(isCustomProduct || editingSupply) && (
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
              )}

              {/* Show selected product info */}
              {selectedProductId && !isCustomProduct && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="font-medium text-emerald-800">{newSupply.name}</p>
                  {newSupply.description && (
                    <p className="text-sm text-emerald-600 mt-1">{newSupply.description}</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">
                  Descrição / Observações
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
                onClick={editingSupply ? handleUpdateSupply : handleCreateSupply}
                disabled={!newSupply.name.trim() || saving}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : editingSupply ? (
                  'Salvar Alterações'
                ) : (
                  'Solicitar Material'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
