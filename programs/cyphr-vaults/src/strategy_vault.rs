use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct InitializeStrategyVault<'info> {
    #[account(
        init,
        payer = authority,
        space = StrategyVaultState::LEN,
        seeds = [b"strategy_vault"],
        bump
    )]
    pub vault_state: Account<'info, StrategyVaultState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateStrategy<'info> {
    #[account(
        mut,
        seeds = [b"strategy_vault"],
        bump = vault_state.bump,
        constraint = !vault_state.is_paused @ VaultError::VaultPaused
    )]
    pub vault_state: Account<'info, StrategyVaultState>,
    
    #[account(
        init,
        payer = owner,
        space = StrategyState::LEN,
        seeds = [b"strategy", owner.key().as_ref(), strategy_config.name.as_bytes()],
        bump
    )]
    pub strategy_state: Account<'info, StrategyState>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteStrategy<'info> {
    #[account(
        mut,
        seeds = [b"strategy_vault"],
        bump = vault_state.bump,
        constraint = !vault_state.is_paused @ VaultError::VaultPaused
    )]
    pub vault_state: Account<'info, StrategyVaultState>,
    
    #[account(
        mut,
        seeds = [b"strategy", strategy_state.owner.as_ref(), strategy_state.name.as_bytes()],
        bump = strategy_state.bump,
        constraint = strategy_state.is_active @ VaultError::StrategyNotActive
    )]
    pub strategy_state: Account<'info, StrategyState>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositStrategySol<'info> {
    #[account(
        mut,
        seeds = [b"strategy_vault"],
        bump = vault_state.bump,
        constraint = !vault_state.is_paused @ VaultError::VaultPaused
    )]
    pub vault_state: Account<'info, StrategyVaultState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = UserDeposit::LEN,
        seeds = [b"strategy_user_deposit", user.key().as_ref()],
        bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawStrategySol<'info> {
    #[account(
        mut,
        seeds = [b"strategy_vault"],
        bump = vault_state.bump,
        constraint = !vault_state.is_paused @ VaultError::VaultPaused
    )]
    pub vault_state: Account<'info, StrategyVaultState>,
    
    #[account(
        mut,
        seeds = [b"strategy_user_deposit", user.key().as_ref()],
        bump = user_deposit.bump,
        constraint = user_deposit.user == user.key() @ VaultError::Unauthorized
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimStrategyYield<'info> {
    #[account(
        mut,
        seeds = [b"strategy_vault"],
        bump = vault_state.bump,
        constraint = !vault_state.is_paused @ VaultError::VaultPaused
    )]
    pub vault_state: Account<'info, StrategyVaultState>,
    
    #[account(
        mut,
        seeds = [b"strategy_user_deposit", user.key().as_ref()],
        bump = user_deposit.bump,
        constraint = user_deposit.user == user.key() @ VaultError::Unauthorized
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn initialize_strategy_vault(ctx: Context<InitializeStrategyVault>) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    vault_state.initialize(ctx.accounts.authority.key(), ctx.bumps.vault_state)?;
    
    msg!("Strategy vault initialized successfully");
    Ok(())
}

pub fn create_strategy(
    ctx: Context<CreateStrategy>,
    strategy_config: StrategyConfig,
) -> Result<()> {
    // Validate strategy configuration
    require!(!strategy_config.name.is_empty(), VaultError::InvalidStrategyConfig);
    require!(!strategy_config.description.is_empty(), VaultError::InvalidStrategyConfig);
    require!(!strategy_config.base_token.is_empty(), VaultError::InvalidStrategyConfig);
    require!(!strategy_config.quote_token.is_empty(), VaultError::InvalidStrategyConfig);
    require!(strategy_config.position_size > 0 && strategy_config.position_size <= 10000, VaultError::InvalidPositionSize);
    require!(strategy_config.yield_target > 0 && strategy_config.yield_target <= 10000, VaultError::InvalidYieldTarget);
    require!(strategy_config.execution_interval > 0, VaultError::InvalidStrategyConfig);
    
    // Validate time frame
    let valid_time_frames = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];
    require!(
        valid_time_frames.contains(&strategy_config.time_frame.as_str()),
        VaultError::InvalidTimeFrame
    );
    
    let vault_state = &mut ctx.accounts.vault_state;
    let strategy_state = &mut ctx.accounts.strategy_state;
    
    // Initialize strategy
    strategy_state.initialize(
        strategy_config.name.clone(),
        ctx.accounts.owner.key(),
        strategy_config,
        ctx.bumps.strategy_state,
    )?;
    
    // Update vault state
    vault_state.active_strategies += 1;
    
    msg!("Strategy '{}' created successfully", strategy_state.name);
    Ok(())
}

pub fn execute_strategy(
    ctx: Context<ExecuteStrategy>,
    strategy_id: String,
) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    let strategy_state = &mut ctx.accounts.strategy_state;
    
    require!(strategy_state.id == strategy_id, VaultError::StrategyNotFound);
    require!(strategy_state.owner == ctx.accounts.owner.key(), VaultError::Unauthorized);
    
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check if enough time has passed since last execution
    if strategy_state.last_execution > 0 {
        require!(
            current_time >= strategy_state.last_execution + strategy_state.execution_interval as i64,
            VaultError::StrategyExecutionFailed
        );
    }
    
    // Simulate strategy execution (in a real implementation, this would interact with DEXs)
    let simulated_pnl = simulate_strategy_execution(strategy_state);
    
    // Update strategy state
    strategy_state.last_execution = current_time;
    strategy_state.total_pnl += simulated_pnl;
    
    // Update vault state
    vault_state.total_pnl += simulated_pnl;
    
    msg!("Strategy '{}' executed successfully. PnL: {}", strategy_state.name, simulated_pnl);
    Ok(())
}

pub fn deposit_strategy_sol(ctx: Context<DepositStrategySol>, amount: u64) -> Result<()> {
    require!(amount > 0, VaultError::InvalidAmount);
    
    let vault_state = &mut ctx.accounts.vault_state;
    let user_deposit = &mut ctx.accounts.user_deposit;
    
    // Initialize user deposit if it's new
    if user_deposit.user == Pubkey::default() {
        user_deposit.initialize(ctx.accounts.user.key(), ctx.bumps.user_deposit)?;
        vault_state.total_users += 1;
    }
    
    // Calculate yield before updating deposit
    let current_time = Clock::get()?.unix_timestamp;
    let yield_earned = calculate_yield(
        user_deposit.deposit_amount,
        user_deposit.last_yield_update,
        current_time,
        vault_state.yield_rate,
    );
    
    // Update user deposit
    user_deposit.deposit_amount += amount;
    user_deposit.yield_earned += yield_earned;
    user_deposit.last_yield_update = current_time;
    
    // Update vault state
    vault_state.total_deposits += amount;
    vault_state.total_yield_generated += yield_earned;
    vault_state.last_yield_calculation = current_time;
    
    // Transfer SOL from user to vault
    let transfer_instruction = system_program::Transfer {
        from: ctx.accounts.user.to_account_info(),
        to: ctx.accounts.vault_state.to_account_info(),
    };
    
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        ),
        amount,
    )?;
    
    msg!("Deposited {} lamports to strategy vault", amount);
    Ok(())
}

pub fn withdraw_strategy_sol(ctx: Context<WithdrawStrategySol>, amount: u64) -> Result<()> {
    require!(amount > 0, VaultError::InvalidAmount);
    
    let vault_state = &mut ctx.accounts.vault_state;
    let user_deposit = &mut ctx.accounts.user_deposit;
    
    // Calculate current yield
    let current_time = Clock::get()?.unix_timestamp;
    let yield_earned = calculate_yield(
        user_deposit.deposit_amount,
        user_deposit.last_yield_update,
        current_time,
        vault_state.yield_rate,
    );
    
    let total_available = user_deposit.deposit_amount + yield_earned;
    require!(amount <= total_available, VaultError::InsufficientBalance);
    
    // Update user deposit
    user_deposit.deposit_amount = user_deposit.deposit_amount.saturating_sub(amount);
    user_deposit.yield_earned += yield_earned;
    user_deposit.last_yield_update = current_time;
    
    // Update vault state
    vault_state.total_deposits = vault_state.total_deposits.saturating_sub(amount);
    vault_state.total_yield_generated += yield_earned;
    vault_state.last_yield_calculation = current_time;
    
    // Transfer SOL from vault to user
    let transfer_instruction = system_program::Transfer {
        from: ctx.accounts.vault_state.to_account_info(),
        to: ctx.accounts.user.to_account_info(),
    };
    
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        ),
        amount,
    )?;
    
    msg!("Withdrew {} lamports from strategy vault", amount);
    Ok(())
}

pub fn claim_strategy_yield(ctx: Context<ClaimStrategyYield>) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    let user_deposit = &mut ctx.accounts.user_deposit;
    
    // Calculate current yield
    let current_time = Clock::get()?.unix_timestamp;
    let yield_earned = calculate_yield(
        user_deposit.deposit_amount,
        user_deposit.last_yield_update,
        current_time,
        vault_state.yield_rate,
    );
    
    let total_yield = user_deposit.yield_earned + yield_earned;
    require!(total_yield > 0, VaultError::NoYieldToClaim);
    
    // Update user deposit
    user_deposit.yield_earned = 0;
    user_deposit.last_yield_update = current_time;
    
    // Update vault state
    vault_state.total_yield_generated = vault_state.total_yield_generated.saturating_sub(total_yield);
    vault_state.last_yield_calculation = current_time;
    
    // Transfer yield from vault to user
    let transfer_instruction = system_program::Transfer {
        from: ctx.accounts.vault_state.to_account_info(),
        to: ctx.accounts.user.to_account_info(),
    };
    
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        ),
        total_yield,
    )?;
    
    msg!("Claimed {} lamports of yield from strategy vault", total_yield);
    Ok(())
}

fn calculate_yield(
    deposit_amount: u64,
    last_update: i64,
    current_time: i64,
    yield_rate: u64,
) -> u64 {
    if deposit_amount == 0 || last_update >= current_time {
        return 0;
    }
    
    let time_elapsed = current_time - last_update;
    let days_elapsed = time_elapsed as f64 / (24.0 * 60.0 * 60.0); // Convert to days
    
    // Calculate yield: (deposit * rate * days) / 365 / 10000 (basis points)
    let yield_amount = (deposit_amount as f64 * yield_rate as f64 * days_elapsed) / (365.0 * 10000.0);
    
    yield_amount as u64
}

fn simulate_strategy_execution(strategy_state: &StrategyState) -> i64 {
    // Simulate strategy execution with random PnL
    // In a real implementation, this would interact with DEXs and price feeds
    
    let base_pnl = 1000; // Base PnL in lamports
    let volatility = 500; // Volatility in lamports
    
    // Simple simulation: random PnL between -volatility and +volatility
    let random_factor = (Clock::get().unwrap().unix_timestamp % 100) as i64;
    let pnl = base_pnl + (random_factor - 50) * volatility / 50;
    
    pnl
} 