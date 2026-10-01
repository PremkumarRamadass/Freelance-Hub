import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { Notification } from '../../entities/notification.entity.js';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockNotifRepo: any;

  const mockNotif = {
    id: 'notif_1',
    title: 'Payment Received',
    message: '₹50,000 received',
    read: false,
  };

  beforeEach(async () => {
    mockNotifRepo = {
      find: vi.fn().mockResolvedValue([mockNotif]),
      findOne: vi.fn(),
      create: vi.fn((data) => ({ id: 'notif_new', ...data })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotifRepo,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should list all notifications', async () => {
    const list = await service.findAll();
    expect(list.length).toBe(1);
  });

  it('should mark notification as read', async () => {
    mockNotifRepo.findOne.mockResolvedValue({ ...mockNotif });
    const marked = await service.markAsRead('notif_1');
    expect(marked.read).toBe(true);
  });

  it('should throw NotFoundException if notification missing', async () => {
    mockNotifRepo.findOne.mockResolvedValue(null);
    await expect(service.markAsRead('invalid')).rejects.toThrow(NotFoundException);
  });

  it('should mark all notifications as read', async () => {
    mockNotifRepo.find.mockResolvedValue([{ ...mockNotif }]);
    const res = await service.markAllAsRead();
    expect(res.success).toBe(true);
    expect(res.count).toBe(1);
  });
});
