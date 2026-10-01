import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ChatWidgetComponent } from './chat-widget.component';
import { ChatService } from '../../../core/services/chat.service';

describe('ChatWidgetComponent', () => {
  let component: ChatWidgetComponent;
  let fixture: ComponentFixture<ChatWidgetComponent>;
  let chatService: ChatService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatWidgetComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        ChatService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWidgetComponent);
    component = fixture.componentInstance;
    chatService = TestBed.inject(ChatService);
    fixture.detectChanges();
  });

  it('should initialize component', () => {
    expect(component).toBeTruthy();
  });

  it('should format simple markdown tokens', () => {
    const formatted = component.formatMessage('**Bold** and `code`');
    expect(formatted).toContain('<strong>Bold</strong>');
    expect(formatted).toContain('<code class="chat-inline-code">code</code>');
  });

  it('should call chatService.sendMessage on onSend()', () => {
    const sendSpy = vi.spyOn(chatService, 'sendMessage').mockReturnValue(of({} as any));
    component.inputMessage.set('Hello Nexa');
    component.onSend();

    expect(sendSpy).toHaveBeenCalledWith('Hello Nexa');
    expect(component.inputMessage()).toBe('');
  });

  it('should trigger sendMessage on onPromptClick()', () => {
    const sendSpy = vi.spyOn(chatService, 'sendMessage').mockReturnValue(of({} as any));
    component.onPromptClick('What are my active projects?');

    expect(sendSpy).toHaveBeenCalledWith('What are my active projects?');
  });
});
