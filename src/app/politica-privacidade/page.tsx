import dbConnect from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { LegalContent } from '@/models/LegalContent';

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

// Parse markdown-like content to HTML
function parseContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
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
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-700 to-gray-800 text-white py-16">
        <div className="container-section py-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Política de Privacidade</h1>
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
              <h2>1. Introdução</h2>
              <p>
                A {propertyName} está comprometida em proteger a privacidade de seus hóspedes e visitantes.
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos
                suas informações pessoais quando você utiliza nosso site e serviços.
              </p>

              <h2>2. Informações que Coletamos</h2>
              <p>Podemos coletar os seguintes tipos de informações:</p>
              <ul>
                <li>
                  <strong>Informações de identificação pessoal:</strong> Nome completo, endereço de e-mail,
                  número de telefone, CPF ou documento de identificação, endereço residencial.
                </li>
                <li>
                  <strong>Informações de reserva:</strong> Datas de check-in e check-out, número de hóspedes,
                  preferências especiais.
                </li>
                <li>
                  <strong>Informações de acesso:</strong> Dados de login, histórico de acesso ao sistema.
                </li>
                <li>
                  <strong>Informações técnicas:</strong> Endereço IP, tipo de navegador, páginas visitadas,
                  tempo de permanência no site.
                </li>
              </ul>

              <h2>3. Como Usamos suas Informações</h2>
              <p>Utilizamos suas informações para:</p>
              <ul>
                <li>Processar e gerenciar suas reservas;</li>
                <li>Comunicar informações importantes sobre sua estadia;</li>
                <li>Fornecer acesso às áreas restritas do site;</li>
                <li>Melhorar nossos serviços e experiência do usuário;</li>
                <li>Cumprir obrigações legais e regulatórias;</li>
                <li>Enviar comunicações de marketing (apenas com seu consentimento).</li>
              </ul>

              <h2>10. Contato</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos
                suas informações pessoais, entre em contato conosco:
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
