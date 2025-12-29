/**
 * Script para atualizar a collection FAQs com as categorias corretas
 * baseado nos dados do seed-complete.cjs
 *
 * Uso: node scripts/update-faqs-category.cjs
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/casapampulha';

// Dados das FAQs com suas categorias
const faqsData = [
  {
    question: "Tem estacionamento disponível no local?",
    answer: "Sim! Nosso estacionamento comporta até 5 carros com total segurança.",
    category: "Estacionamento",
    order: 1
  },
  {
    question: "Posso levar meu pet?",
    answer: "Infelizmente não aceitamos PETs em nossa propriedade.",
    category: "Regras da Casa",
    order: 2
  },
  {
    question: "Como posso me conectar à rede Wi-Fi?",
    answer: "Temos duas redes de Wi-Fi disponíveis com velocidade de até 500MB. As senhas serão enviadas para o chat do aplicativo ou WhatsApp após a confirmação da reserva.",
    category: "Wi-Fi",
    order: 3
  },
  {
    question: "Tem roupa de cama e banho disponível?",
    answer: "Sim! Fornecemos gratuitamente 1 toalha de banho, 1 lençol, 1 virol, 1 fronha e 1 travesseiro para cada hóspede. Cada banheiro é arrumado com 2 toalhas de rosto e tapete de chão. Também fornecemos 1 toalha de piscina por quarto (4 no total).",
    category: "Roupas de Cama e Banho",
    order: 4
  },
  {
    question: "Tem cobertores disponíveis?",
    answer: "Sim! Fornecemos gratuitamente 1 cobertor por hóspede.",
    category: "Roupas de Cama e Banho",
    order: 5
  },
  {
    question: "Como funciona a lavanderia?",
    answer: "A casa possui uma lavanderia para fins particulares. Caso tenha interesse em utilizar (máquina de lavar e secar roupa), é necessário solicitar antes do check-in e uma taxa de R$200,00 será cobrada.",
    category: "Lavanderia",
    order: 6
  },
  {
    question: "Qual o horário de funcionamento da piscina?",
    answer: "O horário de funcionamento da piscina é das 08h00 às 19h00 (finais de semana e feriados até 22h00). Por razões de segurança, não é permitido nadar após o anoitecer.",
    category: "Piscina",
    order: 7
  },
  {
    question: "Posso receber visitas durante a estadia?",
    answer: "Não é permitido receber visitantes. Casos excepcionais poderão ser previamente autorizados pelo anfitrião.",
    category: "Regras da Casa",
    order: 8
  },
];

/**
 * Normaliza uma string para comparação
 */
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Encontra a FAQ correspondente pelo texto da pergunta
 */
function findMatchingFaq(question) {
  const normalizedQuestion = normalizeString(question);

  for (const faq of faqsData) {
    const normalizedFaqQuestion = normalizeString(faq.question);

    // Comparação exata
    if (normalizedFaqQuestion === normalizedQuestion) {
      return faq;
    }

    // Comparação parcial (se uma contém a outra)
    if (normalizedFaqQuestion.includes(normalizedQuestion) ||
        normalizedQuestion.includes(normalizedFaqQuestion)) {
      return faq;
    }

    // Comparação por palavras-chave
    const keywords = normalizedFaqQuestion.split(' ').filter(w => w.length > 3);
    const matchCount = keywords.filter(k => normalizedQuestion.includes(k)).length;
    if (matchCount >= keywords.length * 0.7) {
      return faq;
    }
  }

  return null;
}

async function main() {
  console.log('🚀 Atualizando FAQs com categorias...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB\n');

    const db = client.db();
    const collection = db.collection('faqs');

    // Buscar todas as FAQs existentes
    const existingFaqs = await collection.find({}).toArray();
    console.log(`📋 FAQs existentes no banco: ${existingFaqs.length}\n`);

    let updated = 0;
    let notFound = 0;
    let alreadyHasCategory = 0;

    for (const faq of existingFaqs) {
      // Se já tem categoria válida, pular
      if (faq.category && faq.category !== 'Geral' && faq.category !== '') {
        console.log(`   ⏭️  Já tem categoria: "${faq.question.substring(0, 40)}..." -> ${faq.category}`);
        alreadyHasCategory++;
        continue;
      }

      // Encontrar a FAQ correspondente
      const matchingFaq = findMatchingFaq(faq.question);

      if (matchingFaq) {
        await collection.updateOne(
          { _id: faq._id },
          {
            $set: {
              category: matchingFaq.category,
              order: matchingFaq.order
            }
          }
        );
        console.log(`   ✅ Atualizado: "${faq.question.substring(0, 40)}..." -> ${matchingFaq.category}`);
        updated++;
      } else {
        // Atribuir categoria padrão "Geral"
        await collection.updateOne(
          { _id: faq._id },
          {
            $set: {
              category: 'Geral',
              order: 99
            }
          }
        );
        console.log(`   ⚠️  Não encontrado, usando "Geral": "${faq.question.substring(0, 40)}..."`);
        notFound++;
      }
    }

    // Verificar se há FAQs do seed que não existem no banco
    console.log('\n📋 Verificando FAQs do seed que podem estar faltando...');

    for (const seedFaq of faqsData) {
      const exists = existingFaqs.some(faq =>
        normalizeString(faq.question).includes(normalizeString(seedFaq.question).substring(0, 20))
      );

      if (!exists) {
        console.log(`   ⚠️  FAQ do seed não encontrada no banco: "${seedFaq.question.substring(0, 40)}..."`);
      }
    }

    // Resumo
    console.log('\n' + '='.repeat(60));
    console.log('📊 Resumo da Atualização:');
    console.log('='.repeat(60));
    console.log(`   Total de FAQs: ${existingFaqs.length}`);
    console.log(`   Atualizadas: ${updated}`);
    console.log(`   Já tinham categoria: ${alreadyHasCategory}`);
    console.log(`   Sem correspondência (usou "Geral"): ${notFound}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✅ Conexão com MongoDB fechada');
  }
}

main()
  .then(() => {
    console.log('\n🎉 Atualização concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
