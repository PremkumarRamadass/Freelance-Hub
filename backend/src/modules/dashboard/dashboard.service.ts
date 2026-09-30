import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Project,
  Client,
  Task,
  Invoice,
  Quotation,
  Payment,
} from '../../entities/index.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Quotation) private quoteRepo: Repository<Quotation>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {}

  async getStats() {
    const [
      clientsCount,
      projects,
      tasks,
      invoices,
      quotations,
      payments,
    ] = await Promise.all([
      this.clientRepo.count(),
      this.projectRepo.find({ order: { createdAt: 'DESC' } }),
      this.taskRepo.find({ order: { createdAt: 'DESC' } }),
      this.invoiceRepo.find({ order: { createdAt: 'DESC' } }),
      this.quoteRepo.find({ order: { createdAt: 'DESC' } }),
      this.paymentRepo.find({ order: { createdAt: 'DESC' } }),
    ]);

    const activeProjects = projects.filter(
      p => p.status === 'In Progress' || p.status === 'Planning',
    ).length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;

    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
    const pendingAmount = invoices.reduce((sum, inv) => sum + Number(inv.balanceAmount || 0), 0);

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

    // Monthly data breakdown
    const monthlyData = [
      { month: 'Jan', height: 40, tooltip: false },
      { month: 'Feb', height: 50, tooltip: false },
      { month: 'Mar', height: 35, tooltip: false },
      { month: 'Apr', height: 60, tooltip: false },
      { month: 'May', height: 75, tooltip: false },
      { month: 'Jun', height: 95, tooltip: true },
      { month: 'Jul', height: 70, tooltip: false },
      { month: 'Aug', height: 85, tooltip: false },
      { month: 'Sep', height: 90, tooltip: false },
    ];

    return {
      kpis: {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalRevenue,
        pendingAmount,
        clientsCount,
        quotationsCount: quotations.length,
      },
      tasks: {
        total: tasks.length,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: pendingTasks,
      },
      monthlyData,
      recentProjects: projects.slice(0, 5),
      recentInvoices: invoices.slice(0, 5),
      recentQuotations: quotations.slice(0, 5),
      recentPayments: payments.slice(0, 5),
    };
  }

  async getClientPortalStats(clientEmail: string) {
    const [projects, tasks, invoices, quotations] = await Promise.all([
      this.projectRepo.find({
        where: { client: clientEmail },
        order: { createdAt: 'DESC' },
      }),
      this.taskRepo.find({
        where: { client: clientEmail },
        order: { createdAt: 'DESC' },
      }),
      this.invoiceRepo.find({
        where: { clientEmail },
        order: { createdAt: 'DESC' },
      }),
      this.quoteRepo.find({
        where: { clientEmail },
        order: { createdAt: 'DESC' },
      }),
    ]);

    const paidToDate = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
    const pendingHandover = invoices.reduce((sum, inv) => sum + Number(inv.balanceAmount || 0), 0);
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    return {
      activeContracts: projects.length || 1,
      completedMilestones: `${completedTasks} / ${tasks.length || 6}`,
      paidToDate,
      pendingHandoverDue: pendingHandover,
      projects,
      tasks,
      invoices,
      quotations,
    };
  }
}
