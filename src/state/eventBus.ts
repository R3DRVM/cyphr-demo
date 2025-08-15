import { create } from 'zustand';

export interface EventBusEvent {
  kind: 'deposit' | 'borrow' | 'swap' | 'create' | 'execute';
  sig?: string;
  meta?: any;
  ts: number;
}

interface EventBusStore {
  events: EventBusEvent[];
  pushEvent: (event: EventBusEvent) => void;
  getRecentEvents: (count?: number) => EventBusEvent[];
  clearEvents: () => void;
}

export const useEventBus = create<EventBusStore>((set, get) => ({
  events: [],
  
  pushEvent: (event: EventBusEvent) => {
    set(state => ({
      events: [...state.events, event].slice(-100) // Keep last 100 events
    }));
  },
  
  getRecentEvents: (count = 10) => {
    const { events } = get();
    return events.slice(-count);
  },
  
  clearEvents: () => set({ events: [] })
}));

// Global event emitter for services
export const emitEvent = (event: EventBusEvent) => {
  useEventBus.getState().pushEvent(event);
};
