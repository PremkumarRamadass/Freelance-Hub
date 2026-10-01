import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatChannel } from '../../core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  chatService = inject(ChatService);
  authService = inject(AuthService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  inputMessage = signal<string>('');
  channelFilter = signal<string>('');
  showMobileChannels = signal<boolean>(false);

  ngOnInit(): void {
    this.chatService.loadHistory();
    this.chatService.loadSuggestedPrompts();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch {}
    }
  }

  selectChannel(channel: ChatChannel): void {
    this.chatService.setChannel(channel.id);
    this.showMobileChannels.set(false);
  }

  onSend(): void {
    const text = this.inputMessage().trim();
    if (!text || this.chatService.isLoading()) return;

    this.inputMessage.set('');
    this.chatService.sendMessage(text).subscribe();
  }

  onPromptClick(prompt: string): void {
    if (this.chatService.isLoading()) return;
    this.chatService.sendMessage(prompt).subscribe();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  formatMessage(text: string): string {
    return text
      .replace(/^### (.*$)/gim, '<h4 class="chat-heading">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
      .replace(/^\* (.*$)/gim, '<div class="chat-bullet-item">• $1</div>')
      .replace(/\n/g, '<br/>');
  }
}
