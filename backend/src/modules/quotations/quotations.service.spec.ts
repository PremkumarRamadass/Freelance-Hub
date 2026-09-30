import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { QuotationsService } from './quotations.service.js';
import { Quotation } from '../../entities/quotation.entity.js';

describe('QuotationsService', () => {
  let service: QuotationsService;
  let mockQuoteRepo: any;

  const mockQuote = {
    id: 'quot_1',
    quoteNumber: 'QT-2026-001',
    subtotal: 50000,
    gstRate: 18,
    gstAmount: 9000,
    totalAmount: 59000,
    status: 'Draft',
  };

  beforeEach(async () => {
    mockQuoteRepo = {
      find: vi.fn().mockResolvedValue([mockQuote]),
      findOne: vi.fn(),
      count: vi.fn().mockResolvedValue(1),
      create: vi.fn((data) => ({ id: 'quot_new', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationsService,
        {
          provide: getRepositoryToken(Quotation),
          useValue: mockQuoteRepo,
        },
      ],
    }).compile();

    service = module.get<QuotationsService>(QuotationsService);
  });

  it('should list all quotations', async () => {
    const list = await service.findAll();
    expect(list.length).toBe(1);
  });

  it('should get quotation by id', async () => {
    mockQuoteRepo.findOne.mockResolvedValue(mockQuote);
    const q = await service.findOne('quot_1');
    expect(q.id).toBe('quot_1');
  });

  it('should throw NotFoundException if quote missing', async () => {
    mockQuoteRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should create quotation and compute gstAmount & totalAmount', async () => {
    const q = await service.create({ subtotal: 100000 });
    expect(q.gstAmount).toBe(18000);
    expect(q.totalAmount).toBe(118000);
  });

  it('should approve a quotation', async () => {
    mockQuoteRepo.findOne.mockResolvedValue({ ...mockQuote });
    const approved = await service.approve('quot_1');
    expect(approved.status).toBe('Approved');
  });

  it('should reject a quotation', async () => {
    mockQuoteRepo.findOne.mockResolvedValue({ ...mockQuote });
    const rejected = await service.reject('quot_1');
    expect(rejected.status).toBe('Rejected');
  });
});
