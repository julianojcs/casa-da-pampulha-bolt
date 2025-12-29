import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
    scrollRestoration: false, // Desabilita scroll automático que conflita com elementos fixed
  },
  // Suppress specific hydration warnings
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  images: {
    domains: ['casadapampulha.com.br', 'res.cloudinary.com'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      }
    ]
  },
  // Redirecionar páginas
  async redirects() {
    return [
      // Exemplo de redirecionamento
      // {
      //   source: '/old-page',
      //   destination: '/new-page',
      //   permanent: true,
      // },
    ]
  },
  // Variáveis de ambiente que devem estar disponíveis no cliente
  env: {
    // PUBLIC_API_URL: process.env.PUBLIC_API_URL,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, './src/app'),
      '@/components': path.join(__dirname, './src/components'),
      '@/admin': path.join(__dirname, './src/app/admin'),
      '@/api': path.join(__dirname, './src/app/api'),
      '@/assets': path.join(__dirname, './src/assets'),
      '@/models': path.join(__dirname, './src/models'),
      '@/types': path.join(__dirname, './src/types'),
      '@/lib': path.join(__dirname, './src/lib')
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
}

export default nextConfig
