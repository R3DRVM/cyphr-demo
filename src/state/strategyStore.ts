import { create } from 'zustand';
import { StrategyGraph, StrategyConfig } from '../services/strategyBuilderService';

interface StrategyResult {
  type: 'simulate' | 'create' | 'execute';
  data: any;
  timestamp: number;
}

interface StrategyEvent {
  type: 'simulate' | 'create' | 'execute';
  cfg?: any;
  sig?: string;
  ts: number;
}

interface StrategyStore {
  // State
  graph: StrategyGraph;
  cfg: StrategyConfig | null;
  lastResult: StrategyResult | null;
  events: StrategyEvent[];
  loading: {
    simulate: boolean;
    create: boolean;
    execute: boolean;
  };
  
  // Actions
  setGraph: (graph: StrategyGraph) => void;
  setCfg: (cfg: StrategyConfig) => void;
  setLastResult: (result: StrategyResult) => void;
  pushEvent: (event: StrategyEvent) => void;
  setLoading: (key: keyof StrategyStore['loading'], value: boolean) => void;
  reset: () => void;
}

const initialState = {
  graph: { nodes: [], edges: [] },
  cfg: null,
  lastResult: null,
  events: [],
  loading: {
    simulate: false,
    create: false,
    execute: false
  }
};

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  ...initialState,
  
  setGraph: (graph: StrategyGraph) => set({ graph }),
  
  setCfg: (cfg: StrategyConfig) => set({ cfg }),
  
  setLastResult: (result: StrategyResult) => set({ lastResult: result }),
  
  pushEvent: (event: StrategyEvent) => set(state => ({ events: [...state.events, event] })),
  
  setLoading: (key: keyof StrategyStore['loading'], value: boolean) => 
    set(state => ({
      loading: { ...state.loading, [key]: value }
    })),
  
  reset: () => set(initialState)
}));
