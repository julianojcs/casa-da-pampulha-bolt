'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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

interface Bed {
  type: string;
  quantity: number;
}

interface Room {
  _id: string;
  name: string;
  description: string;
  beds: Bed[];
  maxGuests: number;
  amenities: string[];
  images: string[];
  order: number;
  isActive: boolean;
}

const BED_TYPES = [
  'Cama de Casal',
  'Cama de Solteiro',
  'Cama Queen',
  'Cama King',
  'Beliche',
  'Bicama',
  'Sofá-cama',
  'Berço',
];

const emptyRoom: Omit<Room, '_id'> = {
  name: '',
  description: '',
  beds: [],
  maxGuests: 2,
  amenities: [],
  images: [],
  order: 0,
  isActive: true,
};

// Componente de card sortável
interface SortableRoomCardProps {
  room: Room;
  onView: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
}

function SortableRoomCard({ room, onView, onEdit, onDelete }: SortableRoomCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: room._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-sm overflow-hidden ${
        !room.isActive ? 'opacity-60' : ''
      } ${isDragging ? 'ring-2 ring-amber-500 shadow-lg z-10' : ''}`}
    >
      {/* Imagem */}
      <div className="relative h-48 bg-gray-200">
        {room.images && room.images.length > 0 ? (
          <Image
            src={room.images[0]}
            alt={room.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Sem imagem
          </div>
        )}
        {!room.isActive && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Inativo
          </div>
        )}
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing text-white bg-black/50 hover:bg-black/70 rounded p-1.5 transition-colors"
          data-tooltip-id="drag-tooltip"
          data-tooltip-content="Arraste para reordenar"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800">{room.name}</h3>
          <span className="text-xs text-gray-400 flex-shrink-0">#{room.order}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {room.description}
        </p>
        <div className="mt-2 text-sm text-gray-600">
          <span>Máximo: {room.maxGuests} hóspedes</span>
          {room.beds && room.beds.length > 0 && (
            <span className="ml-2">
              • {room.beds.reduce((acc, b) => acc + b.quantity, 0)} cama(s)
            </span>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onView(room)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <EyeIcon className="h-4 w-4" />
            Ver
          </button>
          <button
            onClick={() => onEdit(room)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-amber-600 border border-amber-600 rounded-lg hover:bg-amber-50"
          >
            <PencilIcon className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => onDelete(room._id)}
            className="px-3 py-1.5 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminQuartosPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<Omit<Room, '_id'>>(emptyRoom);
  const [saving, setSaving] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const [newBed, setNewBed] = useState<Bed>({ type: 'Cama de Casal', quantity: 1 });
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleReorder = async (reorderedRooms: Room[]) => {
    const previousRooms = [...rooms];
    setRooms(reorderedRooms);
    setIsSavingOrder(true);
    
    try {
      const response = await fetch('/api/admin/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'rooms',
          items: reorderedRooms.map((room) => ({ _id: room._id, order: room.order })),
        }),
      });
      
      if (!response.ok) throw new Error('Erro ao salvar ordem');
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      setRooms(previousRooms);
      toast.error('Erro ao salvar ordem');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = rooms.findIndex((room) => room._id === active.id);
      const newIndex = rooms.findIndex((room) => room._id === over.id);
      
      const newRooms = arrayMove(rooms, oldIndex, newIndex).map((room, index) => ({
        ...room,
        order: index + 1,
      }));
      
      handleReorder(newRooms);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms?includeInactive=true');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
      toast.error('Erro ao carregar quartos');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (room?: Room) => {
    setIsViewMode(false);
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        description: room.description,
        beds: room.beds || [],
        maxGuests: room.maxGuests,
        amenities: room.amenities || [],
        images: room.images || [],
        order: room.order,
        isActive: room.isActive,
      });
    } else {
      setEditingRoom(null);
      setFormData(emptyRoom);
    }
    setIsModalOpen(true);
  };

  const openViewModal = (room: Room) => {
    setIsViewMode(true);
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description,
      beds: room.beds || [],
      maxGuests: room.maxGuests,
      amenities: room.amenities || [],
      images: room.images || [],
      order: room.order,
      isActive: room.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setFormData(emptyRoom);
    setIsViewMode(false);
    setNewAmenity('');
    setNewBed({ type: 'Cama de Casal', quantity: 1 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) {
      closeModal();
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Nome do quarto é obrigatório');
      return;
    }

    setSaving(true);

    try {
      const url = editingRoom
        ? `/api/rooms?id=${editingRoom._id}`
        : '/api/rooms';

      const response = await fetch(url, {
        method: editingRoom ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success(editingRoom ? 'Quarto atualizado!' : 'Quarto criado!');
      closeModal();
      fetchRooms();
    } catch (error) {
      toast.error('Erro ao salvar quarto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este quarto?')) return;

    try {
      const response = await fetch(`/api/rooms?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Quarto excluído!');
      fetchRooms();
    } catch (error) {
      toast.error('Erro ao excluir quarto');
    }
  };

  const addBed = () => {
    if (newBed.type && newBed.quantity > 0) {
      setFormData({
        ...formData,
        beds: [...formData.beds, { ...newBed }],
      });
      setNewBed({ type: 'Cama de Casal', quantity: 1 });
    }
  };

  const removeBed = (index: number) => {
    setFormData({
      ...formData,
      beds: formData.beds.filter((_, i) => i !== index),
    });
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  const addImage = (url: string) => {
    if (!formData.images.includes(url)) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quartos e Dormitórios</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Quarto
        </button>
      </div>

      {/* Grid de Quartos */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rooms.map((room) => room._id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <SortableRoomCard
                key={room._id}
                room={room}
                onView={openViewModal}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Tooltip id="drag-tooltip" place="top" />
      
      {isSavingOrder && (
        <div className="fixed bottom-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          Salvando ordem...
        </div>
      )}

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum quarto cadastrado</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">
                {isViewMode
                  ? 'Visualizar Quarto'
                  : editingRoom
                    ? 'Editar Quarto'
                    : 'Novo Quarto'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Quarto
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Suíte Master"
                  disabled={isViewMode}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Descrição do quarto..."
                  disabled={isViewMode}
                />
              </div>

              {/* Capacidade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de Hóspedes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Camas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Camas
                </label>
                {!isViewMode && (
                  <div className="flex gap-2 mb-2">
                    <select
                      value={newBed.type}
                      onChange={(e) => setNewBed({ ...newBed, type: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      {BED_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={newBed.quantity}
                      onChange={(e) => setNewBed({ ...newBed, quantity: parseInt(e.target.value) || 1 })}
                      className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={addBed}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
                {formData.beds.length > 0 && (
                  <div className="space-y-2">
                    {formData.beds.map((bed, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span>{bed.quantity}x {bed.type}</span>
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => removeBed(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comodidades do Quarto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comodidades do Quarto
                </label>
                {!isViewMode && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Ex: Ar condicionado, TV, etc."
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                        {amenity}
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Imagens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagens
                </label>
                {!isViewMode && (
                  <CloudinaryUpload
                    value=""
                    onChange={addImage}
                    folder={CLOUDINARY_FOLDERS.GALLERY}
                    showPreview={false}
                    placeholder="Clique para adicionar imagem"
                  />
                )}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative aspect-video">
                        <Image
                          src={img}
                          alt={`Imagem ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              {!isViewMode && (
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Ativo</span>
                  </label>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {isViewMode ? 'Fechar' : 'Cancelar'}
                </button>
                {!isViewMode && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : editingRoom ? 'Salvar' : 'Criar'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
