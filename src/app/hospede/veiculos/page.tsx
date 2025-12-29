'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TruckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Vehicle {
  _id?: string;
  brand: string;
  model: string;
  color: string;
  plate: string;
}

export default function VeiculosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Vehicle>({
    brand: '',
    model: '',
    color: '',
    plate: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchVehicles();
    }
  }, [status, router]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/user/vehicles');
      const data = await response.json();

      if (response.ok) {
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  const formatPlate = (value: string) => {
    // Remove caracteres especiais e converte para maiúsculas
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Formato padrão: ABC1234 ou ABC1D23 (Mercosul)
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    }
    return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.plate || formData.plate.length < 7) {
      toast.error('Informe uma placa válida');
      return;
    }

    setSaving(true);
    try {
      const method = editingVehicle ? 'PUT' : 'POST';
      const body = editingVehicle
        ? { vehicleId: editingVehicle._id, ...formData }
        : formData;

      const response = await fetch('/api/user/vehicles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          editingVehicle ? 'Veículo atualizado!' : 'Veículo cadastrado!'
        );
        fetchVehicles();
        closeModal();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      toast.error('Erro ao salvar veículo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Tem certeza que deseja remover este veículo?')) return;

    try {
      const response = await fetch(`/api/user/vehicles?vehicleId=${vehicleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Veículo removido');
        fetchVehicles();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao remover');
      }
    } catch (error) {
      toast.error('Erro ao remover veículo');
    }
  };

  const openModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        plate: vehicle.plate,
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        brand: '',
        model: '',
        color: '',
        plate: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setFormData({
      brand: '',
      model: '',
      color: '',
      plate: '',
    });
  };

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/hospede"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Meus Veículos</h1>
              <p className="text-gray-600">Cadastre os veículos da sua estadia</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">
            <strong>Importante:</strong> Cadastre todos os veículos que serão utilizados
            durante sua estadia. Isso facilita o acesso e a segurança do condomínio.
          </p>
        </div>

        {/* Vehicles List */}
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Nenhum veículo cadastrado
              </h3>
              <p className="text-gray-500 mb-4">
                Adicione os veículos que você utilizará durante sua estadia
              </p>
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Cadastrar Veículo
              </button>
            </div>
          ) : (
            vehicles.map((vehicle, index) => (
              <div
                key={vehicle._id || index}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
              >
                <div className="p-3 bg-green-100 rounded-xl">
                  <TruckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-500">
                    {vehicle.color} • Placa: <strong>{vehicle.plate}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(vehicle)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle._id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  placeholder="Ex: Fiat, Volkswagen, Honda..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder="Ex: Palio, Golf, Civic..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="Ex: Preto, Branco, Prata..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa
                </label>
                <input
                  type="text"
                  value={formData.plate}
                  onChange={(e) =>
                    setFormData({ ...formData, plate: formatPlate(e.target.value) })
                  }
                  placeholder="ABC-1A23"
                  maxLength={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent uppercase"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingVehicle ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
