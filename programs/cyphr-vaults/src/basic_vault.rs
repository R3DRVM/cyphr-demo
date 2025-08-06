use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct InitializeBasicVault<'info> {
    #[account(
        init,
        payer = authority,
        space = BasicVaultState::LEN,
        seeds = [b"basic_vault"],
        bump
    )]
    pub vault_state: Account<'info, BasicVaultState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(
        mut,
        seeds = [b"basic_vault"],
        bump = vault_state.bump,
        constraint = !vault_state.is_paused @ VaultError::VaultPaused
    )]
    pub vault_state: Account<'info, BasicVaultState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = UserDeposit::LEN,
        seeds = [b"user_deposit", user.key().as_ref()],
        bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(
        mut,
        seeds = [b"basic_vault"],
        bump = vault_state.bump,
        constraint = !vault_state.is_paused @ VaultError::VaultPaused
    )]
    pub vault_state: Account<'info, BasicVaultState>,
    
    #[account(
        mut,
        seeds = [b"user_deposit", user.key().as_ref()],
        bump = user_deposit.bump,
        constraint = user_deposit.user == user.key() @ VaultError::Unauthorized
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    #[account(
        mut,
        seeds = [b"basic_vault"],
        bump = vault_state.bump,
        constraint = !vault_state.is_paused @ VaultError::VaultPaused
    )]
    pub vault_state: Account<'info, BasicVaultState>,
    
    #[account(
        mut,
        seeds = [b"user_deposit", user.key().as_ref()],
        bump = user_deposit.bump,
        constraint = user_deposit.user == user.key() @ VaultError::Unauthorized
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PauseVault<'info> {
    #[account(
        mut,
        seeds = [b"basic_vault"],
        bump = vault_state.bump,
        constraint = vault_state.authority == authority.key() @ VaultError::Unauthorized
    )]
    pub vault_state: Account<'info, BasicVaultState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResumeVault<'info> {
    #[account(
        mut,
        seeds = [b"basic_vault"],
        bump = vault_state.bump,
        constraint = vault_state.authority == authority.key() @ VaultError::Unauthorized
    )]
    pub vault_state: Account<'info, BasicVaultState>,
    
    pub authority: Signer<'info>,
}

pub fn initialize_basic_vault(ctx: Context<InitializeBasicVault>) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    vault_state.initialize(ctx.accounts.authority.key(), ctx.bumps.vault_state)?;
    
    msg!("Basic vault initialized successfully");
    Ok(())
}

pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
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
    
    msg!("Deposited {} lamports to basic vault", amount);
    Ok(())
}

pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
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
    
    msg!("Withdrew {} lamports from basic vault", amount);
    Ok(())
}

pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
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
    
    msg!("Claimed {} lamports of yield", total_yield);
    Ok(())
}

pub fn pause_vault(ctx: Context<PauseVault>) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    vault_state.is_paused = true;
    
    msg!("Basic vault paused");
    Ok(())
}

pub fn resume_vault(ctx: Context<ResumeVault>) -> Result<()> {
    let vault_state = &mut ctx.accounts.vault_state;
    vault_state.is_paused = false;
    
    msg!("Basic vault resumed");
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