import React, { useState } from 'react';
import { 
  User, Bell, Shield, Zap, Database, Monitor, 
  Moon, Sun, CheckCircle2, Mail, 
  Slack, Globe, Save, Lock, Key, LogOut, History, 
  Smartphone, Code, Check, X, Server
} from 'lucide-react';
import { Theme } from '../App';
import { Currency, Language } from '../types';

type SettingsTab = 'general' | 'profile' | 'notifications' | 'security' | 'integrations';

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
  const [showSaveToast, setShowSaveToast] = useState(false);

  // State for various toggles and inputs
  const [toggles, setToggles] = useState({
    // Notifications
    emailNewLeads: true,
    emailInvoice: true,
    emailMarketing: false,
    pushMentions: true,
    pushReminders: true,
    desktopEnabled: false,
    
    // Security
    twoFactor: false,
    
    // Integrations Status
    gmail: true,
    slack: false,
    supabase: false,
    convex: false
  });

  // State for Integration Credentials (Mock)
  const [integrationConfig, setIntegrationConfig] = useState<{
      id: string | null;
      url: string;
      key: string;
  }>({ id: null, url: '', key: '' });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    // Simulate save
    if ((key as string).includes('gmail') || (key as string).includes('slack')) {
        handleSave();
    }
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

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform dark:bg-gray-900 ${checked ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
    </button>
  );

  const connectIntegration = (id: string) => {
      setIntegrationConfig({ id, url: '', key: '' });
  };

  const saveIntegration = () => {
      if (integrationConfig.id === 'supabase') setToggles(prev => ({ ...prev, supabase: true }));
      if (integrationConfig.id === 'convex') setToggles(prev => ({ ...prev, convex: true }));
      setIntegrationConfig({ id: null, url: '', key: '' });
      handleSave();
  };

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
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white" 
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
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                <div className="border-b border-gray-200 pb-4 mb-4 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('notifications')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose how you want to be notified.</p>
                </div>
                
                {/* Email Alerts */}
                <section>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center dark:text-white">
                        <Mail size={16} className="mr-2" /> Email Alerts
                    </h3>
                    <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-5 dark:bg-gray-900 dark:border-gray-800">
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">New Leads</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when a new lead is assigned to you.</p>
                            </div>
                            <Toggle checked={toggles.emailNewLeads} onChange={() => handleToggle('emailNewLeads')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Invoice Status</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when an invoice is paid or overdue.</p>
                            </div>
                            <Toggle checked={toggles.emailInvoice} onChange={() => handleToggle('emailInvoice')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Product Updates</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Receive news about new features and updates.</p>
                            </div>
                            <Toggle checked={toggles.emailMarketing} onChange={() => handleToggle('emailMarketing')} />
                        </div>
                    </div>
                </section>

                {/* In-App Notifications */}
                <section>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center dark:text-white">
                        <Bell size={16} className="mr-2" /> In-App & Push
                    </h3>
                    <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-5 dark:bg-gray-900 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Mentions</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Notify when you are mentioned in a comment.</p>
                            </div>
                            <Toggle checked={toggles.pushMentions} onChange={() => handleToggle('pushMentions')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Reminders</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Notify for upcoming tasks and meetings.</p>
                            </div>
                            <Toggle checked={toggles.pushReminders} onChange={() => handleToggle('pushReminders')} />
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Desktop Notifications</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Allow push notifications on your desktop.</p>
                            </div>
                            <Toggle checked={toggles.desktopEnabled} onChange={() => handleToggle('desktopEnabled')} />
                        </div>
                    </div>
                </section>

                <div className="pt-2 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and authentication.</p>
                </div>

                {/* Change Password */}
                <section className="bg-white border border-gray-200 rounded-lg p-6 dark:bg-gray-900 dark:border-gray-800">
                    <h3 className="text-sm font-medium text-gray-900 mb-6 flex items-center dark:text-white">
                        <Key size={16} className="mr-2" /> Change Password
                    </h3>
                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">Current Password</label>
                            <input type="password" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">New Password</label>
                            <input type="password" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-gray-300">Confirm New Password</label>
                            <input type="password" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-900 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white" />
                        </div>
                        <div className="pt-2">
                            <button onClick={handleSave} className="px-4 py-2 bg-gray-100 text-gray-900 rounded-md text-xs font-medium hover:bg-gray-200 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700">
                                Update Password
                            </button>
                        </div>
                    </div>
                </section>

                {/* Authentication Options */}
                <section className="bg-white border border-gray-200 rounded-lg p-6 dark:bg-gray-900 dark:border-gray-800">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center dark:text-white">
                        <Shield size={16} className="mr-2" /> Authentication Options
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security to your account.</p>
                        </div>
                        <Toggle checked={toggles.twoFactor} onChange={() => handleToggle('twoFactor')} />
                    </div>
                </section>

                {/* Login History */}
                <section className="bg-white border border-gray-200 rounded-lg overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                     <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-medium text-gray-900 flex items-center dark:text-white">
                            <History size={16} className="mr-2" /> Login History
                        </h3>
                     </div>
                     <div className="p-0">
                         <table className="w-full text-left text-sm">
                             <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                 <tr>
                                     <th className="px-6 py-2 text-xs font-medium">Device</th>
                                     <th className="px-6 py-2 text-xs font-medium">Location</th>
                                     <th className="px-6 py-2 text-xs font-medium">Date</th>
                                     <th className="px-6 py-2 text-xs font-medium text-right">Action</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                 <tr>
                                     <td className="px-6 py-3 flex items-center text-gray-900 dark:text-gray-200">
                                         <Monitor size={14} className="mr-2 text-gray-400" /> Mac OS Chrome
                                     </td>
                                     <td className="px-6 py-3 text-gray-500 text-xs dark:text-gray-400">San Francisco, US</td>
                                     <td className="px-6 py-3 text-gray-500 text-xs dark:text-gray-400">Active now</td>
                                     <td className="px-6 py-3 text-right">
                                         <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-900/20 dark:text-green-400">Current</span>
                                     </td>
                                 </tr>
                                 <tr>
                                     <td className="px-6 py-3 flex items-center text-gray-900 dark:text-gray-200">
                                         <Smartphone size={14} className="mr-2 text-gray-400" /> iPhone 13 App
                                     </td>
                                     <td className="px-6 py-3 text-gray-500 text-xs dark:text-gray-400">San Francisco, US</td>
                                     <td className="px-6 py-3 text-gray-500 text-xs dark:text-gray-400">2 days ago</td>
                                     <td className="px-6 py-3 text-right">
                                         <button className="text-xs text-gray-400 hover:text-red-600 flex items-center justify-end w-full dark:hover:text-red-400">
                                            <LogOut size={12} className="mr-1" /> Revoke
                                         </button>
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
                     </div>
                </section>
            </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                 <div className="border-b border-gray-200 pb-4 mb-4 dark:border-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('integrations')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connect your favorite tools and databases.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Gmail */}
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${toggles.gmail ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                <Mail size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Gmail</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sync emails and contacts.</p>
                            </div>
                        </div>
                        <Toggle checked={toggles.gmail} onChange={() => handleToggle('gmail')} />
                    </div>

                    {/* Slack */}
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${toggles.slack ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                <Slack size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Slack</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications in channels.</p>
                            </div>
                        </div>
                        <Toggle checked={toggles.slack} onChange={() => handleToggle('slack')} />
                    </div>

                    {/* Supabase */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                         <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${toggles.supabase ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                    <Database size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Supabase</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Connect your Supabase database.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => connectIntegration('supabase')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${toggles.supabase ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'}`}
                            >
                                {toggles.supabase ? 'Connected' : 'Connect'}
                            </button>
                        </div>
                        {integrationConfig.id === 'supabase' && (
                            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 dark:bg-gray-800/50 dark:border-gray-700 animate-[fadeIn_0.2s_ease-out]">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Project URL</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-green-500 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        placeholder="https://xyz.supabase.co"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">API Key (Anon)</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-green-500 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        placeholder="ey..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => setIntegrationConfig({id: null, url:'', key:''})} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Cancel</button>
                                    <button onClick={saveIntegration} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700">Save Connection</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Convex */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                         <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${toggles.convex ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                    <Code size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Convex</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Sync with your Convex backend.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => connectIntegration('convex')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${toggles.convex ? 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'}`}
                            >
                                {toggles.convex ? 'Connected' : 'Connect'}
                            </button>
                        </div>
                        {integrationConfig.id === 'convex' && (
                            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 dark:bg-gray-800/50 dark:border-gray-700 animate-[fadeIn_0.2s_ease-out]">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Deployment URL</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-orange-500 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        placeholder="https://glorious-wombat-123.convex.cloud"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => setIntegrationConfig({id: null, url:'', key:''})} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Cancel</button>
                                    <button onClick={saveIntegration} className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700">Save Connection</button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Settings;