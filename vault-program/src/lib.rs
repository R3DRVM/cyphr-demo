use anchor_lang::prelude::*;
use anchor_spl::system_program;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod vault_program {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.total_deposits = 0;
        vault.total_users = 0;
        Ok(())
    }

    pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let user_deposit = &mut ctx.accounts.user_deposit;
        let user = &ctx.accounts.user;

        // Transfer SOL from user to vault
        let transfer_instruction = system_program::Transfer {
            from: user.to_account_info(),
            to: vault.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );

        system_program::transfer(cpi_ctx, amount)?;

        // Update vault stats
        vault.total_deposits = vault.total_deposits.checked_add(amount).unwrap();

        // Update or create user deposit record
        if user_deposit.user == Pubkey::default() {
            user_deposit.user = user.key();
            vault.total_users = vault.total_users.checked_add(1).unwrap();
        }
        user_deposit.amount = user_deposit.amount.checked_add(amount).unwrap();

        msg!("Deposited {} lamports to vault", amount);
        Ok(())
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let user_deposit = &mut ctx.accounts.user_deposit;
        let user = &ctx.accounts.user;

        // Check if user has enough deposited
        require!(
            user_deposit.amount >= amount,
            VaultError::InsufficientDeposit
        );

        // Transfer SOL from vault to user
        let transfer_instruction = system_program::Transfer {
            from: vault.to_account_info(),
            to: user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );

        system_program::transfer(cpi_ctx, amount)?;

        // Update vault stats
        vault.total_deposits = vault.total_deposits.checked_sub(amount).unwrap();
        user_deposit.amount = user_deposit.amount.checked_sub(amount).unwrap();

        msg!("Withdrew {} lamports from vault", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::LEN,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserDeposit::LEN,
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
        seeds = [b"vault"],
        bump,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        mut,
        seeds = [b"user_deposit", user.key().as_ref()],
        bump,
        has_one = user
    )]
    pub user_deposit: Account<'info, UserDeposit>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub total_deposits: u64,
    pub total_users: u64,
}

impl Vault {
    pub const LEN: usize = 32 + 8 + 8;
}

#[account]
pub struct UserDeposit {
    pub user: Pubkey,
    pub amount: u64,
}

impl UserDeposit {
    pub const LEN: usize = 32 + 8;
}

#[error_code]
pub enum VaultError {
    #[msg("Insufficient deposit amount")]
    InsufficientDeposit,
} 