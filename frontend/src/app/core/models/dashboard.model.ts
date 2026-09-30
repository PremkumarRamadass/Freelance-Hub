import { Project } from './project.model';
import { Task } from './task.model';
import { Quotation } from './quotation.model';
import { Payment } from './payment.model';

export interface DashboardKPIs {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  pendingAmount: number;
  clientsCount: number;
  quotationsCount: number;
}

export interface DashboardTaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface MonthlyRevenueData {
  month: string;
  height: number;
  tooltip: boolean;
}

export interface DashboardRecentProject {
  id: string;
  name: string;
  client: string;
  deadline: string;
  progress: number;
  status: string;
}

export interface DashboardDeadlineItem {
  id: string;
  client: string;
  project: string;
  daysLeft: string;
  dueDate: string;
  days: number;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  pendingAmount: number;
  clientsCount: number;
  quotationsCount: number;
  tasks?: DashboardTaskStats;
  monthlyData?: MonthlyRevenueData[];
  recentProjects: DashboardRecentProject[];
  recentInvoices: Payment[];
  recentQuotations: Quotation[];
  recentPayments: Payment[];
}

export interface BackendDashboardResponse {
  kpis?: Partial<DashboardKPIs>;
  tasks?: DashboardTaskStats;
  monthlyData?: MonthlyRevenueData[];
  recentProjects?: DashboardRecentProject[];
  recentInvoices?: Payment[];
  recentQuotations?: Quotation[];
  recentPayments?: Payment[];
}

export interface ClientPortalStats {
  activeContracts: number;
  completedMilestones: string;
  paidToDate: number;
  pendingHandoverDue: number;
  projects: Project[];
  tasks: Task[];
  invoices: Payment[];
  quotations: Quotation[];
}

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalRevenue: 0,
  pendingAmount: 0,
  clientsCount: 0,
  quotationsCount: 0,
  tasks: {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  },
  monthlyData: [],
  recentProjects: [],
  recentInvoices: [],
  recentQuotations: [],
  recentPayments: []
};

export const INITIAL_CLIENT_PORTAL_STATS: ClientPortalStats = {
  activeContracts: 0,
  completedMilestones: '0 / 0',
  paidToDate: 0,
  pendingHandoverDue: 0,
  projects: [],
  tasks: [],
  invoices: [],
  quotations: []
};
