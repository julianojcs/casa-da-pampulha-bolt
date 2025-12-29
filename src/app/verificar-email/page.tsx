'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }

    // A verificação será feita pela API com redirect
    // Aqui mostramos apenas o estado de loading
    const timeout = setTimeout(() => {
      // Se ainda estiver loading após 5s, algo deu errado
      setStatus('error');
      setMessage('Tempo limite excedido. Tente novamente.');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [token]);

  // Se tiver token, redirecionar para a API
  useEffect(() => {
    if (token) {
      window.location.href = `/api/auth/verify-email?token=${token}`;
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Casa da Pampulha"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />
        </Link>

        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Verificando email...
            </h1>
            <p className="text-gray-500">
              Aguarde enquanto confirmamos seu email.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Email Verificado!
            </h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Fazer Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircleIcon className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Erro na Verificação
            </h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Tentar Novamente
              </button>
              <Link
                href="/login"
                className="inline-block w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Ir para Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
