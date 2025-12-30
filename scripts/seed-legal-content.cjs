const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const LegalContentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['privacy', 'terms'],
    unique: true
  },
  items: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true },
  }],
}, { timestamps: true });

const LegalContent = mongoose.models.LegalContent || mongoose.model('LegalContent', LegalContentSchema);

const privacyItems = [
  {
    title: '1. Introdução',
    content: 'A Casa da Pampulha está comprometida em proteger a privacidade de seus hóspedes e visitantes. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nosso site e serviços.',
    order: 1,
  },
  {
    title: '2. Informações que Coletamos',
    content: 'Podemos coletar os seguintes tipos de informações:\n\n• **Informações de identificação pessoal:** Nome completo, endereço de e-mail, número de telefone, CPF ou documento de identificação, endereço residencial.\n• **Informações de reserva:** Datas de check-in e check-out, número de hóspedes, preferências especiais.\n• **Informações de acesso:** Dados de login, histórico de acesso ao sistema.\n• **Informações técnicas:** Endereço IP, tipo de navegador, páginas visitadas, tempo de permanência no site.',
    order: 2,
  },
  {
    title: '3. Como Usamos suas Informações',
    content: 'Utilizamos suas informações para:\n\n• Processar e gerenciar suas reservas;\n• Comunicar informações importantes sobre sua estadia;\n• Fornecer acesso às áreas restritas do site;\n• Melhorar nossos serviços e experiência do usuário;\n• Cumprir obrigações legais e regulatórias;\n• Enviar comunicações de marketing (apenas com seu consentimento).',
    order: 3,
  },
  {
    title: '4. Compartilhamento de Informações',
    content: 'Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes situações:\n\n• Quando necessário para processar sua reserva (ex: plataformas de hospedagem);\n• Para cumprir obrigações legais ou ordens judiciais;\n• Com prestadores de serviços que nos auxiliam na operação (sob acordos de confidencialidade);\n• Com seu consentimento expresso.',
    order: 4,
  },
  {
    title: '5. Segurança dos Dados',
    content: 'Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia de dados, controles de acesso e monitoramento contínuo.',
    order: 5,
  },
  {
    title: '6. Seus Direitos',
    content: 'De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:\n\n• Acessar suas informações pessoais;\n• Corrigir dados incompletos ou incorretos;\n• Solicitar a exclusão de seus dados;\n• Revogar seu consentimento a qualquer momento;\n• Solicitar a portabilidade de seus dados;\n• Obter informações sobre com quem seus dados foram compartilhados.',
    order: 6,
  },
  {
    title: '7. Cookies',
    content: 'Nosso site utiliza cookies para melhorar sua experiência de navegação. Cookies são pequenos arquivos de texto armazenados em seu dispositivo. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do site.',
    order: 7,
  },
  {
    title: '8. Retenção de Dados',
    content: 'Mantemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção maior seja exigido ou permitido por lei.',
    order: 8,
  },
  {
    title: '9. Alterações nesta Política',
    content: 'Podemos atualizar esta Política de Privacidade periodicamente. Quaisquer alterações serão publicadas nesta página com a data de atualização revisada. Recomendamos que você revise esta política regularmente.',
    order: 9,
  },
  {
    title: '10. Contato',
    content: 'Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações pessoais, entre em contato conosco através dos canais disponíveis em nosso site.',
    order: 10,
  },
];

const termsItems = [
  {
    title: '1. Aceitação dos Termos',
    content: 'Ao acessar e utilizar o site da Casa da Pampulha, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso site.',
    order: 1,
  },
  {
    title: '2. Descrição do Serviço',
    content: 'O site da Casa da Pampulha oferece informações sobre nossa propriedade de hospedagem, permite a visualização de reservas, acesso a informações úteis para hóspedes e funcionalidades relacionadas à gestão de estadias.',
    order: 2,
  },
  {
    title: '3. Cadastro e Conta de Usuário',
    content: 'Para acessar determinadas funcionalidades do site, pode ser necessário criar uma conta de usuário. Você é responsável por:\n\n• Fornecer informações verdadeiras e atualizadas;\n• Manter a confidencialidade de suas credenciais de acesso;\n• Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta;\n• Todas as atividades realizadas em sua conta.',
    order: 3,
  },
  {
    title: '4. Uso Aceitável',
    content: 'Ao utilizar nosso site, você concorda em não:\n\n• Violar quaisquer leis ou regulamentos aplicáveis;\n• Fornecer informações falsas ou enganosas;\n• Tentar acessar áreas restritas do site sem autorização;\n• Interferir ou interromper o funcionamento do site;\n• Utilizar o site para fins comerciais não autorizados;\n• Coletar informações de outros usuários sem consentimento.',
    order: 4,
  },
  {
    title: '5. Reservas e Hospedagem',
    content: 'As reservas realizadas através de plataformas de terceiros (como Airbnb, Booking, etc.) estão sujeitas aos termos e condições dessas plataformas, além das regras específicas da Casa da Pampulha. Ao realizar uma reserva, você concorda em:\n\n• Respeitar as regras da casa estabelecidas pela propriedade;\n• Utilizar a propriedade de forma responsável;\n• Comunicar qualquer problema ou dano durante sua estadia;\n• Respeitar os horários de check-in e check-out estabelecidos;\n• Ser responsável pelos atos de todos os hóspedes em sua reserva.',
    order: 5,
  },
  {
    title: '6. Propriedade Intelectual',
    content: 'Todo o conteúdo do site, incluindo textos, imagens, logotipos, design e código, são propriedade da Casa da Pampulha ou de seus licenciadores e são protegidos por leis de propriedade intelectual. Você não pode reproduzir, distribuir ou utilizar comercialmente qualquer conteúdo sem autorização prévia.',
    order: 6,
  },
  {
    title: '7. Limitação de Responsabilidade',
    content: 'A Casa da Pampulha não será responsável por:\n\n• Danos indiretos, incidentais ou consequenciais;\n• Interrupções ou falhas no funcionamento do site;\n• Perda de dados ou informações;\n• Ações de terceiros que utilizem o site;\n• Força maior ou eventos fora de nosso controle.',
    order: 7,
  },
  {
    title: '8. Links para Sites de Terceiros',
    content: 'Nosso site pode conter links para sites de terceiros. Não somos responsáveis pelo conteúdo, políticas de privacidade ou práticas desses sites. Recomendamos que você leia os termos de uso de qualquer site que visitar.',
    order: 8,
  },
  {
    title: '9. Modificações nos Termos',
    content: 'Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação no site. O uso continuado do site após as modificações constitui aceitação dos novos termos.',
    order: 9,
  },
  {
    title: '10. Cancelamento e Encerramento',
    content: 'Podemos suspender ou encerrar seu acesso ao site a qualquer momento, sem aviso prévio, se acreditarmos que você violou estes Termos de Uso ou qualquer lei aplicável.',
    order: 10,
  },
  {
    title: '11. Lei Aplicável',
    content: 'Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será submetida à jurisdição exclusiva dos tribunais competentes no Brasil.',
    order: 11,
  },
  {
    title: '12. Contato',
    content: 'Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através dos canais disponíveis em nosso site.',
    order: 12,
  },
];

async function seedLegalContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    // Clear existing legal content
    await LegalContent.deleteMany({});
    console.log('Conteúdo legal anterior removido');

    // Seed Privacy Policy
    await LegalContent.create({
      type: 'privacy',
      items: privacyItems,
    });
    console.log('Política de Privacidade criada');

    // Seed Terms of Use
    await LegalContent.create({
      type: 'terms',
      items: termsItems,
    });
    console.log('Termos de Uso criados');

    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedLegalContent();
