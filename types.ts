
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

export type ViewState = 'dashboard' | 'pipelines' | 'leads' | 'invoices' | 'billing' | 'settings';

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
