'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserGroupIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Guest {
  name: string;
  age: number;
  document?: string;
}

export default function CadastroPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    documentType: 'CPF',
    document: '',
    checkInDate: '',
    checkOutDate: '',
    specialRequests: '',
    vehiclePlate: '',
    agreedToRules: false,
  });
  const [additionalGuests, setAdditionalGuests] = useState<Guest[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreedToRules) {
      toast.error('Você precisa concordar com as regras da casa');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
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
                    Nome Completo *
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
                    E-mail *
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
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="(31) 99999-9999"
                  />
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
                    Número do Documento *
                  </label>
                  <input
                    type="text"
                    name="document"
                    value={formData.document}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Check-in *
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
                    Data de Check-out *
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa do Veículo
                  </label>
                  <input
                    type="text"
                    name="vehiclePlate"
                    value={formData.vehiclePlate}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="ABC-1234 (opcional)"
                  />
                </div>
              </div>
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
