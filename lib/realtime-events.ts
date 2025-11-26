/* eslint-disable @typescript-eslint/no-explicit-any */
// Central event system for real-time updates

export type UpdateEventType = 
  | 'categories:update'
  | 'services:update'
  | 'about:update'
  | 'contact:update'
  | 'hero:update'
  | 'email:update';

interface UpdateEventDetail {
  type: UpdateEventType;
  timestamp: number;
  data?: any;
}

class RealtimeEventManager {
  private static instance: RealtimeEventManager;

  private constructor() {}

  static getInstance(): RealtimeEventManager {
    if (!RealtimeEventManager.instance) {
      RealtimeEventManager.instance = new RealtimeEventManager();
    }
    return RealtimeEventManager.instance;
  }

  // Emit an update event
  emit(type: UpdateEventType, data?: any) {
    const event = new CustomEvent('realtime:update', {
      detail: {
        type,
        timestamp: Date.now(),
        data
      } as UpdateEventDetail
    });
    window.dispatchEvent(event);
  }

  // Listen for update events
  on(type: UpdateEventType, callback: (detail: UpdateEventDetail) => void) {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<UpdateEventDetail>;
      if (customEvent.detail.type === type) {
        callback(customEvent.detail);
      }
    };

    window.addEventListener('realtime:update', handler);

    // Return cleanup function
    return () => {
      window.removeEventListener('realtime:update', handler);
    };
  }

  // Listen for all update events
  onAny(callback: (detail: UpdateEventDetail) => void) {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<UpdateEventDetail>;
      callback(customEvent.detail);
    };

    window.addEventListener('realtime:update', handler);

    return () => {
      window.removeEventListener('realtime:update', handler);
    };
  }

  // Emit multiple events at once
  emitBatch(types: UpdateEventType[]) {
    types.forEach(type => this.emit(type));
  }
}

export const realtimeEvents = RealtimeEventManager.getInstance();