'use client';

import { useState, useEffect } from 'react';
import { MapPinIcon, GlobeAmericasIcon } from '@heroicons/react/24/outline';
import { FormField } from './FormField';
import { fetchStates, fetchCitiesByStateId, IBGEState, IBGECity } from '@/lib/ibge';

interface AddressData {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

interface AddressFieldsProps {
  value: AddressData;
  onChange: (data: AddressData) => void;
  showZipCode?: boolean;
  required?: boolean;
  className?: string;
}

// Lista de países mais comuns (ordenados por frequência de uso)
const COUNTRIES = [
  { value: 'Brasil', label: 'Brasil' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Chile', label: 'Chile' },
  { value: 'Colombia', label: 'Colômbia' },
  { value: 'Mexico', label: 'México' },
  { value: 'Peru', label: 'Peru' },
  { value: 'Uruguai', label: 'Uruguai' },
  { value: 'Paraguai', label: 'Paraguai' },
  { value: 'Estados Unidos', label: 'Estados Unidos' },
  { value: 'Canadá', label: 'Canadá' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'Espanha', label: 'Espanha' },
  { value: 'França', label: 'França' },
  { value: 'Itália', label: 'Itália' },
  { value: 'Alemanha', label: 'Alemanha' },
  { value: 'Reino Unido', label: 'Reino Unido' },
  { value: 'Holanda', label: 'Holanda' },
  { value: 'Suíça', label: 'Suíça' },
  { value: 'Japão', label: 'Japão' },
  { value: 'China', label: 'China' },
  { value: 'Coreia do Sul', label: 'Coreia do Sul' },
  { value: 'Austrália', label: 'Austrália' },
  { value: 'Nova Zelândia', label: 'Nova Zelândia' },
  { value: 'África do Sul', label: 'África do Sul' },
  { value: 'Outro', label: 'Outro' },
];

/**
 * Componente de campos de endereço com suporte a país estrangeiro
 * Para Brasil: usa selects de estado/cidade com IBGE
 * Para outros países: campos de texto livre
 */
export function AddressFields({
  value,
  onChange,
  showZipCode = false,
  required = false,
  className = '',
}: AddressFieldsProps) {
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [customCountry, setCustomCountry] = useState('');

  const isBrazil = value.country === 'Brasil' || !value.country;
  const isOtherCountry = value.country === 'Outro';

  // Carregar estados do Brasil
  useEffect(() => {
    if (isBrazil) {
      loadStates();
    }
  }, [isBrazil]);

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    if (isBrazil && value.state) {
      loadCities(value.state);
    } else {
      setCities([]);
    }
  }, [value.state, isBrazil]);

  const loadStates = async () => {
    setLoadingStates(true);
    const data = await fetchStates();
    setStates(data);
    setLoadingStates(false);
  };

  const loadCities = async (sigla: string) => {
    const state = states.find((s) => s.sigla === sigla);
    if (state) {
      setLoadingCities(true);
      const data = await fetchCitiesByStateId(state.id);
      setCities(data);
      setLoadingCities(false);
    }
  };

  const handleCountryChange = (country: string) => {
    // Se mudar de Brasil para outro país, limpar estado e cidade
    if (country !== 'Brasil' && value.country === 'Brasil') {
      onChange({ ...value, country, state: '', city: '' });
    } else {
      onChange({ ...value, country });
    }
  };

  const handleStateChange = (state: string) => {
    // Limpar cidade quando mudar estado
    onChange({ ...value, state, city: '' });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <MapPinIcon className="h-4 w-4" />
        Endereço
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* País */}
        <FormField label="País" required={required}>
          <div className="relative">
            <GlobeAmericasIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <select
              value={value.country || 'Brasil'}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
            >
              {COUNTRIES.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
        </FormField>

        {/* Campo para país personalizado quando selecionar "Outro" */}
        {isOtherCountry && (
          <FormField label="Nome do País" required={required}>
            <input
              type="text"
              value={customCountry}
              onChange={(e) => setCustomCountry(e.target.value)}
              onBlur={() => {
                if (customCountry) {
                  onChange({ ...value, country: customCountry });
                }
              }}
              placeholder="Digite o nome do país"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </FormField>
        )}

        {/* CEP (opcional) */}
        {showZipCode && (
          <FormField label="CEP">
            <input
              type="text"
              value={value.zipCode || ''}
              onChange={(e) => onChange({ ...value, zipCode: e.target.value })}
              placeholder={isBrazil ? '00000-000' : 'Código Postal'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </FormField>
        )}
      </div>

      {/* Endereço completo */}
      <FormField label="Endereço" required={required} className="md:col-span-2">
        <input
          type="text"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="Rua, número, complemento"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required={required}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estado - Select para Brasil, Input para outros países */}
        {isBrazil ? (
          <FormField label="Estado" required={required}>
            <select
              value={value.state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required={required}
              disabled={loadingStates}
            >
              <option value="">
                {loadingStates ? 'Carregando...' : 'Selecione...'}
              </option>
              {states.map((state) => (
                <option key={state.id} value={state.sigla}>
                  {state.nome}
                </option>
              ))}
            </select>
          </FormField>
        ) : (
          <FormField label="Estado/Província" required={required}>
            <input
              type="text"
              value={value.state}
              onChange={(e) => onChange({ ...value, state: e.target.value })}
              placeholder="Estado ou Província"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required={required}
            />
          </FormField>
        )}

        {/* Cidade - Select para Brasil, Input para outros países */}
        {isBrazil ? (
          <FormField label="Cidade" required={required}>
            <select
              value={value.city}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required={required}
              disabled={!value.state || loadingCities}
            >
              <option value="">
                {loadingCities
                  ? 'Carregando...'
                  : !value.state
                  ? 'Selecione o estado primeiro'
                  : 'Selecione...'}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.nome}>
                  {city.nome}
                </option>
              ))}
            </select>
          </FormField>
        ) : (
          <FormField label="Cidade" required={required}>
            <input
              type="text"
              value={value.city}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
              placeholder="Nome da cidade"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required={required}
            />
          </FormField>
        )}
      </div>
    </div>
  );
}
