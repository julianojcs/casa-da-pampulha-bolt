'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatPhone } from '@/lib/helpers';

interface PropertyInfo {
  whatsapp?: string;
}

function CadastroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<'verify' | 'register' | 'success'>('verify');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [preRegistration, setPreRegistration] = useState<{
    name: string;
    email?: string;
    phone: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Buscar dados da propriedade para WhatsApp
  useEffect(() => {
    fetch('/api/property')
      .then(res => res.json())
      .then(data => setProperty(data))
      .catch(() => {});
  }, []);

  const getWhatsAppUrl = () => {
    if (!property?.whatsapp) return null;
    const digits = property.whatsapp.replace(/\D/g, '');
    return `https://wa.me/${digits}`;
  };

  // Se tiver token, verificar pré-cadastro automaticamente
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (registrationToken: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pre-registration/verify?token=${registrationToken}`);
      const data = await response.json();

      if (response.ok && data.preRegistration) {
        setPreRegistration(data.preRegistration);
        setFormData((prev) => ({
          ...prev,
          name: data.preRegistration.name,
          email: data.preRegistration.email || '',
          phone: data.preRegistration.phone,
        }));
        setStep('register');
      } else {
        toast.error(data.error || 'Link de cadastro inválido ou expirado');
      }
    } catch (error) {
      toast.error('Erro ao verificar cadastro');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async () => {
    if (!formData.phone || formData.phone.length < 14) {
      toast.error('Informe um telefone válido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/pre-registration/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await response.json();

      if (response.ok && data.preRegistration) {
        setPreRegistration(data.preRegistration);
        setFormData((prev) => ({
          ...prev,
          name: data.preRegistration.name,
          email: data.preRegistration.email || prev.email,
          phone: data.preRegistration.phone,
        }));
        setStep('register');
        toast.success('Pré-cadastro encontrado!');
      } else {
        toast.error(
          data.error ||
            'Não encontramos um pré-cadastro com este telefone. Entre em contato com o anfitrião.'
        );
      }
    } catch (error) {
      toast.error('Erro ao verificar telefone');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          preRegistrationId: preRegistration ? (preRegistration as any)._id : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
        toast.success('Cadastro realizado! Verifique seu email para ativar a conta.');
      } else {
        toast.error(data.error || 'Erro ao criar conta');
      }
    } catch (error) {
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google') => {
    // Salvar dados do pré-cadastro no sessionStorage para recuperar após o login social
    if (preRegistration) {
      sessionStorage.setItem('preRegistration', JSON.stringify(preRegistration));
    }
    signIn(provider, { callbackUrl: '/hospede' });
  };

  if (loading && step === 'verify' && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando cadastro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-20 px-4">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Casa da Pampulha"
              width={80}
              height={80}
              className="mx-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            {step === 'success' ? 'Cadastro Realizado!' : 'Criar Conta'}
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'verify' && 'Informe seu telefone para verificar o pré-cadastro'}
            {step === 'register' && 'Complete seu cadastro para acessar o sistema'}
            {step === 'success' && 'Enviamos um email de confirmação para você'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'verify' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (WhatsApp)
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: formatPhone(e.target.value) })
                    }
                    placeholder="+55 (27) 9XXXX-XXXX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  O anfitrião deve ter feito um pré-cadastro com este número
                </p>
              </div>

              <button
                onClick={verifyPhone}
                disabled={loading}
                className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar Telefone'}
              </button>

              <div className="text-center text-sm text-gray-500">
                {getWhatsAppUrl() ? (
                  <p>
                    Não tem pré-cadastro?{' '}
                    <a
                      href={getWhatsAppUrl()!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline"
                    >
                      Entre em contato
                    </a>
                  </p>
                ) : (
                  <p>Não tem pré-cadastro? Entre em contato com o anfitrião.</p>
                )}
              </div>
            </div>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Social Login */}
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Image
                  src="/images/google-icon.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                <span className="text-gray-700 font-medium">Continuar com Google</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Telefone (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>

              <div>
                <p className="text-gray-600">
                  Enviamos um email de confirmação para{' '}
                  <strong>{formData.email}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Clique no link do email para ativar sua conta
                </p>
              </div>

              <Link
                href="/login"
                className="inline-block w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors text-center"
              >
                Ir para Login
              </Link>
            </div>
          )}
        </div>

        {/* Link para login */}
        {step !== 'success' && (
          <p className="text-center text-gray-600 mt-6">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-amber-600 font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
        </div>
      }
    >
      <CadastroContent />
    </Suspense>
  );
}
