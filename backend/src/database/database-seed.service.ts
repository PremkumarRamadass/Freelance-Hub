import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  User,
  Client,
  Project,
  Task,
  Quotation,
  Invoice,
  Payment,
  Document,
  Notification,
} from '../entities/index.js';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Quotation) private quoteRepo: Repository<Quotation>,
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Document) private docRepo: Repository<Document>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.seedUsers();
      await this.seedClients();
      await this.seedProjects();
      await this.seedTasks();
      await this.seedQuotations();
      await this.seedInvoices();
      await this.seedPayments();
      await this.seedDocuments();
      await this.seedNotifications();
      this.logger.log('✅ PostgreSQL database schema & initial seed ready');
    } catch (err: any) {
      this.logger.warn(`Database seeding notice: ${err?.message || err}`);
    }
  }

  private async seedUsers() {
    const count = await this.userRepo.count();
    if (count > 0) return;

    const salt = await bcrypt.genSalt(10);
    const freelancerPass = await bcrypt.hash('freelancer123', salt);
    const clientPass = await bcrypt.hash('client123', salt);
    const adminPass = await bcrypt.hash('admin123', salt);

    await this.userRepo.save([
      {
        name: 'Premkumar',
        email: 'prem@lancenexus.dev',
        password: freelancerPass,
        role: 'FREELANCER',
        title: 'Full Stack Architect & Consultant',
        hourlyRate: 2500,
        phone: '+91 98765 43210',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@abcpvtltd.com',
        password: clientPass,
        role: 'CLIENT',
        companyName: 'ABC Pvt Ltd',
        title: 'Managing Director',
        phone: '+91 98200 12345',
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      },
      {
        name: 'Super Admin',
        email: 'admin@lancenexus.dev',
        password: adminPass,
        role: 'ADMIN',
        companyName: 'LanceNexus Agency',
        title: 'Operations Director',
        phone: '+91 99999 88888',
        avatarUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      },
    ]);
    this.logger.log('Seeded demo users (Freelancer, Client, Admin)');
  }

  private async seedClients() {
    const count = await this.clientRepo.count();
    if (count > 0) return;

    await this.clientRepo.save([
      {
        name: 'Rahul Sharma',
        company: 'ABC Pvt Ltd',
        email: 'rahul@abcpvtltd.com',
        phone: '+91 98200 12345',
        status: 'Active',
        totalBilled: 75000,
        totalPaid: 60000,
        pendingAmount: 15000,
        activeProjects: 1,
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      },
      {
        name: 'Priya Patel',
        company: 'XYZ Technologies',
        email: 'priya@xyztech.com',
        phone: '+91 98333 44556',
        status: 'Active',
        totalBilled: 45000,
        totalPaid: 45000,
        pendingAmount: 0,
        activeProjects: 1,
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      {
        name: 'Amit Verma',
        company: 'Nexus Digital',
        email: 'amit@nexusdigital.io',
        phone: '+91 98111 22334',
        status: 'Active',
        totalBilled: 120000,
        totalPaid: 80000,
        pendingAmount: 40000,
        activeProjects: 2,
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      },
    ]);
  }

  private async seedProjects() {
    const count = await this.projectRepo.count();
    if (count > 0) return;

    await this.projectRepo.save([
      {
        name: 'Website Development',
        client: 'ABC Pvt Ltd',
        status: 'In Progress',
        deadline: '30 Nov 2026',
        budget: 75000,
        spent: 45000,
        progress: 75,
        description: 'Custom corporate web portal with Angular and NestJS.',
        category: 'Web App',
        tasksCount: 6,
        completedTasks: 4,
      },
      {
        name: 'Mobile App UI/UX',
        client: 'XYZ Technologies',
        status: 'In Progress',
        deadline: '15 Oct 2026',
        budget: 45000,
        spent: 20000,
        progress: 40,
        description: 'Complete cross-platform design tokens and prototype.',
        category: 'Mobile Design',
        tasksCount: 5,
        completedTasks: 2,
      },
      {
        name: 'E-commerce Platform',
        client: 'Nexus Digital',
        status: 'Planning',
        deadline: '20 Dec 2026',
        budget: 120000,
        spent: 25000,
        progress: 20,
        description: 'Multi-vendor marketplace with UPI payments.',
        category: 'E-Commerce',
        tasksCount: 8,
        completedTasks: 1,
      },
    ]);
  }

  private async seedTasks() {
    const count = await this.taskRepo.count();
    if (count > 0) return;

    await this.taskRepo.save([
      {
        title: 'Design System & Component Architecture',
        projectName: 'Website Development',
        client: 'ABC Pvt Ltd',
        dueDate: '10 Oct 2026',
        priority: 'High',
        status: 'Completed',
        estimatedHours: 12,
        loggedHours: 12,
      },
      {
        title: 'PrimeNG Enterprise Suite Integration',
        projectName: 'Website Development',
        client: 'ABC Pvt Ltd',
        dueDate: '18 Oct 2026',
        priority: 'High',
        status: 'Completed',
        estimatedHours: 16,
        loggedHours: 16,
      },
      {
        title: 'Client Portal & Authentication Workflow',
        projectName: 'Website Development',
        client: 'ABC Pvt Ltd',
        dueDate: '25 Oct 2026',
        priority: 'Urgent',
        status: 'Completed',
        estimatedHours: 20,
        loggedHours: 19,
      },
      {
        title: 'Payment Gateway UPI Reconciliation',
        projectName: 'Website Development',
        client: 'ABC Pvt Ltd',
        dueDate: '15 Nov 2026',
        priority: 'High',
        status: 'In Progress',
        estimatedHours: 14,
        loggedHours: 8,
      },
      {
        title: 'Automated GST Invoicing & PDF Generation',
        projectName: 'Website Development',
        client: 'ABC Pvt Ltd',
        dueDate: '30 Nov 2026',
        priority: 'Medium',
        status: 'Pending',
        estimatedHours: 10,
        loggedHours: 0,
      },
    ]);
  }

  private async seedQuotations() {
    const count = await this.quoteRepo.count();
    if (count > 0) return;

    await this.quoteRepo.save([
      {
        quoteNumber: 'QT-2026-001',
        clientName: 'ABC Pvt Ltd',
        clientEmail: 'rahul@abcpvtltd.com',
        date: '2026-10-01',
        validUntil: '2026-11-01',
        subtotal: 63559.32,
        gstRate: 18,
        gstAmount: 11440.68,
        totalAmount: 75000,
        status: 'Approved',
        notes: 'Full sprint scope including frontend, backend and deployment.',
        items: [
          {
            id: 'qi_1',
            description: 'Angular 21 + PrimeNG Enterprise Frontend',
            quantity: 1,
            rate: 35000,
            amount: 35000,
          },
          {
            id: 'qi_2',
            description: 'NestJS + PostgreSQL Backend REST API',
            quantity: 1,
            rate: 28559.32,
            amount: 28559.32,
          },
        ],
      },
    ]);
  }

  private async seedInvoices() {
    const count = await this.invoiceRepo.count();
    if (count > 0) return;

    await this.invoiceRepo.save([
      {
        invoiceNumber: 'INV-2026-001',
        clientName: 'ABC Pvt Ltd',
        clientEmail: 'rahul@abcpvtltd.com',
        issueDate: '2026-10-05',
        dueDate: '2026-10-15',
        subtotal: 25423.73,
        taxAmount: 4576.27,
        totalAmount: 30000,
        paidAmount: 30000,
        balanceAmount: 0,
        status: 'Paid',
        paymentMethod: 'UPI',
        items: [
          {
            id: 'ii_1',
            description: 'Milestone 1: Architecture & UI Setup',
            quantity: 1,
            rate: 25423.73,
            amount: 25423.73,
          },
        ],
      },
      {
        invoiceNumber: 'INV-2026-002',
        clientName: 'ABC Pvt Ltd',
        clientEmail: 'rahul@abcpvtltd.com',
        issueDate: '2026-10-25',
        dueDate: '2026-11-05',
        subtotal: 25423.73,
        taxAmount: 4576.27,
        totalAmount: 30000,
        paidAmount: 30000,
        balanceAmount: 0,
        status: 'Paid',
        paymentMethod: 'UPI',
        items: [
          {
            id: 'ii_2',
            description: 'Milestone 2: Client Portal & Workflows',
            quantity: 1,
            rate: 25423.73,
            amount: 25423.73,
          },
        ],
      },
      {
        invoiceNumber: 'INV-2026-003',
        clientName: 'ABC Pvt Ltd',
        clientEmail: 'rahul@abcpvtltd.com',
        issueDate: '2026-11-10',
        dueDate: '2026-11-30',
        subtotal: 12711.86,
        taxAmount: 2288.14,
        totalAmount: 15000,
        paidAmount: 0,
        balanceAmount: 15000,
        status: 'Sent',
        paymentMethod: 'UPI / Bank Transfer',
        items: [
          {
            id: 'ii_3',
            description: 'Milestone 3: Final Delivery & Handover',
            quantity: 1,
            rate: 12711.86,
            amount: 12711.86,
          },
        ],
      },
    ]);
  }

  private async seedPayments() {
    const count = await this.paymentRepo.count();
    if (count > 0) return;

    await this.paymentRepo.save([
      {
        invoiceId: 'INV-2026-001',
        amount: 30000,
        paymentMethod: 'UPI',
        referenceNumber: 'UPI/2026/89471982',
        transactionDate: '2026-10-12',
        status: 'Completed',
      },
      {
        invoiceId: 'INV-2026-002',
        amount: 30000,
        paymentMethod: 'UPI',
        referenceNumber: 'UPI/2026/91024817',
        transactionDate: '2026-11-02',
        status: 'Completed',
      },
    ]);
  }

  private async seedDocuments() {
    const count = await this.docRepo.count();
    if (count > 0) return;

    await this.docRepo.save([
      {
        name: 'Website_Contract_ABC_Pvt_Ltd.pdf',
        project: 'Website Development',
        type: 'PDF',
        size: '2.4 MB',
        date: '01 Oct 2026',
        icon: 'pi-file-pdf',
      },
      {
        name: 'Non_Disclosure_Agreement_Signed.pdf',
        project: 'FinTech Mobile App',
        type: 'PDF',
        size: '1.1 MB',
        date: '18 Aug 2026',
        icon: 'pi-file-pdf',
      },
      {
        name: 'Software_Architecture_Design_Spec.docx',
        project: 'E-commerce Platform',
        type: 'DOCX',
        size: '4.8 MB',
        date: '05 Sep 2026',
        icon: 'pi-file-word',
      },
    ]);
  }

  private async seedNotifications() {
    const count = await this.notifRepo.count();
    if (count > 0) return;

    await this.notifRepo.save([
      {
        title: 'Quotation Approved',
        message: 'Rahul Sharma approved quotation QT-2026-001 for ABC Pvt Ltd.',
        type: 'success',
        read: false,
        time: '10m ago',
        targetUrl: '/quotations',
      },
      {
        title: 'UPI Payment Reconciled',
        message: 'Payment of ₹30,000 received for INV-2026-002 via UPI.',
        type: 'info',
        read: false,
        time: '1h ago',
        targetUrl: '/invoices',
      },
      {
        title: 'Deliverable Deadline Approaching',
        message: 'Mobile App UI/UX sprint deliverable is due in 3 days.',
        type: 'warning',
        read: true,
        time: '1d ago',
        targetUrl: '/tasks',
      },
    ]);
  }
}
