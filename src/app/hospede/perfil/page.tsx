'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary';
import { AddressFields } from '@/components/AddressFields';
import { FormField } from '@/components/FormField';
import { formatPhone } from '@/lib/helpers';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  birthDate?: string;
}

export default function PerfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    address: '',
    city: '',
    state: '',
    country: 'Brasil',
    birthDate: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (response.ok) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          avatar: data.avatar || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'Brasil',
          birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
        });
      }
    } catch (error) {
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Perfil atualizado!');
        fetchProfile();
        // Atualizar sessão para refletir mudanças no avatar e nome
        await update({ name: formData.name, image: formData.avatar });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao atualizar');
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Senha alterada!');
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      toast.error('Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
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
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/hospede"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie seus dados pessoais</p>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative w-32">
              <CloudinaryUpload
                folder={CLOUDINARY_FOLDERS.GUESTS}
                value={formData.avatar}
                onChange={(url: string) => setFormData({ ...formData, avatar: url })}
                previewClassName="h-32 w-32 rounded-full"
                showPreview={true}
                isAvatar={true}
                userId={profile?._id}
                maxSizeKB={2048}
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Clique para alterar a foto (máx. 2MB)
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Dados Pessoais
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nome Completo" required>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </FormField>

              <FormField label="Email">
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </FormField>

              <FormField label="Telefone">
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: formatPhone(e.target.value) })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </FormField>

              <FormField label="Data de Nascimento">
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </FormField>
            </div>

            {/* Address Fields */}
            <div className="border-t pt-4 mt-4">
              <AddressFields
                value={{
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  country: formData.country,
                }}
                onChange={(addressData) =>
                  setFormData({
                    ...formData,
                    ...addressData,
                  })
                }
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <LockClosedIcon className="h-5 w-5" />
              Segurança
            </h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                Alterar Senha
              </button>
            )}
          </div>

          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <FormField label="Senha Atual" required>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </FormField>

              <FormField label="Nova Senha" required helpText="Mínimo de 6 caracteres">
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </FormField>

              <FormField label="Confirmar Nova Senha" required>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </FormField>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-500">
              Mantenha sua senha segura. Recomendamos usar uma combinação de letras,
              números e símbolos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
