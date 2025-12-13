import React, { useState, useRef, useEffect } from 'react';
import { Lead, StageId, ViewState, Currency } from '../types';
import { Theme } from '../App';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area
} from 'recharts';
import { ArrowUpRight, DollarSign, Euro, PoundSterling, Users, Trophy, Search, Bell, Upload, Plus, Check, MessageSquare, FileText, AlertCircle, X } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  onViewChange: (view: ViewState) => void;
  onImportLeads: (leads: Lead[]) => void;
  theme: Theme;
  t: (key: string) => string;
  formatCurrency: (value: number) => string;
  currency: Currency;
}

// Mock Notifications Data
const NOTIFICATIONS = [
    { id: 1, title: 'New Lead Assigned', message: 'You have been assigned a new lead: TechCorp', time: '2 min ago', read: false, type: 'lead' },
    { id: 2, title: 'Invoice Paid', message: 'Invoice #INV-2024 has been paid by Acme Corp', time: '1 hour ago', read: false, type: 'invoice' },
    { id: 3, title: 'Meeting Reminder', message: 'Demo call with Globex in 15 minutes', time: '3 hours ago', read: true, type: 'meeting' },
    { id: 4, title: 'System Update', message: 'LumenCRM will undergo maintenance at midnight', time: '1 day ago', read: true, type: 'system' },
    { id: 5, title: 'New Comment', message: 'Sarah commented on the Q4 Marketing Audit', time: '2 days ago', read: true, type: 'lead' },
    { id: 6, title: 'Task Due', message: 'Follow up with Soylent Corp', time: '2 days ago', read: true, type: 'task' },
    { id: 7, title: 'New Lead Assigned', message: 'You have been assigned a new lead: Initech', time: '3 days ago', read: true, type: 'lead' },
    { id: 8, title: 'Invoice Overdue', message: 'Invoice #INV-2021 is now overdue', time: '4 days ago', read: true, type: 'invoice' },
];

const Dashboard: React.FC<DashboardProps> = ({ leads, onViewChange, onImportLeads, theme, t, formatCurrency, currency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine current effective theme for chart colors
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setShowNotifications(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Metric Calculations
  const totalValue = leads.reduce((acc, lead) => acc + lead.value, 0);
  const wonLeads = leads.filter(l => l.stageId === StageId.WON);
  const winRate = leads.length > 0 ? (wonLeads.length / leads.length) * 100 : 0;
  const newLeadsCount = leads.filter(l => l.stageId === StageId.NEW).length;

  // Chart Data Preparation
  const pipelineData = [
    { name: 'New', count: leads.filter(l => l.stageId === StageId.NEW).length, color: isDark ? '#4B5563' : '#E5E7EB' },
    { name: 'Contact', count: leads.filter(l => l.stageId === StageId.CONTACTED).length, color: isDark ? '#6B7280' : '#D1D5DB' },
    { name: 'Qualified', count: leads.filter(l => l.stageId === StageId.QUALIFIED).length, color: isDark ? '#9CA3AF' : '#9CA3AF' },
    { name: 'Proposal', count: leads.filter(l => l.stageId === StageId.PROPOSAL).length, color: isDark ? '#D1D5DB' : '#6B7280' },
    { name: 'Won', count: leads.filter(l => l.stageId === StageId.WON).length, color: isDark ? '#F3F4F6' : '#111827' },
  ];

  const trendData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ];

  const getCurrencyIcon = () => {
    switch (currency) {
        case 'EUR': return Euro;
        case 'GBP': return PoundSterling;
        default: return DollarSign;
    }
  };

  const CurrencyIcon = getCurrencyIcon();

  const getNotificationIcon = (type: string) => {
      switch(type) {
          case 'invoice': return <FileText size={16} className="text-green-600 dark:text-green-400" />;
          case 'lead': return <Users size={16} className="text-blue-600 dark:text-blue-400" />;
          case 'meeting': return <MessageSquare size={16} className="text-purple-600 dark:text-purple-400" />;
          case 'system': return <AlertCircle size={16} className="text-orange-600 dark:text-orange-400" />;
          default: return <AlertCircle size={16} className="text-gray-600 dark:text-gray-400" />;
      }
  };

  const StatCard = ({ title, value, subtext, icon: Icon }: any) => (
    <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:bg-gray-900 dark:border-gray-800 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-gray-500 text-sm font-medium dark:text-gray-400">{title}</h3>
        <Icon size={16} className="text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-2xl font-semibold text-gray-900 tracking-tight mb-1 dark:text-white">{value}</p>
      <div className="flex items-center">
        <span className="flex items-center text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded dark:bg-green-900/30 dark:text-green-400">
           <ArrowUpRight size={10} className="mr-0.5" /> 12%
        </span>
        <span className="text-xs text-gray-400 ml-2 dark:text-gray-500">{subtext}</span>
      </div>
    </div>
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const newLeads: Lead[] = [];
      const getVal = (rowParts: string[], keys: string[], defaultIdx: number) => {
        const idx = headers.findIndex(h => keys.some(k => h.includes(k)));
        if (idx !== -1 && rowParts[idx]) return rowParts[idx].trim().replace(/^"|"$/g, '');
        if (rowParts[defaultIdx]) return rowParts[defaultIdx].trim().replace(/^"|"$/g, '');
        return '';
      };

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const parts = lines[i].split(','); 
        const title = getVal(parts, ['title', 'name', 'lead'], 0);
        const company = getVal(parts, ['company', 'organization'], 1);
        const valueStr = getVal(parts, ['value', 'amount', 'price'], 2);
        const owner = getVal(parts, ['owner', 'assigned'], 3);
        
        if (title && company) {
            newLeads.push({
                id: Math.random().toString(36).substr(2, 9),
                title: title,
                company: company,
                value: parseFloat(valueStr) || 0,
                stageId: StageId.NEW,
                owner: owner || 'Unassigned',
                tags: ['Imported'],
                createdAt: new Date().toISOString().split('T')[0]
            });
        }
      }

      if (newLeads.length > 0) {
        onImportLeads(newLeads);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Sort leads by updated date (if available) or created date
  const sortedLeads = [...leads].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
  });

  const filteredRecentLeads = sortedLeads
    .filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.owner.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);
    
  const getRelativeTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 pb-20 animate-[fadeIn_0.3s_ease-out]">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
         <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
         </div>

         <div className="flex items-center gap-3">
             {/* Notifications Dropdown */}
             <div className="relative" ref={notificationRef}>
                 <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 border rounded-lg transition-all shadow-sm group ${showNotifications ? 'bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'}`}
                 >
                     <Bell size={16} />
                     <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                 </button>

                 {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden dark:bg-gray-900 dark:border-gray-800 animate-[fadeIn_0.1s_ease-out]">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            <span className="text-[10px] text-blue-600 cursor-pointer hover:underline font-medium dark:text-blue-400">Mark all read</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {NOTIFICATIONS.slice(0, 4).map(notif => (
                                <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0 dark:border-gray-800 dark:hover:bg-gray-800/50 ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                                     <div className="flex gap-3">
                                         <div className={`mt-0.5 p-1.5 rounded-full ${!notif.read ? 'bg-white shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                            {getNotificationIcon(notif.type)}
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex justify-between items-start mb-0.5">
                                                 <h4 className={`text-xs ${!notif.read ? 'text-gray-900 font-semibold dark:text-white' : 'text-gray-600 font-medium dark:text-gray-400'}`}>{notif.title}</h4>
                                                 <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                                             </div>
                                             <p className="text-[11px] text-gray-500 leading-snug dark:text-gray-400">{notif.message}</p>
                                         </div>
                                     </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center dark:bg-gray-800 dark:border-gray-800">
                            <button 
                                onClick={() => { setShowNotifications(false); setShowAllNotifications(true); }}
                                className="text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                View All Notifications
                            </button>
                        </div>
                    </div>
                 )}
             </div>
             
             <div className="h-6 w-px bg-gray-200 hidden md:block dark:bg-gray-800"></div>

             <button 
                onClick={handleImportClick}
                className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-700"
             >
                 <Upload size={14} className="mr-2 text-gray-500 dark:text-gray-400" />
                 {t('importCsv')}
             </button>
             
             <button 
                onClick={() => onViewChange('leads')}
                className="flex items-center px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-all shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
             >
                 <Plus size={14} className="mr-2" />
                 {t('addLead')}
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title={t('totalValue')} 
          value={formatCurrency(totalValue)} 
          subtext="vs last month"
          icon={CurrencyIcon}
        />
        <StatCard 
          title={t('winRate')} 
          value={`${winRate.toFixed(1)}%`} 
          subtext="vs last month"
          icon={Trophy}
        />
        <StatCard 
          title={t('newLeads')} 
          value={newLeadsCount} 
          subtext="vs last week"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5 dark:bg-gray-900 dark:border-gray-800 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pipeline Stages</h3>
          </div>
          <div className="h-[250px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={pipelineData} barSize={32}>
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11 }} 
                    dy={10}
                />
                <YAxis hide />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                        borderRadius: '6px', 
                        border: isDark ? '1px solid #374151' : '1px solid #E5E7EB', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        fontSize: '12px',
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        color: isDark ? '#F3F4F6' : '#111827'
                    }}
                />
                <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 dark:bg-gray-900 dark:border-gray-800 transition-colors">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 dark:text-white">{t('revenue')}</h3>
          <p className="text-xs text-gray-500 mb-6 dark:text-gray-400">Last 7 days</p>
          <div className="h-[250px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? '#E5E7EB' : '#111827'} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={isDark ? '#E5E7EB' : '#111827'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                    contentStyle={{ 
                        borderRadius: '6px', 
                        border: isDark ? '1px solid #374151' : '1px solid #E5E7EB', 
                        fontSize: '12px',
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        color: isDark ? '#F3F4F6' : '#111827'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke={isDark ? '#E5E7EB' : '#111827'} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 dark:bg-gray-900 dark:border-gray-800 transition-colors">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 dark:text-white">
            {searchQuery ? 'Search Results' : t('recentActivity')}
        </h3>
        <div className="space-y-1">
            {filteredRecentLeads.length > 0 ? (
                filteredRecentLeads.map((lead, i) => (
                    <div key={lead.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-default group dark:hover:bg-gray-800">
                        <div className="flex items-center space-x-3">
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${i === 0 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{lead.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {lead.company} • Added by {lead.owner}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 font-mono dark:text-gray-500">
                            {getRelativeTime(lead.updatedAt || lead.createdAt)}
                        </span>
                    </div>
                ))
            ) : (
                <div className="text-center py-6 text-gray-400 text-sm dark:text-gray-500">
                    No leads found matching "{searchQuery}"
                </div>
            )}
        </div>
      </div>

      {/* Expanded Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] dark:bg-black/40 p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200 flex flex-col max-h-[80vh] dark:bg-gray-900 dark:border-gray-800">
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Notifications</h3>
                    <button 
                        onClick={() => setShowAllNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                        <X size={16} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {NOTIFICATIONS.map(notif => (
                         <div key={notif.id} className={`px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0 dark:border-gray-800 dark:hover:bg-gray-800/50 ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                             <div className="flex gap-4">
                                 <div className={`mt-0.5 p-2 h-fit rounded-full ${!notif.read ? 'bg-white shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    {getNotificationIcon(notif.type)}
                                 </div>
                                 <div className="flex-1">
                                     <div className="flex justify-between items-start mb-1">
                                         <h4 className={`text-sm ${!notif.read ? 'text-gray-900 font-semibold dark:text-white' : 'text-gray-700 font-medium dark:text-gray-300'}`}>{notif.title}</h4>
                                         <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                                     </div>
                                     <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">{notif.message}</p>
                                     <div className="mt-2 flex space-x-2">
                                        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">View details</button>
                                        {!notif.read && (
                                            <button className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300">Mark as read</button>
                                        )}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    ))}
                    <div className="p-4 text-center text-xs text-gray-400 border-t border-gray-50 dark:border-gray-800">
                        End of notifications
                    </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;