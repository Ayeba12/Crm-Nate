
export enum StageId {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  WON = 'won',
  LOST = 'lost'
}

export interface Lead {
  id: string;
  title: string;
  company: string;
  value: number;
  stageId: StageId;
  owner: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  email?: string;
}

export interface Stage {
  id: StageId;
  name: string;
  color: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

export type ViewState = 'dashboard' | 'pipelines' | 'leads' | 'tasks' | 'invoices' | 'billing' | 'settings';

export interface DashboardMetrics {
  totalPipelineValue: number;
  newLeadsThisWeek: number;
  winRate: number;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  issueDate: string;
  description: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP';
export type Language = 'English' | 'Spanish' | 'French';

// Task Types
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Open' | 'In Progress' | 'Completed' | 'Archived';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  ownerId: string;
  leadIds: string[]; // Linked leads
  createdAt: string;
  updatedAt?: string;
}

// Saved List Types
export type SavedListType = 'ManualSelection' | 'FilterBased';

export interface SavedList {
  id: string;
  name: string;
  description?: string;
  type: SavedListType;
  leadIds: string[];
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}
