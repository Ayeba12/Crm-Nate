import React, { useState, useEffect, useRef } from 'react';
import { Lead, StageId, SavedList, Task } from '../types';
import { Search, Filter, ArrowUpDown, MoreHorizontal, Plus, Trash2, Edit, Copy, ChevronDown, CheckCircle2, ChevronLeft, ChevronRight, X, Download, Upload, List, CheckSquare } from 'lucide-react';

interface LeadsListProps {
  leads: Lead[];
  onDelete: (id: string) => void;
  onAdd: (lead: Lead) => void;
  onUpdate: (lead: Lead) => void;
  onImport: (leads: Lead[]) => void;
  t: (key: string) => string;
  formatCurrency: (value: number) => string;
  
  // Saved Lists
  savedLists: SavedList[];
  onAddSavedList: (list: SavedList) => void;
  onUpdateSavedList: (list: SavedList) => void;
  onDeleteSavedList: (id: string) => void;

  // Tasks
  onAddTask: (task: Task) => void;
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

const LeadsList: React.FC<LeadsListProps> = ({ 
    leads, onDelete, onAdd, onUpdate, onImport, t, formatCurrency, 
    savedLists, onAddSavedList, onUpdateSavedList, onDeleteSavedList,
    onAddTask
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Filtering & Pagination State
  const [filterStage, setFilterStage] = useState<StageId | 'ALL'>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Saved Lists State
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showListMenu, setShowListMenu] = useState(false);
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [listForm, setListForm] = useState({ name: '', description: '' });

  // Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'map' | 'preview'>('upload');
  const [rawImportData, setRawImportData] = useState<string[][]>([]);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
      'title': '', 'company': '', 'email': '', 'value': ''
  });

  // Bulk Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Interactive States
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeStageMenuId, setActiveStageMenuId] = useState<string | null>(null);
  
  // Confirmation State
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'duplicate' | 'edit' | 'task', leadId: string } | null>(null);

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
  const listMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (listMenuRef.current && !listMenuRef.current.contains(event.target as Node)) {
            setShowListMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // -- Derived State --
  const activeSavedList = selectedListId ? savedLists.find(l => l.id === selectedListId) : null;

  const filteredLeads = leads.filter(lead => {
    // 1. Saved List Filter
    if (activeSavedList) {
        if (!activeSavedList.leadIds.includes(lead.id)) return false;
    }

    // 2. Search
    const matchesSearch = 
        lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 3. Stage Filter
    const matchesStage = filterStage === 'ALL' || lead.stageId === filterStage;

    return matchesSearch && matchesStage;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStage, selectedListId]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // -- Handlers --

  const toggleLeadSelection = (id: string) => {
      const newSet = new Set(selectedLeadIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedLeadIds(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedLeadIds.size === currentLeads.length) {
          setSelectedLeadIds(new Set());
      } else {
          setSelectedLeadIds(new Set(currentLeads.map(l => l.id)));
      }
  };

  const handleCreateListFromSelection = () => {
      setListForm({ name: '', description: '' });
      setShowAddListModal(true);
  };

  const submitSavedList = () => {
      if (!listForm.name) return;
      const newList: SavedList = {
          id: Math.random().toString(36).substr(2, 9),
          name: listForm.name,
          description: listForm.description,
          type: 'ManualSelection',
          ownerId: 'Me',
          leadIds: Array.from(selectedLeadIds),
          createdAt: new Date().toISOString()
      };
      onAddSavedList(newList);
      setShowAddListModal(false);
      setSelectedListId(newList.id);
      setSelectedLeadIds(new Set()); // Clear selection
  };

  const addSelectionToActiveList = () => {
      if (activeSavedList && selectedLeadIds.size > 0) {
          const updatedIds = Array.from(new Set([...activeSavedList.leadIds, ...Array.from(selectedLeadIds)]));
          onUpdateSavedList({ ...activeSavedList, leadIds: updatedIds });
          setSelectedLeadIds(new Set());
      }
  };
  
  const removeSelectionFromActiveList = () => {
       if (activeSavedList && selectedLeadIds.size > 0) {
          const updatedIds = activeSavedList.leadIds.filter(id => !selectedLeadIds.has(id));
          onUpdateSavedList({ ...activeSavedList, leadIds: updatedIds });
          setSelectedLeadIds(new Set());
      }
  };

  // -- CSV Import Logic --
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
              const text = evt.target?.result as string;
              const lines = text.split('\n').map(l => l.trim()).filter(l => l);
              if (lines.length > 0) {
                  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                  const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
                  
                  setImportHeaders(headers);
                  setRawImportData(rows);
                  
                  // Auto-guess mapping
                  const newMapping = { ...columnMapping };
                  headers.forEach(h => {
                      const lower = h.toLowerCase();
                      if (lower.includes('name') || lower.includes('title')) newMapping.title = h;
                      else if (lower.includes('company') || lower.includes('organization')) newMapping.company = h;
                      else if (lower.includes('email') || lower.includes('mail')) newMapping.email = h;
                      else if (lower.includes('value') || lower.includes('amount') || lower.includes('price')) newMapping.value = h;
                  });
                  setColumnMapping(newMapping);
                  setImportStep('map');
              }
          };
          reader.readAsText(file);
      }
  };

  const executeImport = () => {
      const titleIdx = importHeaders.indexOf(columnMapping.title);
      const companyIdx = importHeaders.indexOf(columnMapping.company);
      const emailIdx = importHeaders.indexOf(columnMapping.email);
      const valueIdx = importHeaders.indexOf(columnMapping.value);

      const newLeads: Lead[] = rawImportData.map(row => ({
          id: Math.random().toString(36).substr(2, 9),
          title: row[titleIdx] || 'Imported Lead',
          company: row[companyIdx] || 'Unknown',
          email: emailIdx !== -1 ? row[emailIdx] : undefined,
          value: valueIdx !== -1 ? parseFloat(row[valueIdx].replace(/[^0-9.-]+/g, "")) || 0 : 0,
          stageId: StageId.NEW,
          owner: 'Me',
          tags: ['Imported'],
          createdAt: new Date().toISOString().split('T')[0]
      })).filter(l => l.title && l.company); // Basic validation

      onImport(newLeads);
      setShowImportModal(false);
      setImportStep('upload');
      setRawImportData([]);
  };

  const handleExportCSV = () => {
      const headers = ['Lead Name', 'Company', 'Email', 'Stage', 'Value', 'Created'];
      const csvContent = [
          headers.join(','),
          ...filteredLeads.map(l => [
              `"${l.title}"`,
              `"${l.company}"`,
              `"${l.email || ''}"`,
              l.stageId,
              l.value,
              l.createdAt
          ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `leads_export_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
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
          
          // Auto-add to active list if present
          if (activeSavedList) {
             onUpdateSavedList({ ...activeSavedList, leadIds: [...activeSavedList.leadIds, lead.id] });
          }
      }
      setShowModal(false);
  };

  const handleActionClick = (type: 'delete' | 'duplicate' | 'edit' | 'task', leadId: string) => {
      if (type === 'task') {
          // Quick Task Add
          onAddTask({
              id: Math.random().toString(36).substr(2, 9),
              title: 'New Task',
              priority: 'Medium',
              status: 'Open',
              ownerId: 'Me',
              leadIds: [leadId],
              createdAt: new Date().toISOString()
          });
          setActiveMenuId(null);
      } else {
          setConfirmAction({ type, leadId });
          setActiveMenuId(null);
      }
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
        
        {/* Saved Lists Selector */}
        <div className="flex items-center space-x-3">
             <div className="relative" ref={listMenuRef}>
                 <button 
                    onClick={() => setShowListMenu(!showListMenu)}
                    className="flex items-center space-x-1.5 text-sm font-semibold text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                 >
                    <List size={16} />
                    <span>{activeSavedList ? activeSavedList.name : 'All Leads'}</span>
                    <ChevronDown size={12} />
                 </button>
                 
                 {showListMenu && (
                     <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 dark:bg-gray-900 dark:border-gray-700">
                         <button 
                             onClick={() => { setSelectedListId(null); setShowListMenu(false); }}
                             className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between items-center dark:hover:bg-gray-800"
                         >
                             <span className={!selectedListId ? 'font-medium' : ''}>All Leads</span>
                             {!selectedListId && <CheckCircle2 size={14} />}
                         </button>
                         <div className="border-t border-gray-100 my-1 dark:border-gray-800"></div>
                         <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Saved Lists</div>
                         {savedLists.map(list => (
                             <button 
                                 key={list.id}
                                 onClick={() => { setSelectedListId(list.id); setShowListMenu(false); }}
                                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between items-center dark:hover:bg-gray-800"
                             >
                                 <span className={selectedListId === list.id ? 'font-medium' : ''}>{list.name}</span>
                                 {selectedListId === list.id && <CheckCircle2 size={14} />}
                             </button>
                         ))}
                     </div>
                 )}
             </div>
             {activeSavedList && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                    {filteredLeads.length} leads
                </span>
             )}
        </div>
        
        <div className="flex items-center space-x-2">
           {/* Bulk Actions */}
           {selectedLeadIds.size > 0 && (
               <div className="flex items-center space-x-2 mr-2 bg-blue-50 px-2 py-1 rounded border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900">
                   <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{selectedLeadIds.size} selected</span>
                   <div className="h-3 w-px bg-blue-200 dark:bg-blue-800"></div>
                   
                   {!activeSavedList ? (
                       <button onClick={handleCreateListFromSelection} className="text-xs font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200">
                           Save as List
                       </button>
                   ) : (
                       <>
                           <button onClick={addSelectionToActiveList} className="text-xs font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200">
                               Add to List
                           </button>
                           <span className="text-blue-300">|</span>
                           <button onClick={removeSelectionFromActiveList} className="text-xs font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200">
                               Remove
                           </button>
                       </>
                   )}
               </div>
           )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 w-full md:w-48 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-gray-600"
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
          
          {/* Filter Button */}
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
          
          {/* More Actions (Import/Export) */}
          <div className="flex bg-white border border-gray-200 rounded-md dark:bg-gray-900 dark:border-gray-700">
             <button onClick={() => setShowImportModal(true)} className="p-1.5 hover:bg-gray-50 border-r border-gray-200 text-gray-500 hover:text-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white" title="Import CSV">
                <Upload size={14} />
             </button>
             <button onClick={handleExportCSV} className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-gray-900 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white" title="Export CSV">
                <Download size={14} />
             </button>
          </div>

          <button 
            onClick={() => { setFormLead({ title: '', company: '', value: 0, stageId: StageId.NEW, email: '' }); setIsEditing(false); setShowModal(true); }}
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
              <th className="px-5 py-2.5 w-10">
                   <div className="flex items-center justify-center">
                       <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-gray-900 focus:ring-0 w-3.5 h-3.5 dark:bg-gray-800 dark:border-gray-600"
                            checked={currentLeads.length > 0 && selectedLeadIds.size === currentLeads.length}
                            onChange={toggleSelectAll}
                       />
                   </div>
              </th>
              <th className="px-2 py-2.5 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
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
              <tr key={lead.id} className={`group hover:bg-gray-50 border-b border-gray-100 last:border-0 relative dark:hover:bg-gray-800/50 dark:border-gray-800 ${selectedLeadIds.has(lead.id) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                <td className="px-5 py-3 text-center">
                     <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-gray-900 focus:ring-0 w-3.5 h-3.5 dark:bg-gray-800 dark:border-gray-600"
                        checked={selectedLeadIds.has(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                     />
                </td>
                <td className="px-2 py-3 font-medium text-gray-900 dark:text-gray-200">
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
                                    onClick={() => handleActionClick('task', lead.id)}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <CheckSquare size={12} className="mr-2 text-gray-500 dark:text-gray-400" /> Add Task
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
                {(searchTerm || filterStage !== 'ALL' || selectedListId) && (
                    <button 
                        onClick={() => { setSearchTerm(''); setFilterStage('ALL'); setSelectedListId(null); }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        )}
      </div>

      {/* Add/Edit Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] dark:bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 dark:text-white">{isEditing ? 'Edit Lead' : 'Create Lead'}</h3>
                <form onSubmit={handleFormSubmit} className="space-y-3">
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

      {/* Add List Modal */}
      {showAddListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] dark:bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 dark:text-white">Create Saved List</h3>
                <p className="text-xs text-gray-500 mb-4 dark:text-gray-400">Save {selectedLeadIds.size} selected leads to a list.</p>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="List Name (e.g. Q4 Outreach)"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={listForm.name}
                        onChange={e => setListForm({...listForm, name: e.target.value})}
                    />
                    <input 
                        type="text" 
                        placeholder="Description (Optional)"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={listForm.description}
                        onChange={e => setListForm({...listForm, description: e.target.value})}
                    />
                    <div className="flex space-x-2 pt-2">
                         <button onClick={() => setShowAddListModal(false)} className="flex-1 py-1.5 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800">Cancel</button>
                         <button onClick={submitSavedList} className="flex-1 py-1.5 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">Create List</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* CSV Import Wizard Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] dark:bg-black/60">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                {/* Wizard Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Import Leads</h3>
                        <p className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                            {importStep === 'upload' && 'Step 1: Upload CSV'}
                            {importStep === 'map' && 'Step 2: Map Columns'}
                            {importStep === 'preview' && 'Step 3: Preview'}
                        </p>
                    </div>
                    <button onClick={() => { setShowImportModal(false); setImportStep('upload'); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={18} /></button>
                </div>

                <div className="p-6">
                    {/* Step 1: Upload */}
                    {importStep === 'upload' && (
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800/30">
                            <Upload size={32} className="text-gray-400 mb-3" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mb-4 dark:text-gray-400">CSV files only (max 5MB)</p>
                            <input 
                                type="file" 
                                accept=".csv"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Browse File
                            </button>
                        </div>
                    )}

                    {/* Step 2: Map */}
                    {importStep === 'map' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Map your CSV columns to Lumen fields.</p>
                            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-4 px-4 py-2 border-b border-gray-200 bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400">
                                    <div>Lumen Field</div>
                                    <div>CSV Header</div>
                                </div>
                                {['title', 'company', 'email', 'value'].map((field) => (
                                    <div key={field} className="grid grid-cols-2 gap-4 px-4 py-3 border-b border-gray-200 last:border-0 items-center dark:border-gray-700">
                                        <div className="text-sm font-medium text-gray-700 capitalize dark:text-gray-300">{field} <span className="text-red-500">*</span></div>
                                        <select 
                                            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                            value={columnMapping[field]}
                                            onChange={(e) => setColumnMapping({...columnMapping, [field]: e.target.value})}
                                        >
                                            <option value="">Select Column</option>
                                            {importHeaders.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    onClick={() => setImportStep('preview')}
                                    disabled={!columnMapping.title || !columnMapping.company}
                                    className={`px-4 py-2 rounded text-xs font-medium text-white ${!columnMapping.title || !columnMapping.company ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900'}`}
                                >
                                    Review Import
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {importStep === 'preview' && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                                <CheckCircle2 size={16} className="text-green-500" />
                                <span>Ready to import <span className="font-bold">{rawImportData.length}</span> leads.</span>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto dark:bg-gray-900 dark:border-gray-700">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-2 text-gray-500 dark:text-gray-400">Title</th>
                                            <th className="px-4 py-2 text-gray-500 dark:text-gray-400">Company</th>
                                            <th className="px-4 py-2 text-gray-500 dark:text-gray-400">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {rawImportData.slice(0, 5).map((row, i) => {
                                            const titleIdx = importHeaders.indexOf(columnMapping.title);
                                            const companyIdx = importHeaders.indexOf(columnMapping.company);
                                            const valueIdx = importHeaders.indexOf(columnMapping.value);
                                            return (
                                                <tr key={i}>
                                                    <td className="px-4 py-2 dark:text-gray-300">{row[titleIdx]}</td>
                                                    <td className="px-4 py-2 dark:text-gray-300">{row[companyIdx]}</td>
                                                    <td className="px-4 py-2 dark:text-gray-300">{row[valueIdx]}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {rawImportData.length > 5 && (
                                    <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                        And {rawImportData.length - 5} more...
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button onClick={() => setImportStep('map')} className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Back</button>
                                <button onClick={executeImport} className="px-4 py-2 bg-gray-900 text-white rounded text-xs font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900">Import Leads</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default LeadsList;
