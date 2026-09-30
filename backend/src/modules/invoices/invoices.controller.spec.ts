import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller.js';
import { InvoicesService } from './invoices.service.js';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      findAll: vi.fn(),
      findAllPayments: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      payInvoice: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoicesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
  });

  it('should return all invoices', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1', invoiceNumber: 'INV-1' }]);
    const res = await controller.findAll();
    expect(res.length).toBe(1);
  });

  it('should return all payments', async () => {
    mockService.findAllPayments.mockResolvedValue([{ id: 'p1', amount: 5000 }]);
    const res = await controller.findAllPayments();
    expect(res.length).toBe(1);
  });

  it('should process payment on payInvoice', async () => {
    mockService.payInvoice.mockResolvedValue({ id: '1', status: 'Paid' });
    const res = await controller.payInvoice('1', { amount: 5000, paymentMethod: 'UPI' });
    expect(res.status).toBe('Paid');
    expect(mockService.payInvoice).toHaveBeenCalledWith('1', 5000, 'UPI', undefined);
  });
});
