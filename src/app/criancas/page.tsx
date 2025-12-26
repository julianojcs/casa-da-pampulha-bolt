'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaChild, FaCheckCircle } from 'react-icons/fa';

interface KidsArea {
  _id: string;
  title: string;
  description: string;
  features: string[];
  images: string[];
}

export default function CriancasPage() {
  const [kidsArea, setKidsArea] = useState<KidsArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchKidsArea();
  }, []);

  const fetchKidsArea = async () => {
    try {
      const response = await fetch('/api/kids');
      const data = await response.json();
      if (data && data.length > 0) {
        setKidsArea(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar área kids:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
            <FaChild className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Área das Crianças
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Um espaço mágico e seguro para os pequenos se divertirem
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : kidsArea ? (
            <div className="space-y-12">
              {/* Description */}
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">
                  {kidsArea.title}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {kidsArea.description}
                </p>
              </div>

              {/* Images Gallery */}
              {kidsArea.images && kidsArea.images.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                  {kidsArea.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`Área Kids ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* Features */}
              {kidsArea.features && kidsArea.features.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-display font-bold text-gray-800 mb-6 text-center">
                    O que temos para as crianças
                  </h3>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {kidsArea.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg"
                      >
                        <FaCheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                <FaChild className="w-16 h-16 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Playground Exclusivo
              </h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Temos um parquinho completo só para as crianças! Um espaço seguro e divertido
                para os pequenos brincarem enquanto os adultos relaxam.
              </p>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {['Pula-pula grande', 'Escorrega', 'Balanços', 'Gira-gira', 'Casinha de madeira', 'Bolas e brinquedos'].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-md"
                  >
                    <FaCheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Safety Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-gray-800 mb-4">
            Segurança em Primeiro Lugar
          </h2>
          <p className="text-gray-600 mb-8">
            Todos os brinquedos são seguros e adequados para crianças.
            Recomendamos sempre a supervisão de um adulto durante as brincadeiras.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Área Cercada</h3>
              <p className="text-sm text-gray-600">Playground em área segura e fechada</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Visibilidade</h3>
              <p className="text-sm text-gray-600">Fácil supervisão a partir da área gourmet</p>
            </div>

            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Bem Iluminado</h3>
              <p className="text-sm text-gray-600">Iluminação adequada para brincadeiras noturnas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full max-w-4xl aspect-video">
            <Image
              src={selectedImage}
              alt="Área Kids"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
