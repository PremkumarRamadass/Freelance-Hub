import { Test, TestingModule } from '@nestjs/testing';
import { QuotationsController } from './quotations.controller.js';
import { QuotationsService } from './quotations.service.js';

describe('QuotationsController', () => {
  let controller: QuotationsController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotationsController],
      providers: [
        {
          provide: QuotationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<QuotationsController>(QuotationsController);
  });

  it('should list all quotations', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1', quoteNumber: 'QT-1' }]);
    const res = await controller.findAll();
    expect(res.length).toBe(1);
  });

  it('should approve quotation', async () => {
    mockService.approve.mockResolvedValue({ id: '1', status: 'Approved' });
    const res = await controller.approve('1');
    expect(res.status).toBe('Approved');
    expect(mockService.approve).toHaveBeenCalledWith('1');
  });

  it('should reject quotation', async () => {
    mockService.reject.mockResolvedValue({ id: '1', status: 'Rejected' });
    const res = await controller.reject('1');
    expect(res.status).toBe('Rejected');
    expect(mockService.reject).toHaveBeenCalledWith('1');
  });
});
