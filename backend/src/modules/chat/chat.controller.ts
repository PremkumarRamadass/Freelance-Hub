import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity.js';
import { extractUserFromRequest } from '../auth/auth-user.util.js';
import { ChatService } from './chat.service.js';
import type { AskQuestionDto } from './chat.service.js';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Get('history')
  async getHistory(@Req() req: any, @Query('channel') channel?: string) {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    const userId = authUser?.id || 'demo_user';
    return this.chatService.getHistory(userId, channel || 'ai-assistant');
  }

  @Delete('history')
  async clearHistory(@Req() req: any, @Query('channel') channel?: string) {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    const userId = authUser?.id || 'demo_user';
    return this.chatService.clearHistory(userId, channel || 'ai-assistant');
  }

  @Get('suggested-prompts')
  async getSuggestedPrompts(@Req() req: any) {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    const role = authUser?.role || 'FREELANCER';
    return this.chatService.getSuggestedPrompts(role);
  }

  @Post('ask')
  async askQuestion(@Req() req: any, @Body() dto: AskQuestionDto) {
    const authUser = await extractUserFromRequest(req, this.userRepo);
    const user = {
      id: authUser?.id || 'demo_user',
      name: authUser?.name || 'Lance Nexa User',
      role: authUser?.role || 'FREELANCER',
      email: authUser?.email,
    };
    return this.chatService.askQuestion(user, dto);
  }
}
