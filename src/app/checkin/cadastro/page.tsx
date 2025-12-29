'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserGroupIcon, PlusIcon, XMarkIcon, TruckIcon } from '@heroicons/react/24/outline';

interface Guest {
  name: string;
  age: number;
  document?: string;
}

interface Vehicle {
  plate: string;
  model: string;
  color: string;
}

// Opções de DDI
const DDI_OPTIONS = [
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+1', country: 'EUA/Canadá', flag: '🇺🇸' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+34', country: 'Espanha', flag: '🇪🇸' },
  { code: '+33', country: 'França', flag: '🇫🇷' },
  { code: '+49', country: 'Alemanha', flag: '🇩🇪' },
  { code: '+39', country: 'Itália', flag: '🇮🇹' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colômbia', flag: '🇨🇴' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+81', country: 'Japão', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
];

// Funções de máscara
function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
    .slice(0, 14);
}

function maskRG(value: string): string {
  // RG pode ter formatos diferentes por estado, mantemos mais flexível
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})/, '$1-$2')
    .slice(0, 12);
}

function maskPassport(value: string): string {
  // Passaporte brasileiro: 2 letras + 6 números
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

function maskPhone(value: string): string {
  // Telefone brasileiro: (31) 99999-9999
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
    .slice(0, 15);
}

function maskVehiclePlate(value: string): string {
  // Placa Mercosul ou antiga: ABC1D23 ou ABC-1234
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7);
}

function formatPlateDisplay(value: string): string {
  // Formata para exibição: ABC-1D23 ou ABC-1234
  if (value.length <= 3) return value;
  return value.slice(0, 3) + '-' + value.slice(3);
}

export default function CadastroPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneDDI: '+55',
    phone: '',
    documentType: 'CPF',
    document: '',
    checkInDate: '',
    checkOutDate: '',
    specialRequests: '',
    agreedToRules: false,
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [additionalGuests, setAdditionalGuests] = useState<Guest[]>([]);

  // Aplicar máscara ao documento baseado no tipo
  const applyDocumentMask = (value: string, type: string): string => {
    switch (type) {
      case 'CPF':
        return maskCPF(value);
      case 'RG':
        return maskRG(value);
      case 'Passaporte':
        return maskPassport(value);
      default:
        return value;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'document') {
      // Aplicar máscara baseada no tipo de documento
      const maskedValue = applyDocumentMask(value, formData.documentType);
      setFormData(prev => ({ ...prev, document: maskedValue }));
    } else if (name === 'phone') {
      // Aplicar máscara de telefone
      const maskedValue = maskPhone(value);
      setFormData(prev => ({ ...prev, phone: maskedValue }));
    } else if (name === 'documentType') {
      // Ao mudar tipo de documento, limpar o valor e reaplicar máscara
      const rawValue = formData.document.replace(/\D/g, '');
      const maskedValue = applyDocumentMask(rawValue, value);
      setFormData(prev => ({
        ...prev,
        documentType: value,
        document: maskedValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  // Veículos
  const addVehicle = () => {
    setVehicles(prev => [...prev, { plate: '', model: '', color: '' }]);
  };

  const removeVehicle = (index: number) => {
    setVehicles(prev => prev.filter((_, i) => i !== index));
  };

  const updateVehicle = (index: number, field: keyof Vehicle, value: string) => {
    setVehicles(prev => prev.map((vehicle, i) =>
      i === index
        ? {
            ...vehicle,
            [field]: field === 'plate' ? maskVehiclePlate(value) : value,
          }
        : vehicle
    ));
  };

  const addGuest = () => {
    setAdditionalGuests(prev => [...prev, { name: '', age: 0, document: '' }]);
  };

  const removeGuest = (index: number) => {
    setAdditionalGuests(prev => prev.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, field: keyof Guest, value: string | number) => {
    setAdditionalGuests(prev => prev.map((guest, i) =>
      i === index ? { ...guest, [field]: value } : guest
    ));
  };

  // Placeholder do documento baseado no tipo
  const getDocumentPlaceholder = () => {
    switch (formData.documentType) {
      case 'CPF':
        return '000.000.000-00';
      case 'RG':
        return '00.000.000-0';
      case 'Passaporte':
        return 'AB123456';
      default:
        return 'Número do documento';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreedToRules) {
      toast.error('Você precisa concordar com as regras da casa');
      return;
    }

    setIsSubmitting(true);

    try {
      // Formatar telefone completo com DDI
      const fullPhone = `${formData.phoneDDI} ${formData.phone}`;

      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone,
          vehicles: vehicles.filter(v => v.plate.trim() !== ''),
          guests: additionalGuests,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar cadastro');
      }

      toast.success('Cadastro realizado com sucesso!');
      router.push('/guest-info');
    } catch (error) {
      toast.error('Erro ao enviar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-600 to-amber-700 text-white py-16">
        <div className="container-section py-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cadastro de Hóspedes</h1>
          <p className="text-lg text-amber-100">
            Preencha seus dados para o check-in
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="container-section">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Guest */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <UserGroupIcon className="h-6 w-6 text-amber-600" />
                Hóspede Principal
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="phoneDDI"
                      value={formData.phoneDDI}
                      onChange={handleInputChange}
                      className="input-field w-32"
                    >
                      {DDI_OPTIONS.map((ddi) => (
                        <option key={ddi.code} value={ddi.code}>
                          {ddi.flag} {ddi.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field flex-1"
                      placeholder="(31) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="CPF">CPF</option>
                    <option value="RG">RG</option>
                    <option value="Passaporte">Passaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="document"
                    value={formData.document}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder={getDocumentPlaceholder()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Check-in <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Check-out <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Vehicles */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <TruckIcon className="h-6 w-6 text-amber-600" />
                  Veículos
                </h2>
                <button
                  type="button"
                  onClick={addVehicle}
                  className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium"
                >
                  <PlusIcon className="h-5 w-5" />
                  Adicionar
                </button>
              </div>

              {vehicles.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Clique em &quot;Adicionar&quot; para incluir veículos (opcional)
                </p>
              ) : (
                <div className="space-y-4">
                  {vehicles.map((vehicle, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Placa
                          </label>
                          <input
                            type="text"
                            value={formatPlateDisplay(vehicle.plate)}
                            onChange={(e) => updateVehicle(index, 'plate', e.target.value)}
                            className="input-field uppercase"
                            placeholder="ABC-1D23"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Modelo
                          </label>
                          <input
                            type="text"
                            value={vehicle.model}
                            onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                            className="input-field"
                            placeholder="Ex: Honda Civic"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cor
                          </label>
                          <input
                            type="text"
                            value={vehicle.color}
                            onChange={(e) => updateVehicle(index, 'color', e.target.value)}
                            className="input-field"
                            placeholder="Ex: Prata"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVehicle(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Guests */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Hóspedes Adicionais
                </h2>
                <button
                  type="button"
                  onClick={addGuest}
                  className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium"
                >
                  <PlusIcon className="h-5 w-5" />
                  Adicionar
                </button>
              </div>

              {additionalGuests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Clique em &quot;Adicionar&quot; para incluir outros hóspedes
                </p>
              ) : (
                <div className="space-y-4">
                  {additionalGuests.map((guest, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={guest.name}
                            onChange={(e) => updateGuest(index, 'name', e.target.value)}
                            className="input-field"
                            placeholder="Nome completo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Idade
                          </label>
                          <input
                            type="number"
                            value={guest.age || ''}
                            onChange={(e) => updateGuest(index, 'age', parseInt(e.target.value) || 0)}
                            className="input-field"
                            placeholder="Idade"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Documento (opcional)
                          </label>
                          <input
                            type="text"
                            value={guest.document || ''}
                            onChange={(e) => updateGuest(index, 'document', e.target.value)}
                            className="input-field"
                            placeholder="CPF ou RG"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGuest(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Special Requests */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Observações
              </h2>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Alguma solicitação especial ou observação?"
              />
            </div>

            {/* Rules Agreement */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreedToRules"
                  checked={formData.agreedToRules}
                  onChange={handleInputChange}
                  className="mt-1 h-5 w-5 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-gray-700">
                  Li e concordo com as regras da casa, incluindo: proibido fumar,
                  não são permitidos animais, proibido festas e eventos, respeitar
                  o horário de silêncio e não receber visitas externas.
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
