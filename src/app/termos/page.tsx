import dbConnect from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { LegalContent } from '@/models/LegalContent';

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

// Parse markdown-like content to HTML
function parseContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
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
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-700 to-gray-800 text-white py-16">
        <div className="container-section py-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Termos de Uso</h1>
          <p className="text-lg text-gray-300">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container-section">
        <div className="max-w-4xl mx-auto prose prose-gray prose-lg">
          {items.length > 0 ? (
            items.map((item: any) => (
              <div key={item._id || item.order}>
                <h2>{item.title}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: parseContent(item.content.replace(/{propertyName}/g, propertyName))
                  }}
                />
              </div>
            ))
          ) : (
            <>
              <h2>1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar o site da {propertyName}, você concorda em cumprir e estar
                vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes
                termos, não deve usar nosso site.
              </p>

              <h2>2. Descrição do Serviço</h2>
              <p>
                O site da {propertyName} oferece informações sobre nossa propriedade de hospedagem,
                permite a visualização de reservas, acesso a informações úteis para hóspedes e
                funcionalidades relacionadas à gestão de estadias.
              </p>

              <h2>12. Contato</h2>
              <p>
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:
              </p>
              {propertyEmail && (
                <p>
                  <strong>E-mail:</strong>{' '}
                  <a href={`mailto:${propertyEmail}`} className="text-amber-600 hover:underline">
                    {propertyEmail}
                  </a>
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
