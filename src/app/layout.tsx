import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers, Header, Footer } from '@/components';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Casa da Pampulha | Sua Casa de Férias em Belo Horizonte',
  description: 'Desfrute de uma experiência única na Pampulha. Casa completa com piscina aquecida, jacuzzi, playground e muito mais. Reserve agora!',
  keywords: 'casa de férias, pampulha, belo horizonte, airbnb, aluguel temporada, piscina, jacuzzi',
  openGraph: {
    title: 'Casa da Pampulha | Sua Casa de Férias em Belo Horizonte',
    description: 'Desfrute de uma experiência única na Pampulha. Casa completa com piscina aquecida, jacuzzi, playground e muito mais.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
