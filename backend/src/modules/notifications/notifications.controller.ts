import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { Notification } from '../../entities/notification.entity.js';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all notifications (Notifications Screen)' })
  @ApiResponse({ status: 200, description: 'List of user notifications' })
  async findAll(): Promise<Notification[]> {
    return this.notifService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create new notification alert' })
  async create(@Body() data: Partial<Notification>): Promise<Notification> {
    return this.notifService.create(data);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notifService.markAsRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    return this.notifService.markAllAsRead();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification by ID' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.notifService.remove(id);
    return { success: true };
  }
}
