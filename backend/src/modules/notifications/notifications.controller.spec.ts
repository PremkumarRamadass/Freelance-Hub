import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      findAll: vi.fn(),
      create: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should list all notifications', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1', title: 'Alert' }]);
    const res = await controller.findAll();
    expect(res.length).toBe(1);
  });

  it('should mark as read', async () => {
    mockService.markAsRead.mockResolvedValue({ id: '1', read: true });
    const res = await controller.markAsRead('1');
    expect(res.read).toBe(true);
  });

  it('should mark all as read', async () => {
    mockService.markAllAsRead.mockResolvedValue({ success: true, count: 5 });
    const res = await controller.markAllAsRead();
    expect(res.count).toBe(5);
  });
});
