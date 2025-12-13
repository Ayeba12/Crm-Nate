import React from 'react';
import { LayoutDashboard, Kanban, Users, CreditCard, Settings, Hexagon, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  isMobile: boolean;
  t: (key: string) => string;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isMobile, t, isCollapsed, toggleCollapse }) => {
  const menuItems: { id: ViewState; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'dashboard', icon: LayoutDashboard },
    { id: 'pipelines', label: 'pipelines', icon: Kanban },
    { id: 'leads', label: 'leads', icon: Users },
    { id: 'invoices', label: 'invoices', icon: FileText },
    { id: 'billing', label: 'billing', icon: CreditCard },
  ];

  const settingsItem = { id: 'settings', label: 'settings', icon: Settings };

  const sidebarClasses = isMobile
    ? "fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 z-50 flex flex-row items-center justify-around dark:bg-gray-900 dark:border-gray-800"
    : `${isCollapsed ? 'w-20 px-2' : 'w-64 px-3'} h-full bg-gray-50 border-r border-gray-200 flex flex-col py-6 z-20 dark:bg-gray-900 dark:border-gray-800 transition-all duration-300 relative`;

  const renderNavItem = (item: { id: string; label: string; icon: React.ElementType }, isMobileView: boolean) => {
    const isActive = currentView === item.id;
    const Icon = item.icon;
    
    return (
      <button
        key={item.id}
        onClick={() => onViewChange(item.id as ViewState)}
        className={`
          relative flex items-center transition-all duration-150
          ${isMobileView 
            ? 'flex-col justify-center p-2' 
            : `w-full py-2 rounded-md text-sm font-medium mb-0.5 ${isCollapsed ? 'justify-center px-0' : 'px-3'}`
          }
          ${isActive && !isMobileView 
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700' 
              : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
          }
          ${isActive && isMobileView ? 'text-gray-900 dark:text-white' : ''}
        `}
        title={isCollapsed ? t(item.label) : ''}
      >
        <div className={isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}>
          <Icon size={18} />
        </div>
        
        {!isMobileView && !isCollapsed && (
          <span className="ml-3 capitalize animate-[fadeIn_0.2s_ease-out]">
            {t(item.label)}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav className={sidebarClasses}>
      {/* Logo Area */}
      {!isMobile && (
        <div className={`flex items-center mb-8 ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'}`}>
          <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-lg text-white dark:bg-white dark:text-gray-900 flex-shrink-0 transition-all">
            <Hexagon size={18} strokeWidth={3} />
          </div>
          {!isCollapsed && (
             <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white whitespace-nowrap overflow-hidden animate-[fadeIn_0.2s_ease-out]">Lumen</span>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <div className={`flex ${isMobile ? 'flex-row w-full justify-around' : 'flex-col space-y-0.5'}`}>
        {menuItems.map((item) => renderNavItem(item, isMobile))}
        {isMobile && renderNavItem(settingsItem, true)}
      </div>

      {/* Footer Area Desktop */}
      {!isMobile && (
        <>
            <div className="mt-auto px-1">
                <div className="mb-4">
                    {renderNavItem(settingsItem, false)}
                </div>

                {!isCollapsed && (
                    <div className="p-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 animate-[fadeIn_0.2s_ease-out]">
                        <p className="text-xs font-semibold text-gray-900 mb-0.5 dark:text-white">{t('trialPlan')}</p>
                        <p className="text-[11px] text-gray-500 mb-3 dark:text-gray-400">12 {t('daysRemaining')}.</p>
                        <button className="w-full py-1.5 bg-gray-900 rounded-md text-[11px] font-medium text-white hover:bg-gray-800 transition-colors dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                        {t('upgrade')}
                        </button>
                    </div>
                )}
            </div>
            
            {/* Collapse Toggle */}
            <button 
                onClick={toggleCollapse}
                className="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors z-50"
            >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </>
      )}
    </nav>
  );
};

export default Sidebar;