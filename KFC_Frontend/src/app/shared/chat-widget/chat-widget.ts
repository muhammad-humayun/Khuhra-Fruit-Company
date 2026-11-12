import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  isDevMode,
  signal,
  viewChild,
} from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { ChatService } from '../../core/services/chat.service';

/**
 * The floating "AI Assistant" button and chat panel.
 *
 * On CSS isolation: every style below is written straight into this component, and Angular scopes
 * it automatically - it rewrites the selectors so they can only ever match elements inside this
 * component's own template. Nothing here can leak out and disturb the shop, and the shop's
 * stylesheet cannot reach in. That is why this widget carries its own colours instead of using the
 * site's global classes.
 */
@Component({
  selector: 'app-chat-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      @if (!open()) {
        <button
          type="button"
          class="launch"
          [attr.aria-label]="i18n.t('chat.open')"
          (click)="toggle()"
        >
          <span class="launch__icon" aria-hidden="true"></span>
        </button>
      }

      @if (open()) {
        <section class="panel" role="dialog" [attr.aria-label]="i18n.t('chat.title')">
          <header class="panel__head">
            <span class="panel__dot" aria-hidden="true"></span>
            <h2 class="panel__title">{{ i18n.t('chat.title') }}</h2>
            <button
              type="button"
              class="panel__close"
              [attr.aria-label]="i18n.t('chat.close')"
              (click)="toggle()"
            >
              &times;
            </button>
          </header>

          <div class="log" #log role="log" aria-live="polite">
            @if (chat.available() === false) {
              <p class="oops">{{ i18n.t('chat.offline') }}</p>
            } @else if (chat.isEmpty()) {
              <p class="greeting">{{ i18n.t('chat.greeting') }}</p>
            }

            @for (message of chat.messages(); track $index) {
              <div class="bubble" [class.bubble--me]="message.role === 'user'">
                {{ message.text }}
              </div>
            }

            @if (chat.sending()) {
              <div class="bubble bubble--typing" [attr.aria-label]="i18n.t('chat.thinking')">
                <span></span><span></span><span></span>
              </div>
            }

            @if (chat.error(); as problem) {
              <p class="oops">{{ problem }}</p>
            }
          </div>

          <form class="compose" (submit)="submit($event)">
            <textarea
              class="compose__input"
              rows="1"
              [value]="draft()"
              [placeholder]="i18n.t('chat.placeholder')"
              [attr.aria-label]="i18n.t('chat.placeholder')"
              [disabled]="chat.sending()"
              (input)="draft.set($any($event.target).value)"
              (keydown.enter)="onEnter($event)"
            ></textarea>
            <button
              type="submit"
              class="compose__send"
              [disabled]="!canSend()"
              [attr.aria-label]="i18n.t('chat.send')"
            >
              &#10148;
            </button>
          </form>

          <p class="note">{{ i18n.t('chat.disclaimer') }}</p>
        </section>
      }
    }
  `,
  styles: `
    :host {
      --chat-brand: #0a2f5c;
      --chat-accent: #1e7a3e;
      --chat-ink: #15212b;
      --chat-line: #e6e8e3;
      position: fixed;
      inset-block-end: 90px;
      inset-inline-end: 24px;
      z-index: 300;
      font-family: inherit;
    }

    .launch {
      display: grid;
      place-items: center;
      width: 54px;
      height: 54px;
      border: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, #14538f, var(--chat-brand));
      box-shadow: 0 8px 22px rgb(10 47 92 / 38%);
      cursor: pointer;
      transition: transform 140ms ease, box-shadow 260ms ease;
    }
    .launch:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 28px rgb(10 47 92 / 46%);
    }
    /* A speech bubble with a tail, drawn in CSS so there is no icon file to ship. */
    .launch__icon {
      width: 22px;
      height: 20px;
      background: #fff;
      border-radius: 50% 50% 50% 4px;
    }

    .panel {
      display: flex;
      flex-direction: column;
      width: min(380px, calc(100vw - 32px));
      height: min(540px, 70vh);
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 18px 50px rgb(8 40 69 / 28%);
      overflow: hidden;
      animation: rise 200ms ease;
    }
    @keyframes rise {
      from { opacity: 0; transform: translateY(14px); }
    }

    .panel__head {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 13px 14px;
      background: linear-gradient(135deg, #14538f, var(--chat-brand));
      color: #fff;
    }
    .panel__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #5ee08a;
    }
    .panel__title {
      flex: 1;
      margin: 0;
      font-size: 0.98rem;
      font-weight: 700;
    }
    .panel__close {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: rgb(255 255 255 / 16%);
      color: #fff;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
    }
    .panel__close:hover { background: rgb(255 255 255 / 30%); }

    .log {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      background: #f7f8f6;
    }

    .greeting {
      margin: 0;
      padding: 11px 13px;
      border-radius: 12px;
      background: #fff;
      border: 1px solid var(--chat-line);
      font-size: 0.86rem;
      color: #46586a;
    }

    .bubble {
      max-width: 92%;
      padding: 10px 14px;
      border-radius: 14px;
      background: #fff;
      border: 1px solid var(--chat-line);
      font-size: 0.88rem;
      /* Roomy enough that bulleted answers do not look cramped. */
      line-height: 1.6;
      color: var(--chat-ink);
      /* pre-wrap is what makes the model's own line breaks survive, which is all the
         structure a plain-text answer needs. */
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      align-self: flex-start;
    }

    /* The visitor's own messages are short, so they stay narrow and hug the right. */
    .bubble--me {
      max-width: 85%;
    }
    .bubble--me {
      align-self: flex-end;
      background: var(--chat-accent);
      border-color: var(--chat-accent);
      color: #fff;
    }

    .bubble--typing { display: flex; gap: 4px; align-items: center; }
    .bubble--typing span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #9aa8b4;
      animation: blink 1.2s infinite;
    }
    .bubble--typing span:nth-child(2) { animation-delay: 0.2s; }
    .bubble--typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink {
      0%, 60%, 100% { opacity: 0.3; }
      30% { opacity: 1; }
    }

    .oops {
      margin: 0;
      padding: 9px 12px;
      border-radius: 10px;
      background: #fdecec;
      color: #a3161f;
      font-size: 0.8rem;
    }

    .compose {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      padding: 10px;
      border-block-start: 1px solid var(--chat-line);
      background: #fff;
    }
    .compose__input {
      flex: 1;
      max-height: 90px;
      padding: 9px 12px;
      border: 1px solid var(--chat-line);
      border-radius: 11px;
      font: inherit;
      font-size: 0.88rem;
      resize: none;
    }
    .compose__input:focus {
      outline: none;
      border-color: var(--chat-accent);
      box-shadow: 0 0 0 3px rgb(30 122 62 / 16%);
    }
    .compose__send {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border: 0;
      border-radius: 50%;
      background: var(--chat-accent);
      color: #fff;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background-color 140ms ease;
    }
    .compose__send:disabled { background: #c3cbd2; cursor: not-allowed; }

    .note {
      margin: 0;
      padding: 0 12px 10px;
      background: #fff;
      font-size: 0.68rem;
      line-height: 1.4;
      color: #8c9aa6;
    }

    /* The send arrow points the other way in Sindhi. */
    :host-context([dir='rtl']) .compose__send { transform: scaleX(-1); }
    :host-context([dir='rtl']) .launch__icon { border-radius: 50% 50% 4px 50%; }

    /* Above the phone action bar rather than behind it. */
    @media (max-width: 720px) {
      :host {
        inset-block-end: calc(70px + env(safe-area-inset-bottom));
        inset-inline-end: 14px;
      }
      .panel { height: min(460px, 62vh); }
    }

    @media (prefers-reduced-motion: reduce) {
      .panel { animation: none; }
      .bubble--typing span { animation: none; opacity: 0.6; }
      .launch:hover { transform: none; }
    }
  `,
})
export class ChatWidget {
  protected readonly i18n = inject(I18nService);
  protected readonly chat = inject(ChatService);

  protected readonly open = signal(false);
  protected readonly draft = signal('');

  protected readonly canSend = computed(
    () => this.draft().trim().length > 0 && !this.chat.sending() && this.chat.available() !== false,
  );

  /**
   * In production the widget disappears when no API key is configured - better than offering a
   * button that cannot work. In development it stays put so the UI can be seen and styled before
   * a key exists.
   */
  protected readonly visible = computed(() => this.chat.available() !== false || isDevMode());

  private readonly log = viewChild<ElementRef<HTMLElement>>('log');

  constructor() {
    this.chat.checkAvailability();

    // Keep the newest message in view. afterRenderEffect runs once the DOM has actually been
    // updated, which matters here: scrollHeight is only correct after the new bubble exists.
    afterRenderEffect(() => {
      this.chat.messages();
      this.chat.sending();

      const element = this.log()?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.sendDraft();
  }

  /** Enter sends; Shift+Enter starts a new line, the way every chat app behaves. */
  protected onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (keyboard.shiftKey) {
      return;
    }

    keyboard.preventDefault();
    this.sendDraft();
  }

  private sendDraft(): void {
    if (!this.canSend()) {
      return;
    }

    this.chat.send(this.draft());
    this.draft.set('');
  }
}
