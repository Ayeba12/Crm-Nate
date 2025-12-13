import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import LeadsList from './components/LeadsList';
import Settings from './components/Settings';
import Billing from './components/Billing';
import Invoices from './components/Invoices';
import { Lead, StageId, ViewState, Invoice, InvoiceStatus, Currency, Language } from './types';
import confetti from 'canvas-confetti';

// Mock initial data
const INITIAL_LEADS: Lead[] = [
  { id: '1', title: 'Enterprise License', company: 'Acme Corp', value: 12000, stageId: StageId.NEW, owner: 'Alex', tags: ['Enterprise', 'SaaS'], createdAt: '2023-10-01' },
  { id: '2', title: 'Q4 Marketing Audit', company: 'Globex', value: 4500, stageId: StageId.CONTACTED, owner: 'Sarah', tags: ['Service'], createdAt: '2023-10-02' },
  { id: '3', title: 'Consulting Retainer', company: 'Soylent Corp', value: 8000, stageId: StageId.QUALIFIED, owner: 'Alex', tags: ['Retainer'], createdAt: '2023-10-03' },
  { id: '4', title: 'Mobile App Dev', company: 'Initech', value: 25000, stageId: StageId.PROPOSAL, owner: 'Mike', tags: ['Dev', 'Mobile'], createdAt: '2023-10-05' },
  { id: '5', title: 'Website Redesign', company: 'Umbrella Corp', value: 15000, stageId: StageId.WON, owner: 'Sarah', tags: ['Design'], createdAt: '2023-09-20' },
  { id: '6', title: 'SEO Package', company: 'Stark Ind', value: 3000, stageId: StageId.LOST, owner: 'Mike', tags: ['Marketing'], createdAt: '2023-09-15' },
  { id: '7', title: 'Cloud Migration', company: 'Cyberdyne', value: 55000, stageId: StageId.QUALIFIED, owner: 'Alex', tags: ['Cloud'], createdAt: '2023-10-08' },
  { id: '8', title: 'Security Audit', company: 'Massive Dynamic', value: 9000, stageId: StageId.NEW, owner: 'Sarah', tags: ['Security'], createdAt: '2023-10-10' },
];

const INITIAL_INVOICES: Invoice[] = [
    { id: 'INV-2024', clientName: 'Acme Corp', amount: 12000, status: 'pending', issueDate: '2023-10-25', dueDate: '2023-11-25', description: 'Enterprise License Q4' },
    { id: 'INV-2023', clientName: 'Globex', amount: 4500, status: 'draft', issueDate: '2023-10-20', dueDate: '2023-11-20', description: 'Marketing Audit Deposit' },
    { id: 'INV-2022', clientName: 'Stark Ind', amount: 3000, status: 'paid', issueDate: '2023-09-15', dueDate: '2023-10-15', description: 'SEO Optimization' },
    { id: 'INV-2021', clientName: 'Wayne Ent', amount: 8500, status: 'overdue', issueDate: '2023-09-01', dueDate: '2023-10-01', description: 'Security Consultation' },
];

export type Theme = 'light' | 'dark' | 'system';

// Translation Dictionary
const DICTIONARY: Record<Language, Record<string, string>> = {
  English: {
    dashboard: 'Dashboard',
    pipelines: 'Pipelines',
    leads: 'Leads',
    invoices: 'Invoices',
    billing: 'Billing',
    settings: 'Settings',
    trialPlan: 'Trial Plan',
    upgrade: 'Upgrade',
    daysRemaining: 'days remaining',
    totalValue: 'Total Value',
    winRate: 'Win Rate',
    newLeads: 'New Leads',
    revenue: 'Revenue',
    recentActivity: 'Recent Activity',
    addLead: 'Add Lead',
    importCsv: 'Import CSV',
    search: 'Search...',
    createInvoice: 'Create Invoice',
    outstanding: 'Outstanding',
    collected: 'Collected',
    manageSubscription: 'Manage Subscription',
    paymentMethod: 'Payment Method',
    invoiceHistory: 'Invoice History',
    generalSettings: 'General Settings',
    profile: 'Profile',
    notifications: 'Notifications',
    security: 'Security',
    integrations: 'Integrations',
    saveChanges: 'Save Changes',
    workspaceName: 'Workspace Name',
    companyAddress: 'Company Address',
    currency: 'Currency',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    system: 'System'
  },
  Spanish: {
    dashboard: 'Tablero',
    pipelines: 'Embudos',
    leads: 'Prospectos',
    invoices: 'Facturas',
    billing: 'Facturación',
    settings: 'Ajustes',
    trialPlan: 'Plan de Prueba',
    upgrade: 'Mejorar',
    daysRemaining: 'días restantes',
    totalValue: 'Valor Total',
    winRate: 'Tasa de Ganancia',
    newLeads: 'Nuevos Prospectos',
    revenue: 'Ingresos',
    recentActivity: 'Actividad Reciente',
    addLead: 'Agregar',
    importCsv: 'Importar CSV',
    search: 'Buscar...',
    createInvoice: 'Crear Factura',
    outstanding: 'Pendiente',
    collected: 'Cobrado',
    manageSubscription: 'Suscripción',
    paymentMethod: 'Método de Pago',
    invoiceHistory: 'Historial',
    generalSettings: 'Ajustes Generales',
    profile: 'Perfil',
    notifications: 'Notificaciones',
    security: 'Seguridad',
    integrations: 'Integraciones',
    saveChanges: 'Guardar Cambios',
    workspaceName: 'Nombre del Espacio',
    companyAddress: 'Dirección',
    currency: 'Moneda',
    language: 'Idioma',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema'
  },
  French: {
    dashboard: 'Tableau de bord',
    pipelines: 'Pipelines',
    leads: 'Pistes',
    invoices: 'Factures',
    billing: 'Facturation',
    settings: 'Paramètres',
    trialPlan: 'Plan d\'Essai',
    upgrade: 'Améliorer',
    daysRemaining: 'jours restants',
    totalValue: 'Valeur Totale',
    winRate: 'Taux de Réussite',
    newLeads: 'Nouvelles Pistes',
    revenue: 'Revenus',
    recentActivity: 'Activité Récente',
    addLead: 'Ajouter',
    importCsv: 'Importer CSV',
    search: 'Rechercher...',
    createInvoice: 'Créer Facture',
    outstanding: 'En attente',
    collected: 'Collecté',
    manageSubscription: 'Gérer l\'abonnement',
    paymentMethod: 'Moyen de Paiement',
    invoiceHistory: 'Historique',
    generalSettings: 'Paramètres Généraux',
    profile: 'Profil',
    notifications: 'Notifications',
    security: 'Sécurité',
    integrations: 'Intégrations',
    saveChanges: 'Enregistrer',
    workspaceName: 'Nom de l\'Espace',
    companyAddress: 'Adresse',
    currency: 'Devise',
    language: 'Langue',
    light: 'Clair',
    dark: 'Sombre',
    system: 'Système'
  }
};

const RATES = {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79
};

const SYMBOLS = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [streak, setStreak] = useState(3);
  const [companyAddress, setCompanyAddress] = useState<string>('123 Business Avenue\nSan Francisco, CA 94103');
  const [theme, setTheme] = useState<Theme>('light');
  const [workspaceName, setWorkspaceName] = useState('Acme Inc.');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [language, setLanguage] = useState<Language>('English');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Helpers
  const t = (key: string) => DICTIONARY[language][key] || key;
  
  const formatCurrency = (value: number) => {
      const rate = RATES[currency];
      const converted = value * rate;
      return `${SYMBOLS[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleUpdateLeadStage = (leadId: string, newStage: StageId) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        if (newStage === StageId.WON && lead.stageId !== StageId.WON) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#a78bfa', '#ec4899', '#3b82f6']
            });
            setStreak(s => s + 1);
        }
        return { ...lead, stageId: newStage, updatedAt: new Date().toISOString() };
      }
      return lead;
    }));
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(lead => {
        if (lead.id === updatedLead.id) {
            if (updatedLead.stageId === StageId.WON && lead.stageId !== StageId.WON) {
                 confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#a78bfa', '#ec4899', '#3b82f6']
                });
                setStreak(s => s + 1);
            }
            return { ...updatedLead, updatedAt: new Date().toISOString() };
        }
        return lead;
    }));
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const handleAddLead = (newLead: Lead) => {
      setLeads(prev => [newLead, ...prev]);
  };

  const handleImportLeads = (newLeads: Lead[]) => {
      setLeads(prev => [...prev, ...newLeads]);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#111827', '#E5E7EB'] 
      });
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
      setInvoices(prev => [newInvoice, ...prev]);
  };
  
  const handleEditInvoice = (updatedInvoice: Invoice) => {
      setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  };

  const handleUpdateInvoiceStatus = (id: string, status: InvoiceStatus) => {
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
      if (status === 'paid') {
        confetti({
            particleCount: 40,
            spread: 40,
            origin: { y: 0.5 },
            colors: ['#22c55e', '#86efac']
        });
      }
  };

  const handleDeleteInvoice = (id: string) => {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      <div className="relative z-10 flex h-full">
        {/* Sidebar */}
        <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            isMobile={isMobile} 
            t={t} 
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content */}
        <main className="flex-1 h-full overflow-hidden flex flex-col relative transition-all duration-300">
          
          {/* Top Header */}
          <div className="h-16 flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white shrink-0 dark:bg-gray-900 dark:border-gray-800 transition-colors">
             <div className="flex items-center space-x-4">
                <h1 className="text-sm font-semibold text-gray-900 capitalize dark:text-white">
                    {t(currentView)}
                </h1>
                <span className="text-gray-300 h-4 border-r border-gray-300 dark:border-gray-700"></span>
                <span className="text-sm text-gray-500 capitalize dark:text-gray-400">{workspaceName}</span>
             </div>
             
             <div className="flex items-center space-x-4">
                 <div className="hidden md:flex items-center px-2 py-1 bg-gray-100 rounded-md border border-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                     <span className="mr-1.5">🔥</span> {streak} Day Streak
                 </div>
                 
                 <div className="relative" ref={profileMenuRef}>
                     <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium dark:bg-gray-700 hover:ring-2 hover:ring-gray-200 dark:hover:ring-gray-600 transition-all focus:outline-none"
                     >
                         JD
                     </button>

                     {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden dark:bg-gray-900 dark:border-gray-800 animate-[fadeIn_0.1s_ease-out]">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">John Doe</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                            </div>
                            <div className="py-1">
                                <button 
                                    onClick={() => { setCurrentView('settings'); setShowProfileMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {t('settings')}
                                </button>
                                <button 
                                    onClick={() => setShowProfileMenu(false)}
                                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                     )}
                 </div>
             </div>
          </div>

          {/* View Container */}
          <div className="flex-1 overflow-auto bg-gray-50 p-6 scroll-smooth dark:bg-gray-950 transition-colors">
            <div className="max-w-7xl mx-auto h-full">
                {currentView === 'dashboard' && <Dashboard leads={leads} onViewChange={setCurrentView} onImportLeads={handleImportLeads} theme={theme} t={t} formatCurrency={formatCurrency} currency={currency} />}
                {currentView === 'pipelines' && (
                  <KanbanBoard 
                    leads={leads} 
                    onUpdateStage={handleUpdateLeadStage} 
                    onDelete={handleDeleteLead}
                    onUpdate={handleUpdateLead}
                    onAdd={handleAddLead}
                    formatCurrency={formatCurrency}
                  />
                )}
                {currentView === 'leads' && <LeadsList leads={leads} onDelete={handleDeleteLead} onAdd={handleAddLead} onUpdate={handleUpdateLead} t={t} formatCurrency={formatCurrency} />}
                {currentView === 'invoices' && <Invoices invoices={invoices} leads={leads} onAdd={handleAddInvoice} onEdit={handleEditInvoice} onUpdateStatus={handleUpdateInvoiceStatus} onDelete={handleDeleteInvoice} companyAddress={companyAddress} t={t} formatCurrency={formatCurrency} />}
                {currentView === 'billing' && <Billing t={t} formatCurrency={formatCurrency} />}
                {currentView === 'settings' && (
                  <Settings 
                    companyAddress={companyAddress} 
                    onUpdateAddress={setCompanyAddress} 
                    theme={theme}
                    onUpdateTheme={setTheme}
                    workspaceName={workspaceName}
                    setWorkspaceName={setWorkspaceName}
                    currency={currency}
                    setCurrency={setCurrency}
                    language={language}
                    setLanguage={setLanguage}
                    t={t}
                  />
                )}
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default App;