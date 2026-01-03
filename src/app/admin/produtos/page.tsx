'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  PhotoIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  purchaseUrl?: string;
  category: string;
  measurementType: string;
  measurementValue?: number;
  measurementUnit?: string;
  brand?: string;
  barcode?: string;
  suggestedSupplier?: string;
  averagePrice?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<string, string> = {
  limpeza: 'Limpeza',
  piscina: 'Piscina',
  jardim: 'Jardim',
  manutencao: 'Manutenção',
  cozinha: 'Cozinha',
  banheiro: 'Banheiro',
  geral: 'Geral',
};

const measurementTypeLabels: Record<string, string> = {
  weight: 'Peso',
  volume: 'Volume',
  unit: 'Unidade',
};

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState({ category: '' });
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string>('');
  const [displayCount, setDisplayCount] = useState(24);
  const loaderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    purchaseUrl: '',
    category: 'geral',
    measurementType: 'unit',
    measurementValue: '',
    measurementUnit: '',
    brand: '',
    barcode: '',
    suggestedSupplier: '',
    averagePrice: '',
    notes: '',
    isActive: true,
  });

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.set('category', filter.category);
      params.set('active', 'false'); // Show all for admin

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store file locally for upload on submit
    setPendingImageFile(file);

    // Create local preview URL
    const previewUrl = URL.createObjectURL(file);
    setLocalImagePreview(previewUrl);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('folder', 'products');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let imageUrl = formData.image;

    // Upload pending image if exists
    if (pendingImageFile) {
      const uploadedUrl = await uploadImage(pendingImageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const payload = {
      ...formData,
      image: imageUrl,
      measurementValue: formData.measurementValue ? Number(formData.measurementValue) : undefined,
      averagePrice: formData.averagePrice ? Number(formData.averagePrice) : undefined,
      _id: editingProduct?._id,
    };

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
        fetchProducts();
        closeModal();
      } else {
        toast.error('Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchProducts();
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        image: product.image || '',
        purchaseUrl: product.purchaseUrl || '',
        category: product.category,
        measurementType: product.measurementType,
        measurementValue: product.measurementValue?.toString() || '',
        measurementUnit: product.measurementUnit || '',
        brand: product.brand || '',
        barcode: product.barcode || '',
        suggestedSupplier: product.suggestedSupplier || '',
        averagePrice: product.averagePrice?.toString() || '',
        notes: product.notes || '',
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        purchaseUrl: '',
        category: 'geral',
        measurementType: 'unit',
        measurementValue: '',
        measurementUnit: '',
        brand: '',
        barcode: '',
        suggestedSupplier: '',
        averagePrice: '',
        notes: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setPendingImageFile(null);
    if (localImagePreview) {
      URL.revokeObjectURL(localImagePreview);
      setLocalImagePreview('');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description?.toLowerCase().includes(search.toLowerCase()) ||
    product.brand?.toLowerCase().includes(search.toLowerCase())
  );

  // Infinite scroll - displayed products
  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount(prev => Math.min(prev + 12, filteredProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, filteredProducts.length]);

  // Reset display count when filter/search changes
  useEffect(() => {
    setDisplayCount(24);
  }, [search, filter.category]);

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
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos</h1>
          <p className="text-gray-500 mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
            {filteredProducts.length !== products.length && ` de ${products.length} total`}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

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

          {/* View Toggle */}
          <div className="flex items-center justify-end gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Visualização em Cards"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Visualização em Tabela"
            >
              <TableCellsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid or Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          <CubeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum produto encontrado</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imagem
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço Médio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedProducts.map((product) => (
                  <tr key={product._id} className={!product.isActive ? 'opacity-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CubeIcon className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                        </div>
                        {product.purchaseUrl && (
                          <Link
                            href={product.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="Link de compra"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {categoryLabels[product.category] || product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.brand || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {product.averagePrice ? (
                        <span className="text-green-600 font-medium">
                          R$ {product.averagePrice.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal(product)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>
      ) : (
        /* Cards View - Smaller cards */
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          {displayedProducts.map((product) => (
            <div
              key={product._id}
              className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${
                !product.isActive ? 'opacity-50' : ''
              }`}
            >
              {/* Image - reduced height by 35% */}
              <div className="aspect-[4/3] bg-gray-100 relative">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CubeIcon className="h-8 w-8 text-gray-300" />
                  </div>
                )}
                {/* Purchase Link Overlay */}
                {product.purchaseUrl && (
                  <Link
                    href={product.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 rounded-lg shadow-md hover:bg-white hover:shadow-lg transition-all"
                    title="Comprar produto"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5 text-emerald-600" />
                  </Link>
                )}
              </div>

              {/* Content - Increased font sizes */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
                {product.brand && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{product.brand}</p>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {product.averagePrice ? (
                      <span className="text-green-600 font-bold text-sm">
                        R$ {product.averagePrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                        {categoryLabels[product.category] || product.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => openModal(product)}
                      className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll Loader */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-6">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
            <span className="text-sm">Carregando mais produtos...</span>
          </div>
        </div>
      )}
      {!hasMore && filteredProducts.length > 24 && (
        <div className="text-center py-4 text-sm text-gray-500">
          Mostrando todos os {filteredProducts.length} produtos
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl relative overflow-hidden flex-shrink-0">
                    {localImagePreview || formData.image ? (
                      <Image
                        src={localImagePreview || formData.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PhotoIcon className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {pendingImageFile ? 'Imagem Selecionada' : 'Escolher Imagem'}
                    </button>
                    {pendingImageFile && (
                      <p className="text-xs text-amber-600 mt-2">
                        A imagem será enviada ao salvar o produto
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      A imagem será salva na pasta &quot;products&quot; do Cloudinary
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Medida</label>
                  <select
                    value={formData.measurementType}
                    onChange={(e) => setFormData({ ...formData, measurementType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(measurementTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.measurementValue}
                    onChange={(e) => setFormData({ ...formData, measurementValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <input
                    type="text"
                    value={formData.measurementUnit}
                    onChange={(e) => setFormData({ ...formData, measurementUnit: e.target.value })}
                    placeholder="kg, g, L, ml..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço Médio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.averagePrice}
                    onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor Sugerido</label>
                  <input
                    type="text"
                    value={formData.suggestedSupplier}
                    onChange={(e) => setFormData({ ...formData, suggestedSupplier: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* URL de Compra */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link de Compra <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="url"
                  value={formData.purchaseUrl}
                  onChange={(e) => setFormData({ ...formData, purchaseUrl: e.target.value })}
                  placeholder="https://www.exemplo.com/produto"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Produto ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {uploading ? 'Salvando...' : editingProduct ? 'Salvar' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
