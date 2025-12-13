import React, { useState, useRef, useEffect } from 'react';
import { Lead, StageId } from '../types';
import { MoreHorizontal, Plus, Trash2, Edit, Copy, X } from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateStage: (leadId: string, stageId: StageId) => void;
  onDelete: (id: string) => void;
  onUpdate: (lead: Lead) => void;
  onAdd: (lead: Lead) => void;
  formatCurrency: (value: number) => string;
}

const STAGES = [
  { id: StageId.NEW, name: 'New' },
  { id: StageId.CONTACTED, name: 'Contacted' },
  { id: StageId.QUALIFIED, name: 'Qualified' },
  { id: StageId.PROPOSAL, name: 'Proposal' },
  { id: StageId.WON, name: 'Won' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onUpdateStage, onDelete, onUpdate, onAdd, formatCurrency }) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'duplicate', leadId: string } | null>(null);
  
  // Unified Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLead, setFormLead] = useState<Partial<Lead>>({});
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setActiveMenuId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: StageId) => {
    e.preventDefault();
    if (draggedLeadId) {
      onUpdateStage(draggedLeadId, stageId);
      setDraggedLeadId(null);
    }
  };

  const handleCreateClick = (stageId: StageId) => {
      setFormLead({ 
          stageId, 
          title: '', 
          company: '', 
          value: 0,
          email: '' 
      });
      setIsEditing(false);
      setShowModal(true);
  };

  const handleActionClick = (type: 'delete' | 'duplicate' | 'edit', leadId: string) => {
      setActiveMenuId(null);
      if (type === 'edit') {
          const lead = leads.find(l => l.id === leadId);
          if (lead) {
              setFormLead({ ...lead });
              setIsEditing(true);
              setShowModal(true);
          }
      } else {
          setConfirmAction({ type, leadId });
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
      }
      setConfirmAction(null);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isEditing && formLead.id && onUpdate) {
          onUpdate(formLead as Lead);
      } else if (!isEditing && onAdd) {
           const newLead: Lead = {
              id: Math.random().toString(36).substr(2, 9),
              title: formLead.title || 'Untitled',
              company: formLead.company || 'Unknown',
              value: Number(formLead.value) || 0,
              stageId: formLead.stageId as StageId,
              owner: 'Me',
              tags: ['New'],
              createdAt: new Date().toISOString().split('T')[0],
              email: formLead.email
          };
          onAdd(newLead);
      }
      
      setShowModal(false);
  };

  return (
    <div className="flex h-full overflow-x-auto pb-4 gap-4 snap-x animate-[fadeIn_0.3s_ease-out]">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter(l => l.stageId === stage.id);
        const totalValue = stageLeads.reduce((acc, l) => acc + l.value, 0);

        return (
          <div 
            key={stage.id} 
            className="flex-shrink-0 w-72 flex flex-col snap-center h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide dark:text-gray-300">{stage.name}</h3>
                <span className="text-xs text-gray-400 font-mono dark:text-gray-500">{stageLeads.length}</span>
              </div>
              <button 
                onClick={() => handleCreateClick(stage.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
                title={`Add lead to ${stage.name}`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Droppable Area */}
            <div className="flex-1 overflow-y-auto min-h-[200px] pb-10 scroll-smooth">
              <div className="space-y-2.5">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="bg-white border border-gray-200 p-3 rounded-md shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-default group relative dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700 dark:shadow-none"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-medium text-gray-500 uppercase px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">{lead.company}</span>
                      
                      {/* Menu Trigger */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === lead.id ? null : lead.id); }}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded ${activeMenuId === lead.id ? 'opacity-100 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                      >
                        <MoreHorizontal size={14} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === lead.id && (
                          <div 
                              ref={menuRef}
                              className="absolute right-2 top-8 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 dark:bg-gray-900 dark:border-gray-700"
                              onMouseDown={(e) => e.stopPropagation()} 
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
                                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center dark:text-red-400 dark:hover:bg-red-900/30"
                                >
                                    <Trash2 size={12} className="mr-2" /> Delete
                                </button>
                          </div>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-900 leading-tight mb-3 dark:text-gray-100">{lead.title}</h4>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                        <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{formatCurrency(lead.value)}</span>
                        <div className="flex items-center -space-x-1">
                             {/* Owner Avatar */}
                            <div className="w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center text-[8px] border-2 border-white dark:bg-gray-200 dark:text-gray-900 dark:border-gray-900" title={lead.owner}>
                                {lead.owner[0]}
                            </div>
                        </div>
                    </div>
                  </div>
                ))}
                
                {stageLeads.length === 0 && (
                    <div className="h-16 border border-dashed border-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs bg-gray-50/50 dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-600">
                        Empty
                    </div>
                )}
              </div>
            </div>
            
             {/* Column Footer */}
             <div className="pt-2">
                <p className="text-[10px] text-gray-400 text-right font-mono dark:text-gray-600">
                    {formatCurrency(totalValue)}
                </p>
            </div>
          </div>
        );
      })}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] dark:bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                 <div className="flex flex-col items-center text-center mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                        confirmAction.type === 'delete' 
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                        {confirmAction.type === 'delete' ? <Trash2 size={20} /> : <Copy size={20} />}
                    </div>
                    
                    <h3 className="text-sm font-semibold text-gray-900 capitalize dark:text-white">
                        Confirm {confirmAction.type}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        {confirmAction.type === 'delete' 
                            ? 'Are you sure you want to delete this lead? This cannot be undone.' 
                            : `Are you sure you want to duplicate this lead?`}
                    </p>
                 </div>
                 <div className="flex space-x-3">
                    <button 
                        onClick={() => setConfirmAction(null)}
                        className="flex-1 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md font-medium border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={executeConfirmation}
                        className={`flex-1 py-2 text-xs text-white rounded-md font-medium border border-transparent transition-colors ${
                            confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200'
                        }`}
                    >
                        Confirm
                    </button>
                 </div>
            </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] dark:bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Lead' : 'Create Lead'}</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                        <X size={16} />
                    </button>
                </div>
                <form onSubmit={handleModalSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Title</label>
                        <input 
                            required
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            value={formLead.title}
                            onChange={e => setFormLead({...formLead, title: e.target.value})}
                            placeholder="e.g. Website Redesign"
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
                            placeholder="e.g. Acme Inc"
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
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Value</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            value={formLead.value || ''}
                            onChange={e => setFormLead({...formLead, value: parseInt(e.target.value)})}
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Stage</label>
                         <select 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            value={formLead.stageId}
                            onChange={e => setFormLead({...formLead, stageId: e.target.value as StageId})}
                         >
                             {STAGES.map(opt => (
                                 <option key={opt.id} value={opt.id}>{opt.name}</option>
                             ))}
                         </select>
                    </div>
                    <div className="flex space-x-2 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md font-medium border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="flex-1 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-800 font-medium border border-transparent dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">{isEditing ? 'Save Changes' : 'Create Lead'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default KanbanBoard;