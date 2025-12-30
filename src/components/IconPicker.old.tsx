'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import * as HeroIcons from '@heroicons/react/24/outline';

// Dicionário de tradução EN -> PT
const iconTranslations: Record<string, string[]> = {
  // Casa e Propriedade
  'home': ['casa', 'lar', 'residência', 'moradia'],
  'home-modern': ['casa moderna', 'residência', 'propriedade'],
  'building-office': ['prédio', 'escritório', 'empresa', 'edifício'],
  'building-office-2': ['prédio', 'escritório', 'comercial'],
  'building-storefront': ['loja', 'comércio', 'estabelecimento'],
  'building-library': ['biblioteca', 'livros'],

  // Segurança
  'lock-closed': ['cadeado', 'fechado', 'seguro', 'trancado', 'segurança'],
  'lock-open': ['cadeado', 'aberto', 'destrancado'],
  'key': ['chave', 'acesso'],
  'shield-check': ['escudo', 'proteção', 'segurança', 'verificado'],
  'shield-exclamation': ['escudo', 'alerta', 'aviso'],
  'finger-print': ['digital', 'biometria', 'impressão'],
  'eye': ['olho', 'ver', 'visualizar', 'visão'],
  'eye-slash': ['olho', 'esconder', 'oculto', 'invisível'],
  'video-camera': ['câmera', 'vídeo', 'filmadora', 'vigilância'],

  // Tecnologia
  'wifi': ['wifi', 'internet', 'rede', 'conexão', 'wireless'],
  'signal': ['sinal', 'rede', 'conexão'],
  'computer-desktop': ['computador', 'desktop', 'pc'],
  'device-phone-mobile': ['celular', 'telefone', 'mobile', 'smartphone'],
  'device-tablet': ['tablet', 'ipad'],
  'tv': ['televisão', 'tv', 'tela'],
  'speaker-wave': ['som', 'áudio', 'alto-falante', 'música'],
  'speaker-x-mark': ['mudo', 'silêncio', 'sem som'],
  'microphone': ['microfone', 'áudio', 'voz'],
  'radio': ['rádio', 'som'],

  // Clima e Natureza
  'sun': ['sol', 'dia', 'claro', 'luz'],
  'moon': ['lua', 'noite'],
  'cloud': ['nuvem', 'céu'],
  'bolt': ['raio', 'elétrico', 'energia'],
  'fire': ['fogo', 'lareira', 'chama', 'quente'],
  'snowflake': ['neve', 'frio', 'gelo', 'inverno'],
  'beaker': ['químico', 'laboratório', 'experimento'],
  'sparkles': ['brilho', 'estrelas', 'mágico', 'especial'],

  // Lazer e Entretenimento
  'musical-note': ['música', 'nota', 'som'],
  'film': ['filme', 'cinema', 'vídeo'],
  'play': ['play', 'reproduzir', 'iniciar'],
  'play-circle': ['reproduzir', 'iniciar', 'play'],
  'pause': ['pausar', 'parar'],
  'stop': ['parar', 'stop'],
  'puzzle-piece': ['quebra-cabeça', 'jogos', 'peça'],

  // Comida e Bebida
  'cake': ['bolo', 'doce', 'festa', 'aniversário'],

  // Transporte
  'truck': ['caminhão', 'transporte', 'entrega'],
  'paper-airplane': ['avião', 'papel', 'enviar'],

  // Comunicação
  'phone': ['telefone', 'ligar', 'chamada'],
  'phone-arrow-down-left': ['telefone', 'receber', 'chamada'],
  'phone-arrow-up-right': ['telefone', 'discar', 'chamada'],
  'phone-x-mark': ['telefone', 'desligar', 'recusar'],
  'envelope': ['email', 'carta', 'mensagem', 'correio'],
  'envelope-open': ['email', 'aberto', 'lido'],
  'chat-bubble-left': ['chat', 'mensagem', 'conversa', 'balão'],
  'chat-bubble-left-right': ['chat', 'conversa', 'mensagens'],
  'chat-bubble-oval-left': ['chat', 'mensagem', 'balão'],
  'megaphone': ['megafone', 'anúncio', 'divulgação'],
  'bell': ['sino', 'notificação', 'alerta'],
  'bell-alert': ['sino', 'alerta', 'aviso'],
  'bell-slash': ['sino', 'desativado', 'mudo'],

  // Pessoas e Usuários
  'user': ['usuário', 'pessoa', 'perfil'],
  'user-circle': ['usuário', 'avatar', 'perfil'],
  'user-group': ['usuários', 'grupo', 'pessoas', 'equipe'],
  'user-plus': ['usuário', 'adicionar', 'novo'],
  'user-minus': ['usuário', 'remover', 'excluir'],
  'users': ['usuários', 'pessoas', 'grupo'],
  'identification': ['identificação', 'cartão', 'id', 'documento'],
  'face-smile': ['emoji', 'feliz', 'sorriso', 'alegre'],
  'face-frown': ['emoji', 'triste'],
  'hand-raised': ['mão', 'parar', 'atenção'],
  'hand-thumb-up': ['like', 'positivo', 'legal', 'joinha'],
  'hand-thumb-down': ['dislike', 'negativo'],

  // Objetos de Casa
  'light-bulb': ['lâmpada', 'luz', 'ideia', 'iluminação'],
  'lamp-ceiling': ['lustre', 'luminária', 'luz'],
  'lamp-desk': ['abajur', 'luminária', 'mesa'],
  'lamp-floor': ['abajur', 'luminária', 'chão'],
  'clock': ['relógio', 'hora', 'tempo'],
  'calendar': ['calendário', 'data', 'evento', 'agenda'],
  'calendar-days': ['calendário', 'dias', 'agenda'],
  'photo': ['foto', 'imagem', 'quadro'],
  'camera': ['câmera', 'foto', 'fotografia'],
  'map': ['mapa', 'localização', 'lugar'],
  'map-pin': ['pin', 'localização', 'marcador', 'lugar'],
  'globe-alt': ['globo', 'mundo', 'terra', 'internacional'],
  'globe-americas': ['globo', 'américas', 'mundo'],

  // Ações e Status
  'check': ['check', 'verificado', 'correto', 'ok'],
  'check-circle': ['verificado', 'aprovado', 'correto', 'sucesso'],
  'x-mark': ['x', 'fechar', 'excluir', 'remover'],
  'x-circle': ['erro', 'fechar', 'excluir'],
  'plus': ['mais', 'adicionar', 'novo'],
  'plus-circle': ['adicionar', 'novo', 'criar'],
  'minus': ['menos', 'remover', 'subtrair'],
  'minus-circle': ['remover', 'subtrair'],
  'exclamation-circle': ['alerta', 'aviso', 'atenção', 'importante'],
  'exclamation-triangle': ['aviso', 'perigo', 'atenção', 'cuidado'],
  'information-circle': ['informação', 'info', 'ajuda', 'sobre'],
  'question-mark-circle': ['pergunta', 'dúvida', 'ajuda', 'faq'],

  // Ferramentas e Configurações
  'cog': ['engrenagem', 'configurações', 'ajustes', 'opções'],
  'cog-6-tooth': ['configurações', 'ajustes', 'opções'],
  'cog-8-tooth': ['configurações', 'ajustes'],
  'wrench': ['chave', 'ferramenta', 'ajuste', 'manutenção'],
  'wrench-screwdriver': ['ferramentas', 'manutenção', 'reparo'],
  'adjustments-horizontal': ['ajustes', 'filtros', 'configurações'],
  'adjustments-vertical': ['ajustes', 'filtros', 'configurações'],

  // Navegação
  'arrow-left': ['seta', 'esquerda', 'voltar'],
  'arrow-right': ['seta', 'direita', 'próximo', 'avançar'],
  'arrow-up': ['seta', 'cima', 'subir'],
  'arrow-down': ['seta', 'baixo', 'descer'],
  'arrow-path': ['atualizar', 'refresh', 'recarregar'],
  'arrows-pointing-in': ['minimizar', 'reduzir'],
  'arrows-pointing-out': ['maximizar', 'expandir', 'ampliar'],
  'chevron-left': ['seta', 'esquerda', 'anterior'],
  'chevron-right': ['seta', 'direita', 'próximo'],
  'chevron-up': ['seta', 'cima', 'expandir'],
  'chevron-down': ['seta', 'baixo', 'recolher'],
  'bars-3': ['menu', 'hambúrguer', 'navegação'],
  'bars-4': ['menu', 'lista', 'linhas'],

  // Piscina e Lazer
  'lifebuoy': ['boia', 'piscina', 'salva-vidas', 'emergência'],

  // Natureza
  'bug-ant': ['formiga', 'inseto', 'bug'],

  // Escritório
  'clipboard': ['clipboard', 'prancheta', 'lista', 'tarefas'],
  'clipboard-document': ['documento', 'prancheta', 'arquivo'],
  'clipboard-document-check': ['documento', 'verificado', 'aprovado'],
  'clipboard-document-list': ['lista', 'documento', 'tarefas'],
  'document': ['documento', 'arquivo', 'papel'],
  'document-text': ['documento', 'texto', 'arquivo'],
  'document-duplicate': ['copiar', 'duplicar', 'documento'],
  'folder': ['pasta', 'diretório', 'arquivo'],
  'folder-open': ['pasta', 'aberta', 'diretório'],
  'archive-box': ['arquivo', 'caixa', 'guardar'],
  'trash': ['lixeira', 'excluir', 'remover', 'deletar'],
  'pencil': ['lápis', 'editar', 'escrever'],
  'pencil-square': ['editar', 'modificar', 'escrever'],

  // Outros
  'gift': ['presente', 'surpresa', 'prêmio'],
  'heart': ['coração', 'favorito', 'amor', 'like'],
  'star': ['estrela', 'favorito', 'destaque', 'avaliação'],
  'tag': ['etiqueta', 'tag', 'marcador', 'preço'],
  'bookmark': ['marcador', 'favorito', 'salvar'],
  'flag': ['bandeira', 'marcador', 'denunciar'],
  'magnifying-glass': ['busca', 'pesquisa', 'lupa', 'procurar'],
  'magnifying-glass-plus': ['zoom', 'ampliar', 'aumentar'],
  'magnifying-glass-minus': ['zoom', 'reduzir', 'diminuir'],
  'funnel': ['funil', 'filtro', 'filtrar'],
  'link': ['link', 'elo', 'conexão', 'url'],
  'paper-clip': ['anexo', 'clipe', 'anexar'],
  'cube': ['cubo', '3d', 'objeto'],
  'squares-2x2': ['grade', 'quadrados', 'grid'],
  'view-columns': ['colunas', 'visualização', 'layout'],
  'queue-list': ['lista', 'fila', 'itens'],
  'rectangle-stack': ['camadas', 'pilha', 'layers'],
  'currency-dollar': ['dólar', 'dinheiro', 'preço', 'valor'],
  'banknotes': ['dinheiro', 'notas', 'pagamento'],
  'credit-card': ['cartão', 'crédito', 'pagamento'],
  'shopping-bag': ['sacola', 'compras', 'loja'],
  'shopping-cart': ['carrinho', 'compras', 'loja'],
  'rocket-launch': ['foguete', 'lançar', 'iniciar'],
  'academic-cap': ['formatura', 'educação', 'acadêmico', 'chapéu'],
  'book-open': ['livro', 'leitura', 'educação'],
  'scale': ['balança', 'justiça', 'peso'],
  'calculator': ['calculadora', 'contas', 'matemática'],
  'chart-bar': ['gráfico', 'barras', 'estatísticas'],
  'chart-pie': ['gráfico', 'pizza', 'estatísticas'],
  'presentation-chart-bar': ['apresentação', 'gráfico', 'dados'],
  'presentation-chart-line': ['apresentação', 'linha', 'dados'],
  'table-cells': ['tabela', 'células', 'grid'],
  'server': ['servidor', 'dados', 'armazenamento'],
  'server-stack': ['servidores', 'infraestrutura'],
  'cloud-arrow-down': ['download', 'baixar', 'nuvem'],
  'cloud-arrow-up': ['upload', 'enviar', 'nuvem'],
  'arrow-down-tray': ['download', 'baixar', 'salvar'],
  'arrow-up-tray': ['upload', 'enviar', 'carregar'],
  'qr-code': ['qr code', 'código', 'scan'],
  'hashtag': ['hashtag', 'tag', 'número'],
  'at-symbol': ['arroba', 'email', 'endereço'],
  'swatch': ['cores', 'paleta', 'amostra'],
  'paint-brush': ['pincel', 'arte', 'pintura'],
  'scissors': ['tesoura', 'cortar'],
};

// Converter nome do ícone para PascalCase (formato do HeroIcons)
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Icon';
};

// Converter PascalCase para kebab-case
const toKebabCase = (str: string) => {
  return str
    .replace(/Icon$/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
};

// Obter todos os ícones disponíveis
const getAllIcons = () => {
  return Object.keys(HeroIcons)
    .filter(key => key.endsWith('Icon') && key !== 'default')
    .map(key => ({
      name: toKebabCase(key),
      component: (HeroIcons as any)[key],
    }));
};

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label = 'Ícone' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(48);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const allIcons = useRef(getAllIcons());

  // Filtrar ícones baseado na busca (em português ou inglês)
  const filteredIcons = allIcons.current.filter(icon => {
    const search = searchTerm.toLowerCase();
    if (!search) return true;

    // Buscar pelo nome em inglês
    if (icon.name.includes(search)) return true;

    // Buscar pelas traduções em português
    const translations = iconTranslations[icon.name] || [];
    return translations.some(t => t.includes(search));
  });

  // Ícones visíveis (para scroll infinito)
  const visibleIcons = filteredIcons.slice(0, visibleCount);

  // Handler para scroll infinito
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setVisibleCount(prev => Math.min(prev + 24, filteredIcons.length));
    }
  }, [filteredIcons.length]);

  // Reset visibleCount quando a busca muda
  useEffect(() => {
    setVisibleCount(48);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [searchTerm]);

  // Obter o componente do ícone selecionado
  const SelectedIconComponent = value ? (HeroIcons as any)[toPascalCase(value)] : null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
      >
        {SelectedIconComponent ? (
          <>
            <SelectedIconComponent className="h-5 w-5 text-gray-700" />
            <span className="text-gray-700">{value}</span>
          </>
        ) : (
          <span className="text-gray-400">Selecionar ícone...</span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
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

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar ícone (ex: casa, wifi, estrela...)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {filteredIcons.length} ícones encontrados
              </p>
            </div>

            {/* Icons Grid */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4"
              style={{ maxHeight: '400px' }}
            >
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {visibleIcons.map(icon => {
                  const IconComponent = icon.component;
                  const isSelected = value === icon.name;
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => {
                        onChange(icon.name);
                        setIsOpen(false);
                      }}
                      className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-amber-100 border-2 border-amber-500'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                      title={icon.name}
                    >
                      <IconComponent className={`h-6 w-6 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                      <span className={`text-[9px] leading-tight text-center truncate w-full ${
                        isSelected ? 'text-amber-700 font-medium' : 'text-gray-500'
                      }`}>
                        {icon.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {visibleCount < filteredIcons.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => Math.min(prev + 48, filteredIcons.length))}
                  className="w-full mt-4 py-2 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  Carregar mais ({filteredIcons.length - visibleCount} restantes)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para exibir o ícone pelo nome
export function DynamicIcon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  if (!name) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  // Normaliza o nome: remove espaços, converte para lowercase para verificação
  const normalizedName = name.trim();

  // Tenta o nome direto primeiro (caso já seja PascalCase com Icon no final)
  if (normalizedName.endsWith('Icon')) {
    const DirectIcon = (HeroIcons as any)[normalizedName];
    if (DirectIcon) {
      return <DirectIcon className={className} />;
    }
  }

  // Converte de kebab-case para PascalCase
  const pascalName = toPascalCase(normalizedName);
  const IconComponent = (HeroIcons as any)[pascalName];

  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  // Tentar variações comuns
  const variations = [
    // Se o nome já é PascalCase sem Icon
    normalizedName + 'Icon',
    // Se é camelCase
    normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1) + 'Icon',
    // Converter underscores para hífens e depois para PascalCase
    toPascalCase(normalizedName.replace(/_/g, '-')),
  ];

  for (const variation of variations) {
    const VariantIcon = (HeroIcons as any)[variation];
    if (VariantIcon) {
      return <VariantIcon className={className} />;
    }
  }

  // Se nada funcionou, mostrar placeholder com tooltip
  console.warn(`[DynamicIcon] Icon not found: "${name}" (tried: ${pascalName}, ${variations.join(', ')})`);
  return <span className="text-gray-400 text-xs" title={`Icon: ${name}`}>?</span>;
}
