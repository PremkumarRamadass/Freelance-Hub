export interface FinancialSummary {
  totalContractValue: number;
  totalCollected: number;
  pendingCollection: number;
  totalTaxCollected: number;
  estimatedExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalClientsCount: number;
  totalInvoicesCount: number;
  totalPaymentsRecorded: number;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
  pct: number;
  expenses: number;
}

export interface ClientRevenue {
  clientId: string;
  name: string;
  company: string;
  email: string;
  projectsCount: number;
  totalBilled: number;
  status: string;
}

export const INITIAL_FINANCIAL_SUMMARY: FinancialSummary = {
  totalContractValue: 0,
  totalCollected: 0,
  pendingCollection: 0,
  totalTaxCollected: 0,
  estimatedExpenses: 0,
  netProfit: 0,
  profitMarginPercent: 0,
  activeProjectsCount: 0,
  completedProjectsCount: 0,
  totalClientsCount: 0,
  totalInvoicesCount: 0,
  totalPaymentsRecorded: 0
};
