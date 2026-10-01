import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatService } from './chat.service.js';
import {
  ChatMessage,
  Project,
  Invoice,
  Task,
  Client,
  Quotation,
  Proposal,
} from '../../entities/index.js';

describe('ChatService', () => {
  let service: ChatService;
  let chatRepo: any;
  let projectRepo: any;
  let invoiceRepo: any;
  let taskRepo: any;
  let clientRepo: any;
  let quoteRepo: any;
  let proposalRepo: any;

  beforeEach(async () => {
    chatRepo = {
      find: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(dto => ({ id: 'chat_1', ...dto, createdAt: new Date() })),
      save: vi.fn().mockImplementation(dto => Promise.resolve({ id: 'chat_1', ...dto, createdAt: new Date() })),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    projectRepo = {
      find: vi.fn().mockResolvedValue([
        { id: 'prj_1', name: 'AI Portal', status: 'Published', budget: 100000, deadline: '2026-11-30' },
      ]),
    };

    invoiceRepo = {
      find: vi.fn().mockResolvedValue([
        { id: 'inv_1', invoiceNumber: 'INV-001', status: 'Paid', totalAmount: 50000 },
        { id: 'inv_2', invoiceNumber: 'INV-002', status: 'Sent', totalAmount: 25000 },
      ]),
    };

    taskRepo = {
      find: vi.fn().mockResolvedValue([
        { id: 'task_1', title: 'Setup DB', status: 'Pending', priority: 'High' },
      ]),
    };

    clientRepo = {
      find: vi.fn().mockResolvedValue([
        { id: 'cli_1', name: 'Rahul Sharma', company: 'ABC Pvt Ltd', status: 'Active' },
      ]),
    };

    quoteRepo = {
      find: vi.fn().mockResolvedValue([
        { id: 'qt_1', quoteNumber: 'QT-001', totalAmount: 80000 },
      ]),
    };

    proposalRepo = {
      find: vi.fn().mockResolvedValue([
        { id: 'prop_1', proposedPrice: 95000, status: 'Submitted' },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(ChatMessage), useValue: chatRepo },
        { provide: getRepositoryToken(Project), useValue: projectRepo },
        { provide: getRepositoryToken(Invoice), useValue: invoiceRepo },
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: getRepositoryToken(Client), useValue: clientRepo },
        { provide: getRepositoryToken(Quotation), useValue: quoteRepo },
        { provide: getRepositoryToken(Proposal), useValue: proposalRepo },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retrieve conversation history by userId and channel', async () => {
    const history = await service.getHistory('user_1');
    expect(chatRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user_1', channel: 'ai-assistant' } }));
    expect(history).toEqual([]);
  });

  it('should clear conversation history', async () => {
    const res = await service.clearHistory('user_1');
    expect(chatRepo.delete).toHaveBeenCalledWith({ userId: 'user_1', channel: 'ai-assistant' });
    expect(res.success).toBe(true);
  });

  it('should answer project questions using database context', async () => {
    const user = { id: 'u1', name: 'Prem', role: 'FREELANCER' };
    const response = await service.askQuestion(user, { message: 'What are the active projects?' });

    expect(response).toBeDefined();
    expect(response.senderRole).toBe('assistant');
    expect(response.message).toContain('Marketplace & Projects Status');
    expect(response.message).toContain('AI Portal');
    expect(projectRepo.find).toHaveBeenCalled();
  });

  it('should answer invoice and payment questions', async () => {
    const user = { id: 'u1', name: 'Prem', role: 'FREELANCER' };
    const response = await service.askQuestion(user, { message: 'How much money have I earned from invoices?' });

    expect(response).toBeDefined();
    expect(response.message).toContain('Financial & Invoicing Overview');
    expect(response.message).toContain('50,000');
    expect(invoiceRepo.find).toHaveBeenCalled();
  });

  it('should provide suggested prompts based on user role', () => {
    const clientPrompts = service.getSuggestedPrompts('CLIENT');
    expect(clientPrompts.length).toBeGreaterThan(0);
    expect(clientPrompts[0]).toContain('create and publish a project');

    const freelancerPrompts = service.getSuggestedPrompts('FREELANCER');
    expect(freelancerPrompts.some(p => p.includes('proposal'))).toBe(true);
  });
});
