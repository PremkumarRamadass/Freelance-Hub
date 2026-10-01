import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { User } from '../../entities/user.entity.js';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: any;
  let userRepo: any;

  beforeEach(async () => {
    chatService = {
      getHistory: vi.fn().mockResolvedValue([]),
      clearHistory: vi.fn().mockResolvedValue({ success: true }),
      getSuggestedPrompts: vi.fn().mockReturnValue(['Prompt 1', 'Prompt 2']),
      askQuestion: vi.fn().mockResolvedValue({
        id: 'msg_1',
        senderRole: 'assistant',
        message: 'Hello! I can help you.',
        channel: 'ai-assistant',
        createdAt: new Date(),
      }),
    };

    userRepo = {
      findOne: vi.fn().mockResolvedValue({
        id: 'u_1',
        name: 'Premkumar',
        email: 'prem@lancenexa.dev',
        role: 'FREELANCER',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: chatService },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return chat history for authenticated user', async () => {
    const mockReq = { headers: { authorization: 'Bearer fh_jwt_u_1_12345' } };
    const res = await controller.getHistory(mockReq, 'ai-assistant');
    expect(chatService.getHistory).toHaveBeenCalledWith('u_1', 'ai-assistant');
    expect(res).toEqual([]);
  });

  it('should clear chat history', async () => {
    const mockReq = { headers: { authorization: 'Bearer fh_jwt_u_1_12345' } };
    const res = await controller.clearHistory(mockReq);
    expect(chatService.clearHistory).toHaveBeenCalledWith('u_1', 'ai-assistant');
    expect(res.success).toBe(true);
  });

  it('should return suggested prompts for user role', async () => {
    const mockReq = { headers: { authorization: 'Bearer fh_jwt_u_1_12345' } };
    const res = await controller.getSuggestedPrompts(mockReq);
    expect(chatService.getSuggestedPrompts).toHaveBeenCalledWith('FREELANCER');
    expect(res).toEqual(['Prompt 1', 'Prompt 2']);
  });

  it('should ask question and return assistant reply', async () => {
    const mockReq = { headers: { authorization: 'Bearer fh_jwt_u_1_12345' } };
    const res = await controller.askQuestion(mockReq, { message: 'How to browse projects?' });
    expect(chatService.askQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u_1', role: 'FREELANCER' }),
      { message: 'How to browse projects?' },
    );
    expect(res.message).toContain('Hello! I can help you.');
  });
});
