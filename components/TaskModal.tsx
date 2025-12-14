import React, { useState, useEffect } from 'react';
import { Task, Lead, TaskPriority, TaskStatus } from '../types';
import { CheckCircle2, X } from 'lucide-react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: Partial<Task>, isEditing: boolean) => void;
    leads: Lead[];
    initialData?: Partial<Task>;
    isEditing?: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, leads, initialData, isEditing = false }) => {
    const [formTask, setFormTask] = useState<Partial<Task>>({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open',
        dueDate: '',
        leadIds: []
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setFormTask({
                title: initialData.title || '',
                description: initialData.description || '',
                priority: initialData.priority || 'Medium',
                status: initialData.status || 'Open',
                dueDate: initialData.dueDate || '',
                leadIds: initialData.leadIds || []
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!formTask.title) return;
        if (!formTask.leadIds || formTask.leadIds.length === 0) {
            alert("Please select at least one linked lead.");
            return;
        }

        onSubmit(formTask, isEditing);
    };

    const toggleLeadSelection = (leadId: string) => {
        setFormTask(prev => {
            const currentIds = prev.leadIds || [];
            if (currentIds.includes(leadId)) {
                return { ...prev, leadIds: currentIds.filter(id => id !== leadId) };
            } else {
                return { ...prev, leadIds: [...currentIds, leadId] };
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] dark:bg-black/50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Task' : 'Create Task'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Title <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            value={formTask.title}
                            onChange={e => setFormTask({ ...formTask, title: e.target.value })}
                            placeholder="e.g. Follow up with client"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Description</label>
                        <textarea
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 h-20 resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            value={formTask.description}
                            onChange={e => setFormTask({ ...formTask, description: e.target.value })}
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Priority</label>
                            <select
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={formTask.priority}
                                onChange={e => setFormTask({ ...formTask, priority: e.target.value as TaskPriority })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Due Date</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={formTask.dueDate}
                                onChange={e => setFormTask({ ...formTask, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2 dark:text-gray-400">Linked Leads <span className="text-red-500">*</span></label>
                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1 dark:border-gray-700 dark:bg-gray-800">
                            {leads.length > 0 ? leads.map(lead => (
                                <div
                                    key={lead.id}
                                    onClick={() => toggleLeadSelection(lead.id)}
                                    className={`flex items-center p-2 rounded cursor-pointer text-xs ${formTask.leadIds?.includes(lead.id) ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'}`}
                                >
                                    <div className={`w-3 h-3 rounded-full border mr-2 flex items-center justify-center ${formTask.leadIds?.includes(lead.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                                        {formTask.leadIds?.includes(lead.id) && <CheckCircle2 size={10} className="text-white" />}
                                    </div>
                                    <span className="truncate">{lead.title}</span>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-400 p-2">No leads available</p>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md font-medium border border-gray-300 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 text-xs text-white bg-gray-900 hover:bg-gray-800 rounded-md font-medium border border-transparent dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                        >
                            {isEditing ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
