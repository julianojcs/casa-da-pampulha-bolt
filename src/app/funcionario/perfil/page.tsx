'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

export default function PerfilPage() {
  const { data: session } = useSession();
  const [imageError, setImageError] = useState(false);

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

      {/* Help Text */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
        <p className="text-blue-800 text-sm">
          💡 Para atualizar suas informações, entre em contato com o
          administrador do sistema.
        </p>
      </div>
    </div>
  );
}
