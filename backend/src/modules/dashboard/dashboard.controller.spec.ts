import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getStats: vi.fn(),
      getClientPortalStats: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should get stats via getStats', async () => {
    mockService.getStats.mockResolvedValue({ kpis: { totalProjects: 10 } });
    const res = await controller.getStats();
    expect(res.kpis.totalProjects).toBe(10);
    expect(mockService.getStats).toHaveBeenCalled();
  });

  it('should get client portal stats via getClientPortalStats', async () => {
    mockService.getClientPortalStats.mockResolvedValue({ paidToDate: 50000 });
    const res = await controller.getClientPortalStats('client@example.com');
    expect(res.paidToDate).toBe(50000);
    expect(mockService.getClientPortalStats).toHaveBeenCalledWith('client@example.com');
  });
});
