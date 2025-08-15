import { StrategyConfig } from './strategyBuilderService';

/**
 * Parse bot message to strategy configuration
 */
export function fromPromptToConfig(text: string): StrategyConfig {
  const lowerText = text.toLowerCase();
  
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
    // Parse token
    if (lowerText.includes('sol') || lowerText.includes('solana')) {
      config.token = "SOL";
    } else if (lowerText.includes('usdc') || lowerText.includes('usd coin')) {
      config.token = "USDC";
    } else if (lowerText.includes('eth') || lowerText.includes('ethereum')) {
      config.token = "ETH";
    }

    // Parse logic type
    if (lowerText.includes('time-based') || lowerText.includes('time based') || lowerText.includes('time')) {
      config.logicType = "time-based";
    } else if (lowerText.includes('price') || lowerText.includes('price-based')) {
      config.logicType = "price";
    } else if (lowerText.includes('volatility') || lowerText.includes('vol')) {
      config.logicType = "volatility";
    }

    // Parse duration
    if (lowerText.includes('week') || lowerText.includes('wk')) {
      const weekMatch = lowerText.match(/(\d+)\s*(?:week|wk)/i);
      if (weekMatch) {
        config.durationDays = parseInt(weekMatch[1]) * 7;
      }
    } else if (lowerText.includes('day') || lowerText.includes('d')) {
      const dayMatch = lowerText.match(/(\d+)\s*(?:day|d)/i);
      if (dayMatch) {
        config.durationDays = parseInt(dayMatch[1]);
      }
    } else if (lowerText.includes('month') || lowerText.includes('mo')) {
      const monthMatch = lowerText.match(/(\d+)\s*(?:month|mo)/i);
      if (monthMatch) {
        config.durationDays = parseInt(monthMatch[1]) * 30;
      }
    }

    // Parse profit target
    const profitMatch = lowerText.match(/(\d+)%/);
    if (profitMatch) {
      config.profitTargetPct = parseInt(profitMatch[1]);
    }

    // Parse action type
    if (lowerText.includes('entry') || lowerText.includes('buy') || lowerText.includes('long')) {
      config.actionType = "entry";
    } else if (lowerText.includes('exit') || lowerText.includes('sell') || lowerText.includes('short')) {
      config.actionType = "exit";
    }

    // Parse action
    if (lowerText.includes('stake') || lowerText.includes('stake')) {
      config.action = "stake";
    } else if (lowerText.includes('rebalance') || lowerText.includes('rebal')) {
      config.action = "rebalance";
    } else if (lowerText.includes('hedge')) {
      config.action = "hedge";
    }

    // Parse auto-execute
    if (lowerText.includes('auto') || lowerText.includes('automated') || lowerText.includes('automatic')) {
      config.autoExecute = true;
    } else if (lowerText.includes('manual') || lowerText.includes('manual execution')) {
      config.autoExecute = false;
    }

    // Parse hedge ratio
    if (lowerText.includes('hedge')) {
      const hedgeMatch = lowerText.match(/hedge\s*(\d+)%/i);
      if (hedgeMatch) {
        config.hedgeRatioPct = parseInt(hedgeMatch[1]);
      }
    }

  } catch (error) {
    console.warn('Failed to parse prompt to config, using defaults:', error);
  }

  return config;
}
