import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Pending =
  | { kind:'yield'; step:'choose-amount'|'confirm'|'executing'; opId:string; createdAt:number; ctx:{ targetBps:number; amountLamports?:number } }
  | undefined;

export type ChatMsg = {
  id: string;
  role: 'user' | 'bot';
  kind: 'text' | 'chips' | 'hash';
  text?: string;
  chips?: Array<{ id:string; label:string; action:string; payload?:any }>;
  hash?: { sig:string; short:string; url:string; status:'pending'|'completed'|'error' };
  ts: number;
};

export interface YieldSession {
  depositLamports: number;
  targetBps: number;
  creditedLamports: number;
  startedAt: number;
  lastBundleSig: string;
}

interface ChatStore {
  msgs: ChatMsg[];
  pending?: Pending;
  inflight?: { opId: string } | null;
  yieldSession?: YieldSession;

  // Core actions
  addMsg: (msg: Omit<ChatMsg, 'id' | 'ts'>) => string;
  updateMsg: (id: string, updates: Partial<ChatMsg>) => void;
  setPending: (pending: Pending) => void;
  clearPending: () => void;
  setInflight: (opId: string | null) => void;
  advance: (step: string) => boolean;
  
  // Yield session
  setYieldSession: (session?: YieldSession) => void;
  
  // Cleanup
  clearAll: () => void;
  checkTTL: () => void;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateOpId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const useChatSession = create<ChatStore>()(
  persist(
    (set, get) => ({
      msgs: [],
      pending: undefined,
      inflight: null,
      yieldSession: undefined,

      addMsg: (msgData) => {
        const id = generateId();
        const msg: ChatMsg = {
          ...msgData,
          id,
          ts: Date.now()
        };
        
        set((state) => ({
          msgs: [...state.msgs, msg].slice(-100) // Keep last 100 messages
        }));
        
        return id;
      },

      updateMsg: (id, updates) => {
        set((state) => ({
          msgs: state.msgs.map(msg => 
            msg.id === id ? { ...msg, ...updates } : msg
          )
        }));
      },

      setPending: (pending) => {
        set({ pending });
      },

      clearPending: () => {
        set({ pending: undefined });
      },

      setInflight: (opId) => {
        set({ inflight: opId ? { opId } : null });
      },

      advance: (step) => {
        const state = get();
        
        // Guard: only advance if not inflight
        if (state.inflight) {
          console.warn('🚫 Cannot advance - operation in flight:', state.inflight.opId);
          return false;
        }

        if (!state.pending) {
          console.warn('🚫 Cannot advance - no pending state');
          return false;
        }

        // Update pending step
        set({
          pending: {
            ...state.pending,
            step
          } as Pending
        });

        return true;
      },

      setYieldSession: (session) => {
        set({ yieldSession: session });
      },

      clearAll: () => {
        set({ 
          msgs: [], 
          pending: undefined, 
          inflight: null, 
          yieldSession: undefined 
        });
        
        // Clear localStorage
        ['cyphr.yield.session.v1', 'cyphr.chat.pending.v1', 'cyphr.chat.history.v1'].forEach(k => {
          localStorage.removeItem(k);
        });
      },

      checkTTL: () => {
        const state = get();
        const now = Date.now();
        
        // Check pending TTL (90 seconds)
        if (state.pending && (now - state.pending.createdAt) > 90000) {
          console.log('🧹 Clearing expired pending state');
          set({ pending: undefined, inflight: null });
          
          // Add session expired message
          get().addMsg({
            role: 'bot',
            kind: 'text',
            text: 'Session expired; let\'s start fresh 👋'
          });
        }

        // Check yield session TTL (1 hour)
        if (state.yieldSession && (now - state.yieldSession.startedAt) > 3600000) {
          console.log('🧹 Clearing expired yield session');
          set({ yieldSession: undefined });
        }

        // Clear old messages (keep 24 hours)
        const cutoff = now - 86400000;
        const filteredMsgs = state.msgs.filter(msg => msg.ts > cutoff);
        if (filteredMsgs.length !== state.msgs.length) {
          set({ msgs: filteredMsgs });
        }
      }
    }),
    {
      name: 'cyphr-chat-session',
      partialize: (state) => ({
        msgs: state.msgs,
        pending: state.pending,
        yieldSession: state.yieldSession
      })
    }
  )
);

// Convenience functions for common operations
export const addBotMsg = (text: string, chips?: ChatMsg['chips']) => {
  const store = useChatSession.getState();
  return store.addMsg({
    role: 'bot',
    kind: chips ? 'chips' : 'text',
    text,
    chips
  });
};

export const addUserMsg = (text: string) => {
  const store = useChatSession.getState();
  return store.addMsg({
    role: 'user',
    kind: 'text',
    text
  });
};

export const addHashMsg = (sig: string, short: string, url: string, label: string) => {
  const store = useChatSession.getState();
  return store.addMsg({
    role: 'bot',
    kind: 'hash',
    text: label,
    hash: { sig, short, url, status: 'pending' }
  });
};

export const updateHashStatus = (id: string, status: 'pending'|'completed'|'error') => {
  const store = useChatSession.getState();
  const msg = store.msgs.find(m => m.id === id);
  if (msg?.hash) {
    store.updateMsg(id, {
      hash: { ...msg.hash, status }
    });
  }
};

export const updateHashMsg = (id: string, sig: string, short: string, url: string, label: string, status: 'pending'|'completed'|'error' = 'completed') => {
  const store = useChatSession.getState();
  store.updateMsg(id, {
    text: label,
    hash: { sig, short, url, status }
  });
};