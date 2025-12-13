import React, { useState } from 'react';
import { 
  User, Bell, Shield, Zap, Database, Monitor, 
  Moon, Sun, CheckCircle2, RefreshCw, Mail, 
  Slack, MessageCircle, FileText, MessageSquare,
  Smartphone, Globe, Save
} from 'lucide-react';
import { Theme } from '../App';
import { Currency, Language } from '../types';

type SettingsTab = 'general' | 'profile' | 'notifications' | 'security' | 'integrations';

type ToggleState = {
    emailNotifs: boolean;
    desktopNotifs: boolean;
    marketingEmails: boolean;
    twoFactor: boolean;
    gmail: boolean;
    slack: boolean;
};

interface IntegrationCardProps {
    icon: React.ElementType;
    name: string;
    description: string;
    connected: boolean;
    onToggle?: () => void;
}

interface SettingsProps {
    companyAddress: string;
    onUpdateAddress: (address: string) => void;
    theme: Theme;
    onUpdateTheme: (theme: Theme) => void;
    workspaceName: string;
    setWorkspaceName: (name: string) => void;
    currency: Currency;
    setCurrency: (c: Currency) => void;
    language: Language;
    setLanguage: (l: Language) => void;
    t: (key: string) => string;
}

const Settings: React.FC<SettingsProps> = ({ 
    companyAddress, onUpdateAddress, 
    theme, onUpdateTheme,
    workspaceName, setWorkspaceName,
    currency, setCurrency,
    language, setLanguage,
    t
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [showSaveToast, setShowSaveToast] = useState(false);

  const [toggles, setToggles] = useState<ToggleState>({
    emailNotifs: true,
    desktopNotifs: false,
    marketingEmails: false,
    twoFactor: true,
    gmail: true,
    slack: false,
  });

  const handleToggle = (key: keyof ToggleState) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
      setShowSaveToast(true);
      setTimeout(() => {
          setShowSaveToast(false);
      }, 3000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: t('generalSettings'), icon: Globe },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'integrations', label: t('integrations'), icon: Zap },
  ];

  const IntegrationCard: React.FC<IntegrationCardProps> = ({ icon: Icon, name, description, connected, onToggle }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700">
        <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${connected ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            </div>
        </div>
        <button 
            onClick={onToggle}
            disabled={!onToggle}
            className={`
                relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none
                ${connected ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}
                ${!onToggle ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
        >
            <span 
                className={`
                    inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform dark:bg-gray-900
                    ${connected ? 'translate-x-[18px]' : 'translate-x-[2px]'}
                `} 
            />
        </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto pb-32 relative">
      
      {/* Toast Notification */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 dark:bg-white dark:text-gray-900">
                <div className="bg-green-500 rounded-full p-0.5">
                    <CheckCircle2 size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium">{t('saveChanges')} Success</span>
            </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-56 shrink-0">
        <nav className="flex flex-col space-y-0.5">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${activeTab === tab.id 
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200'}
                    `}
                >
                    <tab.icon size={16} className={`mr-3 ${activeTab === tab.id ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                    {tab.label}
                </button>
            ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="border-b border-gray-200 pb-4 mb-4 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('generalSettings')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your workspace and appearance.</p>
                </div>

                <section>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 dark:text-white">Theme</h3>
                    <div className="grid grid-cols-3 gap-3 max-w-md">
                        <button 
                            onClick={() => onUpdateTheme('light')}
                            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${theme === 'light' ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900 dark:border-white dark:bg-gray-800 dark:ring-white' : 'border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                        >
                            <Sun className={`${theme === 'light' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'} mb-2`} size={18} />
                            <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{t('light')}</span>
                        </button>
                        <button 
                            onClick={() => onUpdateTheme('dark')}
                            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${theme === 'dark' ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900 dark:border-white dark:bg-gray-800 dark:ring-white' : 'border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                        >
                            <Moon className={`${theme === 'dark' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'} mb-2`} size={18} />
                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{t('dark')}</span>
                        </button>
                        <button 
                            onClick={() => onUpdateTheme('system')}
                            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${theme === 'system' ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900 dark:border-white dark:bg-gray-800 dark:ring-white' : 'border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                        >
                            <Monitor className={`${theme === 'system' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'} mb-2`} size={18} />
                            <span className={`text-xs font-medium ${theme === 'system' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{t('system')}</span>
                        </button>
                    </div>
                </section>

                <section className="pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 dark:text-white">Workspace Details</h3>
                    <div className="space-y-3 max-w-lg">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">{t('workspaceName')}</label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white dark:focus:border-white" 
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">{t('companyAddress')}</label>
                            <textarea 
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none h-20 resize-none font-sans dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white" 
                                value={companyAddress}
                                onChange={(e) => onUpdateAddress(e.target.value)}
                                placeholder="Enter your company address..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">{t('currency')}</label>
                                <select 
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as Currency)}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">{t('language')}</label>
                                <select 
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as Language)}
                                >
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button 
                        onClick={handleSave}
                        className="flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
                        <Save size={16} className="mr-2" />
                        {t('saveChanges')}
                    </button>
                </div>
            </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="border-b border-gray-200 pb-4 mb-4 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('profile')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal information.</p>
                </div>

                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-sm flex items-center justify-center text-xl font-bold text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                        JD
                    </div>
                    <div>
                        <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors mr-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
                            Upload new picture
                        </button>
                        <button className="text-xs text-red-600 font-medium hover:underline dark:text-red-400">
                            Remove
                        </button>
                    </div>
                </div>

                <div className="space-y-4 max-w-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">First Name</label>
                            <input type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white" defaultValue="John" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">Last Name</label>
                            <input type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white" defaultValue="Doe" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">Email Address</label>
                        <input type="email" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white" defaultValue="john@acme.inc" />
                    </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button 
                        onClick={handleSave}
                        className="flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
                        <Save size={16} className="mr-2" />
                        {t('saveChanges')}
                    </button>
                </div>
            </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="border-b border-gray-200 pb-4 mb-4 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('notifications')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose what you want to be notified about.</p>
                </div>
                {/* ... existing notification content ... */}
                 <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button 
                        onClick={handleSave}
                        className="flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
                        <Save size={16} className="mr-2" />
                        {t('saveChanges')}
                    </button>
                </div>
            </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                <div className="border-b border-gray-200 pb-4 mb-4 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('security')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and security settings.</p>
                </div>
                {/* ... existing security content ... */}
                 <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button 
                        onClick={handleSave}
                        className="flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
                        <Save size={16} className="mr-2" />
                        {t('saveChanges')}
                    </button>
                </div>
            </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                 <div className="border-b border-gray-200 pb-4 mb-4 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('integrations')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connect your favorite tools.</p>
                </div>

                <div className="space-y-3">
                    <IntegrationCard 
                        icon={Mail} 
                        name="Gmail" 
                        description="Sync your emails to view them in the dashboard."
                        connected={toggles.gmail}
                        onToggle={() => handleToggle('gmail')}
                    />
                     <IntegrationCard 
                        icon={Slack} 
                        name="Slack" 
                        description="Receive notifications in your Slack channels."
                        connected={toggles.slack}
                        onToggle={() => handleToggle('slack')}
                    />
                     <IntegrationCard 
                        icon={Database} 
                        name="Supabase" 
                        description="Connect your Supabase database."
                        connected={connectionStatus === 'connected'}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Settings;