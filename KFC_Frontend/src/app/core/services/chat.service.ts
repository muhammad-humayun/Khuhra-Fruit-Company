import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';

/** One bubble in the chat window. */
export interface ChatMessage {
  readonly role: 'user' | 'assistant';
  readonly text: string;
}

/** The envelope every endpoint in this API returns (BOL_ApiResponse&lt;T&gt;). */
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

interface ChatReply {
  reply: string;
  sessionId: string;
  historyCount: number;
}

const SESSION_KEY = 'kfc-chat-session';

/**
 * Talks to the backend chat endpoint.
 *
 * Note what this file does NOT contain: an API key. The browser never sees one. It posts to our
 * own server, and the server adds the key before calling OpenAI. Anything shipped to the browser
 * can be read by anyone who opens DevTools, so a key here would be a key given away.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);

  /** The visible conversation. The server keeps its own copy for context. */
  readonly messages = signal<ChatMessage[]>([]);

  /** True while we are waiting for an answer, so the UI can show the typing dots. */
  readonly sending = signal(false);

  readonly error = signal<string | null>(null);

  /** null until we have asked the server; false hides the widget entirely. */
  readonly available = signal<boolean | null>(null);

  readonly isEmpty = computed(() => this.messages().length === 0);

  /**
   * Identifies this conversation to the server so follow-up questions have context.
   * Kept in sessionStorage, so closing the tab starts a fresh conversation.
   */
  private readonly sessionId = readOrCreateSessionId();

  private get baseUrl(): string {
    return APP_CONFIG.apiBaseUrl;
  }

  /** Asks the server whether an API key is configured. Called once when the widget loads. */
  checkAvailability(): void {
    if (this.available() !== null) {
      return;
    }

    this.http
      .get<ApiResponse<{ available: boolean }>>(`${this.baseUrl}/api/chat/status`)
      .subscribe({
        next: (response) => this.available.set(response.data?.available ?? false),
        // The backend not running at all is the usual reason this fails in development.
        error: () => this.available.set(false),
      });
  }

  send(text: string): void {
    const message = text.trim();

    if (!message || this.sending()) {
      return;
    }

    this.error.set(null);
    this.messages.update((list) => [...list, { role: 'user', text: message }]);
    this.sending.set(true);

    this.http
      .post<ApiResponse<ChatReply>>(`${this.baseUrl}/api/chat`, {
        sessionId: this.sessionId,
        message,
      })
      .subscribe({
        next: (response) => {
          const reply = tidy(response.data?.reply ?? '');

          if (reply) {
            this.messages.update((list) => [...list, { role: 'assistant', text: reply }]);
          } else {
            this.error.set('The assistant did not reply. Please try again.');
          }

          this.sending.set(false);
        },
        error: (err: HttpErrorResponse) => {
          // The server sends a friendly sentence in `message` for the cases it expects
          // (not configured, timed out, upstream failure). Anything else gets a generic line -
          // we never show a raw HTTP error to a visitor.
          this.error.set(
            typeof err.error?.message === 'string' && err.error.message
              ? err.error.message
              : 'Could not reach the assistant. Please check your connection and try again.',
          );
          this.sending.set(false);
        },
      });
  }

  clear(): void {
    this.messages.set([]);
    this.error.set(null);
  }
}

/**
 * Cleans Markdown out of a reply so it reads properly in a plain-text bubble.
 *
 * The model is already told not to use Markdown, but models drift, so this is the safety net. It
 * is a pure text transformation on purpose: it produces a STRING, never HTML, so there is no way
 * for anything the model says to become markup in the page. Rendering model output as HTML is how
 * chat widgets get themselves an XSS hole.
 */
export function tidy(raw: string): string {
  return (
    raw
      // ```code fences``` and `inline code` - keep the text, drop the backticks.
      .replace(/```[a-z]*\n?/gi, '')
      .replace(/`([^`]+)`/g, '$1')
      // **bold**, __bold__, *italic*, _italic_ - keep the words, drop the markers.
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/(^|\s)\*([^*\n]+)\*/g, '$1$2')
      .replace(/(^|\s)_([^_\n]+)_/g, '$1$2')
      // ### Headings - drop the hashes, keep the words.
      .replace(/^#{1,6}\s*/gm, '')
      // Turn list markers into a real bullet, which reads better than a stray dash.
      .replace(/^\s*[-*+]\s+/gm, '• ')
      // Markdown links [text](url) - show the text, then the bare url.
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1 ($2)')
      // Collapse runs of blank lines so the bubble is not mostly whitespace.
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

function readOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      return existing;
    }

    const fresh = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // Private browsing can block storage; a per-load id still works for one page view.
    return crypto.randomUUID();
  }
}
