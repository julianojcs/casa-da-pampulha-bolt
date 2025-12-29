'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { type CloudinaryFolder } from '@/lib/cloudinary';
import toast from 'react-hot-toast';

// Tipo para arquivo pendente de upload
export interface PendingUpload {
  file: File;
  previewUrl: string;
  folder: CloudinaryFolder;
}

interface CloudinaryUploadProps {
  folder: CloudinaryFolder;
  value: string;
  onChange: (url: string) => void;
  onPendingChange?: (pending: PendingUpload | null) => void;
  onDelete?: () => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  className?: string;
  previewClassName?: string;
  showPreview?: boolean;
  deferUpload?: boolean; // Se true, não faz upload imediato
  isAvatar?: boolean; // Se true, usa public_id fixo e redimensiona
  userId?: string; // ID do usuário para avatar fixo
  maxSizeKB?: number; // Tamanho máximo do arquivo em KB (default: 5MB)
}

// Função para fazer upload do arquivo pendente
export async function uploadPendingFile(pending: PendingUpload, options?: { isAvatar?: boolean; userId?: string }): Promise<string> {
  const formData = new FormData();
  formData.append('file', pending.file);
  formData.append('folder', pending.folder);

  if (options?.isAvatar) {
    formData.append('isAvatar', 'true');
  }
  if (options?.userId) {
    formData.append('userId', options.userId);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao fazer upload');
  }

  const result = await response.json();

  // Limpar o preview URL
  URL.revokeObjectURL(pending.previewUrl);

  return result.url;
}

export function CloudinaryUpload({
  folder,
  value,
  onChange,
  onPendingChange,
  onDelete,
  label,
  placeholder = 'Arraste uma imagem ou clique para selecionar',
  accept = 'image/*',
  className = '',
  previewClassName = 'h-48 w-full',
  showPreview = true,
  deferUpload = false,
  isAvatar = false,
  userId,
  maxSizeKB = 5120, // 5MB default
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Limpar preview local quando value muda
  useEffect(() => {
    if (value && localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
  }, [value, localPreview]);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validar tamanho do arquivo
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      toast.error(`Arquivo muito grande. Máximo: ${Math.round(maxSizeKB / 1024)}MB`);
      return;
    }

    // Criar preview local
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    if (deferUpload) {
      // Apenas notifica sobre o arquivo pendente
      onPendingChange?.({
        file,
        previewUrl,
        folder,
      });
      return;
    }

    // Upload imediato
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Adicionar parâmetros de avatar se necessário
      if (isAvatar) {
        formData.append('isAvatar', 'true');
        if (userId) {
          formData.append('userId', userId);
        }
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer upload');
      }

      const result = await response.json();
      onChange(result.url);
      setLocalPreview(null);
      URL.revokeObjectURL(previewUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload');
      setLocalPreview(null);
      URL.revokeObjectURL(previewUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = async () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
      onPendingChange?.(null);
    }
    if (onDelete) {
      onDelete();
    }
    onChange('');
  };

  const displayUrl = localPreview || value;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {displayUrl && showPreview ? (
        <div className="relative">
          <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${previewClassName}`}>
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={displayUrl.startsWith('blob:')}
            />
            {localPreview && (
              <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                Pendente
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg z-10"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${dragOver ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400'}
            ${uploading ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-2" />
              <span className="text-sm text-gray-500">Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <CloudArrowUpIcon className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">{placeholder}</span>
              <span className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF até 10MB
              </span>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {displayUrl && !showPreview && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <PhotoIcon className="h-4 w-4" />
          <span className="truncate flex-1">
            {localPreview ? 'Arquivo selecionado (pendente)' : displayUrl}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

interface CloudinaryMultiUploadProps {
  folder: CloudinaryFolder;
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
  className?: string;
}

export function CloudinaryMultiUpload({
  folder,
  values,
  onChange,
  label,
  maxImages = 10,
  className = '',
}: CloudinaryMultiUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - values.length;
    if (remainingSlots <= 0) {
      toast.error(`Limite de ${maxImages} imagens atingido`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Erro ao fazer upload');
        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.url);
      onChange([...values, ...newUrls]);
      toast.success(`${newUrls.length} imagem(ns) enviada(s)!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload de algumas imagens');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newValues = [...values];
    const [removed] = newValues.splice(fromIndex, 1);
    newValues.splice(toIndex, 0, removed);
    onChange(newValues);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* Image Grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {values.map((url, index) => (
            <div key={url} className="relative group aspect-square">
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index - 1)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="Mover para esquerda"
                  >
                    ←
                  </button>
                )}
                {index < values.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index + 1)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="Mover para direita"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                  title="Remover"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {values.length < maxImages && (
        <div
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200 border-gray-300 hover:border-amber-400
            ${uploading ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-2" />
              <span className="text-sm text-gray-500">Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <CloudArrowUpIcon className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                Clique para adicionar imagens ({values.length}/{maxImages})
              </span>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}
