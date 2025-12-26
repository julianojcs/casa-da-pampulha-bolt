/**
 * Seed de dados para Informações aos Hóspedes (Guest Info)
 * Informações realistas para a Casa da Pampulha
 *
 * Execute com: node scripts/seed-checkin.cjs
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Schema do GuestInfo
const GuestInfoSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  icon: { type: String, default: 'info' },
  order: { type: Number, default: 0 },
  isRestricted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const GuestInfo = mongoose.models.GuestInfo || mongoose.model('GuestInfo', GuestInfoSchema);

// Dados de Check-in / Check-out
const guestInfoData = [
  // ===== CHECK-IN =====
  {
    type: 'checkin',
    title: 'Horário de Check-in',
    content: 'O check-in pode ser realizado a partir das 15:00. Caso necessite chegar mais cedo, entre em contato conosco com antecedência para verificarmos a disponibilidade.',
    icon: 'clock',
    order: 1,
    isRestricted: false,
    isActive: true,
  },
  {
    type: 'checkin',
    title: 'Localização e Acesso',
    content: 'A casa está localizada na Rua Reginaldo Cunha Balaguer, 260, Bairro Enseada das Garças, Pampulha, Belo Horizonte - MG. O portão é automático e você receberá o código de acesso por WhatsApp no dia da chegada.',
    icon: 'map',
    order: 2,
    isRestricted: false,
    isActive: true,
  },
  {
    type: 'checkin',
    title: 'Como Pegar as Chaves',
    content: 'As chaves estarão em um porta-chaves eletrônico na entrada principal. Você receberá o código de acesso por mensagem algumas horas antes da sua chegada. Após abrir o porta-chaves, retire todas as chaves e feche novamente.',
    icon: 'key',
    order: 3,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'checkin',
    title: 'Estacionamento',
    content: 'A casa dispõe de estacionamento coberto para até 4 veículos. O acesso é pelo portão automático da entrada principal. Há também espaço na rua, caso necessário.',
    icon: 'car',
    order: 4,
    isRestricted: false,
    isActive: true,
  },

  // ===== CHECK-OUT =====
  {
    type: 'checkout',
    title: 'Horário de Check-out',
    content: 'O check-out deve ser realizado até as 11:00. Se precisar de um horário diferente, entre em contato conosco para verificarmos a possibilidade de late check-out (sujeito a disponibilidade e cobrança adicional).',
    icon: 'clock',
    order: 1,
    isRestricted: false,
    isActive: true,
  },
  {
    type: 'checkout',
    title: 'Devolução das Chaves',
    content: 'Ao sair, por favor, retorne todas as chaves ao porta-chaves eletrônico na entrada e feche-o com o mesmo código. Verifique se não esqueceu nenhum pertence pessoal antes de sair.',
    icon: 'key',
    order: 2,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'checkout',
    title: 'Antes de Sair',
    content: 'Por favor, desligue todos os aparelhos (ar-condicionado, luzes, TV, som), feche portas e janelas, e deixe o lixo separado nos locais indicados. Não é necessário lavar louças ou arrumar camas - nossa equipe cuidará da limpeza.',
    icon: 'checklist',
    order: 3,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'checkout',
    title: 'Portão Automático',
    content: 'Ao sair, certifique-se de que o portão automático fechou completamente após a saída do último veículo. Aguarde alguns segundos para confirmar o fechamento.',
    icon: 'shield',
    order: 4,
    isRestricted: true,
    isActive: true,
  },

  // ===== REGRAS DA CASA =====
  {
    type: 'rule',
    title: 'Número Máximo de Hóspedes',
    content: 'A casa acomoda confortavelmente até 16 pessoas. Por questões de seguro e conforto, não é permitido exceder este número. Visitantes externos precisam ser autorizados previamente.',
    icon: 'users',
    order: 1,
    isRestricted: false,
    isActive: true,
  },
  {
    type: 'rule',
    title: 'Festas e Eventos',
    content: 'Não são permitidas festas ou eventos sem autorização prévia. A casa é ideal para confraternizações familiares e reuniões tranquilas. Respeite o horário de silêncio após as 22h.',
    icon: 'music',
    order: 2,
    isRestricted: false,
    isActive: true,
  },
  {
    type: 'rule',
    title: 'Animais de Estimação',
    content: 'Não aceitamos animais de estimação. Esta política é importante para manter a casa livre de alergênicos e preservar o mobiliário.',
    icon: 'ban',
    order: 3,
    isRestricted: false,
    isActive: true,
  },
  {
    type: 'rule',
    title: 'É Proibido Fumar',
    content: 'É estritamente proibido fumar dentro da casa. Cigarros, vaporizadores e similares só podem ser usados nas áreas externas. Por favor, descarte as bitucas adequadamente.',
    icon: 'smoke',
    order: 4,
    isRestricted: false,
    isActive: true,
  },
  {
    type: 'rule',
    title: 'Crianças e Piscina',
    content: 'Crianças devem estar sempre acompanhadas de adultos, especialmente na área da piscina. A piscina é aquecida, mas o uso é por conta e risco dos hóspedes. Não há salva-vidas no local.',
    icon: 'child',
    order: 5,
    isRestricted: false,
    isActive: true,
  },
  {
    type: 'rule',
    title: 'Cuidado com a Propriedade',
    content: 'Por favor, trate a casa com o mesmo cuidado que daria à sua própria. Qualquer dano ou quebra deve ser comunicado imediatamente. Danos intencionais ou negligentes serão cobrados.',
    icon: 'home',
    order: 6,
    isRestricted: false,
    isActive: true,
  },

  // ===== INSTRUÇÕES =====
  {
    type: 'instruction',
    title: 'Wi-Fi',
    content: 'Nome da rede: Casa_Pampulha_5G\nSenha: pampulha2024\n\nTambém disponível: Casa_Pampulha_2.4G (mesma senha) para melhor alcance em áreas mais distantes.',
    icon: 'wifi',
    order: 1,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Ar-Condicionado',
    content: 'Todos os quartos possuem ar-condicionado split. Use o controle remoto para ligar (botão ON/OFF), ajustar temperatura (setas) e modo (MODE). Recomendamos manter entre 22-24°C. Por favor, desligue ao sair do quarto.',
    icon: 'snowflake',
    order: 2,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Aquecimento da Piscina',
    content: 'A piscina é aquecida e mantida entre 28-30°C. O sistema fica ligado automaticamente. Não é necessário ajustar nada. Em dias muito frios, a temperatura pode variar levemente.',
    icon: 'water',
    order: 3,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Churrasqueira',
    content: 'A área gourmet possui churrasqueira a carvão. Você encontrará utensílios no armário ao lado. Após o uso, aguarde esfriar completamente, limpe a grelha e descarte as cinzas no local indicado. Não deixe carvão aceso sem supervisão.',
    icon: 'fire',
    order: 4,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Televisões e Som',
    content: 'As TVs são smart e já estão conectadas ao Wi-Fi. Você pode usar Netflix, YouTube e outros apps (faça logout ao sair). O sistema de som da sala pode ser conectado via Bluetooth. Reduza o volume após as 22h.',
    icon: 'tv',
    order: 5,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Cozinha Completa',
    content: 'A cozinha está totalmente equipada: fogão 6 bocas, forno elétrico, micro-ondas, geladeira grande, lava-louças, cafeteira, liquidificador, processador e todos os utensílios necessários. Há também filtro de água gelada.',
    icon: 'utensils',
    order: 6,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Lixo e Reciclagem',
    content: 'Temos lixeiras separadas na cozinha: orgânico (cinza), recicláveis (azul) e rejeitos (preta). Por favor, amarre os sacos ao encher e coloque na área de serviço. A coleta é às terças, quintas e sábados.',
    icon: 'trash',
    order: 7,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Máquina de Lavar',
    content: 'Há uma lavadora e secadora na área de serviço. Detergente está disponível no armário. Use o ciclo adequado para o tipo de roupa. Não sobrecarregue a máquina.',
    icon: 'washing',
    order: 8,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Playground Infantil',
    content: 'A casa possui um playground com pula-pula, escorrega, balanços e casinha. É recomendado uso apenas com supervisão de adultos. Crianças devem retirar sapatos antes de usar o pula-pula.',
    icon: 'playground',
    order: 9,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Spa e Sauna',
    content: 'O spa/ofurô está disponível na área externa. Ligue o aquecedor com 1 hora de antecedência. Não use produtos químicos além dos fornecidos. A sauna seca também está disponível - ligue 20 minutos antes do uso.',
    icon: 'hot-tub',
    order: 10,
    isRestricted: true,
    isActive: true,
  },
  {
    type: 'instruction',
    title: 'Contato em Emergências',
    content: 'Em caso de emergência, entre em contato conosco imediatamente pelo WhatsApp: (31) 98765-4321. Para emergências médicas, bombeiros: 193, polícia: 190. O hospital mais próximo é o Hospital da Baleia (4km).',
    icon: 'phone',
    order: 11,
    isRestricted: true,
    isActive: true,
  },
];

async function seedGuestInfo() {
  try {
    // Conectar ao MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/casa-pampulha';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    // Limpar dados existentes
    await GuestInfo.deleteMany({});
    console.log('🗑️  Dados anteriores removidos');

    // Inserir novos dados
    const inserted = await GuestInfo.insertMany(guestInfoData);
    console.log(`✅ ${inserted.length} informações para hóspedes inseridas`);

    // Resumo por tipo
    const summary = guestInfoData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Resumo:');
    console.log(`   - Check-in: ${summary.checkin || 0} itens`);
    console.log(`   - Check-out: ${summary.checkout || 0} itens`);
    console.log(`   - Regras: ${summary.rule || 0} itens`);
    console.log(`   - Instruções: ${summary.instruction || 0} itens`);
    console.log(`\n🎉 Seed concluído com sucesso!`);

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexão com MongoDB encerrada');
  }
}

// Executar o seed
if (require.main === module) {
  seedGuestInfo();
}

module.exports = { seedGuestInfo };
