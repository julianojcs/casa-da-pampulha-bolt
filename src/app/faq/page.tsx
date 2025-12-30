import dbConnect from '@/lib/mongodb';
import { FAQ } from '@/models/FAQ';
import { Property } from '@/models/Property';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata = {
  title: 'Perguntas Frequentes | Casa da Pampulha',
  description: 'Respostas para as perguntas mais frequentes sobre a Casa da Pampulha.',
};

async function getFAQs() {
  await dbConnect();
  const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 });
  return JSON.parse(JSON.stringify(faqs));
}

async function getProperty() {
  await dbConnect();
  const property = await Property.findOne({ isActive: true });
  return property ? JSON.parse(JSON.stringify(property)) : null;
}

export default async function FAQPage() {
  const [faqs, property] = await Promise.all([getFAQs(), getProperty()]);

  const whatsappUrl = property?.whatsapp
    ? `https://wa.me/${property.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-600 to-amber-700 text-white py-16">
        <div className="container-section py-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Perguntas Frequentes</h1>
          <p className="text-lg text-amber-100">
            Encontre respostas para suas dúvidas
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-section">
        <div className="max-w-3xl mx-auto">
          <FAQAccordion faqs={faqs} />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container-section bg-gray-50">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Não encontrou o que procurava?
          </h2>
          <p className="text-gray-600 mb-6">
            Entre em contato conosco e teremos prazer em ajudar.
          </p>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Fale Conosco
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
