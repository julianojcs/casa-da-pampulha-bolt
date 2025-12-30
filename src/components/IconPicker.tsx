'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as FA from 'react-icons/fa';
import * as FA6 from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';

// Tipo de biblioteca de ícones
type IconLibrary = 'hero' | 'fa' | 'fa6';

// Interface para ícone
interface IconItem {
  name: string;
  component: React.ComponentType<{ className?: string }>;
  library: IconLibrary;
  displayName: string;
  keywords: string[];
}

// Dicionário de tradução EN -> PT para busca
const iconKeywords: Record<string, string[]> = {
  // Objetos e Casa
  'home': ['casa', 'lar', 'residência', 'moradia'],
  'house': ['casa', 'lar', 'residência', 'moradia'],
  'bed': ['cama', 'quarto', 'dormir', 'descanso'],
  'couch': ['sofá', 'sala', 'descanso'],
  'chair': ['cadeira', 'assento'],
  'door': ['porta', 'entrada', 'saída'],
  'window': ['janela', 'vista'],
  'bath': ['banho', 'banheiro', 'banheira'],
  'shower': ['chuveiro', 'banho'],
  'toilet': ['banheiro', 'sanitário', 'vaso'],
  'sink': ['pia', 'lavatório'],
  'faucet': ['torneira', 'água'],
  'kitchen': ['cozinha', 'culinária'],
  'utensils': ['talheres', 'cozinha', 'refeição'],
  'blender': ['liquidificador', 'cozinha'],
  'mug': ['caneca', 'xícara', 'café'],
  'coffee': ['café', 'bebida'],
  'wine': ['vinho', 'bebida', 'taça'],
  'glass': ['copo', 'bebida', 'vidro'],
  'beer': ['cerveja', 'bebida'],
  'cocktail': ['coquetel', 'bebida', 'drink'],
  'pizza': ['pizza', 'comida', 'refeição'],
  'burger': ['hambúrguer', 'comida', 'lanche'],
  'hotdog': ['cachorro-quente', 'comida', 'lanche'],
  'ice': ['gelo', 'frio', 'sorvete'],
  'cookie': ['biscoito', 'doce'],
  'cake': ['bolo', 'doce', 'festa', 'aniversário'],
  'candy': ['doce', 'bala'],
  'lemon': ['limão', 'fruta', 'cítrico'],
  'carrot': ['cenoura', 'vegetal', 'legume'],
  'leaf': ['folha', 'natureza', 'planta'],
  'tree': ['árvore', 'natureza', 'planta'],
  'seedling': ['muda', 'planta', 'crescimento'],
  'flower': ['flor', 'planta', 'natureza'],

  // Tecnologia
  'wifi': ['wifi', 'internet', 'rede', 'conexão', 'wireless'],
  'signal': ['sinal', 'rede', 'conexão'],
  'bluetooth': ['bluetooth', 'conexão', 'wireless'],
  'computer': ['computador', 'desktop', 'pc'],
  'laptop': ['notebook', 'computador', 'portátil'],
  'desktop': ['computador', 'desktop', 'pc', 'monitor'],
  'mobile': ['celular', 'telefone', 'smartphone'],
  'phone': ['telefone', 'ligar', 'chamada', 'celular'],
  'tablet': ['tablet', 'ipad'],
  'tv': ['televisão', 'tv', 'tela'],
  'display': ['tela', 'monitor', 'display'],
  'keyboard': ['teclado', 'digitação'],
  'mouse': ['mouse', 'cursor'],
  'headphones': ['fone', 'áudio', 'música'],
  'speaker': ['caixa de som', 'áudio', 'alto-falante'],
  'microphone': ['microfone', 'áudio', 'voz'],
  'camera': ['câmera', 'foto', 'fotografia'],
  'video': ['vídeo', 'filmagem', 'gravação'],
  'printer': ['impressora', 'imprimir'],
  'usb': ['usb', 'pendrive', 'conexão'],
  'plug': ['tomada', 'energia', 'conexão'],
  'battery': ['bateria', 'energia', 'carga'],
  'charger': ['carregador', 'energia'],
  'power': ['energia', 'força', 'ligar'],

  // Clima e Natureza
  'sun': ['sol', 'dia', 'claro', 'luz', 'verão'],
  'moon': ['lua', 'noite'],
  'cloud': ['nuvem', 'céu', 'tempo'],
  'rain': ['chuva', 'tempo', 'água'],
  'snow': ['neve', 'frio', 'inverno'],
  'wind': ['vento', 'ar', 'ventilador'],
  'bolt': ['raio', 'elétrico', 'energia', 'tempestade'],
  'thunder': ['trovão', 'tempestade', 'raio'],
  'fire': ['fogo', 'lareira', 'chama', 'quente'],
  'water': ['água', 'líquido', 'hidratação'],
  'droplet': ['gota', 'água', 'líquido'],
  'snowflake': ['neve', 'frio', 'gelo', 'inverno'],
  'temperature': ['temperatura', 'termômetro', 'clima'],
  'thermometer': ['termômetro', 'temperatura', 'febre'],
  'umbrella': ['guarda-chuva', 'chuva', 'proteção'],

  // Lazer e Entretenimento
  'music': ['música', 'som', 'melodia'],
  'film': ['filme', 'cinema', 'vídeo'],
  'play': ['play', 'reproduzir', 'iniciar', 'tocar'],
  'pause': ['pausar', 'parar'],
  'stop': ['parar', 'stop'],
  'record': ['gravar', 'gravação'],
  'game': ['jogo', 'jogar', 'diversão'],
  'gamepad': ['controle', 'jogo', 'videogame'],
  'puzzle': ['quebra-cabeça', 'jogos', 'peça'],
  'dice': ['dado', 'jogo', 'sorte'],
  'chess': ['xadrez', 'jogo', 'estratégia'],
  'ball': ['bola', 'esporte', 'jogo'],
  'football': ['futebol', 'bola', 'esporte'],
  'basketball': ['basquete', 'bola', 'esporte'],
  'volleyball': ['vôlei', 'bola', 'esporte'],
  'tennis': ['tênis', 'raquete', 'esporte'],
  'golf': ['golfe', 'esporte'],
  'swim': ['nadar', 'piscina', 'natação'],
  'pool': ['piscina', 'nadar', 'água'],
  'dumbbell': ['haltere', 'academia', 'exercício'],
  'running': ['corrida', 'exercício', 'esporte'],
  'bicycle': ['bicicleta', 'bike', 'ciclismo'],
  'camping': ['camping', 'acampamento', 'barraca'],
  'tent': ['barraca', 'camping', 'acampamento'],
  'mountain': ['montanha', 'natureza', 'trilha'],
  'hiking': ['trilha', 'caminhada', 'natureza'],
  'beach': ['praia', 'mar', 'verão'],
  'spa': ['spa', 'relaxamento', 'bem-estar'],
  'hot-tub': ['jacuzzi', 'spa', 'hidromassagem', 'banheira'],
  'sauna': ['sauna', 'relaxamento', 'calor'],
  'massage': ['massagem', 'relaxamento', 'spa'],

  // Segurança
  'lock': ['cadeado', 'fechado', 'seguro', 'trancado', 'segurança'],
  'unlock': ['destrancado', 'aberto'],
  'key': ['chave', 'acesso'],
  'shield': ['escudo', 'proteção', 'segurança'],
  'fingerprint': ['digital', 'biometria', 'impressão'],
  'eye': ['olho', 'ver', 'visualizar', 'visão'],
  'camera-security': ['câmera', 'segurança', 'vigilância'],

  // Pessoas e Usuários
  'user': ['usuário', 'pessoa', 'perfil'],
  'users': ['usuários', 'pessoas', 'grupo', 'equipe'],
  'person': ['pessoa', 'indivíduo'],
  'people': ['pessoas', 'grupo'],
  'baby': ['bebê', 'criança', 'infantil'],
  'child': ['criança', 'infantil', 'kids'],
  'children': ['crianças', 'infantil', 'kids'],
  'family': ['família', 'grupo'],
  'wheelchair': ['cadeira de rodas', 'acessibilidade'],
  'accessible': ['acessível', 'acessibilidade'],

  // Transporte
  'car': ['carro', 'automóvel', 'veículo'],
  'taxi': ['táxi', 'transporte'],
  'bus': ['ônibus', 'transporte'],
  'truck': ['caminhão', 'transporte', 'entrega'],
  'motorcycle': ['moto', 'motocicleta'],
  'plane': ['avião', 'voo', 'viagem'],
  'ship': ['navio', 'barco', 'embarcação'],
  'boat': ['barco', 'embarcação'],
  'train': ['trem', 'transporte'],
  'subway': ['metrô', 'transporte'],
  'rocket': ['foguete', 'espaço', 'lançamento'],
  'helicopter': ['helicóptero', 'voo'],
  'parking': ['estacionamento', 'vaga', 'carro'],
  'gas': ['gasolina', 'combustível', 'posto'],

  // Comunicação
  'email': ['email', 'carta', 'mensagem', 'correio'],
  'envelope': ['envelope', 'carta', 'email'],
  'chat': ['chat', 'mensagem', 'conversa', 'balão'],
  'message': ['mensagem', 'texto', 'sms'],
  'comment': ['comentário', 'resposta'],
  'bell': ['sino', 'notificação', 'alerta'],
  'megaphone': ['megafone', 'anúncio', 'divulgação'],

  // Ações e Status
  'check': ['check', 'verificado', 'correto', 'ok', 'sucesso'],
  'times': ['x', 'fechar', 'excluir', 'remover', 'erro'],
  'close': ['fechar', 'x', 'cancelar'],
  'plus': ['mais', 'adicionar', 'novo'],
  'minus': ['menos', 'remover', 'subtrair'],
  'exclamation': ['alerta', 'aviso', 'atenção', 'importante'],
  'info': ['informação', 'info', 'ajuda', 'sobre'],
  'question': ['pergunta', 'dúvida', 'ajuda', 'faq'],
  'warning': ['aviso', 'atenção', 'cuidado'],
  'error': ['erro', 'problema', 'falha'],
  'success': ['sucesso', 'correto', 'aprovado'],

  // Ferramentas
  'cog': ['engrenagem', 'configurações', 'ajustes', 'opções'],
  'gear': ['engrenagem', 'configurações'],
  'wrench': ['chave', 'ferramenta', 'ajuste', 'manutenção'],
  'hammer': ['martelo', 'ferramenta', 'construção'],
  'screwdriver': ['chave de fenda', 'ferramenta'],
  'tools': ['ferramentas', 'manutenção', 'reparo'],
  'brush': ['pincel', 'arte', 'pintura'],
  'broom': ['vassoura', 'limpeza'],
  'vacuum': ['aspirador', 'limpeza'],

  // Escritório
  'clipboard': ['clipboard', 'prancheta', 'lista', 'tarefas'],
  'document': ['documento', 'arquivo', 'papel'],
  'file': ['arquivo', 'documento'],
  'folder': ['pasta', 'diretório', 'arquivo'],
  'archive': ['arquivo', 'caixa', 'guardar'],
  'trash': ['lixeira', 'excluir', 'remover', 'deletar'],
  'pencil': ['lápis', 'editar', 'escrever'],
  'pen': ['caneta', 'escrever', 'editar'],
  'eraser': ['borracha', 'apagar'],
  'ruler': ['régua', 'medida'],
  'scissors': ['tesoura', 'cortar'],
  'paperclip': ['clipe', 'anexo'],
  'stapler': ['grampeador'],
  'calculator': ['calculadora', 'contas', 'matemática'],
  'print': ['imprimir', 'impressão'],
  'save': ['salvar', 'guardar'],
  'copy': ['copiar', 'duplicar'],
  'paste': ['colar'],
  'cut': ['cortar', 'recortar'],

  // Dinheiro e Comércio
  'dollar': ['dólar', 'dinheiro', 'preço', 'valor'],
  'money': ['dinheiro', 'notas', 'pagamento'],
  'credit-card': ['cartão', 'crédito', 'pagamento'],
  'wallet': ['carteira', 'dinheiro'],
  'shopping': ['compras', 'loja', 'sacola'],
  'cart': ['carrinho', 'compras'],
  'bag': ['sacola', 'compras', 'bolsa'],
  'store': ['loja', 'comércio'],
  'receipt': ['recibo', 'nota fiscal', 'comprovante'],
  'gift': ['presente', 'surpresa', 'prêmio'],
  'tag': ['etiqueta', 'tag', 'marcador', 'preço'],
  'barcode': ['código de barras', 'produto'],
  'qrcode': ['qr code', 'código', 'scan'],

  // Favoritos e Avaliação
  'heart': ['coração', 'favorito', 'amor', 'like'],
  'star': ['estrela', 'favorito', 'destaque', 'avaliação'],
  'bookmark': ['marcador', 'favorito', 'salvar'],
  'flag': ['bandeira', 'marcador', 'denunciar'],
  'thumbs-up': ['like', 'positivo', 'legal', 'joinha'],
  'thumbs-down': ['dislike', 'negativo'],

  // Navegação
  'arrow': ['seta', 'direção'],
  'chevron': ['seta', 'navegação'],
  'angle': ['ângulo', 'seta'],
  'caret': ['seta', 'indicador'],
  'menu': ['menu', 'hambúrguer', 'navegação'],
  'bars': ['menu', 'linhas', 'hambúrguer'],
  'search': ['busca', 'pesquisa', 'lupa', 'procurar'],
  'filter': ['filtro', 'filtrar'],
  'sort': ['ordenar', 'classificar'],
  'refresh': ['atualizar', 'refresh', 'recarregar'],
  'sync': ['sincronizar', 'atualizar'],

  // Localização
  'map': ['mapa', 'localização', 'lugar'],
  'location': ['localização', 'lugar', 'posição'],
  'pin': ['pin', 'marcador', 'localização'],
  'marker': ['marcador', 'localização'],
  'globe': ['globo', 'mundo', 'terra', 'internacional'],
  'compass': ['bússola', 'direção', 'navegação'],
  'directions': ['direções', 'rota', 'caminho'],
  'route': ['rota', 'caminho', 'trajeto'],

  // Tempo
  'clock': ['relógio', 'hora', 'tempo'],
  'calendar': ['calendário', 'data', 'evento', 'agenda'],
  'hourglass': ['ampulheta', 'tempo', 'espera'],
  'stopwatch': ['cronômetro', 'tempo'],
  'timer': ['timer', 'tempo', 'contagem'],
  'history': ['histórico', 'passado'],

  // Mídia Social
  'facebook': ['facebook', 'rede social'],
  'twitter': ['twitter', 'x', 'rede social'],
  'instagram': ['instagram', 'rede social', 'fotos'],
  'youtube': ['youtube', 'vídeo'],
  'tiktok': ['tiktok', 'vídeo', 'rede social'],
  'linkedin': ['linkedin', 'profissional'],
  'whatsapp': ['whatsapp', 'mensagem', 'chat'],
  'telegram': ['telegram', 'mensagem'],
  'pinterest': ['pinterest', 'imagens'],
  'snapchat': ['snapchat', 'rede social'],
  'reddit': ['reddit', 'fórum'],
  'discord': ['discord', 'chat', 'comunidade'],
  'slack': ['slack', 'trabalho', 'chat'],
  'github': ['github', 'código', 'desenvolvimento'],
  'google': ['google', 'busca'],
  'amazon': ['amazon', 'compras'],
  'apple': ['apple', 'maçã', 'fruta', 'tecnologia'],
  'android': ['android', 'robô', 'tecnologia'],
  'windows': ['windows', 'janelas', 'sistema'],
  'linux': ['linux', 'pinguim', 'sistema'],

  // Educação
  'book': ['livro', 'leitura', 'educação'],
  'graduation': ['formatura', 'educação', 'acadêmico', 'chapéu'],
  'school': ['escola', 'educação', 'aprendizado'],
  'university': ['universidade', 'faculdade', 'educação'],
  'chalkboard': ['quadro', 'aula', 'professor'],
  'certificate': ['certificado', 'diploma'],

  // Saúde
  'hospital': ['hospital', 'saúde', 'médico'],
  'clinic': ['clínica', 'saúde'],
  'doctor': ['médico', 'doutor', 'saúde'],
  'nurse': ['enfermeiro', 'enfermeira', 'saúde'],
  'stethoscope': ['estetoscópio', 'médico'],
  'syringe': ['seringa', 'vacina', 'injeção'],
  'pill': ['pílula', 'remédio', 'medicamento'],
  'capsule': ['cápsula', 'remédio'],
  'bandage': ['bandagem', 'curativo', 'ferimento'],
  'first-aid': ['primeiros socorros', 'kit', 'emergência'],
  'heart-pulse': ['coração', 'batimento', 'saúde'],
  'dna': ['dna', 'genética', 'ciência'],
  'microscope': ['microscópio', 'ciência', 'laboratório'],
  'brain': ['cérebro', 'mente', 'inteligência'],
  'tooth': ['dente', 'dentista', 'odontologia'],

  // Animais
  'dog': ['cachorro', 'cão', 'pet', 'animal'],
  'cat': ['gato', 'felino', 'pet', 'animal'],
  'bird': ['pássaro', 'ave', 'animal'],
  'fish': ['peixe', 'aquário', 'animal'],
  'horse': ['cavalo', 'equino', 'animal'],
  'cow': ['vaca', 'gado', 'animal'],
  'pig': ['porco', 'animal'],
  'spider': ['aranha', 'inseto', 'animal'],
  'bug': ['inseto', 'besouro', 'bug'],
  'butterfly': ['borboleta', 'inseto'],
  'paw': ['pata', 'pet', 'animal'],
  'bone': ['osso', 'cachorro', 'pet'],

  // Roupas e Acessórios
  'shirt': ['camisa', 'roupa', 'vestuário'],
  'tshirt': ['camiseta', 'roupa'],
  'hat': ['chapéu', 'boné', 'acessório'],
  'glasses': ['óculos', 'visão', 'acessório'],
  'sunglasses': ['óculos de sol', 'acessório'],
  'shoe': ['sapato', 'calçado'],
  'socks': ['meias', 'roupa'],
  'watch': ['relógio', 'pulso', 'acessório'],
  'ring': ['anel', 'joia', 'acessório'],
  'crown': ['coroa', 'rei', 'rainha'],
  'gem': ['gema', 'diamante', 'joia'],

  // Construção
  'building': ['prédio', 'edifício', 'construção'],
  'house-building': ['casa', 'construção'],
  'hammer-construction': ['martelo', 'construção'],
  'hard-hat': ['capacete', 'construção', 'segurança'],
  'brick': ['tijolo', 'construção'],

  // Ar condicionado e Ventilação
  'fan': ['ventilador', 'ar', 'vento', 'cooler'],
  'air': ['ar', 'condicionado', 'climatização'],
  'hvac': ['ar condicionado', 'climatização'],
};

// Função para obter todos os ícones do HeroIcons
const getHeroIcons = (): IconItem[] => {
  return Object.keys(HeroIcons)
    .filter(key => key.endsWith('Icon') && !key.startsWith('default'))
    .map(key => {
      const name = key.replace(/Icon$/, '')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      return {
        name: `hero:${name}`,
        component: (HeroIcons as any)[key],
        library: 'hero' as IconLibrary,
        displayName: name,
        keywords: getKeywords(name),
      };
    });
};

// Função para obter ícones do Font Awesome (fa)
const getFAIcons = (): IconItem[] => {
  return Object.keys(FA)
    .filter(key => key.startsWith('Fa') && !key.startsWith('default'))
    .map(key => {
      const name = key.slice(2)
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      return {
        name: `fa:${name}`,
        component: (FA as any)[key],
        library: 'fa' as IconLibrary,
        displayName: name,
        keywords: getKeywords(name),
      };
    });
};

// Função para obter ícones do Font Awesome 6 (fa6)
const getFA6Icons = (): IconItem[] => {
  return Object.keys(FA6)
    .filter(key => key.startsWith('Fa') && !key.startsWith('default'))
    .map(key => {
      const name = key.slice(2)
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      return {
        name: `fa6:${name}`,
        component: (FA6 as any)[key],
        library: 'fa6' as IconLibrary,
        displayName: name,
        keywords: getKeywords(name),
      };
    });
};

// Função para obter keywords de um nome de ícone
const getKeywords = (name: string): string[] => {
  const keywords: string[] = [name];
  const parts = name.split('-');
  keywords.push(...parts);

  // Adiciona traduções em português
  for (const part of parts) {
    if (iconKeywords[part]) {
      keywords.push(...iconKeywords[part]);
    }
  }

  // Verifica o nome completo
  if (iconKeywords[name]) {
    keywords.push(...iconKeywords[name]);
  }

  return Array.from(new Set(keywords));
};

// Cache de ícones
let allIconsCache: IconItem[] | null = null;

const getAllIcons = (): IconItem[] => {
  if (allIconsCache) return allIconsCache;

  allIconsCache = [
    ...getHeroIcons(),
    ...getFAIcons(),
    ...getFA6Icons(),
  ];

  return allIconsCache;
};

// Cores das bibliotecas
const libraryColors: Record<IconLibrary, { bg: string; text: string; label: string }> = {
  hero: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Hero' },
  fa: { bg: 'bg-green-100', text: 'text-green-600', label: 'FA' },
  fa6: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'FA6' },
};

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label = 'Ícone' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(60);
  const [selectedLibrary, setSelectedLibrary] = useState<IconLibrary | 'all'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const allIcons = useMemo(() => getAllIcons(), []);

  // Filtrar ícones baseado na busca e biblioteca
  const filteredIcons = useMemo(() => {
    return allIcons.filter(icon => {
      // Filtro de biblioteca
      if (selectedLibrary !== 'all' && icon.library !== selectedLibrary) {
        return false;
      }

      // Filtro de busca
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return icon.keywords.some(k => k.includes(search)) || icon.displayName.includes(search);
    });
  }, [allIcons, searchTerm, selectedLibrary]);

  // Ícones visíveis (para scroll infinito)
  const visibleIcons = filteredIcons.slice(0, visibleCount);

  // Handler para scroll infinito
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setVisibleCount(prev => Math.min(prev + 40, filteredIcons.length));
    }
  }, [filteredIcons.length]);

  // Reset visibleCount quando a busca muda
  useEffect(() => {
    setVisibleCount(60);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [searchTerm, selectedLibrary]);

  // Obter o componente do ícone selecionado
  const SelectedIcon = useMemo(() => {
    if (!value) return null;
    const icon = allIcons.find(i => i.name === value);
    return icon || null;
  }, [value, allIcons]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
      >
        {SelectedIcon ? (
          <>
            <SelectedIcon.component className="h-5 w-5 text-gray-700" />
            <span className="text-gray-700 truncate flex-1 text-left">{SelectedIcon.displayName}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${libraryColors[SelectedIcon.library].bg} ${libraryColors[SelectedIcon.library].text}`}>
              {libraryColors[SelectedIcon.library].label}
            </span>
          </>
        ) : (
          <span className="text-gray-400">Selecionar ícone...</span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Selecionar Ícone</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar ícone (ex: casa, wifi, coração, piscina...)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Library Tabs */}
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedLibrary('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedLibrary === 'all'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos ({allIcons.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLibrary('hero')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedLibrary === 'hero'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  HeroIcons
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLibrary('fa')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedLibrary === 'fa'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  Font Awesome
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLibrary('fa6')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedLibrary === 'fa6'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  Font Awesome 6
                </button>
              </div>

              <p className="text-xs text-gray-500">
                {filteredIcons.length} ícones encontrados
              </p>
            </div>

            {/* Icons Grid */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4"
              style={{ maxHeight: '450px' }}
            >
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10 gap-2">
                {visibleIcons.map(icon => {
                  const IconComponent = icon.component;
                  const isSelected = value === icon.name;
                  const libColor = libraryColors[icon.library];
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => {
                        onChange(icon.name);
                        setIsOpen(false);
                      }}
                      className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all relative group ${
                        isSelected
                          ? 'bg-amber-100 border-2 border-amber-500'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-300'
                      }`}
                      data-tooltip-id="icon-tooltip"
                      data-tooltip-content={`${icon.displayName} (${libColor.label})`}
                    >
                      <IconComponent className={`h-5 w-5 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                      <span className={`text-[8px] leading-tight text-center truncate w-full ${
                        isSelected ? 'text-amber-700 font-medium' : 'text-gray-500'
                      }`}>
                        {icon.displayName.length > 10 ? icon.displayName.slice(0, 10) + '...' : icon.displayName}
                      </span>
                      <span className={`absolute -top-1 -right-1 text-[7px] px-1 rounded ${libColor.bg} ${libColor.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        {libColor.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {visibleCount < filteredIcons.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => Math.min(prev + 60, filteredIcons.length))}
                  className="w-full mt-4 py-2 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  Carregar mais ({filteredIcons.length - visibleCount} restantes)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <Tooltip id="icon-tooltip" place="top" />
    </div>
  );
}

// Componente para exibir o ícone pelo nome
export function DynamicIcon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  if (!name) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  const normalizedName = name.trim();

  // Novo formato: library:icon-name
  if (normalizedName.includes(':')) {
    const [library, iconName] = normalizedName.split(':');

    if (library === 'hero') {
      const pascalName = iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Icon';
      const IconComponent = (HeroIcons as any)[pascalName];
      if (IconComponent) {
        return <IconComponent className={className} />;
      }
    } else if (library === 'fa') {
      const pascalName = 'Fa' + iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      const IconComponent = (FA as any)[pascalName];
      if (IconComponent) {
        return <IconComponent className={className} />;
      }
    } else if (library === 'fa6') {
      const pascalName = 'Fa' + iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      const IconComponent = (FA6 as any)[pascalName];
      if (IconComponent) {
        return <IconComponent className={className} />;
      }
    }
  }

  // Fallback: Formato antigo (kebab-case para HeroIcons)
  const pascalName = normalizedName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Icon';

  const IconComponent = (HeroIcons as any)[pascalName];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  // Tentar como FA
  const faPascalName = 'Fa' + normalizedName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const FAIcon = (FA as any)[faPascalName] || (FA6 as any)[faPascalName];
  if (FAIcon) {
    return <FAIcon className={className} />;
  }

  console.warn(`[DynamicIcon] Icon not found: "${name}"`);
  return <span className="text-gray-400 text-xs" title={`Icon: ${name}`}>?</span>;
}
