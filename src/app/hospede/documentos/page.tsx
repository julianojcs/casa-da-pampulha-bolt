'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary';
import { CPFInput } from '@/components/CPFInput';
import { validateCPF, cleanCPF } from '@/lib/cpf';

interface Documents {
  documentType: string;
  document: string;
  documentImage?: string;
}

export default function DocumentosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState<Documents>({
    documentType: 'CPF',
    document: '',
    documentImage: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDocuments();
    }
  }, [status, router]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/user/documents');
      const data = await response.json();

      if (response.ok && data) {
        setDocuments({
          documentType: data.documentType || 'CPF',
          document: data.document || '',
          documentImage: data.documentImage || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documents.document) {
      toast.error('Informe o número do documento');
      return;
    }

    // Validação de CPF
    if (documents.documentType === 'CPF') {
      if (!validateCPF(documents.document)) {
        toast.error('CPF inválido');
        return;
      }
    }

    setSaving(true);
    try {
      // Limpar o CPF antes de enviar (remover máscara)
      const dataToSend = {
        ...documents,
        document: documents.documentType === 'CPF'
          ? cleanCPF(documents.document)
          : documents.document,
      };

      const response = await fetch('/api/user/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success('Documentos atualizados!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      toast.error('Erro ao salvar documentos');
    } finally {
      setSaving(false);
    }
  };

  const getDocumentStatus = () => {
    if (!documents.document) {
      return {
        status: 'pending',
        label: 'Pendente',
        message: 'Você ainda não enviou seu documento',
        color: 'bg-yellow-100 text-yellow-800',
      };
    }
    if (!documents.documentImage) {
      return {
        status: 'incomplete',
        label: 'Incompleto',
        message: 'Envie uma foto do documento para completar',
        color: 'bg-orange-100 text-orange-800',
      };
    }
    return {
      status: 'complete',
      label: 'Completo',
      message: 'Documentos enviados com sucesso',
      color: 'bg-green-100 text-green-800',
    };
  };

  const docStatus = getDocumentStatus();

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/hospede"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Documentos</h1>
            <p className="text-gray-600">Envie seus documentos de identificação</p>
          </div>
        </div>

        {/* Status Card */}
        <div
          className={`rounded-xl p-4 mb-6 flex items-start gap-3 ${
            docStatus.status === 'complete'
              ? 'bg-green-50 border border-green-200'
              : docStatus.status === 'incomplete'
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          {docStatus.status === 'complete' ? (
            <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
          ) : (
            <ExclamationCircleIcon
              className={`h-6 w-6 flex-shrink-0 ${
                docStatus.status === 'incomplete'
                  ? 'text-orange-600'
                  : 'text-yellow-600'
              }`}
            />
          )}
          <div>
            <p
              className={`font-medium ${
                docStatus.status === 'complete'
                  ? 'text-green-800'
                  : docStatus.status === 'incomplete'
                  ? 'text-orange-800'
                  : 'text-yellow-800'
              }`}
            >
              {docStatus.label}
            </p>
            <p
              className={`text-sm ${
                docStatus.status === 'complete'
                  ? 'text-green-700'
                  : docStatus.status === 'incomplete'
                  ? 'text-orange-700'
                  : 'text-yellow-700'
              }`}
            >
              {docStatus.message}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['CPF', 'RG', 'Passaporte'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setDocuments({ ...documents, documentType: type })
                    }
                    className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                      documents.documentType === type
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do Documento
              </label>
              {documents.documentType === 'CPF' ? (
                <CPFInput
                  value={documents.document}
                  onChange={(value) => setDocuments({ ...documents, document: value })}
                  required
                />
              ) : (
                <input
                  type="text"
                  value={documents.document}
                  onChange={(e) =>
                    setDocuments({ ...documents, document: e.target.value })
                  }
                  placeholder={
                    documents.documentType === 'RG'
                      ? '00.000.000-0'
                      : 'Número do passaporte'
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Document Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto do Documento
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Envie uma foto legível do seu documento de identificação
              </p>

              <CloudinaryUpload
                folder={CLOUDINARY_FOLDERS.GUESTS}
                value={documents.documentImage || ''}
                onChange={(url: string) =>
                  setDocuments({ ...documents, documentImage: url })
                }
                placeholder="Arraste ou clique para enviar a foto do documento"
                previewClassName="h-48 w-full"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Documentos'}
            </button>
          </form>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            <strong>Privacidade:</strong> Seus documentos são armazenados de forma
            segura e são utilizados apenas para fins de identificação durante sua
            estadia. Nunca compartilhamos seus dados com terceiros.
          </p>
        </div>
      </div>
    </div>
  );
}
