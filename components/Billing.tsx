import React from 'react';
import { CreditCard, CheckCircle2, FileText, Zap, MoreHorizontal } from 'lucide-react';

interface BillingProps {
    t: (key: string) => string;
    formatCurrency: (value: number) => string;
}

const Billing: React.FC<BillingProps> = ({ t, formatCurrency }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Plan */}
            <div className="md:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Professional Plan</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">ACTIVE</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Billed monthly</p>
                    </div>
                    <div className="text-right">
                         <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(29)}<span className="text-sm font-normal text-gray-400 dark:text-gray-500">/mo</span></p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5 dark:text-gray-400">
                            <span>Leads</span>
                            <span>850 / 2,500</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden dark:bg-gray-800">
                            <div className="bg-gray-900 h-1.5 rounded-full dark:bg-white" style={{ width: '34%' }}></div>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5 dark:text-gray-400">
                            <span>Pipelines</span>
                            <span>2 / 5</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden dark:bg-gray-800">
                            <div className="bg-gray-400 h-1.5 rounded-full dark:bg-gray-600" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex space-x-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button className="px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                        {t('upgrade')}
                    </button>
                    <button className="px-3 py-2 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                        {t('manageSubscription')}
                    </button>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between dark:bg-gray-900 dark:border-gray-800 transition-colors">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 dark:text-white">{t('paymentMethod')}</h3>
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-800 dark:border-gray-700">
                        <div className="w-8 h-5 bg-gray-800 rounded-sm flex items-center justify-center dark:bg-gray-950">
                            <div className="w-4 h-2 border border-white/30 rounded-[1px] flex items-center justify-center"></div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-200">•••• 4242</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Expires 12/24</p>
                        </div>
                    </div>
                </div>
                 <button className="text-xs text-gray-600 font-medium hover:text-gray-900 hover:underline text-left dark:text-gray-400 dark:hover:text-gray-200">
                    Update card
                </button>
            </div>
        </div>

        {/* Invoices */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-900 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('invoiceHistory')}</h3>
                <button className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Download All</button>
            </div>
            
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-800 dark:text-gray-500">
                        <th className="px-5 py-2 font-medium">Invoice</th>
                        <th className="px-5 py-2 font-medium">Date</th>
                        <th className="px-5 py-2 font-medium">Amount</th>
                        <th className="px-5 py-2 font-medium">Status</th>
                        <th className="px-5 py-2 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {[
                        { id: 'INV-003', date: 'Oct 01, 2023', amount: 29, status: 'Paid' },
                        { id: 'INV-002', date: 'Sep 01, 2023', amount: 29, status: 'Paid' },
                        { id: 'INV-001', date: 'Aug 01, 2023', amount: 29, status: 'Paid' },
                    ].map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors dark:hover:bg-gray-800/50">
                            <td className="px-5 py-3 text-gray-900 font-medium text-xs dark:text-gray-200">{inv.id}</td>
                            <td className="px-5 py-3 text-gray-500 text-xs dark:text-gray-400">{inv.date}</td>
                            <td className="px-5 py-3 text-gray-900 text-xs font-mono dark:text-gray-200">{formatCurrency(inv.amount)}</td>
                            <td className="px-5 py-3">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                    {inv.status}
                                </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                                <button className="text-gray-400 hover:text-gray-900 transition-colors dark:text-gray-500 dark:hover:text-gray-300">
                                    <FileText size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Billing;