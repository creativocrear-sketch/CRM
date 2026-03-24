import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Campaign, 
  EmailTemplate, 
  DomainConfig, 
  Contact, 
  ContactList, 
  ViewType,
  EmailStats 
} from '@/types';

interface AppState {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  
  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  sendCampaign: (id: string) => void;
  
  // Templates
  templates: EmailTemplate[];
  addTemplate: (template: EmailTemplate) => void;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  getTemplateById: (id: string) => EmailTemplate | undefined;
  
  // Domain Config
  domainConfig: DomainConfig | null;
  setDomainConfig: (config: DomainConfig) => void;
  
  // Contacts
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  importContacts: (contacts: Contact[]) => void;
  
  // Contact Lists
  contactLists: ContactList[];
  addContactList: (list: ContactList) => void;
  updateContactList: (id: string, updates: Partial<ContactList>) => void;
  deleteContactList: (id: string) => void;
  addContactToList: (listId: string, contactId: string) => void;
  removeContactFromList: (listId: string, contactId: string) => void;
  
  // Stats
  globalStats: EmailStats;
  updateGlobalStats: () => void;
}

// Plantillas predefinidas del Hotel Don Gregorio
const predefinedTemplates: EmailTemplate[] = [
  {
    id: 'hotel-simple',
    name: 'Hotel Don Gregorio - Promoción Simple',
    content: [],
    thumbnail: '/images/template1/asset_1.jpg',
    html: 'hotel-simple',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hotel-elaborate',
    name: 'Hotel Don Gregorio - Promoción Elaborada',
    content: [],
    thumbnail: '/images/template2/asset_1.jpg',
    html: 'hotel-elaborate',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hotel-gallery',
    name: 'Hotel Don Gregorio - Galería',
    content: [],
    thumbnail: '/images/template3/asset_1.jpg',
    html: 'hotel-gallery',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Promoción Semana Santa 2026',
    subject: '30% OFF en alojamiento - Hotel Don Gregorio',
    status: 'sent',
    createdAt: new Date('2026-03-01'),
    sentAt: new Date('2026-03-05'),
    recipientCount: 2500,
    templateId: 'hotel-simple',
    stats: {
      sent: 2500,
      opened: 875,
      clicked: 325,
      openRate: 35,
      clickRate: 13
    }
  },
  {
    id: 'camp-2',
    name: 'Newsletter Marzo',
    subject: 'Descubre nuestras nuevas instalaciones',
    status: 'draft',
    createdAt: new Date('2026-03-20'),
    recipientCount: 0,
    templateId: 'hotel-gallery'
  }
];

const sampleContacts: Contact[] = [
  { id: '1', email: 'juan.perez@email.com', firstName: 'Juan', lastName: 'Pérez', subscribed: true, createdAt: new Date('2026-01-15') },
  { id: '2', email: 'maria.garcia@email.com', firstName: 'María', lastName: 'García', subscribed: true, createdAt: new Date('2026-02-20') },
  { id: '3', email: 'carlos.lopez@email.com', firstName: 'Carlos', lastName: 'López', subscribed: false, createdAt: new Date('2026-03-01') },
  { id: '4', email: 'ana.martinez@email.com', firstName: 'Ana', lastName: 'Martínez', subscribed: true, createdAt: new Date('2026-03-10') },
  { id: '5', email: 'pedro.sanchez@email.com', firstName: 'Pedro', lastName: 'Sánchez', subscribed: true, createdAt: new Date('2026-03-15') },
];

const sampleLists: ContactList[] = [
  { id: '1', name: 'Clientes VIP', contacts: [], count: 150 },
  { id: '2', name: 'Newsletter General', contacts: [], count: 2500 },
  { id: '3', name: 'Promociones', contacts: [], count: 1800 },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      setCurrentView: (view: ViewType) => set({ currentView: view }),
      
      // Campaigns
      campaigns: sampleCampaigns,
      addCampaign: (campaign: Campaign) => set((state: AppState) => ({ 
        campaigns: [...state.campaigns, campaign] 
      })),
      updateCampaign: (id: string, updates: Partial<Campaign>) => set((state: AppState) => ({
        campaigns: state.campaigns.map((c: Campaign) => 
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      deleteCampaign: (id: string) => set((state: AppState) => ({
        campaigns: state.campaigns.filter((c: Campaign) => c.id !== id)
      })),
      duplicateCampaign: (id: string) => {
        const campaign = get().campaigns.find((c: Campaign) => c.id === id);
        if (campaign) {
          const newCampaign: Campaign = {
            ...campaign,
            id: `camp-${Date.now()}`,
            name: `${campaign.name} (Copia)`,
            status: 'draft',
            createdAt: new Date(),
            sentAt: undefined,
            stats: undefined,
            recipientCount: 0
          };
          set((state: AppState) => ({
            campaigns: [...state.campaigns, newCampaign]
          }));
        }
      },
      sendCampaign: (id: string) => set((state: AppState) => {
        const updatedCampaigns = state.campaigns.map((c: Campaign) =>
          c.id === id ? {
            ...c,
            status: 'sent' as const,
            sentAt: new Date(),
            stats: {
              sent: c.recipientCount || 1000,
              opened: Math.floor((c.recipientCount || 1000) * 0.35),
              clicked: Math.floor((c.recipientCount || 1000) * 0.13),
              openRate: 35,
              clickRate: 13
            }
          } : c
        );
        const withStats = updatedCampaigns.filter((c: Campaign) => c.stats);
        const totalSent = withStats.reduce((sum: number, c: Campaign) => sum + (c.stats?.sent || 0), 0);
        const totalOpened = withStats.reduce((sum: number, c: Campaign) => sum + (c.stats?.opened || 0), 0);
        const totalClicked = withStats.reduce((sum: number, c: Campaign) => sum + (c.stats?.clicked || 0), 0);
        return {
          campaigns: updatedCampaigns,
          globalStats: {
            sent: totalSent,
            opened: totalOpened,
            clicked: totalClicked,
            openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
            clickRate: totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0
          }
        };
      }),
      
      // Templates
      templates: predefinedTemplates,
      addTemplate: (template: EmailTemplate) => set((state: AppState) => ({ 
        templates: [...state.templates, template] 
      })),
      updateTemplate: (id: string, updates: Partial<EmailTemplate>) => set((state: AppState) => ({
        templates: state.templates.map((t: EmailTemplate) => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
        )
      })),
      deleteTemplate: (id: string) => set((state: AppState) => ({
        templates: state.templates.filter((t: EmailTemplate) => t.id !== id)
      })),
      duplicateTemplate: (id: string) => {
        const template = get().templates.find((t: EmailTemplate) => t.id === id);
        if (template) {
          const newTemplate: EmailTemplate = {
            ...template,
            id: `template-${Date.now()}`,
            name: `${template.name} (Copia)`,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          set((state: AppState) => ({
            templates: [...state.templates, newTemplate]
          }));
        }
      },
      getTemplateById: (id: string) => {
        return get().templates.find((t: EmailTemplate) => t.id === id);
      },
      
      // Domain Config
      domainConfig: null,
      setDomainConfig: (config: DomainConfig) => set({ domainConfig: config }),
      
      // Contacts
      contacts: sampleContacts,
      addContact: (contact: Contact) => set((state: AppState) => ({ 
        contacts: [...state.contacts, contact] 
      })),
      updateContact: (id: string, updates: Partial<Contact>) => set((state: AppState) => ({
        contacts: state.contacts.map((c: Contact) => 
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      deleteContact: (id: string) => set((state: AppState) => ({
        contacts: state.contacts.filter((c: Contact) => c.id !== id)
      })),
      importContacts: (newContacts: Contact[]) => set((state: AppState) => ({
        contacts: [...state.contacts, ...newContacts]
      })),
      
      // Contact Lists
      contactLists: sampleLists,
      addContactList: (list: ContactList) => set((state: AppState) => ({ 
        contactLists: [...state.contactLists, list] 
      })),
      updateContactList: (id: string, updates: Partial<ContactList>) => set((state: AppState) => ({
        contactLists: state.contactLists.map((l: ContactList) => 
          l.id === id ? { ...l, ...updates } : l
        )
      })),
      deleteContactList: (id: string) => set((state: AppState) => ({
        contactLists: state.contactLists.filter((l: ContactList) => l.id !== id)
      })),
      addContactToList: (listId: string, contactId: string) => set((state: AppState) => ({
        contactLists: state.contactLists.map((l: ContactList) => 
          l.id === listId ? { 
            ...l, 
            contacts: [...l.contacts, state.contacts.find((c: Contact) => c.id === contactId)!],
            count: l.count + 1
          } : l
        )
      })),
      removeContactFromList: (listId: string, contactId: string) => set((state: AppState) => ({
        contactLists: state.contactLists.map((l: ContactList) => 
          l.id === listId ? { 
            ...l, 
            contacts: l.contacts.filter((c: Contact) => c.id !== contactId),
            count: Math.max(0, l.count - 1)
          } : l
        )
      })),
      
      // Stats
      globalStats: {
        sent: 2500,
        opened: 875,
        clicked: 325,
        openRate: 35,
        clickRate: 13
      },
      updateGlobalStats: () => {
        const campaigns = get().campaigns.filter((c: Campaign) => c.stats);
        const totalSent = campaigns.reduce((sum: number, c: Campaign) => sum + (c.stats?.sent || 0), 0);
        const totalOpened = campaigns.reduce((sum: number, c: Campaign) => sum + (c.stats?.opened || 0), 0);
        const totalClicked = campaigns.reduce((sum: number, c: Campaign) => sum + (c.stats?.clicked || 0), 0);
        
        set({
          globalStats: {
            sent: totalSent,
            opened: totalOpened,
            clicked: totalClicked,
            openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
            clickRate: totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0
          }
        });
      }
    }),
    {
      name: 'email-marketing-storage',
      merge: (persisted: unknown, current: AppState): AppState => {
        const p = persisted as Partial<AppState>;
        const toDate = (v: unknown): Date => (v instanceof Date ? v : new Date(v as string));
        return {
          ...current,
          ...p,
          campaigns: (p.campaigns ?? current.campaigns).map((c) => ({
            ...c,
            createdAt: toDate(c.createdAt),
            sentAt: c.sentAt ? toDate(c.sentAt) : undefined,
          })),
          templates: (p.templates ?? current.templates).map((t) => ({
            ...t,
            createdAt: toDate(t.createdAt),
            updatedAt: toDate(t.updatedAt),
          })),
          contacts: (p.contacts ?? current.contacts).map((c) => ({
            ...c,
            createdAt: toDate(c.createdAt),
          })),
        };
      },
    }
  )
);
