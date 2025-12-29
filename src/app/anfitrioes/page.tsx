'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaStar, FaLanguage, FaClock, FaCheckCircle } from 'react-icons/fa';

interface Host {
  _id: string;
  name: string;
  bio: string;
  photo: string;
  role: string;
  languages: string[];
  responseTime: string;
  responseRate: string;
  isSuperhost: boolean;
  joinedDate: string;
}

export default function AnfitioesPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    fetchHosts();
    fetchWhatsApp();
  }, []);

  const fetchHosts = async () => {
    try {
      const response = await fetch('/api/hosts');
      const data = await response.json();
      setHosts(data);
    } catch (error) {
      console.error('Erro ao carregar anfitriões:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWhatsApp = async () => {
    try {
      const response = await fetch('/api/property');
      const data = await response.json();
      if (data?.whatsapp) {
        // Remove caracteres não numéricos
        setWhatsapp(data.whatsapp.replace(/\D/g, ''));
      }
    } catch (error) {
      console.error('Erro ao carregar WhatsApp:', error);
    }
  };

  const getWhatsAppLink = () => {
    return whatsapp ? `https://wa.me/${whatsapp}` : '#';
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Conheça Seus Anfitriões
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Estamos aqui para garantir que sua estadia seja perfeita
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : hosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hosts.map((host) => (
                <div key={host._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-8 text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 p-1">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          {host.photo ? (
                            <Image
                              src={host.photo}
                              alt={host.name}
                              fill
                              className="object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-4xl font-bold text-amber-600">
                              {host.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      {host.isSuperhost && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Superhost
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl font-display font-bold text-gray-800 mt-4">
                      {host.name}
                    </h2>
                    <p className="text-amber-600 font-medium">{host.role}</p>

                    <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                      {host.bio}
                    </p>

                    <div className="mt-6 space-y-3">
                      {host.languages && host.languages.length > 0 && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <FaLanguage className="text-amber-500" />
                          <span>Fala: {host.languages.join(', ')}</span>
                        </div>
                      )}

                      {host.responseTime && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <FaClock className="text-amber-500" />
                          <span>Responde {host.responseTime}</span>
                        </div>
                      )}

                      {host.responseRate && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <FaCheckCircle className="text-green-500" />
                          <span>Taxa de resposta: {host.responseRate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                <FaStar className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Conheça Seus Anfitriões
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Somos uma família apaixonada por receber bem. Criamos este espaço com muito carinho
                para proporcionar momentos inesquecíveis aos nossos hóspedes.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">
            Entre em Contato
          </h2>
          <p className="text-gray-600 mb-8">
            Tem alguma dúvida? Estamos sempre disponíveis para ajudar!
          </p>
          {whatsapp && (
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-500 text-white px-8 py-3 rounded-full font-medium hover:bg-green-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Fale Conosco no WhatsApp</span>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
