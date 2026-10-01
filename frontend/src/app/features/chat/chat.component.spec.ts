import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ChatComponent } from './chat.component';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let chatService: ChatService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        ChatService,
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    chatService = TestBed.inject(ChatService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize component and load messages', () => {
    expect(component).toBeTruthy();
    expect(chatService.messages().length).toBeGreaterThan(0);
  });

  it('should format markdown syntax correctly', () => {
    const formatted = component.formatMessage('### Summary\n* Bullet 1\n`const x = 1;`');
    expect(formatted).toContain('<h4 class="chat-heading">Summary</h4>');
    expect(formatted).toContain('<div class="chat-bullet-item">• Bullet 1</div>');
    expect(formatted).toContain('<code class="chat-inline-code">const x = 1;</code>');
  });

  it('should send a message via chatService on onSend()', () => {
    const sendSpy = vi.spyOn(chatService, 'sendMessage').mockReturnValue(of({} as any));
    component.inputMessage.set('How to post a project?');
    component.onSend();

    expect(sendSpy).toHaveBeenCalledWith('How to post a project?');
    expect(component.inputMessage()).toBe('');
  });

  it('should handle prompt chip click', () => {
    const sendSpy = vi.spyOn(chatService, 'sendMessage').mockReturnValue(of({} as any));
    component.onPromptClick('What are my active projects?');

    expect(sendSpy).toHaveBeenCalledWith('What are my active projects?');
  });

  it('should change active channel on selectChannel()', () => {
    const channel = { id: 'support-billing', name: 'Support', icon: 'pi-file', description: 'Help', status: 'online' as const };
    const setChannelSpy = vi.spyOn(chatService, 'setChannel');

    component.selectChannel(channel);
    expect(setChannelSpy).toHaveBeenCalledWith('support-billing');
    expect(component.showMobileChannels()).toBe(false);
  });
});
