import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  typing?: boolean;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent implements OnInit {
  private base = environment.apiBase;
  
  messages: Message[] = [];
  question = '';
  isOpen = false;

  // Unique IDs
  sessionId = '';
  userId = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Assign persistent userId (survives refresh, unique per browser)
    const storedUser = localStorage.getItem('chat_user_id');
    if (storedUser) {
      this.userId = storedUser;
    } else {
      this.userId = 'user-' + this.uuid();
      localStorage.setItem('chat_user_id', this.userId);
    }

    // Assign fresh sessionId (new each page load / refresh)
    this.sessionId = 'session-' + this.uuid();

    // Initial welcome message
    this.messages.push({
      sender: 'bot',
      text: '👋 Hello! How can I help you today?'
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.scrollToBottom();
  }

  sendMessage() {
    const trimmed = this.question.trim();
    if (!trimmed) return;

    // 1. Push user message
    this.messages.push({ text: trimmed, sender: 'user' });
    this.question = '';
    this.scrollToBottom();

    // 2. Show typing indicator
    const typingMsg: Message = { text: 'Typing...', sender: 'bot', typing: true };
    this.messages.push(typingMsg);
    this.scrollToBottom();

    // 3. Call backend with dynamic IDs
    const body = new FormData();
    body.append('message', trimmed);
    body.append('session_id', this.sessionId);
    body.append('user_id', this.userId);

    this.http.post<any>(`${this.base}/onboarding/chat`, body).subscribe({
      next: (res) => {
        // Remove typing indicator
        this.messages = this.messages.filter(m => !m.typing);

        // Bot reply
        const botText = (res?.reply ?? '').toString().trim();
        this.messages.push({
          sender: 'bot',
          text: botText || '🤔 Sorry, I could not find an answer. Please contact HR.'
        });

        // (Optional) show sources
        // if (res?.sources?.length) {
        //   this.messages.push({
        //     sender: 'bot',
        //     text: '📎 Sources: ' + res.sources.map((s: any) => s.filename || s).join(', ')
        //   });
        // }

        this.scrollToBottom();
      },
      error: () => {
        this.messages = this.messages.filter(m => !m.typing);
        this.messages.push({ sender: 'bot', text: '⚠️ Failed to fetch response. Try again or Contact HR' });
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages');
      el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }

  // Simple UUID generator
  private uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
