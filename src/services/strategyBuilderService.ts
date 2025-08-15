import { strategyBridge } from './strategyBridge';
import { getVaultInfo } from './vaultService';
import { DEMO_MODE } from '../config/policy';
import { useStrategyStore } from '../state/strategyStore';

// Event bus for strategy actions
let eventBus: ((event: any) => void) | null = null;

export const setStrategyEventBus = (bus: (event: any) => void) => {
  eventBus = bus;
};

const emitEvent = (event: { type: 'simulate' | 'create' | 'execute'; cfg?: any; sig?: string; ts: number }) => {
  if (eventBus) {
    eventBus(event);
  }
};

export type StrategyGraph = {
  nodes: any[];
  edges: any[];
};

export type StrategyConfig = {
  token: string;
  logicType: "time-based" | "price" | "volatility";
  durationDays: number;
  profitTargetPct: number;
  actionType: "entry" | "exit";
  action: "stake" | "rebalance" | "hedge";
  autoExecute: boolean;
  hedgeRatioPct?: number;
};

/**
 * Serialize graph to strategy config
 */
export function serializeGraph(graph: StrategyGraph): StrategyConfig {
  // Default config
  const config: StrategyConfig = {
    token: "SOL",
    logicType: "time-based",
    durationDays: 21,
    profitTargetPct: 15,
    actionType: "entry",
    action: "stake",
    autoExecute: true
  };

  try {
    // Parse nodes to extract configuration
    graph.nodes.forEach(node => {
      if (node.type === 'token-data') {
        config.token = node.data?.token || "SOL";
      } else if (node.type === 'strategy-logic') {
        config.logicType = node.data?.logicType || "time-based";
        
        // Parse duration
        const durationText = node.data?.duration || "3 Weeks";
        if (durationText.includes("Week")) {
          const weeks = parseInt(durationText.match(/\d+/)?.[0] || "3");
          config.durationDays = weeks * 7;
        } else if (durationText.includes("Day")) {
          config.durationDays = parseInt(durationText.match(/\d+/)?.[0] || "21");
        } else if (durationText.includes("Month")) {
          const months = parseInt(durationText.match(/\d+/)?.[0] || "1");
          config.durationDays = months * 30;
        }
        
        // Parse profit target
        const profitText = node.data?.profitTarget || "15%";
        config.profitTargetPct = parseInt(profitText.match(/\d+/)?.[0] || "15");
      } else if (node.type === 'action') {
        config.actionType = node.data?.actionType || "entry";
        config.action = node.data?.action || "stake";
        config.autoExecute = node.data?.autoExecute !== false;
        
        // Parse hedge ratio if present
        if (node.data?.hedgeRatio) {
          const hedgeText = node.data.hedgeRatio;
          config.hedgeRatioPct = parseInt(hedgeText.match(/\d+/)?.[0] || "25");
        }
      }
    });
  } catch (error) {
    console.warn('Failed to serialize graph, using defaults:', error);
  }

  return config;
}

/**
 * Validate strategy configuration
 */
export function validateConfig(cfg: StrategyConfig): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!cfg.token) {
    errors.push("Token is required");
  }

  if (!["time-based", "price", "volatility"].includes(cfg.logicType)) {
    errors.push("Invalid logic type");
  }

  if (cfg.durationDays < 1 || cfg.durationDays > 365) {
    errors.push("Duration must be between 1 and 365 days");
  }

  if (cfg.profitTargetPct < 1 || cfg.profitTargetPct > 100) {
    errors.push("Profit target must be between 1% and 100%");
  }

  if (!["entry", "exit"].includes(cfg.actionType)) {
    errors.push("Invalid action type");
  }

  if (!["stake", "rebalance", "hedge"].includes(cfg.action)) {
    errors.push("Invalid action");
  }

  if (cfg.hedgeRatioPct && (cfg.hedgeRatioPct < 1 || cfg.hedgeRatioPct > 100)) {
    errors.push("Hedge ratio must be between 1% and 100%");
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

/**
 * Simulate strategy
 */
export async function simulate(cfg: StrategyConfig): Promise<{
  successProb: number;
  estYieldPct: number;
  notes: string[];
}> {
  try {
    const vaultInfo = await getVaultInfo();
    
    // Calculate success probability based on logic type
    let successProb = 0.7; // Base 70%
    switch (cfg.logicType) {
      case "time-based":
        successProb = 0.8; // Time-based strategies are more predictable
        break;
      case "price":
        successProb = 0.6; // Price-based strategies have more volatility
        break;
      case "volatility":
        successProb = 0.65; // Volatility strategies are moderate risk
        break;
    }

    // Calculate estimated yield
    const baseYield = vaultInfo.supplyApy * (cfg.durationDays / 365);
    const strategyYield = cfg.profitTargetPct * 0.1; // 10% of target as additional yield
    const estYieldPct = (baseYield + strategyYield) * 100;

    // Generate notes
    const notes: string[] = [];
    notes.push(`${cfg.logicType} strategy with ${cfg.durationDays} day duration`);
    notes.push(`Target profit: ${cfg.profitTargetPct}%`);
    notes.push(`Action: ${cfg.actionType} ${cfg.action}`);
    if (cfg.hedgeRatioPct) {
      notes.push(`Hedge ratio: ${cfg.hedgeRatioPct}%`);
    }
    notes.push(`Auto-execute: ${cfg.autoExecute ? 'Yes' : 'No'}`);

    const result = {
      successProb,
      estYieldPct,
      notes
    };

    // Emit event
    emitEvent({ type: 'simulate', cfg, ts: Date.now() });

    return result;
  } catch (error) {
    console.error('Simulation failed:', error);
    return {
      successProb: 0.5,
      estYieldPct: 0,
      notes: ["Simulation failed - using fallback values"]
    };
  }
}

/**
 * Create strategy
 */
export async function create(cfg: StrategyConfig): Promise<{ strategyId: string; signature: string }> {
  if (DEMO_MODE) {
    const demoSignature = 'demo_strategy_create_' + Math.random().toString(36).substring(2, 15);
    const demoStrategyId = 'demo_' + Math.random().toString(36).substring(2, 15);
    
    // Store demo strategy
    const demoStrategies = JSON.parse(localStorage.getItem('demo_strategies') || '[]');
    demoStrategies.push({ id: demoStrategyId, config: cfg, signature: demoSignature });
    localStorage.setItem('demo_strategies', JSON.stringify(demoStrategies));
    
    const result = { strategyId: demoStrategyId, signature: demoSignature };
    
    // Emit event
    emitEvent({ type: 'create', cfg, sig: demoSignature, ts: Date.now() });
    
    return result;
  }

  const result = await strategyBridge.createStrategy(cfg);
  
  // Emit event
  emitEvent({ type: 'create', cfg, sig: result.signature, ts: Date.now() });
  
  return result;
}

/**
 * Execute strategy
 */
export async function execute(strategyId: string): Promise<{ signature: string }> {
  if (DEMO_MODE) {
    const demoSignature = 'demo_strategy_execute_' + Math.random().toString(36).substring(2, 15);
    
    // Update demo strategy status
    const demoStrategies = JSON.parse(localStorage.getItem('demo_strategies') || '[]');
    const strategyIndex = demoStrategies.findIndex((s: any) => s.id === strategyId);
    if (strategyIndex >= 0) {
      demoStrategies[strategyIndex].lastExecuted = Date.now();
      demoStrategies[strategyIndex].executionCount = (demoStrategies[strategyIndex].executionCount || 0) + 1;
      localStorage.setItem('demo_strategies', JSON.stringify(demoStrategies));
    }
    
    const result = { signature: demoSignature };
    
    // Emit event
    emitEvent({ type: 'execute', sig: demoSignature, ts: Date.now() });
    
    return result;
  }

  const result = await strategyBridge.executeStrategy(strategyId);
  
  // Emit event
  emitEvent({ type: 'execute', sig: result.signature, ts: Date.now() });
  
  return result;
}
