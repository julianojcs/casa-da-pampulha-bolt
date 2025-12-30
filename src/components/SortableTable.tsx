'use client';

import { useState } from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SortableRow({ id, children, disabled }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? 'bg-amber-50 shadow-lg z-10' : ''}`}
    >
      <td className="px-3 py-4 w-10">
        <button
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
          data-tooltip-id="drag-tooltip"
          data-tooltip-content="Arraste para reordenar"
          disabled={disabled}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
      </td>
      {children}
    </tr>
  );
}

interface SortableCardProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SortableCard({ id, children, disabled }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'bg-amber-50 shadow-lg z-10 rounded-lg' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className={`absolute top-2 left-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 bg-white rounded p-1 shadow-sm transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
        data-tooltip-id="drag-tooltip"
        data-tooltip-content="Arraste para reordenar"
        disabled={disabled}
      >
        <Bars3Icon className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

interface SortableContainerProps<T extends { _id: string; order?: number }> {
  items: T[];
  onReorder: (items: T[]) => Promise<void>;
  children: (items: T[]) => React.ReactNode;
  disabled?: boolean;
}

export function SortableContainer<T extends { _id: string; order?: number }>({
  items,
  onReorder,
  children,
  disabled,
}: SortableContainerProps<T>) {
  const [localItems, setLocalItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar items externos com locais
  if (JSON.stringify(items.map(i => i._id)) !== JSON.stringify(localItems.map(i => i._id))) {
    setLocalItems(items);
  }

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item._id === active.id);
      const newIndex = localItems.findIndex((item) => item._id === over.id);

      const newItems = arrayMove(localItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      setLocalItems(newItems);
      setIsSaving(true);

      try {
        await onReorder(newItems);
      } catch (error) {
        // Reverter em caso de erro
        setLocalItems(items);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localItems.map((item) => item._id)}
          strategy={verticalListSortingStrategy}
          disabled={disabled || isSaving}
        >
          {children(localItems)}
        </SortableContext>
      </DndContext>
      <Tooltip id="drag-tooltip" place="top" />
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          Salvando ordem...
        </div>
      )}
    </>
  );
}
