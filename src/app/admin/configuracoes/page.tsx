'use client';

import { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SocialLink {
  _id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
  isActive: boolean;
}

interface Host {
  _id: string;
  name: string;
  bio: string;
  photo: string;
  role: string;
  languages: string[];
  responseTime: string;
  responseRate: string;
  isSuperhost: boolean;
  joinedDate: string;
}

const emptyHost: Omit<Host, '_id'> = {
  name: '',
  bio: '',
  photo: '',
  role: '',
  languages: [],
  responseTime: '',
  responseRate: '',
  isSuperhost: false,
  joinedDate: '',
};

const emptySocialLink: Omit<SocialLink, '_id'> = {
  platform: '',
  url: '',
  icon: '',
  order: 0,
  isActive: true,
};

interface LegalItem {
  _id?: string;
  title: string;
  content: string;
  order: number;
}

interface LegalContent {
  type: 'privacy' | 'terms';
  items: LegalItem[];
}

const emptyLegalItem: Omit<LegalItem, '_id'> = {
  title: '',
  content: '',
  order: 0,
};

// Sortable Legal Item Component
function SortableLegalItem({
  item,
  onEdit,
  onDelete
}: {
  item: LegalItem;
  onEdit: (item: LegalItem) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id || item.order.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-2 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
          {...attributes}
          {...listeners}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{item.title}</h4>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.content}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => item._id && onDelete(item._id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminConfiguracoesPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'social' | 'hosts' | 'legal'>('social');

  // Social Modal
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [socialFormData, setSocialFormData] = useState<Omit<SocialLink, '_id'>>(emptySocialLink);

  // Host Modal
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [hostFormData, setHostFormData] = useState<Omit<Host, '_id'>>(emptyHost);
  const [languageInput, setLanguageInput] = useState('');

  // Legal Content
  const [privacyItems, setPrivacyItems] = useState<LegalItem[]>([]);
  const [termsItems, setTermsItems] = useState<LegalItem[]>([]);
  const [activeLegalType, setActiveLegalType] = useState<'privacy' | 'terms'>('privacy');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [editingLegal, setEditingLegal] = useState<LegalItem | null>(null);
  const [legalFormData, setLegalFormData] = useState<Omit<LegalItem, '_id'>>(emptyLegalItem);

  const [saving, setSaving] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchData();
    fetchLegalContent();
  }, []);

  const fetchData = async () => {
    try {
      const [socialRes, hostsRes] = await Promise.all([
        fetch('/api/social'),
        fetch('/api/hosts'),
      ]);

      const [socialData, hostsData] = await Promise.all([
        socialRes.json(),
        hostsRes.json(),
      ]);

      setSocialLinks(Array.isArray(socialData) ? socialData : []);
      setHosts(Array.isArray(hostsData) ? hostsData : []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLegalContent = async () => {
    try {
      const [privacyRes, termsRes] = await Promise.all([
        fetch('/api/legal?type=privacy'),
        fetch('/api/legal?type=terms'),
      ]);

      const [privacyData, termsData] = await Promise.all([
        privacyRes.json(),
        termsRes.json(),
      ]);

      if (privacyData?.items) setPrivacyItems(privacyData.items);
      if (termsData?.items) setTermsItems(termsData.items);
    } catch (error) {
      console.error('Erro ao carregar conteúdo legal:', error);
    }
  };

  // Social Link handlers
  const openSocialModal = (link?: SocialLink) => {
    if (link) {
      setEditingSocial(link);
      setSocialFormData({
        platform: link.platform,
        url: link.url,
        icon: link.icon,
        order: link.order,
        isActive: link.isActive,
      });
    } else {
      setEditingSocial(null);
      setSocialFormData(emptySocialLink);
    }
    setIsSocialModalOpen(true);
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingSocial
        ? `/api/social?id=${editingSocial._id}`
        : '/api/social';

      const response = await fetch(url, {
        method: editingSocial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialFormData),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success(editingSocial ? 'Link atualizado!' : 'Link criado!');
      setIsSocialModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar link');
    } finally {
      setSaving(false);
    }
  };

  const handleSocialDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;

    try {
      await fetch(`/api/social?id=${id}`, { method: 'DELETE' });
      toast.success('Link excluído!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  // Host handlers
  const openHostModal = (host?: Host) => {
    if (host) {
      setEditingHost(host);
      setHostFormData({
        name: host.name,
        bio: host.bio,
        photo: host.photo,
        role: host.role,
        languages: host.languages || [],
        responseTime: host.responseTime,
        responseRate: host.responseRate,
        isSuperhost: host.isSuperhost,
        joinedDate: host.joinedDate ? host.joinedDate.split('T')[0] : '',
      });
    } else {
      setEditingHost(null);
      setHostFormData(emptyHost);
    }
    setIsHostModalOpen(true);
  };

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingHost
        ? `/api/hosts?id=${editingHost._id}`
        : '/api/hosts';

      const response = await fetch(url, {
        method: editingHost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostFormData),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success(editingHost ? 'Anfitrião atualizado!' : 'Anfitrião criado!');
      setIsHostModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao salvar anfitrião');
    } finally {
      setSaving(false);
    }
  };

  const handleHostDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;

    try {
      await fetch(`/api/hosts?id=${id}`, { method: 'DELETE' });
      toast.success('Anfitrião excluído!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const addLanguage = () => {
    if (languageInput.trim()) {
      setHostFormData({
        ...hostFormData,
        languages: [...hostFormData.languages, languageInput.trim()],
      });
      setLanguageInput('');
    }
  };

  const removeLanguage = (index: number) => {
    setHostFormData({
      ...hostFormData,
      languages: hostFormData.languages.filter((_, i) => i !== index),
    });
  };

  // Legal Content handlers
  const currentLegalItems = activeLegalType === 'privacy' ? privacyItems : termsItems;
  const setCurrentLegalItems = activeLegalType === 'privacy' ? setPrivacyItems : setTermsItems;

  const openLegalModal = (item?: LegalItem) => {
    if (item) {
      setEditingLegal(item);
      setLegalFormData({
        title: item.title,
        content: item.content,
        order: item.order,
      });
    } else {
      setEditingLegal(null);
      setLegalFormData({
        ...emptyLegalItem,
        order: currentLegalItems.length + 1,
      });
    }
    setIsLegalModalOpen(true);
  };

  const handleLegalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const newItems = editingLegal
        ? currentLegalItems.map(item =>
            item._id === editingLegal._id
              ? { ...item, ...legalFormData }
              : item
          )
        : [...currentLegalItems, { ...legalFormData, _id: `temp-${Date.now()}` }];

      const response = await fetch(`/api/legal?type=${activeLegalType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems }),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      toast.success(editingLegal ? 'Item atualizado!' : 'Item criado!');
      setIsLegalModalOpen(false);
      fetchLegalContent();
    } catch (error) {
      toast.error('Erro ao salvar item');
    } finally {
      setSaving(false);
    }
  };

  const handleLegalDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;

    try {
      const newItems = currentLegalItems.filter(item => item._id !== id);

      const response = await fetch(`/api/legal?type=${activeLegalType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems }),
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Item excluído!');
      fetchLegalContent();
    } catch (error) {
      toast.error('Erro ao excluir item');
    }
  };

  const handleLegalDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = currentLegalItems.findIndex(item => (item._id || item.order.toString()) === active.id);
      const newIndex = currentLegalItems.findIndex(item => (item._id || item.order.toString()) === over.id);

      const reorderedItems = arrayMove(currentLegalItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      setCurrentLegalItems(reorderedItems);

      try {
        const response = await fetch(`/api/legal?type=${activeLegalType}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: reorderedItems }),
        });

        if (!response.ok) throw new Error('Erro ao reordenar');
        toast.success('Ordem atualizada!');
      } catch (error) {
        toast.error('Erro ao reordenar itens');
        fetchLegalContent();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 -mb-px ${activeTab === 'social' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500'}`}
        >
          Redes Sociais
        </button>
        <button
          onClick={() => setActiveTab('hosts')}
          className={`px-4 py-2 -mb-px ${activeTab === 'hosts' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500'}`}
        >
          Anfitriões
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2 -mb-px ${activeTab === 'legal' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500'}`}
        >
          Termos Legais
        </button>
      </div>

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openSocialModal()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <PlusIcon className="h-5 w-5" />
              Novo Link
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plataforma</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ícone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {socialLinks.map((link) => (
                    <tr key={link._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{link.platform}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 truncate max-w-xs">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{link.icon}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          link.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {link.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openSocialModal(link)} className="text-amber-600 hover:text-amber-800">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleSocialDelete(link._id)} className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {socialLinks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Nenhum link social cadastrado
                </div>
              ) : (
                socialLinks.map((link) => (
                  <div key={link._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{link.platform}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            link.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {link.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 truncate block"
                        >
                          {link.url}
                        </a>
                        {link.icon && (
                          <span className="text-xs text-gray-500">Ícone: {link.icon}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openSocialModal(link)}
                          className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleSocialDelete(link._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hosts Tab */}
      {activeTab === 'hosts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openHostModal()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <PlusIcon className="h-5 w-5" />
              Novo Anfitrião
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hosts.map((host) => (
              <div key={host._id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    {host.photo && (
                      <img src={host.photo} alt={host.name} className="w-16 h-16 rounded-full object-cover" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{host.name}</h3>
                      <p className="text-sm text-gray-500">{host.role}</p>
                      {host.isSuperhost && (
                        <span className="text-xs text-amber-600 font-medium">⭐ Superhost</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openHostModal(host)} className="text-amber-600 hover:text-amber-800">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleHostDelete(host._id)} className="text-red-600 hover:text-red-800">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 line-clamp-3">{host.bio}</p>
                {host.languages && host.languages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {host.languages.map((lang, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">{lang}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Content Tab */}
      {activeTab === 'legal' && (
        <div className="space-y-4">
          {/* Sub-tabs for Privacy/Terms */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveLegalType('privacy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeLegalType === 'privacy'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Política de Privacidade
            </button>
            <button
              onClick={() => setActiveLegalType('terms')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeLegalType === 'terms'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Termos de Uso
            </button>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Arraste os itens para reordenar. As alterações são salvas automaticamente.
            </p>
            <button
              onClick={() => openLegalModal()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <PlusIcon className="h-5 w-5" />
              Novo Item
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            {currentLegalItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum item cadastrado. Execute o seed ou adicione manualmente.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLegalDragEnd}
              >
                <SortableContext
                  items={currentLegalItems.map(item => item._id || item.order.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  {currentLegalItems
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <SortableLegalItem
                        key={item._id || item.order}
                        item={item}
                        onEdit={openLegalModal}
                        onDelete={handleLegalDelete}
                      />
                    ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {/* Social Modal */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingSocial ? 'Editar Link' : 'Novo Link'}</h2>
              <button onClick={() => setIsSocialModalOpen(false)}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSocialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
                <input
                  type="text"
                  value={socialFormData.platform}
                  onChange={(e) => setSocialFormData({ ...socialFormData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={socialFormData.url}
                  onChange={(e) => setSocialFormData({ ...socialFormData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                  <input
                    type="text"
                    value={socialFormData.icon}
                    onChange={(e) => setSocialFormData({ ...socialFormData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                  <input
                    type="number"
                    value={socialFormData.order}
                    onChange={(e) => setSocialFormData({ ...socialFormData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={socialFormData.isActive}
                  onChange={(e) => setSocialFormData({ ...socialFormData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Ativo</span>
              </label>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsSocialModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-lg disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Host Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingHost ? 'Editar Anfitrião' : 'Novo Anfitrião'}</h2>
              <button onClick={() => setIsHostModalOpen(false)}><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
            </div>
            <form onSubmit={handleHostSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={hostFormData.name}
                  onChange={(e) => setHostFormData({ ...hostFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                <input
                  type="text"
                  value={hostFormData.role}
                  onChange={(e) => setHostFormData({ ...hostFormData, role: e.target.value })}
                  placeholder="Anfitriã, Coanfitrião..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={hostFormData.bio}
                  onChange={(e) => setHostFormData({ ...hostFormData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL)</label>
                <input
                  type="text"
                  value={hostFormData.photo}
                  onChange={(e) => setHostFormData({ ...hostFormData, photo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idiomas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    placeholder="Português"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  />
                  <button type="button" onClick={addLanguage} className="px-4 py-2 bg-gray-200 rounded-lg">+</button>
                </div>
                {hostFormData.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hostFormData.languages.map((lang, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                        {lang}
                        <button type="button" onClick={() => removeLanguage(i)}><XMarkIcon className="h-4 w-4" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Resposta</label>
                  <input
                    type="text"
                    value={hostFormData.responseTime}
                    onChange={(e) => setHostFormData({ ...hostFormData, responseTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Resposta</label>
                  <input
                    type="text"
                    value={hostFormData.responseRate}
                    onChange={(e) => setHostFormData({ ...hostFormData, responseRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hostFormData.isSuperhost}
                  onChange={(e) => setHostFormData({ ...hostFormData, isSuperhost: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Superhost</span>
              </label>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsHostModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-lg disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal Modal */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingLegal ? 'Editar Item' : 'Novo Item'} - {activeLegalType === 'privacy' ? 'Política de Privacidade' : 'Termos de Uso'}
              </h2>
              <button onClick={() => setIsLegalModalOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleLegalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={legalFormData.title}
                  onChange={(e) => setLegalFormData({ ...legalFormData, title: e.target.value })}
                  placeholder="Ex: 1. Introdução"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea
                  value={legalFormData.content}
                  onChange={(e) => setLegalFormData({ ...legalFormData, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Use **texto** para negrito e • para listas"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dica: Use **texto** para negrito e \n• para listas com bullets
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLegalModalOpen(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
