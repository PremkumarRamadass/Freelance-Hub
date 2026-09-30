import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, Client, Invoice, Payment } from '../../entities/index.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {}

  async getFinancialSummary() {
    const [projects, invoices, clients, payments] = await Promise.all([
      this.projectRepo.find(),
      this.invoiceRepo.find(),
      this.clientRepo.find(),
      this.paymentRepo.find(),
    ]);

    const totalContractValue = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
    const pendingCollection = invoices.reduce((sum, inv) => sum + Number(inv.balanceAmount || 0), 0);
    const totalTaxCollected = invoices.reduce((sum, inv) => sum + Number(inv.taxAmount || 0), 0);
    const estimatedExpenses = Math.round(totalCollected * 0.18);
    const netProfit = totalCollected - estimatedExpenses;

    return {
      totalContractValue,
      totalCollected,
      pendingCollection,
      totalTaxCollected,
      estimatedExpenses,
      netProfit,
      profitMarginPercent: totalCollected > 0 ? Math.round((netProfit / totalCollected) * 100) : 82,
      activeProjectsCount: projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length,
      completedProjectsCount: projects.filter(p => p.status === 'Completed').length,
      totalClientsCount: clients.length,
      totalInvoicesCount: invoices.length,
      totalPaymentsRecorded: payments.length,
    };
  }

  async getMonthlyTrends() {
    return [
      { month: 'Jan', amount: 35000, pct: 35, expenses: 6300 },
      { month: 'Feb', amount: 48000, pct: 48, expenses: 8640 },
      { month: 'Mar', amount: 30000, pct: 30, expenses: 5400 },
      { month: 'Apr', amount: 55000, pct: 55, expenses: 9900 },
      { month: 'May', amount: 70000, pct: 70, expenses: 12600 },
      { month: 'Jun', amount: 95000, pct: 95, expenses: 17100 },
      { month: 'Jul', amount: 65000, pct: 65, expenses: 11700 },
      { month: 'Aug', amount: 80000, pct: 80, expenses: 14400 },
      { month: 'Sep', amount: 85000, pct: 85, expenses: 15300 },
    ];
  }

  async getClientRevenueBreakdown() {
    const clients = await this.clientRepo.find({ order: { totalBilled: 'DESC' } });
    return clients.map(c => ({
      clientId: c.id,
      name: c.name,
      company: c.company,
      email: c.email,
      projectsCount: c.projectsCount,
      totalBilled: Number(c.totalBilled || 0),
      status: c.status,
    }));
  }

  async exportCsvData(): Promise<string> {
    const projects = await this.projectRepo.find({ order: { createdAt: 'DESC' } });
    const header = 'Project Name,Client,Category,Budget,Spent,Progress,Status,Deadline\n';
    const rows = projects.map(p =>
      `"${p.name}","${p.client}","${p.category || 'General'}",${p.budget},${p.spent},${p.progress}%,"${p.status}","${p.deadline}"`
    ).join('\n');
    return header + rows;
  }
}
