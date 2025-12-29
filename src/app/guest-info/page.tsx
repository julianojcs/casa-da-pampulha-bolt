import dbConnect from '@/lib/mongodb';
import { GuestInfo } from '@/models/GuestInfo';
import {
  KeyIcon,
  ClockIcon,
  WifiIcon,
  BoltIcon,
  ShieldExclamationIcon,
  HomeModernIcon,
  NoSymbolIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'Check-in & Check-out | Casa da Pampulha',
  description: 'Informações de check-in e check-out, regras da casa e instruções para sua estadia.',
};

async function getGuestInfo() {
  await dbConnect();
  // Only include restricted items when the user is authenticated
  const session = await getServerSession(authOptions);
  const query: Record<string, unknown> = { isActive: true };
  if (!session) query.isRestricted = false;

  const items = await GuestInfo.find(query).sort({ order: 1 });
  return JSON.parse(JSON.stringify(items));
}

const iconMap: Record<string, React.ElementType> = {
  key: KeyIcon,
  clock: ClockIcon,
  wifi: WifiIcon,
  bolt: BoltIcon,
  shield: ShieldExclamationIcon,
  home: HomeModernIcon,
  no: NoSymbolIcon,
};

export default async function CheckinPage() {
  const items = await getGuestInfo();

  const checkinItems = items.filter((item: { type: string }) => item.type === 'checkin');
  const checkoutItems = items.filter((item: { type: string }) => item.type === 'checkout');
  const rules = items.filter((item: { type: string }) => item.type === 'rule');
  const instructions = items.filter((item: { type: string }) => item.type === 'instruction');

  const totalCount = items.length;
  const countsSummary = `Check-in: ${checkinItems.length} · Check-out: ${checkoutItems.length} · Regras: ${rules.length} · Instruções: ${instructions.length}`;

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-600 to-amber-700 text-white py-16">
        <div className="container-section py-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Check-in & Check-out</h1>
          <p className="text-lg text-amber-100">Tudo o que você precisa saber para sua chegada e partida</p>
          <p className="text-sm text-amber-100 mt-2">Mostrando <span className="font-semibold">{totalCount}</span> itens — <span className="italic">{countsSummary}</span></p>
        </div>
      </section>

      {/* Guest Registration CTA */}
      <section className="bg-amber-50 py-8">
        <div className="container-section py-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Cadastro de Hóspedes</h2>
              <p className="text-gray-600">Preencha o formulário de cadastro antes do check-in</p>
            </div>
            <Link href="/guest-info/cadastro" className="btn-primary">
              Fazer Cadastro
            </Link>
          </div>
        </div>
      </section>

      {/* Check-in Info */}
      <section className="container-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Check-in */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <ClockIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Check-in</h2>
                <p className="text-gray-500">A partir das 15:00</p>
              </div>
            </div>

            <div className="space-y-4">
              {checkinItems.length > 0 ? (
                checkinItems.map((item: { _id: string; icon: string; title: string; content: string }) => {
                  const Icon = iconMap[item.icon || 'key'] || KeyIcon;
                  return (
                    <div key={item._id} className="bg-white p-4 rounded-lg shadow-md">
                      <div className="flex items-start space-x-3">
                        <Icon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-amber-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.title}</h3>
                          <p className="text-gray-600 text-sm whitespace-pre-line">{item.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex items-start space-x-3">
                    <KeyIcon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-amber-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Acesso à Propriedade</h3>
                      <p className="text-gray-600 text-sm">
                        As instruções detalhadas de acesso serão enviadas após a confirmação da reserva.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Check-out */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <ClockIcon className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Check-out</h2>
                <p className="text-gray-500">Até às 11:00</p>
              </div>
            </div>

            <div className="space-y-4">
              {checkoutItems.length > 0 ? (
                checkoutItems.map((item: { _id: string; icon: string; title: string; content: string }) => {
                  const Icon = iconMap[item.icon || 'home'] || HomeModernIcon;
                  return (
                    <div key={item._id} className="bg-white p-4 rounded-lg shadow-md">
                      <div className="flex items-start space-x-3">
                        <Icon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-amber-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.title}</h3>
                          <p className="text-gray-600 text-sm whitespace-pre-line">{item.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-start space-x-3">
                      <HomeModernIcon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-amber-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Deixe a casa organizada</h3>
                        <p className="text-gray-600 text-sm">
                          Por favor, deixe a casa arrumada e retire o lixo antes de sair.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-start space-x-3">
                      <KeyIcon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-amber-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Devolução das Chaves</h3>
                        <p className="text-gray-600 text-sm">
                          Deixe as chaves no local indicado ao fazer o check-in.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Previously used a single CheckoutInfo document; now checkout items come from GuestInfo records. */}
            </div>
          </div>
        </div>
      </section>

      {/* House Rules */}
      <section className="container-section bg-gray-50">
        <div className="text-center mb-8">
          <h2 className="section-title">Regras da Casa</h2>
          <p className="section-subtitle">
            Para garantir uma estadia agradável para todos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.length > 0 ? (
            rules.map((rule: { _id: string; title: string; content: string }) => (
              <div key={rule._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <NoSymbolIcon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-red-500" />
                  <h3 className="font-semibold text-gray-800">{rule.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{rule.content}</p>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <NoSymbolIcon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-red-500" />
                  <h3 className="font-semibold text-gray-800">Proibido Fumar</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  É proibido fumar em qualquer área interna da casa.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <NoSymbolIcon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-red-500" />
                  <h3 className="font-semibold text-gray-800">Não são permitidos animais</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Infelizmente não aceitamos pets na propriedade.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <NoSymbolIcon className="h-6 w-6 text-red-500" />
                  <h3 className="font-semibold text-gray-800">Proibido festas e eventos</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Não é permitida a realização de festas ou eventos na propriedade.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <ShieldExclamationIcon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-amber-500" />
                  <h3 className="font-semibold text-gray-800">Horário de silêncio</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Respeite o horário de silêncio das 22h às 8h. Uso de som apenas em volume moderado.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <NoSymbolIcon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-red-500" />
                  <h3 className="font-semibold text-gray-800">Não é permitido receber visitas</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Apenas os hóspedes cadastrados podem acessar a propriedade.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <ShieldExclamationIcon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-amber-500" />
                  <h3 className="font-semibold text-gray-800">Regras da Piscina</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Crianças devem estar sempre acompanhadas. Não pular na piscina.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Instructions */}
      {instructions.length > 0 && (
        <section className="container-section">
          <div className="text-center mb-8">
            <h2 className="section-title">Instruções Gerais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instructions.map((item: { _id: string; icon: string; title: string; content: string }) => {
              const Icon = iconMap[item.icon || 'home'] || HomeModernIcon;
              return (
                <div key={item._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-start space-x-3">
                    <Icon className="h-6 w-6 min-h-6 min-w-6 flex-shrink-0 text-amber-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{item.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Login CTA */}
      <section className="container-section bg-amber-50">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Informações Restritas
          </h2>
          <p className="text-gray-600 mb-6">
            Senhas de WiFi, códigos de acesso e outras informações importantes
            estão disponíveis apenas para hóspedes com reserva confirmada.
          </p>
          <Link href="/login" className="btn-primary">
            Fazer Login
          </Link>
        </div>
      </section>
    </div>
  );
}
