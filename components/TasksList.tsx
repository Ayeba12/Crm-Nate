import React, { useState, useEffect } from 'react';
import { Task, Lead, TaskPriority, TaskStatus } from '../types';
import { Search, Plus, Calendar, Flag, CheckCircle2, Clock, MoreHorizontal, Edit, Trash2, X, Filter } from 'lucide-react';

interface TasksListProps {
  tasks: Task[];
  leads: Lead[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  t: (key: string) => string;
}

const TasksList: React.FC<TasksListProps> = ({ tasks, leads, onAddTask, onUpdateTask, onDeleteTask, t }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'All'>('All');

  // Form State
  const [formTask, setFormTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    dueDate: '',
    leadIds: []
  });

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
      // Sort by due date (ascending), then priority
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dateA - dateB;
  });

  const getPriorityColor = (priority: TaskPriority) => {
    switch(priority) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900';
      case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
      switch(status) {
          case 'Completed': return <CheckCircle2 size={14} className="text-green-500" />;
          case 'In Progress': return <Clock size={14} className="text-blue-500" />;
          default: return <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>;
      }
  };

  const openCreateModal = () => {
    setFormTask({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Open',
      dueDate: '',
      leadIds: []
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (task: Task) => {
    setFormTask({ ...task });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Basic Validation
      if (!formTask.title) return;
      if (!formTask.leadIds || formTask.leadIds.length === 0) {
          alert("Please select at least one linked lead.");
          return;
      }

      if (isEditing && formTask.id) {
          onUpdateTask(formTask as Task);
      } else {
          const newTask: Task = {
              id: Math.random().toString(36).substr(2, 9),
              title: formTask.title || 'Untitled Task',
              description: formTask.description,
              priority: formTask.priority as TaskPriority,
              status: formTask.status as TaskStatus,
              dueDate: formTask.dueDate,
              ownerId: 'Me',
              leadIds: formTask.leadIds || [],
              createdAt: new Date().toISOString()
          };
          onAddTask(newTask);
      }
      setShowModal(false);
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

  const updateStatus = (taskId: string, newStatus: TaskStatus) => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
          onUpdateTask({ ...task, status: newStatus });
      }
  };

  return (
    <div className="space-y-6 pb-20 animate-[fadeIn_0.3s_ease-out]">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Tasks</h2>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                 <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm w-full md:w-48 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-gray-600"
                    />
                </div>
                
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                    <option value="All">All Status</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>

                <select 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className="px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                    <option value="All">All Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>

                <button 
                    onClick={openCreateModal}
                    className="flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium hover:bg-gray-800 transition-colors dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                >
                    <Plus size={14} className="mr-1.5" /> Add Task
                </button>
            </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 dark:bg-gray-800/50 dark:border-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Task</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Priority</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Leads</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Due Date</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right dark:text-gray-400">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredTasks.map(task => (
                        <tr key={task.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <p className={`text-sm font-medium ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                                    {task.title}
                                </p>
                                {task.description && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs dark:text-gray-400">{task.description}</p>}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {task.leadIds.map(leadId => {
                                        const lead = leads.find(l => l.id === leadId);
                                        return lead ? (
                                            <span key={leadId} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                                {lead.title}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className={`flex items-center text-xs ${!task.dueDate ? 'text-gray-400' : new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <Calendar size={12} className="mr-1.5" />
                                    {task.dueDate || 'No date'}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <select 
                                    value={task.status}
                                    onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                                    className="bg-transparent text-xs font-medium text-gray-700 border-none focus:ring-0 cursor-pointer dark:text-gray-300"
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="relative inline-block">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === task.id ? null : task.id); }}
                                        className="p-1.5 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800"
                                    >
                                        <MoreHorizontal size={14} />
                                    </button>
                                    
                                    {activeMenuId === task.id && (
                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1 dark:bg-gray-900 dark:border-gray-700">
                                            <button 
                                                onClick={() => handleEditClick(task)}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                                <Edit size={12} className="mr-2" /> Edit
                                            </button>
                                            <button 
                                                onClick={() => onDeleteTask(task.id)}
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
                    {filteredTasks.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm dark:text-gray-500">
                                No tasks found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] dark:bg-black/50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Task' : 'Create Task'}</h3>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
                                onChange={e => setFormTask({...formTask, title: e.target.value})}
                                placeholder="e.g. Follow up with client"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Description</label>
                            <textarea 
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 h-20 resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                value={formTask.description}
                                onChange={e => setFormTask({...formTask, description: e.target.value})}
                                placeholder="Add details..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 dark:text-gray-400">Priority</label>
                                <select 
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    value={formTask.priority}
                                    onChange={e => setFormTask({...formTask, priority: e.target.value as TaskPriority})}
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
                                    onChange={e => setFormTask({...formTask, dueDate: e.target.value})}
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
                                onClick={() => setShowModal(false)}
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
        )}
    </div>
  );
};

export default TasksList;
