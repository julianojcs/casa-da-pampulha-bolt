'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  StarIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export interface TransferListItem {
  id: string;
  name: string;
  isDefault?: boolean;
}

interface TransferListProps {
  /** Items available for selection (left list) */
  availableItems: TransferListItem[];
  /** Currently selected/active items (right list) */
  selectedItems: TransferListItem[];
  /** Callback when selected items change */
  onSelectedChange: (items: TransferListItem[]) => void;
  /** Callback to permanently delete an item from available list */
  onDeleteItem?: (item: TransferListItem) => Promise<void>;
  /** Callback when an item is set as default */
  onSetDefault?: (item: TransferListItem) => Promise<void>;
  /** Title for available items list */
  availableTitle?: string;
  /** Title for selected items list */
  selectedTitle?: string;
  /** Allow adding new items */
  allowAdd?: boolean;
  /** Callback when adding a new item */
  onAddItem?: (name: string) => Promise<TransferListItem | null>;
  /** Allow permanent deletion of items */
  allowDelete?: boolean;
  /** Allow setting default item */
  allowSetDefault?: boolean;
  /** Placeholder for add input */
  addPlaceholder?: string;
  /** Show order numbers in selected list */
  showOrder?: boolean;
  /** Enable sorting in selected list */
  enableSort?: boolean;
  /** Loading state */
  loading?: boolean;
}

export function TransferList({
  availableItems,
  selectedItems,
  onSelectedChange,
  onDeleteItem,
  onSetDefault,
  availableTitle = 'Disponíveis',
  selectedTitle = 'Selecionados',
  allowAdd = true,
  onAddItem,
  allowDelete = false,
  allowSetDefault = false,
  addPlaceholder = 'Novo item...',
  showOrder = true,
  enableSort = true,
  loading = false,
}: TransferListProps) {
  const [leftSelected, setLeftSelected] = useState<Set<string>>(new Set());
  const [rightSelected, setRightSelected] = useState<Set<string>>(new Set());
  const [newItemName, setNewItemName] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TransferListItem | null>(null);

  // Track last clicked item for shift-click range selection
  const lastLeftClickRef = useRef<string | null>(null);
  const lastRightClickRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get IDs of selected items for filtering
  const selectedIds = new Set(selectedItems.map(item => item.id));

  // Items not yet selected - ALWAYS sorted alphabetically
  const unselectedItems = availableItems
    .filter(item => !selectedIds.has(item.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  // Listen for Escape key to clear selections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLeftSelected(new Set());
        setRightSelected(new Set());
        lastLeftClickRef.current = null;
        lastRightClickRef.current = null;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle left list click with Shift support
  const handleLeftClick = useCallback((itemId: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastLeftClickRef.current) {
      // Shift+Click: select range
      const startIdx = unselectedItems.findIndex(item => item.id === lastLeftClickRef.current);
      const endIdx = unselectedItems.findIndex(item => item.id === itemId);

      if (startIdx !== -1 && endIdx !== -1) {
        const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
        const rangeIds = unselectedItems.slice(from, to + 1).map(item => item.id);

        setLeftSelected(prev => {
          const newSet = new Set(prev);
          rangeIds.forEach(id => newSet.add(id));
          return newSet;
        });
      }
    } else {
      // Normal click: toggle single item
      setLeftSelected(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    }
    lastLeftClickRef.current = itemId;
  }, [unselectedItems]);

  // Handle right list click with Shift support
  const handleRightClick = useCallback((itemId: string, event: React.MouseEvent) => {
    if (event.shiftKey && lastRightClickRef.current) {
      // Shift+Click: select range
      const startIdx = selectedItems.findIndex(item => item.id === lastRightClickRef.current);
      const endIdx = selectedItems.findIndex(item => item.id === itemId);

      if (startIdx !== -1 && endIdx !== -1) {
        const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
        const rangeIds = selectedItems.slice(from, to + 1).map(item => item.id);

        setRightSelected(prev => {
          const newSet = new Set(prev);
          rangeIds.forEach(id => newSet.add(id));
          return newSet;
        });
      }
    } else {
      // Normal click: toggle single item
      setRightSelected(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    }
    lastRightClickRef.current = itemId;
  }, [selectedItems]);

  const moveToRight = useCallback(() => {
    if (leftSelected.size === 0) return;
    const itemsToMove = availableItems.filter(item => leftSelected.has(item.id));
    onSelectedChange([...selectedItems, ...itemsToMove]);
    setLeftSelected(new Set());
    lastLeftClickRef.current = null;
  }, [leftSelected, availableItems, selectedItems, onSelectedChange]);

  const moveToLeft = useCallback(async () => {
    if (rightSelected.size === 0) return;

    // Check if any selected item is the default
    const movingItems = selectedItems.filter(item => rightSelected.has(item.id));
    const defaultItem = movingItems.find(item => item.isDefault);

    if (defaultItem && onSetDefault) {
      // Find the first remaining item in the right list that is NOT being moved
      const remainingItems = selectedItems.filter(item => !rightSelected.has(item.id));

      if (remainingItems.length > 0) {
        // Set the first remaining item as the new default
        await onSetDefault(remainingItems[0]);
      }
    }

    onSelectedChange(selectedItems.filter(item => !rightSelected.has(item.id)));
    setRightSelected(new Set());
    lastRightClickRef.current = null;
  }, [rightSelected, selectedItems, onSelectedChange, onSetDefault]);

  const moveAllToRight = useCallback(() => {
    onSelectedChange([...selectedItems, ...unselectedItems]);
    setLeftSelected(new Set());
    lastLeftClickRef.current = null;
  }, [selectedItems, unselectedItems, onSelectedChange]);

  const moveAllToLeft = useCallback(() => {
    onSelectedChange([]);
    setRightSelected(new Set());
    lastRightClickRef.current = null;
  }, [onSelectedChange]);

  // Move selected items up (block move)
  const moveUp = useCallback(() => {
    if (rightSelected.size === 0) return;

    // Get indices of selected items
    const selectedIndices = selectedItems
      .map((item, index) => rightSelected.has(item.id) ? index : -1)
      .filter(idx => idx !== -1)
      .sort((a, b) => a - b);

    // Can't move up if first selected item is already at top
    if (selectedIndices[0] === 0) return;

    const newItems = [...selectedItems];
    // Move each selected item up by 1
    for (const idx of selectedIndices) {
      [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
    }

    onSelectedChange(newItems);
  }, [rightSelected, selectedItems, onSelectedChange]);

  // Move selected items down (block move)
  const moveDown = useCallback(() => {
    if (rightSelected.size === 0) return;

    // Get indices of selected items
    const selectedIndices = selectedItems
      .map((item, index) => rightSelected.has(item.id) ? index : -1)
      .filter(idx => idx !== -1)
      .sort((a, b) => b - a); // Sort descending for moving down

    // Can't move down if last selected item is already at bottom
    if (selectedIndices[0] === selectedItems.length - 1) return;

    const newItems = [...selectedItems];
    // Move each selected item down by 1
    for (const idx of selectedIndices) {
      [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
    }

    onSelectedChange(newItems);
  }, [rightSelected, selectedItems, onSelectedChange]);

  // Sort right list alphabetically
  const sortAlphabetically = useCallback(() => {
    const sorted = [...selectedItems].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    onSelectedChange(sorted);
  }, [selectedItems, onSelectedChange]);

  const addNewItem = useCallback(async () => {
    const trimmed = newItemName.trim();
    if (!trimmed || !onAddItem) return;

    // Check if already exists
    const allItems = [...availableItems, ...selectedItems];
    if (allItems.some(item => item.name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }

    const newItem = await onAddItem(trimmed);
    if (newItem) {
      onSelectedChange([...selectedItems, newItem]);
      setNewItemName('');
    }
  }, [newItemName, onAddItem, availableItems, selectedItems, onSelectedChange]);

  const removeFromSelected = useCallback((item: TransferListItem) => {
    onSelectedChange(selectedItems.filter(i => i.id !== item.id));
  }, [selectedItems, onSelectedChange]);

  const handleDeleteItem = useCallback(async (item: TransferListItem) => {
    if (!onDeleteItem) return;

    setIsDeleting(item.id);
    try {
      await onDeleteItem(item);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(null);
    }
  }, [onDeleteItem]);

  const handleSetDefault = useCallback(async (item: TransferListItem) => {
    if (!onSetDefault) return;

    setIsSettingDefault(item.id);
    try {
      await onSetDefault(item);
    } catch (error) {
      console.error('Error setting default:', error);
    } finally {
      setIsSettingDefault(null);
    }
  }, [onSetDefault]);

  // Find default item
  const defaultItem = [...availableItems, ...selectedItems].find(item => item.isDefault);

  return (
    <div className="space-y-4">
      {/* Add new item input */}
      {allowAdd && onAddItem && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addNewItem();
              }
            }}
            placeholder={addPlaceholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            type="button"
            onClick={addNewItem}
            disabled={loading || !newItemName.trim()}
            className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Default category indicator */}
      {allowSetDefault && defaultItem && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          <StarIconSolid className="h-4 w-4 text-amber-500" />
          <span>Categoria padrão: <strong>{defaultItem.name}</strong></span>
          <span className="text-xs text-gray-500">(itens órfãos serão associados a esta categoria)</span>
        </div>
      )}

      {/* Selection hint */}
      <p className="text-xs text-gray-400">
        💡 Dica: Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-[10px]">Shift</kbd>+Clique para selecionar vários itens. Pressione <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-[10px]">Esc</kbd> para desselecionar.
      </p>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Available/Inactive (always sorted alphabetically) */}
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden min-w-0">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">{availableTitle}</h4>
              <p className="text-xs text-gray-500">{unselectedItems.length} item(s)</p>
            </div>
            {leftSelected.size > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {leftSelected.size} selecionado(s)
              </span>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {unselectedItems.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum item disponível</p>
            ) : (
              unselectedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => handleLeftClick(item.id, e)}
                  className={`px-3 py-2 rounded cursor-pointer text-sm transition-colors flex items-center justify-between group ${
                    leftSelected.has(item.id)
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {item.isDefault && (
                      <StarIconSolid className="h-4 w-4 text-amber-500 flex-shrink-0" title="Categoria padrão" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* No set-default button on left list - only right list can have default */}
                    {allowDelete && onDeleteItem && !item.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(item);
                        }}
                        disabled={isDeleting === item.id}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                        title="Excluir permanentemente"
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transfer Buttons */}
        <div className="flex lg:flex-col justify-center items-center gap-2 py-2">
          <button
            type="button"
            onClick={moveAllToRight}
            disabled={unselectedItems.length === 0 || loading}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Mover todos para selecionados"
          >
            <ChevronDoubleDownIcon className="h-4 w-4 text-gray-600 lg:hidden" />
            <ChevronDoubleRightIcon className="h-4 w-4 text-gray-600 hidden lg:block" />
          </button>
          <button
            type="button"
            onClick={moveToRight}
            disabled={leftSelected.size === 0 || loading}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Mover selecionados"
          >
            <ChevronDownIcon className="h-4 w-4 text-gray-600 lg:hidden" />
            <ChevronRightIcon className="h-4 w-4 text-gray-600 hidden lg:block" />
          </button>
          <button
            type="button"
            onClick={moveToLeft}
            disabled={rightSelected.size === 0 || loading}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remover selecionados"
          >
            <ChevronUpIcon className="h-4 w-4 text-gray-600 lg:hidden" />
            <ChevronLeftIcon className="h-4 w-4 text-gray-600 hidden lg:block" />
          </button>
          <button
            type="button"
            onClick={moveAllToLeft}
            disabled={selectedItems.length === 0 || loading}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remover todos"
          >
            <ChevronDoubleUpIcon className="h-4 w-4 text-gray-600 lg:hidden" />
            <ChevronDoubleLeftIcon className="h-4 w-4 text-gray-600 hidden lg:block" />
          </button>
        </div>

        {/* Right Panel - Selected/Active */}
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden min-w-0">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">{selectedTitle}</h4>
              <p className="text-xs text-gray-500">{selectedItems.length} item(s)</p>
            </div>
            <div className="flex items-center gap-1">
              {rightSelected.size > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mr-1">
                  {rightSelected.size} selecionado(s)
                </span>
              )}
              {enableSort && (
                <>
                  <button
                    type="button"
                    onClick={sortAlphabetically}
                    disabled={selectedItems.length < 2 || loading}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ordenar alfabeticamente"
                  >
                    <Bars3BottomLeftIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={moveUp}
                    disabled={rightSelected.size === 0 || loading}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    <ChevronUpIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={moveDown}
                    disabled={rightSelected.size === 0 || loading}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {selectedItems.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum item selecionado</p>
            ) : (
              selectedItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={(e) => handleRightClick(item.id, e)}
                  className={`px-3 py-2 rounded cursor-pointer text-sm transition-colors flex items-center justify-between group ${
                    rightSelected.has(item.id)
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {showOrder && (
                      <span className="text-gray-400 flex-shrink-0">{index + 1}.</span>
                    )}
                    {item.isDefault && (
                      <StarIconSolid className="h-4 w-4 text-amber-500 flex-shrink-0" title="Categoria padrão" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {allowSetDefault && onSetDefault && !item.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(item);
                        }}
                        disabled={isSettingDefault === item.id}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amber-100 rounded transition-opacity"
                        title="Tornar categoria padrão"
                      >
                        <StarIcon className="h-4 w-4 text-amber-500" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromSelected(item);
                      }}
                      disabled={loading}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                      title="Desativar (mover para disponíveis)"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir permanentemente a categoria{' '}
              <strong>&quot;{confirmDelete.name}&quot;</strong>?
            </p>
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
              ⚠️ Os itens da galeria associados a esta categoria serão movidos para a categoria padrão.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting === confirmDelete.id}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(confirmDelete)}
                disabled={isDeleting === confirmDelete.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting === confirmDelete.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom icon components for mobile view (vertical arrows)
function ChevronDoubleDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function ChevronDoubleUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 18.75l7.5-7.5 7.5 7.5m-15-6l7.5-7.5 7.5 7.5" />
    </svg>
  );
}
