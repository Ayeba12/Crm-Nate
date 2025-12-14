import React, { useState, useEffect } from 'react';
import { Task, Lead, TaskPriority, TaskStatus } from '../types';
import { Search, Plus, Calendar, Flag, CheckCircle2, Clock, MoreHorizontal, Edit, Trash2, Filter } from 'lucide-react';
import TaskModal from './TaskModal';

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
        switch (priority) {
            case 'Critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900';
            case 'High': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900';
            case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900';
            default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
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

            <TaskModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={(data, editing) => {
                    if (editing && data.id) {
                        onUpdateTask(data as Task);
                    } else {
                        const newTask: Task = {
                            id: Math.random().toString(36).substr(2, 9),
                            title: data.title || 'Untitled Task',
                            description: data.description,
                            priority: data.priority as TaskPriority,
                            status: data.status as TaskStatus,
                            dueDate: data.dueDate,
                            ownerId: 'Me',
                            leadIds: data.leadIds || [],
                            createdAt: new Date().toISOString()
                        };
                        onAddTask(newTask);
                    }
                    setShowModal(false);
                }}
                leads={leads}
                initialData={formTask}
                isEditing={isEditing}
            />
        </div>
    );
};

export default TasksList;
