/**
 * Script para adicionar campo 'category' às FAQs existentes no banco de dados
 *
 * Uso: node scripts/migrate-faq-categories.cjs
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casapampulha';

// Mapeamento de palavras-chave para categorias
const categoryKeywords = {
  'Reservas': ['reserva', 'reservar', 'check-in', 'check-out', 'checkout', 'checkin', 'cancelar', 'cancelamento', 'pagamento', 'pagar', 'preço', 'valor', 'diária', 'antecedência', 'disponibilidade'],
  'Comodidades': ['piscina', 'jacuzzi', 'wifi', 'internet', 'estacionamento', 'cozinha', 'tv', 'ar condicionado', 'aquecimento', 'toalha', 'roupa de cama', 'churrasqueira', 'playground'],
  'Regras': ['regra', 'permitido', 'proibido', 'pode', 'não pode', 'animal', 'pet', 'festa', 'evento', 'barulho', 'silêncio', 'fumar', 'fumante', 'visitante', 'visita', 'horário'],
  'Geral': [] // Fallback category
};

function detectCategory(question, answer) {
  const text = `${question} ${answer}`.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'Geral') continue;

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'Geral';
}

async function migrateFaqCategories() {
  console.log('🚀 Iniciando migração de categorias de FAQs...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');

    const db = client.db();
    const faqsCollection = db.collection('faqs');

    // Buscar todas as FAQs
    const faqs = await faqsCollection.find({}).toArray();
    console.log(`📋 Encontradas ${faqs.length} FAQs\n`);

    let updated = 0;
    let skipped = 0;

    for (const faq of faqs) {
      // Se já tem categoria definida, pular
      if (faq.category && faq.category !== '') {
        console.log(`⏭️  FAQ "${faq.question.substring(0, 50)}..." já tem categoria: ${faq.category}`);
        skipped++;
        continue;
      }

      // Detectar categoria
      const category = detectCategory(faq.question || '', faq.answer || '');

      // Atualizar FAQ
      await faqsCollection.updateOne(
        { _id: faq._id },
        { $set: { category } }
      );

      console.log(`✅ FAQ "${faq.question.substring(0, 50)}..." -> Categoria: ${category}`);
      updated++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Resumo da Migração:');
    console.log(`   - Total de FAQs: ${faqs.length}`);
    console.log(`   - Atualizadas: ${updated}`);
    console.log(`   - Já tinham categoria: ${skipped}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✅ Conexão com MongoDB fechada');
  }
}

// Executar
migrateFaqCategories()
  .then(() => {
    console.log('\n🎉 Migração concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
