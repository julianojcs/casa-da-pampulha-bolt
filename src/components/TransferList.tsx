'use client';

import { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface TransferListProps {
  availableItems: string[];
  selectedItems: string[];
  onSelectedChange: (items: string[]) => void;
  availableTitle?: string;
  selectedTitle?: string;
}

export function TransferList({
  availableItems,
  selectedItems,
  onSelectedChange,
  availableTitle = 'Disponíveis',
  selectedTitle = 'Selecionados',
}: TransferListProps) {
  const [leftSelected, setLeftSelected] = useState<Set<string>>(new Set());
  const [rightSelected, setRightSelected] = useState<Set<string>>(new Set());
  const [newItem, setNewItem] = useState('');

  // Items not yet selected
  const unselectedItems = availableItems.filter((item) => !selectedItems.includes(item));

  const toggleLeftSelection = (item: string) => {
    const newSet = new Set(leftSelected);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setLeftSelected(newSet);
  };

  const toggleRightSelection = (item: string) => {
    const newSet = new Set(rightSelected);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setRightSelected(newSet);
  };

  const moveToRight = () => {
    if (leftSelected.size === 0) return;
    const itemsToMove = Array.from(leftSelected);
    onSelectedChange([...selectedItems, ...itemsToMove]);
    setLeftSelected(new Set());
  };

  const moveToLeft = () => {
    if (rightSelected.size === 0) return;
    const itemsToRemove = rightSelected;
    onSelectedChange(selectedItems.filter((item) => !itemsToRemove.has(item)));
    setRightSelected(new Set());
  };

  const moveAllToRight = () => {
    onSelectedChange([...selectedItems, ...unselectedItems]);
    setLeftSelected(new Set());
  };

  const moveAllToLeft = () => {
    onSelectedChange([]);
    setRightSelected(new Set());
  };

  const moveUp = () => {
    if (rightSelected.size !== 1) return;
    const item = Array.from(rightSelected)[0];
    const index = selectedItems.indexOf(item);
    if (index <= 0) return;
    const newItems = [...selectedItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    onSelectedChange(newItems);
  };

  const moveDown = () => {
    if (rightSelected.size !== 1) return;
    const item = Array.from(rightSelected)[0];
    const index = selectedItems.indexOf(item);
    if (index === -1 || index >= selectedItems.length - 1) return;
    const newItems = [...selectedItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    onSelectedChange(newItems);
  };

  const addNewItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (selectedItems.includes(trimmed) || availableItems.includes(trimmed)) {
      // Already exists
      return;
    }
    onSelectedChange([...selectedItems, trimmed]);
    setNewItem('');
  };

  const removeFromSelected = (item: string) => {
    onSelectedChange(selectedItems.filter((i) => i !== item));
  };

  return (
    <div className="space-y-4">
      {/* Add new category input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addNewItem();
            }
          }}
          placeholder="Nova categoria..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
        />
        <button
          type="button"
          onClick={addNewItem}
          className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Panel - Available */}
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-700">{availableTitle}</h4>
            <p className="text-xs text-gray-500">{unselectedItems.length} item(s)</p>
          </div>
          <div className="max-h-48 overflow-y-auto p-2 space-y-1">
            {unselectedItems.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum item disponível</p>
            ) : (
              unselectedItems.map((item) => (
                <div
                  key={item}
                  onClick={() => toggleLeftSelection(item)}
                  className={`px-3 py-2 rounded cursor-pointer text-sm transition-colors ${
                    leftSelected.has(item)
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {item}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transfer Buttons */}
        <div className="flex md:flex-col justify-center items-center gap-2 py-2">
          <button
            type="button"
            onClick={moveAllToRight}
            disabled={unselectedItems.length === 0}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Mover todos para selecionados"
          >
            <ChevronDoubleRightIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={moveToRight}
            disabled={leftSelected.size === 0}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Mover selecionados"
          >
            <ChevronRightIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={moveToLeft}
            disabled={rightSelected.size === 0}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remover selecionados"
          >
            <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={moveAllToLeft}
            disabled={selectedItems.length === 0}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remover todos"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Right Panel - Selected */}
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">{selectedTitle}</h4>
              <p className="text-xs text-gray-500">{selectedItems.length} item(s)</p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={moveUp}
                disabled={rightSelected.size !== 1}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Mover para cima"
              >
                <ChevronUpIcon className="h-4 w-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={moveDown}
                disabled={rightSelected.size !== 1}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Mover para baixo"
              >
                <ChevronDownIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-2 space-y-1">
            {selectedItems.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum item selecionado</p>
            ) : (
              selectedItems.map((item, index) => (
                <div
                  key={item}
                  onClick={() => toggleRightSelection(item)}
                  className={`px-3 py-2 rounded cursor-pointer text-sm transition-colors flex items-center justify-between group ${
                    rightSelected.has(item)
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span>
                    <span className="text-gray-400 mr-2">{index + 1}.</span>
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromSelected(item);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                    title="Remover"
                  >
                    <XMarkIcon className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
