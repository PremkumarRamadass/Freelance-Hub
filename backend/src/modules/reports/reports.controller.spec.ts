import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';

describe('ReportsController', () => {
  let controller: ReportsController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getFinancialSummary: vi.fn(),
      getMonthlyTrends: vi.fn(),
      getClientRevenueBreakdown: vi.fn(),
      exportCsvData: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should get summary via getSummary', async () => {
    mockService.getFinancialSummary.mockResolvedValue({ totalCollected: 50000 });
    const res = await controller.getSummary();
    expect(res.totalCollected).toBe(50000);
  });

  it('should get monthly trends', async () => {
    mockService.getMonthlyTrends.mockResolvedValue([{ month: 'Jan', amount: 1000 }]);
    const res = await controller.getMonthlyTrends();
    expect(res.length).toBe(1);
  });

  it('should export csv with appropriate response headers', async () => {
    mockService.exportCsvData.mockResolvedValue('col1,col2\nval1,val2');
    const mockRes: any = {
      setHeader: vi.fn(),
      send: vi.fn((val) => val),
    };

    await controller.exportCsv(mockRes);
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(mockRes.send).toHaveBeenCalledWith('col1,col2\nval1,val2');
  });
});
