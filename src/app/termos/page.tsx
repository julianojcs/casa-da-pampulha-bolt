import dbConnect from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { LegalContent } from '@/models/LegalContent';
import { DocumentTextIcon } from '@heroicons/react/24/solid';

export const metadata = {
  title: 'Termos de Uso | Casa da Pampulha',
  description: 'Termos de Uso da Casa da Pampulha.',
};

async function getProperty() {
  await dbConnect();
  const property = await Property.findOne({ isActive: true });
  return property ? JSON.parse(JSON.stringify(property)) : null;
}

async function getTermsContent() {
  await dbConnect();
  const content = await LegalContent.findOne({ type: 'terms' });
  return content ? JSON.parse(JSON.stringify(content)) : null;
}

// Parse content preserving paragraphs and formatting
function parseContent(content: string): { paragraphs: string[], bullets: string[] } {
  const lines = content.split('\n').filter(line => line.trim());
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      bullets.push(trimmed.replace(/^[•\-*]\s*/, ''));
    } else {
      paragraphs.push(trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));
    }
  });

  return { paragraphs, bullets };
}

export default async function TermosPage() {
  const [property, termsContent] = await Promise.all([
    getProperty(),
    getTermsContent(),
  ]);

  const propertyName = property?.name || 'Casa da Pampulha';
  const propertyEmail = property?.email || '';
  const items = termsContent?.items?.sort((a: any, b: any) => a.order - b.order) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <DocumentTextIcon className="h-12 w-12 text-amber-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Termos de Uso
          </h1>
          <p className="text-center text-gray-300 text-lg max-w-2xl mx-auto">
            Condições para utilização dos nossos serviços
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-400">
            <span className="bg-white/10 px-3 py-1 rounded-full">
              Última atualização: {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Introduction Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 mb-10">
              <p className="text-gray-700 leading-relaxed">
                Bem-vindo à <strong className="text-gray-900">{propertyName}</strong>. Ao acessar e utilizar
                nosso site, você concorda com os termos e condições estabelecidos abaixo. Leia atentamente
                este documento antes de prosseguir.
              </p>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {items.length > 0 ? (
                items.map((item: any, index: number) => {
                  const { paragraphs, bullets } = parseContent(
                    item.content.replace(/{propertyName}/g, propertyName)
                  );

                  return (
                    <article
                      key={item._id || item.order}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {item.title}
                          </h2>
                          <div className="space-y-3">
                            {paragraphs.map((p, pIndex) => (
                              <p
                                key={pIndex}
                                className="text-gray-600 leading-relaxed text-justify"
                                style={{ textIndent: '2rem' }}
                                dangerouslySetInnerHTML={{ __html: p }}
                              />
                            ))}
                            {bullets.length > 0 && (
                              <ul className="mt-4 space-y-2">
                                {bullets.map((bullet, bIndex) => (
                                  <li key={bIndex} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2" />
                                    <span className="text-gray-600 leading-relaxed">{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <>
                  {/* Default content with professional styling */}
                  <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                        1
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Aceitação dos Termos</h2>
                        <p className="text-gray-600 leading-relaxed text-justify" style={{ textIndent: '2rem' }}>
                          Ao acessar e utilizar o site da {propertyName}, você concorda em cumprir e estar
                          vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes
                          termos, não deve usar nosso site.
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                        2
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição do Serviço</h2>
                        <p className="text-gray-600 leading-relaxed text-justify" style={{ textIndent: '2rem' }}>
                          O site da {propertyName} oferece informações sobre nossa propriedade de hospedagem,
                          permite a visualização de reservas, acesso a informações úteis para hóspedes e
                          funcionalidades relacionadas à gestão de estadias.
                        </p>
                      </div>
                    </div>
                  </article>
                </>
              )}
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📞</span>
                Dúvidas sobre nossos Termos?
              </h3>
              <p className="text-gray-300 mb-4">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco.
                Estamos à disposição para esclarecer qualquer questão.
              </p>
              {propertyEmail && (
                <a
                  href={`mailto:${propertyEmail}`}
                  className="inline-flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  ✉️ {propertyEmail}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
