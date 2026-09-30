import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async findAll(): Promise<Notification[]> {
    return this.notifRepo.find({ order: { createdAt: 'DESC' } });
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    const notif = this.notifRepo.create({
      ...data,
      time: data.time || 'Just now',
      read: data.read ?? false,
      type: data.type || 'info',
    });
    return this.notifRepo.save(notif);
  }

  async markAsRead(id: string): Promise<Notification> {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException(`Notification with id ${id} not found`);
    notif.read = true;
    return this.notifRepo.save(notif);
  }

  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    const unread = await this.notifRepo.find({ where: { read: false } });
    for (const n of unread) {
      n.read = true;
    }
    await this.notifRepo.save(unread);
    return { success: true, count: unread.length };
  }

  async remove(id: string): Promise<void> {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (notif) {
      await this.notifRepo.remove(notif);
    }
  }
}
