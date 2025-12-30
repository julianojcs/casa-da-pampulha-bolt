'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  Bars3Icon,
  PlayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';
import { CLOUDINARY_FOLDERS, getYouTubeThumbnail } from '@/lib/cloudinary';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip } from 'react-tooltip';

interface GalleryItem {
  _id: string;
  type: string;
  src: string;
  thumbnail: string;
  title: string;
  category: string;
  order: number;
  isActive: boolean;
}

const defaultCategories = [
  'Área Gourmet',
  'Arredores',
  'Banheiros',
  'Cozinha Completa',
  'Estacionamento',
  'Jardim',
  'Piscina/Jacuzzi',
  'Playground',
  'Quarto Crianças',
  'Quarto Família',
  'Sala de Estar',
  'Suite Master',
  'Loft',
  'Vídeos',
];

const emptyItem: Omit<GalleryItem, '_id'> = {
  type: 'image',
  src: '',
  thumbnail: '',
  title: '',
  category: 'Área Gourmet',
  order: 0,
  isActive: true,
};

// Componente SortableGalleryItem
function SortableGalleryItem({
  item,
  onEdit,
  onDelete,
  disabled
}: {
  item: GalleryItem;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: disabled ? 'auto' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-lg overflow-hidden border border-gray-200 ${isDragging ? 'ring-2 ring-purple-500 shadow-lg z-10' : ''} ${!disabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
      {...attributes}
      {...listeners}
    >
      {/* Drag Handle Indicator */}
      <div
        className={`absolute top-2 right-2 z-10 bg-white/90 rounded p-1.5 shadow-sm text-gray-400 transition-colors ${disabled ? 'opacity-30' : ''}`}
        data-tooltip-id="drag-tooltip"
        data-tooltip-content="Arraste para reordenar"
      >
        <Bars3Icon className="h-4 w-4" />
      </div>

      <div className="aspect-video relative">
        {item.type === 'video' ? (
          (() => {
            const ytThumb = getYouTubeThumbnail(item.src);
            return ytThumb ? (
              <Image
                src={ytThumb}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <VideoCameraIcon className="w-12 h-12 text-gray-400" />
              </div>
            );
          })()
        ) : (
          <Image
            src={item.thumbnail || item.src}
            alt={item.title}
            fill
            className="object-cover"
          />
        )}
        {/* Play icon overlay for videos (always visible, below actions) */}
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="bg-black/50 rounded-full p-3 group-hover:scale-110 transition-transform">
              <PlayIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        )}

        {/* Actions - z-10 to be above play icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-2 bg-white rounded-full text-gray-800 hover:bg-blue-500 hover:text-white transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-white rounded-full text-gray-800 hover:bg-red-500 hover:text-white transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          {item.type === 'video' ? (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Vídeo</span>
          ) : (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Foto</span>
          )}
        </div>

        {/* Order Badge */}
        <div className="absolute bottom-2 left-2">
          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">#{item.order}</span>
        </div>
      </div>

      <div className="p-3">
        <p className="font-medium text-gray-800 text-sm truncate">{item.title}</p>
        <p className="text-xs text-gray-500">{item.category}</p>
      </div>
    </div>
  );
}

export default function AdminGaleriaPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState<Omit<GalleryItem, '_id'>>(emptyItem);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar galeria:', error);
      toast.error('Erro ao carregar galeria');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: GalleryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        type: item.type,
        src: item.src,
        thumbnail: item.thumbnail || '',
        title: item.title,
        category: item.category,
        order: item.order,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({ ...emptyItem, order: items.length + 1 });
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
        ? `/api/gallery?id=${editingItem._id}`
        : '/api/gallery';

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
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Item excluído!');
      fetchItems();
    } catch (error) {
      toast.error('Erro ao excluir item');
    }
  };

  const handleReorder = async (reorderedItems: GalleryItem[]) => {
    try {
      const response = await fetch('/api/admin/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gallery',
          items: reorderedItems.map((item) => ({ _id: item._id, order: item.order })),
        }),
      });

      if (!response.ok) throw new Error('Erro ao reordenar');

      toast.success('Ordem atualizada!');
      setItems(reorderedItems);
    } catch (error) {
      toast.error('Erro ao reordenar itens');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredItems.findIndex((item) => item._id === active.id);
      const newIndex = filteredItems.findIndex((item) => item._id === over.id);

      const newItems = arrayMove(filteredItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      // Atualizar items mantendo os não filtrados
      const updatedItems = items.map(item => {
        const updated = newItems.find(i => i._id === item._id);
        return updated || item;
      });

      setItems(updatedItems);
      await handleReorder(newItems);
    }
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Galeria</h1>
          <p className="text-gray-500 mt-1">Gerencie fotos e vídeos</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Novo Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Todas categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredItems.map((item) => item._id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <SortableGalleryItem
                      key={item._id}
                      item={item}
                      onEdit={() => openModal(item)}
                      onDelete={() => handleDelete(item._id)}
                      disabled={!!categoryFilter || !!searchTerm}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <Tooltip id="drag-tooltip" place="top" />
          </>
        ) : (
          <div className="text-center py-12">
            <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum item encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="image">Imagem</option>
                  <option value="video">Vídeo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'video' ? 'URL do Vídeo *' : 'Imagem *'}
                </label>
                {formData.type === 'video' ? (
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/embed/..."
                    value={formData.src}
                    onChange={(e) => setFormData(prev => ({ ...prev, src: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                ) : (
                  <CloudinaryUpload
                    folder={CLOUDINARY_FOLDERS.GALLERY}
                    value={formData.src}
                    onChange={(url) => setFormData(prev => ({ ...prev, src: url, thumbnail: url }))}
                    previewClassName="h-48 w-full"
                  />
                )}
              </div>

              {formData.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail do Vídeo
                  </label>
                  <CloudinaryUpload
                    folder={CLOUDINARY_FOLDERS.GALLERY}
                    value={formData.thumbnail}
                    onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                    previewClassName="h-32 w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {defaultCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Ativo</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
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
