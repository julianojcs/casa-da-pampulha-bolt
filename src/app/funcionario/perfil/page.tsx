'use client';

import { useSession } from 'next-auth/react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  CameraIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function PerfilPage() {
  const { data: session, update: updateSession } = useSession();
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!session) {
    return null;
  }

  const user = session.user as any;
  const staff = user.staff || {};

  const jobTypeLabels: Record<string, string> = {
    piscineiro: 'Piscineiro(a)',
    jardineiro: 'Jardineiro(a)',
    faxineira: 'Faxineiro(a)',
    manutencao: 'Manutenção',
    outro: 'Outros',
  };

  const workDaysLabels: Record<string, string> = {
    dom: 'Domingo',
    seg: 'Segunda',
    ter: 'Terça',
    qua: 'Quarta',
    qui: 'Quinta',
    sex: 'Sexta',
    sab: 'Sábado',
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo: 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    setUploading(true);
    try {
      // Upload image
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'guests');
      formData.append('isAvatar', 'true');
      formData.append('userId', user.id);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const { url } = await uploadRes.json();

      // Update profile with new avatar
      const profileRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: url }),
      });

      if (!profileRes.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      // Update session
      await updateSession({ ...session, user: { ...session.user, image: url } });
      setImageError(false);
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      toast.error('Erro ao atualizar foto');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao alterar senha');
      }

      toast.success('Senha alterada com sucesso!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
          Meu Perfil
        </h1>
        <p className="text-slate-500 mt-1">Visualize suas informações</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600" />

        {/* Avatar and Basic Info */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="-mt-16">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="relative group cursor-pointer"
                title="Clique para alterar a foto"
              >
                {user.image && !imageError ? (
                  <Image
                    src={user.image}
                    alt={user.name || ''}
                    width={96}
                    height={96}
                    onError={() => setImageError(true)}
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CameraIcon className="h-8 w-8 text-white" />
                  )}
                </div>
              </button>
            </div>

            <div className="flex-1 pt-1 sm:pt-4">
              <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-500">
                {jobTypeLabels[staff.jobType] || 'Funcionário'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl self-start sm:mt-4">
              <CheckBadgeIcon className="h-5 w-5" />
              <span className="font-medium">Ativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UserCircleIcon className="h-5 w-5 text-emerald-600" />
            Contato
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <EnvelopeIcon className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">E-mail</p>
                <p className="font-medium text-slate-800">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <PhoneIcon className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Telefone</p>
                  <p className="font-medium text-slate-800">{user.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-emerald-600" />
            Função
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BriefcaseIcon className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Cargo</p>
                <p className="font-medium text-slate-800">
                  {jobTypeLabels[staff.jobType] || 'Não definido'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Days */}
      {staff.workDays && staff.workDays.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-emerald-600" />
            Dias de Trabalho
          </h3>
          <div className="flex flex-wrap gap-2">
            {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map((day) => {
              const isWorkDay = staff.workDays?.includes(day);
              return (
                <div
                  key={day}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isWorkDay
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-2 border-slate-100'
                  }`}
                >
                  {workDaysLabels[day]}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Checklist */}
      {staff.checklist && staff.checklist.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5 text-emerald-600" />
            Minhas Tarefas Padrão
          </h3>
          <div className="space-y-2">
            {staff.checklist.map((item: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <KeyIcon className="h-5 w-5 text-emerald-600" />
          Segurança
        </h3>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
        >
          <KeyIcon className="h-5 w-5" />
          Alterar Senha
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
        <p className="text-blue-800 text-sm">
          💡 Para atualizar outras informações, entre em contato com o
          administrador do sistema.
        </p>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Alterar Senha</h2>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                    placeholder="Confirme a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {changingPassword ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
