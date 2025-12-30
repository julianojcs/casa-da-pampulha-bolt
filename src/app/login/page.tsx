'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { LockClosedIcon, EnvelopeIcon, ExclamationTriangleIcon, PaperAirplaneIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const successMessage = searchParams.get('success');
  const errorMessage = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Exibir mensagens de success/error da URL
  useEffect(() => {
    if (successMessage) {
      setShowSuccessMessage(successMessage);
      // Remover parâmetro da URL após exibir
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, '', url.toString());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      // Remover parâmetro da URL após exibir
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [successMessage, errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailNotVerified(false);
    setShowSuccessMessage(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          setEmailNotVerified(true);
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success('Login realizado com sucesso!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('E-mail de verificação reenviado! Verifique sua caixa de entrada.');
      } else {
        toast.error(data.error || 'Erro ao reenviar e-mail');
      }
    } catch (error) {
      toast.error('Erro ao reenviar e-mail de verificação');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <LockClosedIcon className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Entrar</h1>
            <p className="text-gray-500 mt-2">
              Acesse sua conta para ver informações restritas
            </p>
          </div>

          {/* Success Message from Email Verification */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">{showSuccessMessage}</p>
              </div>
            </div>
          )}

          {/* Email Not Verified Alert */}
          {emailNotVerified && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800">E-mail não verificado</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Para acessar sua conta, você precisa confirmar seu e-mail.
                    Verifique sua caixa de entrada (e spam) pelo link de verificação.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                      {isResending ? 'Reenviando...' : 'Reenviar e-mail de verificação'}
                    </button>
                    <Link
                      href={`/verify-email?email=${encodeURIComponent(formData.email)}`}
                      className="text-center text-sm text-amber-700 hover:text-amber-800 underline"
                    >
                      Já tenho o código de verificação
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não tem uma conta?{' '}
              <Link href="/guest-info/cadastro" className="text-amber-600 hover:text-amber-700 font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Para hóspedes: use o e-mail e senha enviados pelo anfitrião.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
