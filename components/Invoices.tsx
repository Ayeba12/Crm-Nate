import React, { useState, useEffect, useRef } from 'react';
import { Invoice, InvoiceStatus, Lead } from '../types';
import { Plus, Search, Filter, MoreHorizontal, CheckCircle2, Send, Edit, Trash2, Copy, Eye, X, Printer, Hexagon } from 'lucide-react';

interface InvoicesProps {
  invoices: Invoice[];
  leads: Lead[];
  onAdd: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onDelete: (id: string) => void;
  companyAddress: string;
  t: (key: string) => string;
  formatCurrency: (value: number) => string;
}

const Invoices: React.FC<InvoicesProps> = ({ invoices, leads, onAdd, onEdit, onUpdateStatus, onDelete, companyAddress, t, formatCurrency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // View State
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  // Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Confirmation State
  const [confirmAction, setConfirmAction] = useState<{ type: 'edit' | 'delete' | 'duplicate' | 'pay', id: string } | null>(null);
  
  // Send Invoice Dialog State
  const [sendDialog, setSendDialog] = useState<{
    isOpen: boolean;
    invoice: Invoice | null;
    email: string;
    tempEmail: string;
    step: 'confirm' | 'edit';
  }>({ isOpen: false, invoice: null, email: '', tempEmail: '', step: 'confirm' });

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    clientName: '',
    amount: 0,
    dueDate: '',
    description: ''
  });

  // Handle click outside to close menu
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setActiveMenuId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = invoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const getClientEmail = (clientName: string) => {
    const lead = leads.find(l => l.company.trim().toLowerCase() === clientName.trim().toLowerCase());
    return lead?.email || 'billing@client.com';
  };

  const openSendDialog = (invoice: Invoice) => {
    const email = getClientEmail(invoice.clientName);
    setSendDialog({
        isOpen: true,
        invoice,
        email,
        tempEmail: email,
        step: 'confirm'
    });
  };

  const handleSendEmail = () => {
    if (sendDialog.invoice) {
        onUpdateStatus(sendDialog.invoice.id, 'pending');
        setSendDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && newInvoice.id) {
        // Handle Edit
        onEdit(newInvoice as Invoice);
    } else {
        // Handle Create
        if (!newInvoice.clientName || !newInvoice.amount) return;
        const invoice: Invoice = {
            id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
            clientName: newInvoice.clientName || '',
            amount: Number(newInvoice.amount),
            dueDate: newInvoice.dueDate || new Date().toISOString().split('T')[0],
            issueDate: new Date().toISOString().split('T')[0],
            status: 'draft',
            description: newInvoice.description || 'Professional Services'
        };
        onAdd(invoice);
    }
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
      setNewInvoice({ clientName: '', amount: 0, dueDate: '', description: '' });
      setIsEditing(false);
  };

  const openCreateModal = () => {
      resetForm();
      setShowModal(true);
  };

  const handleActionClick = (type: 'edit' | 'delete' | 'duplicate' | 'pay', id: string) => {
      setConfirmAction({ type, id });
      setActiveMenuId(null); // Close menu
  };

  const executeConfirmation = () => {
      if (!confirmAction) return;
      const { type, id } = confirmAction;

      if (type === 'pay') {
          onUpdateStatus(id, 'paid');
      } else if (type === 'delete') {
          onDelete(id);
      } else if (type === 'duplicate') {
          const inv = invoices.find(i => i.id === id);
          if (inv) {
              const copy: Invoice = { 
                  ...inv, 
                  id: `INV-${Math.floor(1000 + Math.random() * 9000)}`, 
                  clientName: `${inv.clientName} (Copy)`, 
                  status: 'draft' 
              };
              onAdd(copy);
          }
      } else if (type === 'edit') {
          const inv = invoices.find(i => i.id === id);
          if (inv) {
              setNewInvoice(inv);
              setIsEditing(true);
              setShowModal(true);
          }
      }
      setConfirmAction(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
    switch (status) {
        case 'paid':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Paid</span>;
        case 'pending':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">Pending</span>;
        case 'overdue':
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">Overdue</span>;
        default:
            return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">Draft</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:bg-gray-900 dark:border-gray-800 transition-colors">
            <p className="text-xs text-gray-500 font-medium mb-1 dark:text-gray-400">{t('outstanding')}</p>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight dark:text-white">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:bg-gray-900 dark:border-gray-800 transition-colors">
            <p className="text-xs text-gray-500 font-medium mb-1 dark:text-gray-400">{t('collected')} (All Time)</p>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight dark:text-white">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white border border-gray-200 rounded-lg flex flex-col min-h-[500px] dark:bg-gray-900 dark:border-gray-800 transition-colors">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Client Invoices</h2>
            <div className="flex items-center space-x-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                    type="text" 
                    placeholder={t('search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 w-full md:w-56 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-gray-600"
                    />
                </div>
                <button className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                    <Filter size={14} />
                </button>
                <button 
                  onClick={openCreateModal}
                  className="flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-all shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                  <Plus size={14} className="mr-1.5" /> {t('createInvoice')}
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto pb-24"> 
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs font-medium text-gray-500 border-b border-gray-200 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-800 dark:text-gray-400">
                        <th className="px-5 py-3">Invoice ID</th>
                        <th className="px-5 py-3">Client</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Due Date</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="group hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors dark:hover:bg-gray-800/50 dark:border-gray-800">
                            <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">#{inv.id}</td>
                            <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-200">
                                {inv.clientName}
                                <p className="text-[10px] text-gray-400 font-normal">{inv.description}</p>
                            </td>
                            <td className="px-5 py-4 text-gray-500 text-xs dark:text-gray-400">{inv.issueDate}</td>
                            <td className="px-5 py-4 text-gray-500 text-xs dark:text-gray-400">{inv.dueDate}</td>
                            <td className="px-5 py-4 font-mono text-gray-900 dark:text-gray-200">{formatCurrency(inv.amount)}</td>
                            <td className="px-5 py-4">
                                <StatusBadge status={inv.status} />
                            </td>
                            <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end space-x-2 relative">
                                    {inv.status === 'draft' && (
                                        <button 
                                            onClick={() => openSendDialog(inv)}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                                            title="Send Invoice"
                                        >
                                            <Send size={14} />
                                        </button>
                                    )}
                                    {inv.status === 'pending' && (
                                        <button 
                                            onClick={() => handleActionClick('pay', inv.id)}
                                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors dark:hover:bg-green-900/20 dark:hover:text-green-400"
                                            title="Mark Paid"
                                        >
                                            <CheckCircle2 size={14} />
                                        </button>
                                    )}
                                    
                                    {/* Action Menu Trigger */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === inv.id ? null : inv.id); }}
                                        className={`p-1.5 rounded transition-colors ${activeMenuId === inv.id ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800'}`}
                                    >
                                        <MoreHorizontal size={14} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeMenuId === inv.id && (
                                        <div 
                                            ref={menuRef}
                                            className="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 animate-[fadeIn_0.1s_ease-out] dark:bg-gray-900 dark:border-gray-700"
                                        >
                                            <button 
                                                onClick={() => { setViewingInvoice(inv); setActiveMenuId(null); }}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                <Eye size={12} className="mr-2 text-gray-500 dark:text-gray-400" /> View
                                            </button>
                                            <div className="h-px bg-gray-100 my-1 dark:bg-gray-800"></div>
                                            <button 
                                                onClick={() => handleActionClick('edit', inv.id)}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                <Edit size={12} className="mr-2 text-gray-500 dark:text-gray-400" /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleActionClick('duplicate', inv.id)}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                <Copy size={12} className="mr-2 text-gray-500 dark:text-gray-400" /> Duplicate
                                            </button>
                                            <div className="h-px bg-gray-100 my-1 dark:bg-gray-800"></div>
                                            <button 
                                                onClick={() => handleActionClick('delete', inv.id)}
                                                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 size={12} className="mr-2" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredInvoices.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-10 text-gray-400 text-sm dark:text-gray-500">
                                No invoices found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] p-4 dark:bg-black/70">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] dark:bg-gray-900 dark:border dark:border-gray-800">
                 {/* Header Actions */}
                 <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Invoice Preview</h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrint} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700" title="Print Invoice">
                             <Printer size={18} />
                        </button>
                        <button onClick={() => setViewingInvoice(null)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700" title="Close">
                             <X size={18} />
                        </button>
                    </div>
                 </div>

                 {/* Invoice Content (Scrollable) */}
                 <div className="flex-1 overflow-y-auto p-8 md:p-12 print:p-0">
                     <div className="max-w-2xl mx-auto" id="invoice-content">
                        {/* Branding & Header */}
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                     <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-lg text-white dark:bg-white dark:text-gray-900">
                                        <Hexagon size={18} strokeWidth={3} />
                                     </div>
                                     <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Lumen</span>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice</h1>
                                <p className="text-sm text-gray-500 font-mono mt-2 dark:text-gray-400">#{viewingInvoice.id}</p>
                            </div>
                            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                <h4 className="font-semibold text-gray-900 mb-1 dark:text-white">Acme Inc.</h4>
                                <div className="whitespace-pre-line">{companyAddress}</div>
                                <p>billing@lumen.inc</p>
                            </div>
                        </div>

                        {/* Client & Date Info */}
                        <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Bill To</p>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{viewingInvoice.clientName}</h3>
                                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Client ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                            </div>
                            <div className="flex gap-8 text-right md:text-left">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Issue Date</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viewingInvoice.issueDate}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">Due Date</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viewingInvoice.dueDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-10">
                            <div className="border-b-2 border-gray-900 pb-2 mb-4 dark:border-gray-100">
                                <div className="flex justify-between">
                                    <p className="text-xs font-bold text-gray-900 uppercase dark:text-white">Description</p>
                                    <p className="text-xs font-bold text-gray-900 uppercase dark:text-white">Amount</p>
                                </div>
                            </div>
                            <div className="flex justify-between py-4 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viewingInvoice.description}</p>
                                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Professional Services</p>
                                </div>
                                <p className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(viewingInvoice.amount)}</p>
                            </div>
                            {/* Placeholder for potential extra items */}
                            <div className="flex justify-between py-4 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Platform Fee</p>
                                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Processing & Handling</p>
                                </div>
                                <p className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(0)}</p>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/2 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Subtotal</span>
                                    <span className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(viewingInvoice.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Tax (0%)</span>
                                    <span className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(0)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between items-center dark:border-gray-700">
                                    <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                                    <span className="text-xl font-bold text-gray-900 font-mono dark:text-white">{formatCurrency(viewingInvoice.amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Status */}
                        <div className="mt-12 pt-6 border-t border-gray-100 text-center dark:border-gray-800">
                             <div className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                Status: {viewingInvoice.status}
                             </div>
                             <p className="text-xs text-gray-400 mt-4 dark:text-gray-500">Thank you for your business.</p>
                        </div>
                     </div>
                 </div>
             </div>
        </div>
      )}

      {/* Send Invoice Dialog */}
      {sendDialog.isOpen && sendDialog.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] dark:bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-200 relative dark:bg-gray-900 dark:border-gray-800">
                <button 
                    onClick={() => setSendDialog({...sendDialog, isOpen: false})} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
                >
                    <X size={16} />
                </button>
                
                {sendDialog.step === 'confirm' ? (
                    <>
                         <div className="flex flex-col items-center text-center mb-6 pt-2">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
                                <Send size={20} />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Send Invoice</h3>
                            <p className="text-xs text-gray-500 mt-2 max-w-[240px] leading-relaxed dark:text-gray-400">
                                Do you want to send this invoice to <br/>
                                <span className="font-medium text-gray-900 dark:text-gray-200">{sendDialog.email}</span>?
                            </p>
                         </div>
                         <div className="flex space-x-3">
                            <button 
                                onClick={() => setSendDialog({...sendDialog, tempEmail: sendDialog.email, step: 'edit'})}
                                className="flex-1 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md font-medium border border-gray-300 transition-colors dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                Edit Email
                            </button>
                            <button 
                                onClick={handleSendEmail}
                                className="flex-1 py-2 text-xs text-white bg-gray-900 hover:bg-gray-800 rounded-md font-medium border border-transparent transition-colors shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                            >
                                Send
                            </button>
                         </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 mt-1 dark:text-white">Edit Recipient Email</h3>
                        <div className="mb-6">
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 dark:text-gray-400">Email Address</label>
                            <input 
                                type="email" 
                                value={sendDialog.tempEmail}
                                onChange={(e) => setSendDialog({...sendDialog, tempEmail: e.target.value})}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white"
                                placeholder="name@company.com"
                                autoFocus
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setSendDialog({...sendDialog, step: 'confirm'})}
                                className="flex-1 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md font-medium border border-gray-300 transition-colors dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => setSendDialog({...sendDialog, email: sendDialog.tempEmail, step: 'confirm'})}
                                className="flex-1 py-2 text-xs text-white bg-gray-900 hover:bg-gray-800 rounded-md font-medium border border-transparent transition-colors shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                            >
                                Approve
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* Generic Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] dark:bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                 <div className="flex flex-col items-center text-center mb-4">
                    {/* Dynamic Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                        confirmAction.type === 'delete' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 
                        confirmAction.type === 'pay' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                        {confirmAction.type === 'delete' ? <Trash2 size={20} /> : 
                         confirmAction.type === 'pay' ? <CheckCircle2 size={20} /> :
                         confirmAction.type === 'edit' ? <Edit size={20} /> :
                         <Copy size={20} />}
                    </div>
                    
                    {/* Dynamic Title */}
                    <h3 className="text-sm font-semibold text-gray-900 capitalize dark:text-white">
                        {confirmAction.type === 'pay' ? 'Approve Payment' : `Confirm ${confirmAction.type}`}
                    </h3>
                    
                    {/* Dynamic Message */}
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        {confirmAction.type === 'pay' ? 'Are you sure you want to approve this payment?' :
                         confirmAction.type === 'delete' ? 'Are you sure you want to delete this invoice? This action cannot be undone.' :
                         `Are you sure you want to continue to ${confirmAction.type} this invoice?`}
                    </p>
                 </div>
                 <div className="flex space-x-3">
                    <button 
                        onClick={() => setConfirmAction(null)}
                        className="flex-1 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md font-medium border border-gray-300 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={executeConfirmation}
                        className={`flex-1 py-2 text-xs text-white rounded-md font-medium border border-transparent transition-colors ${
                            confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                        }`}
                    >
                        Approve
                    </button>
                 </div>
            </div>
        </div>
      )}

      {/* Modal for Creating/Editing Invoice */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] dark:bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 dark:text-white">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h3>
                <form onSubmit={handleModalSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Client Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white"
                            value={newInvoice.clientName}
                            onChange={e => setNewInvoice({...newInvoice, clientName: e.target.value})}
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Description</label>
                        <input 
                            required
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white"
                            value={newInvoice.description}
                            onChange={e => setNewInvoice({...newInvoice, description: e.target.value})}
                            placeholder="e.g. Web Development Services"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Amount (Base Currency)</label>
                            <input 
                                required
                                type="number" 
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white"
                                value={newInvoice.amount || ''}
                                onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Due Date</label>
                            <input 
                                required
                                type="date" 
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-white"
                                value={newInvoice.dueDate}
                                onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md font-medium border border-gray-300 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800">Cancel</button>
                        <button type="submit" className="flex-1 py-2 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-800 font-medium border border-transparent dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">{isEditing ? 'Save Changes' : 'Create Invoice'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;