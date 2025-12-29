// Helpers para consulta de dados do IBGE (estados e municípios)

export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGECity {
  id: number;
  nome: string;
}

const IBGE_API_BASE = 'https://servicodados.ibge.gov.br/api/v1/localidades';

/**
 * Busca todos os estados brasileiros ordenados por nome
 */
export async function fetchStates(): Promise<IBGEState[]> {
  try {
    const response = await fetch(`${IBGE_API_BASE}/estados?orderBy=nome`);
    if (!response.ok) throw new Error('Erro ao buscar estados');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao carregar estados do IBGE:', error);
    throw error;
  }
}

/**
 * Busca cidades de um estado específico
 * @param stateId ID numérico do estado (ex: 31 para MG)
 */
export async function fetchCitiesByStateId(stateId: number): Promise<IBGECity[]> {
  try {
    const response = await fetch(
      `${IBGE_API_BASE}/estados/${stateId}/municipios?orderBy=nome`
    );
    if (!response.ok) throw new Error('Erro ao buscar cidades');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao carregar cidades do IBGE:', error);
    throw error;
  }
}

/**
 * Busca cidades de um estado pela sigla (UF)
 * @param states Lista de estados para encontrar o ID
 * @param stateSigla Sigla do estado (ex: 'MG')
 */
export async function fetchCitiesByStateSigla(
  states: IBGEState[],
  stateSigla: string
): Promise<IBGECity[]> {
  const state = states.find((s) => s.sigla === stateSigla);
  if (!state) {
    throw new Error(`Estado não encontrado: ${stateSigla}`);
  }
  return fetchCitiesByStateId(state.id);
}

/**
 * Hook helper para uso com React
 * Retorna funções e estados padrão para seleção de UF/Cidade
 */
export const defaultBrazilData = {
  country: 'Brasil',
  nationality: 'Brasileiro(a)',
};
