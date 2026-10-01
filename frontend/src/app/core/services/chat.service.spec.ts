import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatService } from './chat.service';
import { API_BASE_URL } from '../config/api.config';

describe('ChatService', () => {
  let service: ChatService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ChatService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should initialize with welcome message and default signals', () => {
    expect(service).toBeTruthy();
    expect(service.messages().length).toBeGreaterThan(0);
    expect(service.activeChannel()).toBe('ai-assistant');
    expect(service.isWidgetOpen()).toBe(false);
  });

  it('should toggle widget open/close', () => {
    service.toggleWidget();
    expect(service.isWidgetOpen()).toBe(true);

    service.closeWidget();
    expect(service.isWidgetOpen()).toBe(false);

    service.openWidget();
    expect(service.isWidgetOpen()).toBe(true);
  });

  it('should send a message to backend and append reply', () => {
    service.sendMessage('What are my active projects?').subscribe();

    const req = httpTesting.expectOne(`${API_BASE_URL}/chat/ask`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.message).toBe('What are my active projects?');

    req.flush({
      id: 'ast_123',
      senderRole: 'assistant',
      message: 'You have 3 active projects.',
      channel: 'ai-assistant',
      createdAt: '2026-10-01T10:00:00.000Z'
    });

    expect(service.isLoading()).toBe(false);
    expect(service.messages().some(m => m.message === 'You have 3 active projects.')).toBe(true);
  });

  it('should clear chat history', () => {
    service.clearChat();

    const req = httpTesting.expectOne(`${API_BASE_URL}/chat/history?channel=ai-assistant`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });

    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].message).toContain('Chat history cleared');
  });
});
