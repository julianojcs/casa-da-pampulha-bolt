import dbConnect from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { LegalContent } from '@/models/LegalContent';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Política de Privacidade | Casa da Pampulha',
  description: 'Política de Privacidade da Casa da Pampulha.',
};

async function getProperty() {
  await dbConnect();
  const property = await Property.findOne({ isActive: true });
  return property ? JSON.parse(JSON.stringify(property)) : null;
}

async function getPrivacyContent() {
  await dbConnect();
  const content = await LegalContent.findOne({ type: 'privacy' });
  return content ? JSON.parse(JSON.stringify(content)) : null;
}

export default async function PoliticaPrivacidadePage() {
  const [property, privacyContent] = await Promise.all([
    getProperty(),
    getPrivacyContent(),
  ]);

  const propertyName = property?.name || 'Casa da Pampulha';
  const propertyEmail = property?.email || '';
  const items = privacyContent?.items?.sort((a: any, b: any) => a.order - b.order) || [];

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <ShieldCheckIcon className="h-12 w-12 text-amber-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Política de Privacidade
          </h1>
          <p className="text-lg text-slate-300 text-center max-w-2xl mx-auto">
            Nosso compromisso com a transparência e proteção dos seus dados pessoais.
          </p>
          <div className="mt-6 text-center">
            <span className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm text-slate-300">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {items.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {items.map((item: any, index: number) => (
                  <article
                    key={item._id || item.order}
                    className="p-8 hover:bg-gray-50/50 transition-colors"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{item.title.replace(/^\d+\.\s*/, '')}</span>
                    </h2>
                    <div className="text-gray-600 leading-relaxed space-y-4 pl-11">
                      {item.content.split('\n\n').map((paragraph: string, pIndex: number) => {
                        const lines = paragraph.split('\n').filter((l: string) => l.trim());
                        const hasBullets = lines.some((l: string) => l.trim().startsWith('•'));

                        if (hasBullets) {
                          return (
                            <ul key={pIndex} className="space-y-2">
                              {lines.map((line: string, lIndex: number) => {
                                const text = line.replace(/^•\s*/, '').trim();
                                if (!text) return null;
                                return (
                                  <li key={lIndex} className="flex items-start">
                                    <span className="text-amber-500 mr-3 mt-0.5 text-lg">•</span>
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: text
                                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800 font-semibold">$1</strong>')
                                          .replace(/{propertyName}/g, propertyName)
                                      }}
                                    />
                                  </li>
                                );
                              })}
                            </ul>
                          );
                        }
                        return (
                          <p
                            key={pIndex}
                            className="text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: paragraph
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800 font-semibold">$1</strong>')
                                .replace(/{propertyName}/g, propertyName)
                            }}
                          />
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-8">
                <p className="text-gray-500 text-center">
                  Conteúdo não disponível. Por favor, entre em contato conosco.
                </p>
              </div>
            )}

            {/* Contact Footer */}
            {propertyEmail && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 border-t border-amber-100">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Dúvidas sobre privacidade?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Entre em contato conosco para esclarecer qualquer questão.
                  </p>
                  <a
                    href={`mailto:${propertyEmail}`}
                    className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                  >
                    {propertyEmail}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
