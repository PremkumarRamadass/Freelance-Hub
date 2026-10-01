import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss'
})
export class ChatWidgetComponent implements AfterViewChecked {
  chatService = inject(ChatService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  inputMessage = signal<string>('');

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch {}
    }
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
    // Quick safe markdown format for bold, italics, code, bullet lines
    return text
      .replace(/^### (.*$)/gim, '<h4 class="chat-heading">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
      .replace(/^\* (.*$)/gim, '<div class="chat-bullet-item">• $1</div>')
      .replace(/\n/g, '<br/>');
  }
}
