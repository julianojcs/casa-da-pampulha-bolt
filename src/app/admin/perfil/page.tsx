'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  LanguageIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CloudinaryUpload } from '@/components/CloudinaryUpload';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary';
import { formatPhone } from '@/lib/helpers';

interface Host {
  bio?: string;
  role?: string;
  languages?: string[];
  responseTime?: string;
  responseRate?: string;
  isSuperhost?: boolean;
  joinedDate?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  host?: Host;
}

// Lista de idiomas disponíveis
const AVAILABLE_LANGUAGES = [
  'Português',
  'Inglês',
  'Espanhol',
  'Francês',
  'Alemão',
  'Italiano',
  'Japonês',
  'Mandarim',
  'Coreano',
  'Russo',
  'Árabe',
];

export default function AdminPerfilPage() {
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
  });

  const [hostData, setHostData] = useState<Host>({
    bio: '',
    role: 'Coanfitrião',
    languages: ['Português'],
    responseTime: 'Dentro de uma hora',
    responseRate: '100%',
    isSuperhost: false,
    joinedDate: '',
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
      if (session?.user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchProfile();
      }
    }
  }, [status, session, router]);

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
        });
        if (data.host) {
          setHostData({
            bio: data.host.bio || '',
            role: data.host.role || 'Coanfitrião',
            languages: data.host.languages || ['Português'],
            responseTime: data.host.responseTime || 'Dentro de uma hora',
            responseRate: data.host.responseRate || '100%',
            isSuperhost: data.host.isSuperhost || false,
            joinedDate: data.host.joinedDate?.split('T')[0] || '',
          });
        }
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
      const payload = profile?.host
        ? { ...formData, host: hostData }
        : formData;

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>

      {/* Avatar Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Foto do Perfil</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-32">
            <CloudinaryUpload
              folder={CLOUDINARY_FOLDERS.HOSTS}
              value={formData.avatar}
              onChange={(url: string) => setFormData({ ...formData, avatar: url })}
              previewClassName="h-32 w-32 rounded-full"
              showPreview={true}
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-gray-700 font-medium">{formData.name || 'Administrador'}</p>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-2">
              Clique na imagem para alterar sua foto
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Dados Pessoais
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={profile?.email || ''}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
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
            </div>
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

      {/* Host Data Section - only shown if user is a host */}
      {profile?.host && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-amber-500" />
            Dados de Anfitrião
            {hostData.isSuperhost && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Superhost
              </span>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Função
              </label>
              <select
                value={hostData.role}
                onChange={(e) => setHostData({ ...hostData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="Anfitrião">Anfitrião</option>
                <option value="Anfitriã">Anfitriã</option>
                <option value="Coanfitrião">Coanfitrião</option>
                <option value="Coanfitriã">Coanfitriã</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membro desde
              </label>
              <input
                type="date"
                value={hostData.joinedDate}
                onChange={(e) => setHostData({ ...hostData, joinedDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografia
              </label>
              <textarea
                rows={4}
                value={hostData.bio}
                onChange={(e) => setHostData({ ...hostData, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Conte um pouco sobre você..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idiomas
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  onChange={(e) => {
                    if (e.target.value && !hostData.languages?.includes(e.target.value)) {
                      setHostData({
                        ...hostData,
                        languages: [...(hostData.languages || []), e.target.value],
                      });
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Adicionar idioma...</option>
                  {AVAILABLE_LANGUAGES.filter(lang => !hostData.languages?.includes(lang)).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              {hostData.languages && hostData.languages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hostData.languages.map((lang, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                      {lang}
                      <button
                        type="button"
                        onClick={() => setHostData({
                          ...hostData,
                          languages: hostData.languages?.filter((_, i) => i !== index),
                        })}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo de Resposta
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={hostData.responseTime}
                  onChange={(e) => setHostData({ ...hostData, responseTime: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Dentro de uma hora"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de Resposta
              </label>
              <input
                type="text"
                value={hostData.responseRate}
                onChange={(e) => setHostData({ ...hostData, responseRate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: 100%"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hostData.isSuperhost}
                  onChange={(e) => setHostData({ ...hostData, isSuperhost: e.target.checked })}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">Superhost</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Password Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Alterar Senha
          </h2>
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            {showPasswordForm ? 'Cancelar' : 'Alterar'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha Atual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha <span className="text-red-500">*</span>
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha <span className="text-red-500">*</span>
                </label>
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
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
