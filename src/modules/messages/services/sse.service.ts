import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export interface SseMessageEvent {
  type: 'new-message' | 'message-read' | 'user-online' | 'user-offline';
  data: Record<string, unknown>;
}

/**
 * SseService
 * ──────────────────────────────────────────────────────────────────────────────
 * Manages server-sent event streams per connected user.
 * Uses rxjs Subject so each user gets their own observable stream.
 */
@Injectable()
export class SseService implements OnModuleDestroy {
  /** userId → Subject that pushes events to that user's SSE connection */
  private readonly streams = new Map<string, Subject<SseMessageEvent>>();

  /** Get or create a Subject for a user */
  getStream(userId: string): Observable<SseMessageEvent> {
    if (!this.streams.has(userId)) {
      this.streams.set(userId, new Subject<SseMessageEvent>());
    }
    return this.streams.get(userId)!.asObservable();
  }

  /** Push an event to a specific user's SSE stream */
  emit(userId: string, event: SseMessageEvent): void {
    const subject = this.streams.get(userId);
    if (subject && !subject.closed) {
      subject.next(event);
    }
  }

  /** Remove the stream when user disconnects */
  removeStream(userId: string): void {
    const subject = this.streams.get(userId);
    if (subject) {
      subject.complete();
      this.streams.delete(userId);
    }
  }

  onModuleDestroy(): void {
    this.streams.forEach((subject) => subject.complete());
    this.streams.clear();
  }
}
