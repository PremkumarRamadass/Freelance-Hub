import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ChatMessage,
  User,
  Project,
  Invoice,
  Task,
  Client,
  Quotation,
  Proposal,
} from '../../entities/index.js';
import { ChatService } from './chat.service.js';
import { ChatController } from './chat.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatMessage,
      User,
      Project,
      Invoice,
      Task,
      Client,
      Quotation,
      Proposal,
    ]),
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
