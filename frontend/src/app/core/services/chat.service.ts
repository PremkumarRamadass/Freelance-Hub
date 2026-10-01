import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ChatMessageItem, AskQuestionPayload, ChatChannel } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);

  readonly messages = signal<ChatMessageItem[]>([
    {
      id: 'welcome_1',
      senderRole: 'assistant',
      message: '👋 Hi there! I am **Nexa AI**, your Lance Nexa assistant. Ask me anything about your projects, invoices, proposals, platform workflows, or active tasks.',
      channel: 'ai-assistant',
      suggestedPrompts: [
        'What are my active projects?',
        'How do I submit a proposal?',
        'Show my pending invoice balance',
        'What are my top priority tasks?'
      ],
      createdAt: new Date().toISOString()
    }
  ]);

  readonly isLoading = signal<boolean>(false);
  readonly isWidgetOpen = signal<boolean>(false);
  readonly activeChannel = signal<string>('ai-assistant');
  readonly suggestedPrompts = signal<string[]>([
    'What are my active projects?',
    'How do I submit a proposal?',
    'Show my pending invoice balance',
    'What are my top priority tasks?'
  ]);

  readonly channels = signal<ChatChannel[]>([
    {
      id: 'ai-assistant',
      name: 'Nexa AI Assistant',
      icon: 'pi-bolt',
      description: 'Platform assistant, analytics & intelligent Q&A',
      status: 'online'
    },
    {
      id: 'project-collab',
      name: 'Project Discussion',
      icon: 'pi-folder',
      description: 'Collaboration, sprint deadlines & requirements',
      badge: 'Active',
      status: 'online'
    },
    {
      id: 'support-billing',
      name: 'Invoices & Support',
      icon: 'pi-file',
      description: 'Escrow, invoice processing & account support',
      status: 'online'
    }
  ]);

  toggleWidget(): void {
    this.isWidgetOpen.update(v => !v);
  }

  openWidget(): void {
    this.isWidgetOpen.set(true);
  }

  closeWidget(): void {
    this.isWidgetOpen.set(false);
  }

  setChannel(channelId: string): void {
    this.activeChannel.set(channelId);
    this.loadHistory(channelId);
  }

  loadHistory(channel = 'ai-assistant'): void {
    this.http.get<ChatMessageItem[]>(`${API_BASE_URL}/chat/history?channel=${channel}`).pipe(
      catchError(() => of([]))
    ).subscribe(items => {
      if (items && items.length > 0) {
        this.messages.set(items);
      }
    });
  }

  loadSuggestedPrompts(): void {
    this.http.get<string[]>(`${API_BASE_URL}/chat/suggested-prompts`).pipe(
      catchError(() => of([]))
    ).subscribe(prompts => {
      if (prompts && prompts.length > 0) {
        this.suggestedPrompts.set(prompts);
      }
    });
  }

  sendMessage(userQuestion: string, channel = this.activeChannel()): Observable<ChatMessageItem> {
    const trimmed = userQuestion.trim();
    if (!trimmed) {
      return of({} as ChatMessageItem);
    }

    const tempUserMsg: ChatMessageItem = {
      id: `usr_${Date.now()}`,
      senderRole: 'user',
      message: trimmed,
      channel,
      createdAt: new Date().toISOString()
    };

    this.messages.update(list => [...list, tempUserMsg]);
    this.isLoading.set(true);

    const payload: AskQuestionPayload = {
      message: trimmed,
      channel
    };

    return this.http.post<ChatMessageItem>(`${API_BASE_URL}/chat/ask`, payload).pipe(
      tap((assistantMsg: ChatMessageItem) => {
        this.isLoading.set(false);
        this.messages.update(list => [...list, assistantMsg]);
        if (assistantMsg.suggestedPrompts && assistantMsg.suggestedPrompts.length > 0) {
          this.suggestedPrompts.set(assistantMsg.suggestedPrompts);
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        const fallbackMsg: ChatMessageItem = {
          id: `ast_${Date.now()}`,
          senderRole: 'assistant',
          message: `I encountered a momentary connection issue. You can check your **Projects** or **Invoices** portal directly from the left sidebar, or try rephrasing your question!`,
          channel,
          createdAt: new Date().toISOString()
        };
        this.messages.update(list => [...list, fallbackMsg]);
        return of(fallbackMsg);
      })
    );
  }

  clearChat(channel = this.activeChannel()): void {
    this.http.delete(`${API_BASE_URL}/chat/history?channel=${channel}`).pipe(
      catchError(() => of({ success: true }))
    ).subscribe(() => {
      this.messages.set([
        {
          id: `rst_${Date.now()}`,
          senderRole: 'assistant',
          message: 'Chat history cleared. How can I help you next?',
          channel,
          suggestedPrompts: this.suggestedPrompts(),
          createdAt: new Date().toISOString()
        }
      ]);
    });
  }
}
