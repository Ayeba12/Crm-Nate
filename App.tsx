import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import LeadsList from './components/LeadsList';
import TasksList from './components/TasksList';
import Settings from './components/Settings';
import Billing from './components/Billing';
import Invoices from './components/Invoices';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { Lead, StageId, ViewState, Invoice, InvoiceStatus, Currency, Language, Task, SavedList, TaskPriority, TaskStatus, SavedListType } from './types';
import confetti from 'canvas-confetti';

export type Theme = 'light' | 'dark' | 'system';

// Translation Dictionary
const DICTIONARY: Record<Language, Record<string, string>> = {
  English: {
    dashboard: 'Dashboard',
    pipelines: 'Pipelines',
    leads: 'Leads',
    tasks: 'Tasks',
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
    tasks: 'Tareas',
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
    tasks: 'Tâches',
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

const AuthenticatedApp: React.FC = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);

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

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch Leads
      const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (leadsData) {
        setLeads(leadsData.map(l => ({
          id: l.id,
          title: l.title,
          company: l.company,
          value: Number(l.value),
          stageId: l.stage_id as StageId,
          owner: user.email?.split('@')[0] || 'Me',
          tags: l.tags || [],
          createdAt: l.created_at,
          updatedAt: l.updated_at,
          email: l.company_email
        })));
      }

      // Fetch Invoices
      const { data: invoicesData } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (invoicesData) {
        setInvoices(invoicesData.map(i => ({
          id: i.id,
          clientName: i.client_name,
          amount: Number(i.amount),
          status: i.status as InvoiceStatus,
          dueDate: i.due_date,
          issueDate: i.issue_date,
          description: i.description
        })));
      }

      // Fetch Tasks
      const { data: tasksData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (tasksData) {
        setTasks(tasksData.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          priority: t.priority as TaskPriority,
          status: t.status as TaskStatus,
          dueDate: t.due_date ? t.due_date.split('T')[0] : '', // Format date if ISO
          ownerId: user.email?.split('@')[0] || 'Me',
          leadIds: t.lead_ids || [],
          createdAt: t.created_at,
          updatedAt: t.updated_at
        })));
      }

      // Fetch Saved Lists
      const { data: listsData } = await supabase.from('saved_lists').select('*').order('created_at', { ascending: false });
      if (listsData) {
        setSavedLists(listsData.map(l => ({
          id: l.id,
          name: l.name,
          description: l.description,
          type: l.type as SavedListType,
          leadIds: l.lead_ids || [],
          ownerId: user.email?.split('@')[0] || 'Me',
          createdAt: l.created_at,
          updatedAt: l.updated_at
        })));
      }
    };
    fetchData();
  }, [user]);

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

  // --- Lead Handlers ---
  const handleUpdateLeadStage = async (leadId: string, newStage: StageId) => {
    const originalLeads = [...leads];
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        if (newStage === StageId.WON && lead.stageId !== StageId.WON) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#a78bfa', '#ec4899', '#3b82f6'] });
          setStreak(s => s + 1);
        }
        return { ...lead, stageId: newStage, updatedAt: new Date().toISOString() };
      }
      return lead;
    }));

    const { error } = await supabase.from('leads').update({ stage_id: newStage, updated_at: new Date().toISOString() }).eq('id', leadId);
    if (error) { console.error(error); setLeads(originalLeads); }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    const originalLeads = [...leads];
    setLeads(prev => prev.map(lead => {
      if (lead.id === updatedLead.id) {
        if (updatedLead.stageId === StageId.WON && lead.stageId !== StageId.WON) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#a78bfa', '#ec4899', '#3b82f6'] });
          setStreak(s => s + 1);
        }
        return { ...updatedLead, updatedAt: new Date().toISOString() };
      }
      return lead;
    }));

    const { error } = await supabase.from('leads').update({
      title: updatedLead.title, company: updatedLead.company, value: updatedLead.value, company_email: updatedLead.email, updated_at: new Date().toISOString()
    }).eq('id', updatedLead.id);
    if (error) { console.error(error); setLeads(originalLeads); }
  };

  const handleDeleteLead = async (leadId: string) => {
    const original = [...leads];
    setLeads(prev => prev.filter(l => l.id !== leadId));
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (error) { console.error(error); setLeads(original); }
  };

  const handleAddLead = async (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
    const { data, error } = await supabase.from('leads').insert([{
      title: newLead.title, company: newLead.company, company_email: newLead.email, value: newLead.value, stage_id: newLead.stageId, user_id: user?.id,
      tags: newLead.tags
    }]).select().single();
    if (error) { console.error(error); setLeads(prev => prev.filter(l => l.id !== newLead.id)); }
    else if (data) { setLeads(prev => prev.map(l => l.id === newLead.id ? { ...l, id: data.id } : l)); }
  };

  const handleImportLeads = async (newLeads: Lead[]) => {
    if (!newLeads.length) return;

    // Prepare for DB
    const dbLeads = newLeads.map(l => ({
      title: l.title,
      company: l.company,
      company_email: l.email,
      value: l.value,
      stage_id: l.stageId,
      user_id: user?.id,
      tags: l.tags || ['Imported']
    }));

    const { data, error } = await supabase.from('leads').insert(dbLeads).select();

    if (error) {
      console.error('Import error:', error);
      alert("Failed to save imported leads.");
      return;
    }

    if (data) {
      const importedLeads: Lead[] = data.map(l => ({
        id: l.id,
        title: l.title,
        company: l.company,
        value: Number(l.value),
        stageId: l.stage_id as StageId,
        owner: user?.email?.split('@')[0] || 'Me',
        tags: l.tags || [],
        createdAt: l.created_at,
        updatedAt: l.updated_at,
        email: l.company_email
      }));
      setLeads(prev => [...importedLeads, ...prev]);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 }, colors: ['#111827', '#E5E7EB'] });
    }
  };

  // --- Invoice Handlers ---
  const handleAddInvoice = async (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
    const { data, error } = await supabase.from('invoices').insert([{
      client_name: newInvoice.clientName, amount: newInvoice.amount, status: newInvoice.status, due_date: newInvoice.dueDate, issue_date: newInvoice.issueDate, description: newInvoice.description, user_id: user?.id
    }]).select().single();
    if (error) { console.error(error); setInvoices(prev => prev.filter(i => i.id !== newInvoice.id)); }
    else if (data) { setInvoices(prev => prev.map(i => i.id === newInvoice.id ? { ...i, id: data.id } : i)); }
  };

  const handleEditInvoice = async (updatedInvoice: Invoice) => {
    const original = [...invoices];
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    const { error } = await supabase.from('invoices').update({
      client_name: updatedInvoice.clientName, amount: updatedInvoice.amount, status: updatedInvoice.status, due_date: updatedInvoice.dueDate, issue_date: updatedInvoice.issueDate, description: updatedInvoice.description
    }).eq('id', updatedInvoice.id);
    if (error) { console.error(error); setInvoices(original); }
  };

  const handleUpdateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    if (status === 'paid') {
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.5 }, colors: ['#22c55e', '#86efac'] });
    }
    await supabase.from('invoices').update({ status }).eq('id', id);
  };

  const handleDeleteInvoice = async (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    await supabase.from('invoices').delete().eq('id', id);
  };

  // --- Task Handlers ---
  const handleAddTask = async (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    const { data, error } = await supabase.from('tasks').insert([{
      title: newTask.title, description: newTask.description, priority: newTask.priority, status: newTask.status, due_date: newTask.dueDate, lead_ids: newTask.leadIds, user_id: user?.id
    }]).select().single();
    if (error) { console.error(error); setTasks(prev => prev.filter(t => t.id !== newTask.id)); }
    else if (data) { setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, id: data.id } : t)); }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    const original = [...tasks];
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    const { error } = await supabase.from('tasks').update({
      title: updatedTask.title, description: updatedTask.description, priority: updatedTask.priority, status: updatedTask.status, due_date: updatedTask.dueDate, lead_ids: updatedTask.leadIds, updated_at: new Date().toISOString()
    }).eq('id', updatedTask.id);
    if (error) { console.error(error); setTasks(original); }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  // --- Saved List Handlers ---
  const handleAddSavedList = async (newList: SavedList) => {
    setSavedLists(prev => [newList, ...prev]);
    const { data, error } = await supabase.from('saved_lists').insert([{
      name: newList.name, description: newList.description, type: newList.type, lead_ids: newList.leadIds, user_id: user?.id
    }]).select().single();
    if (error) { console.error(error); setSavedLists(prev => prev.filter(l => l.id !== newList.id)); }
    else if (data) { setSavedLists(prev => prev.map(l => l.id === newList.id ? { ...l, id: data.id } : l)); }
  };

  const handleUpdateSavedList = async (updatedList: SavedList) => {
    const original = [...savedLists];
    setSavedLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
    const { error } = await supabase.from('saved_lists').update({
      name: updatedList.name, description: updatedList.description, type: updatedList.type, lead_ids: updatedList.leadIds, updated_at: new Date().toISOString()
    }).eq('id', updatedList.id);
    if (error) { console.error(error); setSavedLists(original); }
  };

  const handleDeleteSavedList = async (id: string) => {
    setSavedLists(prev => prev.filter(l => l.id !== id));
    await supabase.from('saved_lists').delete().eq('id', id);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      <div className="relative z-10 flex h-full">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isMobile={isMobile}
          t={t}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 h-full overflow-hidden flex flex-col relative transition-all duration-300">
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
                  {user?.email?.substring(0, 2).toUpperCase() || 'JD'}
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden dark:bg-gray-900 dark:border-gray-800 animate-[fadeIn_0.1s_ease-out]">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.email}</p>
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
                        onClick={() => { signOut(); setShowProfileMenu(false); }}
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
              {currentView === 'leads' && (
                <LeadsList
                  leads={leads}
                  onDelete={handleDeleteLead}
                  onAdd={handleAddLead}
                  onUpdate={handleUpdateLead}
                  onImport={handleImportLeads}
                  t={t}
                  formatCurrency={formatCurrency}
                  savedLists={savedLists}
                  onAddSavedList={handleAddSavedList}
                  onUpdateSavedList={handleUpdateSavedList}
                  onDeleteSavedList={handleDeleteSavedList}
                  onAddTask={handleAddTask}
                />
              )}
              {currentView === 'tasks' && (
                <TasksList
                  tasks={tasks}
                  leads={leads}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  t={t}
                />
              )}
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

const AuthWrapper: React.FC<{ view: 'landing' | 'auth', setView: (v: 'landing' | 'auth') => void }> = ({ view, setView }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>;
  if (!user) {
    if (view === 'landing') return <LandingPage onGetStarted={() => setView('auth')} />;
    return <AuthPage onAuthSuccess={() => { }} onBack={() => setView('landing')} />;
  }
  return <AuthenticatedApp />;
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth'>('landing');
  return (
    <AuthProvider>
      <AuthWrapper view={view} setView={setView} />
    </AuthProvider>
  );
};

export default App;
