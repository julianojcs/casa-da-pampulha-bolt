"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaAirbnb,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaLinkedin,
  FaPinterest
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { HomeIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const quickLinks = [
  { name: 'Sobre a Casa', href: '/#sobre' },
  { name: 'Quartos', href: '/#quartos' },
  { name: 'Comodidades', href: '/#comodidades' },
  { name: 'Galeria', href: '/galeria' },
  { name: 'Guia Local', href: '/guia-local' },
  { name: 'Calendário', href: '/calendario' },
  { name: 'Informações', href: '/guest-info' },
  { name: 'FAQ', href: '/faq' },
];

const ICON_MAP: Record<string, any> = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  whatsapp: FaWhatsapp,
  airbnb: FaAirbnb,
  twitter: FaTwitter,
  x: FaXTwitter,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  linkedin: FaLinkedin,
  pinterest: FaPinterest,
};

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<Array<any>>([]);
  const [contactInfo, setContactInfo] = useState<any>(null);

  // Não renderizar o Footer nas páginas do admin e funcionario (têm seus próprios layouts)
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/funcionario')) {
    return null;
  }

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        // Fetch social links
        const socialRes = await fetch('/api/social');
        if (socialRes.ok) {
          const socialData = await socialRes.json();
          if (mounted) setSocialLinks(Array.isArray(socialData) ? socialData : []);
        }

        // Fetch property/contact info
        const propertyRes = await fetch('/api/property');
        if (propertyRes.ok) {
          const propertyData = await propertyRes.json();
          if (mounted && propertyData) {
            setContactInfo(propertyData);
          }
        }
      } catch (err) {
        console.error('Error loading footer data:', err);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const renderedSocials = (socialLinks && socialLinks.length > 0)
    ? socialLinks.map((s: any) => ({
        Icon: ICON_MAP[s.icon?.toLowerCase()] || FaAirbnb,
        href: s.url,
        label: s.platform || s.icon || 'social',
      }))
    : [];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <HomeIcon className="h-8 w-8 text-amber-500" />
              <span className="font-display text-xl font-bold">
                {contactInfo?.name || 'Casa da Pampulha'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Sua casa de férias perfeita em Belo Horizonte. Desfrute de conforto,
              comodidades premium e a melhor localização na Pampulha.
            </p>
            <div className="flex space-x-4">
              {renderedSocials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-amber-500 transition-colors"
                  aria-label={s.label}
                >
                  <s.Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-amber-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              {(contactInfo?.address ||contactInfo?.city || contactInfo?.country) && (
                <li className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-amber-500 mt-0.5" />
                  <span className="text-gray-400 text-sm">
                    {contactInfo?.address}<br />
                    {contactInfo?.city}, {contactInfo?.country}
                  </span>
                </li>
              )}
              {contactInfo?.whatsapp && (
                <li className="flex items-center space-x-3">
                  <FaWhatsapp className="h-5 w-5 text-amber-500" />
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-amber-500 text-sm"
                  >
                    {contactInfo.whatsapp}
                  </a>
                </li>
              )}
              {contactInfo?.phone && (
                <li className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-amber-500" />
                  <a
                    href={`tel:${contactInfo?.phone}`}
                    className="text-gray-400 hover:text-amber-500 text-sm"
                  >
                    {contactInfo?.phone}
                  </a>
                </li>
              )}
              {contactInfo?.email && (
                <li className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-amber-500" />
                  <a
                    href={`mailto:${contactInfo?.email}`}
                    className="text-gray-400 hover:text-amber-500 text-sm"
                  >
                    {contactInfo?.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Reserve */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Reserve Agora</h3>
            <p className="text-gray-400 text-sm mb-4">
              Faça sua reserva diretamente pelo Airbnb ou entre em contato conosco.
            </p>
            {contactInfo?.airbnbUrl && (
              <a
                href={contactInfo?.airbnbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaAirbnb className="h-5 w-5" />
                <span>Ver no Airbnb</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Join Digital Solutions. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link href="/politica-privacidade" className="text-gray-400 hover:text-amber-500 text-sm">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="text-gray-400 hover:text-amber-500 text-sm">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
