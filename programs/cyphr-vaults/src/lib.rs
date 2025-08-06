use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod basic_vault;
pub mod strategy_vault;
pub mod state;
pub mod errors;

use basic_vault::*;
use strategy_vault::*;
use state::*;
use errors::*;

#[program]
pub mod cyphr_vaults {
    use super::*;

    // Basic Vault Instructions
    pub fn initialize_basic_vault(ctx: Context<InitializeBasicVault>) -> Result<()> {
        basic_vault::initialize_basic_vault(ctx)
    }

    pub fn deposit_sol(
        ctx: Context<DepositSol>,
        amount: u64,
    ) -> Result<()> {
        basic_vault::deposit_sol(ctx, amount)
    }

    pub fn withdraw_sol(
        ctx: Context<WithdrawSol>,
        amount: u64,
    ) -> Result<()> {
        basic_vault::withdraw_sol(ctx, amount)
    }

    pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
        basic_vault::claim_yield(ctx)
    }

    pub fn pause_vault(ctx: Context<PauseVault>) -> Result<()> {
        basic_vault::pause_vault(ctx)
    }

    pub fn resume_vault(ctx: Context<ResumeVault>) -> Result<()> {
        basic_vault::resume_vault(ctx)
    }

    // Strategy Vault Instructions
    pub fn initialize_strategy_vault(ctx: Context<InitializeStrategyVault>) -> Result<()> {
        strategy_vault::initialize_strategy_vault(ctx)
    }

    pub fn create_strategy(
        ctx: Context<CreateStrategy>,
        strategy_config: StrategyConfig,
    ) -> Result<()> {
        strategy_vault::create_strategy(ctx, strategy_config)
    }

    pub fn execute_strategy(
        ctx: Context<ExecuteStrategy>,
        strategy_id: String,
    ) -> Result<()> {
        strategy_vault::execute_strategy(ctx, strategy_id)
    }

    pub fn deposit_strategy_sol(
        ctx: Context<DepositStrategySol>,
        amount: u64,
    ) -> Result<()> {
        strategy_vault::deposit_strategy_sol(ctx, amount)
    }

    pub fn withdraw_strategy_sol(
        ctx: Context<WithdrawStrategySol>,
        amount: u64,
    ) -> Result<()> {
        strategy_vault::withdraw_strategy_sol(ctx, amount)
    }

    pub fn claim_strategy_yield(ctx: Context<ClaimStrategyYield>) -> Result<()> {
        strategy_vault::claim_strategy_yield(ctx)
    }
} 