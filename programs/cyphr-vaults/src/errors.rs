use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("Vault is paused")]
    VaultPaused,
    
    #[msg("Insufficient balance")]
    InsufficientBalance,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("User not found")]
    UserNotFound,
    
    #[msg("Strategy not found")]
    StrategyNotFound,
    
    #[msg("Strategy is not active")]
    StrategyNotActive,
    
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("No yield to claim")]
    NoYieldToClaim,
    
    #[msg("Invalid strategy configuration")]
    InvalidStrategyConfig,
    
    #[msg("Strategy execution failed")]
    StrategyExecutionFailed,
    
    #[msg("Invalid time frame")]
    InvalidTimeFrame,
    
    #[msg("Invalid yield target")]
    InvalidYieldTarget,
    
    #[msg("Invalid position size")]
    InvalidPositionSize,
} 