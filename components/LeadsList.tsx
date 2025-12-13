import React, { useState, useEffect, useRef } from 'react';
import { Lead, StageId } from '../types';
import { Search, Filter, ArrowUpDown, MoreHorizontal, Plus, Trash2, Edit, Copy, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LeadsListProps {
  leads: Lead[];
  onDelete: (id: string) => void;
  onAdd: (lead: Lead) => void;
  onUpdate: (lead: Lead) => void;
  t: (key: string) => string;
  formatCurrency: (value: number) => string;
}

// Helper for stage colors
const getStageColor = (stage: StageId) => {
    switch (stage) {
        case StageId.WON: return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
        case StageId.LOST: return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case StageId.NEW: return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
};

const STAGE_OPTIONS = [
    { id: StageId.NEW, label: 'New' },
    { id: StageId.CONTACTED, label: 'Contacted' },
    { id: StageId.QUALIFIED, label: 'Qualified' },
    { id: StageId.PROPOSAL, label: 'Proposal' },
    { id: StageId.WON, label: 'Won' },
    { id: StageId.LOST, label: 'Lost' },
];

const ITEMS_PER_PAGE = 8;

const LeadsList: React.FC<LeadsListProps> = ({ leads, onDelete, onAdd, onUpdate, t, formatCurrency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Filtering & Pagination State
  const [filterStage, setFilterStage] = useState<StageId | 'ALL'>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Interactive States
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeStageMenuId, setActiveStageMenuId] = useState<string | null>(null);
  
  // Confirmation State
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'duplicate' | 'edit', leadId: string } | null>(null);

  const [formLead, setFormLead] = useState<Partial<Lead>>({
      title: '',
      company: '',
      value: 0,
      stageId: StageId.NEW,
      email: ''
  });

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const stageMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setActiveMenuId(null);
        }
        if (stageMenuRef.current && !stageMenuRef.current.contains(event.target as Node)) {
            setActiveStageMenuId(null);
        }
        if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
            setShowFilterMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Logic
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
        lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStage = filterStage === 'ALL' || lead.stageId === filterStage;

    return matchesSearch && matchesStage;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStage]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const openAddModal = () => {
      setFormLead({ title: '', company: '', value: 0, stageId: StageId.NEW, email: '' });
      setIsEditing(false);
      setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isEditing && formLead.id) {
          onUpdate(formLead as Lead);
      } else {
          if (!formLead.title || !formLead.company) return;
          const lead: Lead = {
              id: Math.random().toString(36).substr(2, 9),
              title: formLead.title || 'Untitled',
              company: formLead.company || 'Unknown',
              value: Number(formLead.value) || 0,
              stageId: formLead.stageId as StageId || StageId.NEW,
              owner: 'Me',
              tags: ['New'],
              createdAt: new Date().toISOString().split('T')[0],
              email: formLead.email
          };
          onAdd(lead);
          setSearchTerm('');
          setFilterStage('ALL');
          setCurrentPage(1);
      }
      setShowModal(false);
  };

  const handleActionClick = (type: 'delete' | 'duplicate' | 'edit', leadId: string) => {
      setConfirmAction({ type, leadId });
      setActiveMenuId(null);
  };

  const executeConfirmation = () => {
      if (!confirmAction) return;
      const { type, leadId } = confirmAction;

      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;

      if (type === 'delete') {
          onDelete(leadId);
      } else if (type === 'duplicate') {
          const copy: Lead = {
              ...lead,
              id: Math.random().toString(36).substr(2, 9),
              title: `${lead.title} (Copy)`,
              createdAt: new Date().toISOString().split('T')[0]
          };
          onAdd(copy);
      } else if (type === 'edit') {
          setFormLead({ ...lead });
          setIsEditing(true);
          setShowModal(true);
      }
      setConfirmAction(null);
  };

  const updateStage = (leadId: string, newStage: StageId) => {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
          onUpdate({ ...lead, stageId: newStage });
      }
      setActiveStageMenuId(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-[calc(100vh-140px)] animate-[fadeIn_0.3s_ease-out] dark:bg-gray-900 dark:border-gray-800 transition-colors">
      {/* Header Actions */}
      <div className="px-5 py-3 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">All Leads</h2>
        
        <div className="flex items-center space-x-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 w-full md:w-64 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-gray-600"
            />
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X size={12} />
                </button>
            )}
          </div>
          
          {/* Filter Button & Menu */}
          <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`p-1.5 border rounded-md transition-colors ${filterStage !== 'ALL' ? 'bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'}`}
                title="Filter by Stage"
              >
                <Filter size={14} />
              </button>
              
              {showFilterMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 dark:bg-gray-900 dark:border-gray-700">
                      <div className="px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:text-gray-400">
                          Filter by Stage
                      </div>
                      <button 
                          onClick={() => { setFilterStage('ALL'); setShowFilterMenu(false); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between dark:hover:bg-gray-800"
                      >
                          <span className={filterStage === 'ALL' ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>All Stages</span>
                          {filterStage === 'ALL' && <CheckCircle2 size={12} className="text-gray-900 dark:text-white" />}
                      </button>
                      {STAGE_OPTIONS.map(opt => (
                          <button
                              key={opt.id}
                              onClick={() => { setFilterStage(opt.id); setShowFilterMenu(false); }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between dark:hover:bg-gray-800"
                          >
                              <span className={filterStage === opt.id ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>{opt.label}</span>
                              {filterStage === opt.id && <CheckCircle2 size={12} className="text-gray-900 dark:text-white" />}
                          </button>
                      ))}
                  </div>
              )}
          </div>

          <button 
            onClick={openAddModal}
            className="flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-all shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            <Plus size={14} className="mr-1.5" /> {t('addLead')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-medium text-gray-500 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:bg-gray-900/90 dark:border-gray-800 dark:text-gray-400">
              <th className="px-5 py-2.5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                <div className="flex items-center">Lead Name <ArrowUpDown size={12} className="ml-1 opacity-50" /></div>
              </th>
              <th className="px-5 py-2.5">Company</th>
              <th className="px-5 py-2.5">Email</th>
              <th className="px-5 py-2.5">Stage</th>
              <th className="px-5 py-2.5 text-right">Value</th>
              <th className="px-5 py-2.5">Created</th>
              <th className="px-5 py-2.5 w-10 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm bg-white dark:bg-gray-900">
            {currentLeads.map((lead) => (
              <tr key={lead.id} className="group hover:bg-gray-50 border-b border-gray-100 last:border-0 relative dark:hover:bg-gray-800/50 dark:border-gray-800">
                <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-200">
                    <div>
                        {lead.title}
                    </div>
                </td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                            {lead.company.substring(0, 1).toUpperCase()}
                        </div>
                        <span>{lead.company}</span>
                    </div>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs dark:text-gray-400">
                     {lead.email || <span className="text-gray-300 dark:text-gray-600">-</span>}
                </td>
                <td className="px-5 py-3 relative">
                  <div className="relative inline-block">
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveStageMenuId(activeStageMenuId === lead.id ? null : lead.id); }}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border cursor-pointer hover:opacity-80 transition-opacity space-x-1 ${getStageColor(lead.stageId)}`}
                    >
                        <span>{lead.stageId.charAt(0).toUpperCase() + lead.stageId.slice(1)}</span>
                        <ChevronDown size={10} />
                    </button>
                    
                    {activeStageMenuId === lead.id && (
                        <div 
                            ref={stageMenuRef}
                            className="absolute left-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 dark:bg-gray-900 dark:border-gray-700"
                        >
                            {STAGE_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => updateStage(lead.id, opt.id)}
                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between dark:hover:bg-gray-800 ${lead.stageId === opt.id ? 'text-gray-900 font-medium bg-gray-50 dark:bg-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    {opt.label}
                                    {lead.stageId === opt.id && <CheckCircle2 size={10} className="text-gray-900 dark:text-white"/>}
                                </button>
                            ))}
                        </div>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-mono text-gray-600 text-xs dark:text-gray-300">
                    {formatCurrency(lead.value)}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs dark:text-gray-500">{lead.createdAt}</td>
                <td className="px-5 py-3 text-right">
                   <div className="relative flex justify-end">
                       <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === lead.id ? null : lead.id); }}
                            className={`p-1.5 rounded transition-colors ${activeMenuId === lead.id ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800'}`}
                       >
                            <MoreHorizontal size={14} />
                       </button>

                       {activeMenuId === lead.id && (
                           <div 
                               ref={menuRef}
                               className="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 dark:bg-gray-900 dark:border-gray-700"
                           >
                                <button 
                                    onClick={() => handleActionClick('edit', lead.id)}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <Edit size={12} className="mr-2 text-gray-500 dark:text-gray-400" /> Edit
                                </button>
                                <button 
                                    onClick={() => handleActionClick('duplicate', lead.id)}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <Copy size={12} className="mr-2 text-gray-500 dark:text-gray-400" /> Duplicate
                                </button>
                                <div className="h-px bg-gray-100 my-1 dark:bg-gray-800"></div>
                                <button 
                                    onClick={() => handleActionClick('delete', lead.id)}
                                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center dark:hover:bg-red-900/30 dark:text-red-400"
                                >
                                    <Trash2 size={12} className="mr-2" /> Delete
                                </button>
                           </div>
                       )}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLeads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm dark:text-gray-500">
                <p>No leads found matching your criteria.</p>
                {(searchTerm || filterStage !== 'ALL') && (
                    <button 
                        onClick={() => { setSearchTerm(''); setFilterStage('ALL'); }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        )}
      </div>
      {/* Pagination & Modals remain unchanged but use formatCurrency implicitly if needed in modals though input is usually raw number */}
      {/* Add/Edit Lead Modal - Value Input remains raw number for editing */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] dark:bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 dark:text-white">{isEditing ? 'Edit Lead' : 'Create Lead'}</h3>
                <form onSubmit={handleFormSubmit} className="space-y-3">
                    {/* ... other fields ... */}
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Title</label>
                        <input 
                            required
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            value={formLead.title}
                            onChange={e => setFormLead({...formLead, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Company</label>
                        <input 
                            required
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            value={formLead.company}
                            onChange={e => setFormLead({...formLead, company: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Company Email</label>
                        <input 
                            type="email" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            value={formLead.email || ''}
                            onChange={e => setFormLead({...formLead, email: e.target.value})}
                            placeholder="contact@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Value (Base Currency)</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            value={formLead.value || ''}
                            onChange={e => setFormLead({...formLead, value: parseInt(e.target.value)})}
                        />
                    </div>
                    {!isEditing && (
                        <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Initial Stage</label>
                             <select 
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                value={formLead.stageId}
                                onChange={e => setFormLead({...formLead, stageId: e.target.value as StageId})}
                             >
                                 {STAGE_OPTIONS.map(opt => (
                                     <option key={opt.id} value={opt.id}>{opt.label}</option>
                                 ))}
                             </select>
                        </div>
                    )}
                    <div className="flex space-x-2 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md font-medium border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="flex-1 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-800 font-medium border border-transparent dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">{isEditing ? 'Save Changes' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;