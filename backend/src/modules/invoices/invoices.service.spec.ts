import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service.js';
import { Invoice } from '../../entities/invoice.entity.js';
import { Payment } from '../../entities/payment.entity.js';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let mockInvoiceRepo: any;
  let mockPaymentRepo: any;

  const mockInvoice = {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-001',
    subtotal: 50000,
    taxAmount: 9000,
    totalAmount: 59000,
    paidAmount: 0,
    balanceAmount: 59000,
    status: 'Sent',
  };

  beforeEach(async () => {
    mockInvoiceRepo = {
      find: vi.fn().mockResolvedValue([mockInvoice]),
      findOne: vi.fn(),
      count: vi.fn().mockResolvedValue(1),
      create: vi.fn((data) => ({ id: 'inv_new', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    mockPaymentRepo = {
      find: vi.fn().mockResolvedValue([{ id: 'pay_1', amount: 59000 }]),
      create: vi.fn((data) => ({ id: 'pay_new', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepo,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepo,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should return all invoices', async () => {
    const list = await service.findAll();
    expect(list.length).toBe(1);
    expect(mockInvoiceRepo.find).toHaveBeenCalled();
  });

  it('should find invoice by id', async () => {
    mockInvoiceRepo.findOne.mockResolvedValue(mockInvoice);
    const inv = await service.findOne('inv_1');
    expect(inv.id).toBe('inv_1');
  });

  it('should throw NotFoundException if invoice missing', async () => {
    mockInvoiceRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should create an invoice and calculate total & balance with GST', async () => {
    const inv = await service.create({
      subtotal: 100000,
    });
    expect(inv.subtotal).toBe(100000);
    expect(inv.taxAmount).toBe(18000);
    expect(inv.totalAmount).toBe(118000);
    expect(inv.balanceAmount).toBe(118000);
  });

  it('should pay invoice and record transaction in payment table', async () => {
    mockInvoiceRepo.findOne.mockResolvedValue({ ...mockInvoice });
    const paid = await service.payInvoice('inv_1', 59000, 'UPI', 'UPI/123/FHUB');
    expect(paid.status).toBe('Paid');
    expect(paid.balanceAmount).toBe(0);
    expect(mockPaymentRepo.create).toHaveBeenCalled();
    expect(mockPaymentRepo.save).toHaveBeenCalled();
  });

  it('should list all payments', async () => {
    const payments = await service.findAllPayments();
    expect(payments.length).toBe(1);
  });
});
