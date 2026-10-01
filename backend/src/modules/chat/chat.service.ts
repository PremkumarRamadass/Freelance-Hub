import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChatMessage,
  User,
  Project,
  Invoice,
  Task,
  Client,
  Quotation,
  Proposal,
} from '../../entities/index.js';

export interface AskQuestionDto {
  message: string;
  channel?: string;
}

export interface ChatResponse {
  id: string;
  senderRole: 'assistant';
  message: string;
  channel: string;
  suggestedPrompts?: string[];
  actionLinks?: { label: string; route: string; icon: string }[];
  createdAt: Date;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepo: Repository<ChatMessage>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Quotation)
    private readonly quoteRepo: Repository<Quotation>,
    @InjectRepository(Proposal)
    private readonly proposalRepo: Repository<Proposal>,
  ) {}

  async getHistory(userId: string, channel = 'ai-assistant'): Promise<ChatMessage[]> {
    return this.chatRepo.find({
      where: { userId, channel },
      order: { createdAt: 'ASC' },
      take: 50,
    });
  }

  async clearHistory(userId: string, channel = 'ai-assistant'): Promise<{ success: boolean }> {
    await this.chatRepo.delete({ userId, channel });
    return { success: true };
  }

  getSuggestedPrompts(role: string): string[] {
    if (role === 'CLIENT') {
      return [
        'How do I create and publish a project?',
        'How do I review freelancer proposals?',
        'Show my active projects and budgets',
        'What invoices are pending payment?',
        'How does contract assignment work on LanceNexa?',
      ];
    }
    if (role === 'ADMIN') {
      return [
        'Summarize platform activities and revenue',
        'Show active projects across all clients',
        'How many proposals have been submitted?',
        'What are the pending invoices across the agency?',
      ];
    }
    return [
      'Show my active tasks and deadlines',
      'How do I find published projects and submit a proposal?',
      'What are my total earnings and pending invoices?',
      'How do I send a quotation to a client?',
      'Tips for writing winning proposals on LanceNexa',
    ];
  }

  async askQuestion(
    user: { id: string; name: string; role: string; email?: string },
    dto: AskQuestionDto,
  ): Promise<ChatResponse> {
    const rawQuestion = dto.message.trim();
    const channel = dto.channel || 'ai-assistant';

    // 1. Record User Message
    const userMsg = this.chatRepo.create({
      userId: user.id,
      userName: user.name,
      senderRole: 'user',
      message: rawQuestion,
      channel,
    });
    await this.chatRepo.save(userMsg);

    // 2. Synthesize Contextual Answer
    const { answer, suggestedPrompts, actionLinks } = await this.generateAnswer(user, rawQuestion);

    // 3. Record Assistant Response
    const assistantMsg = this.chatRepo.create({
      userId: user.id,
      userName: 'Nexa AI Assistant',
      senderRole: 'assistant',
      message: answer,
      channel,
      metadata: { suggestedPrompts, actionLinks },
    });
    const savedAssistantMsg = await this.chatRepo.save(assistantMsg);

    return {
      id: savedAssistantMsg.id,
      senderRole: 'assistant',
      message: answer,
      channel,
      suggestedPrompts,
      actionLinks,
      createdAt: savedAssistantMsg.createdAt,
    };
  }

  private async generateAnswer(
    user: { id: string; name: string; role: string; email?: string },
    question: string,
  ): Promise<{
    answer: string;
    suggestedPrompts: string[];
    actionLinks: { label: string; route: string; icon: string }[];
  }> {
    const q = question.toLowerCase();

    // 1. PROJECTS INTENT
    if (q.includes('project') || q.includes('contract') || q.includes('browse') || q.includes('my project')) {
      const allProjects = await this.projectRepo.find();
      const published = allProjects.filter(p => p.status === 'Published');
      const inProgress = allProjects.filter(p => p.status === 'In Progress' || p.status === 'Assigned');

      if (user.role === 'CLIENT') {
        const clientProjects = allProjects.filter(
          p => p.clientId === user.id || p.clientName?.toLowerCase().includes(user.name.toLowerCase()),
        );
        return {
          answer: `### 📁 Your Client Projects Overview\n\nYou currently have **${clientProjects.length}** project(s) registered in your account:\n\n` +
            clientProjects
              .map(p => `* **${p.name}** — \`${p.status}\` • Budget: ₹${Number(p.budget || 0).toLocaleString('en-IN')} (Deadline: ${p.deadline || 'Flexible'})`)
              .join('\n') +
            `\n\n💡 *To post a new project, click "+ Create New Project" in your Projects portal.*`,
          suggestedPrompts: ['How do I review freelancer proposals?', 'Show my pending invoices', 'Create a new project'],
          actionLinks: [
            { label: 'Go to My Projects', route: '/projects', icon: 'pi-folder' },
            { label: 'View Tasks', route: '/tasks', icon: 'pi-check-square' },
          ],
        };
      }

      return {
        answer: `### 🚀 Marketplace & Projects Status\n\nHere is what is currently active on **Lance Nexa**:\n\n` +
          `* **${published.length} Published Project(s)** open for bidding in the Marketplace.\n` +
          `* **${inProgress.length} Assigned / Ongoing Sprints** currently in development.\n\n` +
          `Recent available jobs:\n` +
          published
            .slice(0, 3)
            .map(p => `* **${p.name}** (₹${Number(p.budget || 0).toLocaleString('en-IN')}) — Required: \`${(p.requiredSkills || []).slice(0, 3).join(', ') || 'Full Stack'}\``)
            .join('\n') +
          `\n\n👉 Head over to **Browse Projects** to submit your proposal!`,
        suggestedPrompts: ['How do I submit a proposal?', 'Show my assigned tasks', 'Check invoice status'],
        actionLinks: [
          { label: 'Browse Projects', route: '/browse-projects', icon: 'pi-compass' },
          { label: 'My Projects', route: '/projects', icon: 'pi-folder' },
        ],
      };
    }

    // 2. INVOICES / FINANCIALS / EARNINGS
    if (q.includes('invoice') || q.includes('payment') || q.includes('paid') || q.includes('earning') || q.includes('money') || q.includes('bill')) {
      const invoices = await this.invoiceRepo.find();
      const paidInvoices = invoices.filter(i => i.status === 'Paid');
      const pendingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
      const totalPaid = paidInvoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
      const totalPending = pendingInvoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);

      if (user.role === 'CLIENT') {
        return {
          answer: `### 💳 Invoices & Billing Summary\n\n` +
            `* **Pending Invoices:** **${pendingInvoices.length}** totaling **₹${totalPending.toLocaleString('en-IN')}**.\n` +
            `* **Settled Invoices:** **${paidInvoices.length}** totaling **₹${totalPaid.toLocaleString('en-IN')}**.\n\n` +
            `You can view breakdown items, download receipts, and process instant milestone payments directly in your Invoices section.`,
          suggestedPrompts: ['Show active projects', 'How to approve a quotation?', 'Contact support'],
          actionLinks: [
            { label: 'View Invoices', route: '/invoices', icon: 'pi-file' },
          ],
        };
      }

      return {
        answer: `### 💰 Financial & Invoicing Overview\n\n` +
          `* **Total Collected:** **₹${totalPaid.toLocaleString('en-IN')}** across ${paidInvoices.length} paid invoices.\n` +
          `* **Pending Receivables:** **₹${totalPending.toLocaleString('en-IN')}** waiting for client settlement.\n\n` +
          `You can generate GST-ready invoices and mark milestones as completed from the **Invoices** portal.`,
        suggestedPrompts: ['Show my ongoing tasks', 'How do I submit a proposal?', 'View reports'],
        actionLinks: [
          { label: 'Manage Invoices', route: '/invoices', icon: 'pi-file' },
          { label: 'Financial Reports', route: '/reports', icon: 'pi-chart-line' },
        ],
      };
    }

    // 3. TASKS & SPRINTS
    if (q.includes('task') || q.includes('sprint') || q.includes('todo') || q.includes('deadline')) {
      const tasks = await this.taskRepo.find();
      const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
      const completed = tasks.filter(t => t.status === 'Completed');

      return {
        answer: `### 📋 Tasks & Milestone Tracker\n\n` +
          `* **Pending Tasks:** **${pending.length}** tasks in progress.\n` +
          `* **Completed Deliverables:** **${completed.length}** tasks closed.\n\n` +
          `Top priority items:\n` +
          pending
            .slice(0, 3)
            .map(t => `* **${t.title}** (${t.priority} priority) — Due: ${t.dueDate || 'Sprint End'}`)
            .join('\n') +
          `\n\nKeep up the great momentum!`,
        suggestedPrompts: ['Show project details', 'What invoices are pending?', 'Check earnings'],
        actionLinks: [
          { label: 'Open Task Board', route: '/tasks', icon: 'pi-check-square' },
        ],
      };
    }

    // 4. PROPOSALS & QUOTATIONS WORKFLOW
    if (q.includes('proposal') || q.includes('bid') || q.includes('quote') || q.includes('quotation')) {
      const proposals = await this.proposalRepo.find();
      const quotes = await this.quoteRepo.find();

      return {
        answer: `### 🤝 Proposals & Quotations Guide\n\n` +
          `On **Lance Nexa**, the project assignment workflow operates as follows:\n\n` +
          `1. **Post Project:** Client creates project in \`Draft\` or \`Published\` status.\n` +
          `2. **Marketplace Visibility:** Once published, freelancers view details in **Browse Projects**.\n` +
          `3. **Submit Proposal:** Freelancer inputs proposed bid price, estimated delivery timeline, and cover letter.\n` +
          `4. **Review & Award:** Client reviews received proposals and clicks **Accept**.\n` +
          `5. **Automated Assignment:** The accepted proposal assigns the contract, and competing proposals are gracefully closed.\n\n` +
          `*Current platform proposals:* **${proposals.length}** submitted | **${quotes.length}** formal quotations generated.`,
        suggestedPrompts: ['Show published projects', 'View active quotations', 'How to invoice a client?'],
        actionLinks: [
          { label: 'Browse Projects', route: '/browse-projects', icon: 'pi-compass' },
          { label: 'View Quotations', route: '/quotations', icon: 'pi-file-edit' },
        ],
      };
    }

    // 5. CLIENTS INTENT
    if (q.includes('client') || q.includes('customer') || q.includes('contact')) {
      const clients = await this.clientRepo.find();
      return {
        answer: `### 🏢 Client Directory Summary\n\n` +
          `You have **${clients.length}** client account(s) registered in your network:\n\n` +
          clients
            .slice(0, 4)
            .map(c => `* **${c.name}** (${c.company}) — Status: \`${c.status}\``)
            .join('\n') +
          `\n\nNavigate to the **Clients** module to add notes, invite new representatives, or review contract history.`,
        suggestedPrompts: ['Show active projects', 'Create new project', 'View invoices'],
        actionLinks: [
          { label: 'Clients Directory', route: '/clients', icon: 'pi-users' },
        ],
      };
    }

    // 6. GENERAL ASSISTANT / FALLBACK GREETING
    return {
      answer: `Hello **${user.name}**! 👋 I am your **Nexa AI Platform Assistant**.\n\n` +
        `I am connected directly to your **Lance Nexa** workspace. I can help you with:\n\n` +
        `* 📁 **Projects & Marketplace:** Tracking project milestones, browsing jobs, or posting new contracts.\n` +
        `* 📝 **Proposals & Bids:** Reviewing bids, understanding submission guidelines, and contract awards.\n` +
        `* 💳 **Invoices & Billing:** Checking pending balances, payment status, and financial metrics.\n` +
        `* 📋 **Task Management:** Viewing sprint deliverables and checking deadlines.\n\n` +
        `How can I assist you right now? Feel free to pick a prompt below or type your question.`,
      suggestedPrompts: this.getSuggestedPrompts(user.role),
      actionLinks: [
        { label: 'Dashboard', route: '/dashboard', icon: 'pi-th-large' },
        { label: 'Browse Projects', route: '/browse-projects', icon: 'pi-compass' },
      ],
    };
  }
}
