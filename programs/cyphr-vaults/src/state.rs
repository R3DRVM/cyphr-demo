use anchor_lang::prelude::*;

#[account]
pub struct BasicVaultState {
    pub authority: Pubkey,
    pub total_deposits: u64,
    pub total_users: u32,
    pub is_paused: bool,
    pub total_yield_generated: u64,
    pub last_yield_calculation: i64,
    pub yield_rate: u64, // Basis points (500 = 5%)
    pub bump: u8,
}

#[account]
pub struct UserDeposit {
    pub user: Pubkey,
    pub deposit_amount: u64,
    pub yield_earned: u64,
    pub last_yield_update: i64,
    pub bump: u8,
}

#[account]
pub struct StrategyVaultState {
    pub authority: Pubkey,
    pub total_deposits: u64,
    pub total_users: u32,
    pub is_paused: bool,
    pub total_yield_generated: u64,
    pub last_yield_calculation: i64,
    pub yield_rate: u64, // Basis points (500 = 5%)
    pub active_strategies: u32,
    pub total_pnl: i64,
    pub bump: u8,
}

#[account]
pub struct StrategyState {
    pub id: String,
    pub owner: Pubkey,
    pub name: String,
    pub description: String,
    pub base_token: String,
    pub quote_token: String,
    pub position_size: u64, // Basis points (6000 = 60%)
    pub time_frame: String,
    pub execution_interval: u64,
    pub yield_target: u64, // Basis points (1500 = 15%)
    pub yield_accumulation: bool,
    pub is_active: bool,
    pub created_at: i64,
    pub last_execution: i64,
    pub total_pnl: i64,
    pub entry_conditions: Vec<Condition>,
    pub exit_conditions: Vec<Condition>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Condition {
    pub condition_type: String,
    pub value: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct StrategyConfig {
    pub name: String,
    pub description: String,
    pub base_token: String,
    pub quote_token: String,
    pub position_size: u64,
    pub time_frame: String,
    pub execution_interval: u64,
    pub yield_target: u64,
    pub yield_accumulation: bool,
    pub entry_conditions: Vec<Condition>,
    pub exit_conditions: Vec<Condition>,
}

impl BasicVaultState {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // total_deposits
        4 + // total_users
        1 + // is_paused
        8 + // total_yield_generated
        8 + // last_yield_calculation
        8 + // yield_rate
        1; // bump

    pub fn initialize(&mut self, authority: Pubkey, bump: u8) -> Result<()> {
        self.authority = authority;
        self.total_deposits = 0;
        self.total_users = 0;
        self.is_paused = false;
        self.total_yield_generated = 0;
        self.last_yield_calculation = Clock::get()?.unix_timestamp;
        self.yield_rate = 500; // 5% annual yield
        self.bump = bump;
        Ok(())
    }
}

impl StrategyVaultState {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // total_deposits
        4 + // total_users
        1 + // is_paused
        8 + // total_yield_generated
        8 + // last_yield_calculation
        8 + // yield_rate
        4 + // active_strategies
        8 + // total_pnl
        1; // bump

    pub fn initialize(&mut self, authority: Pubkey, bump: u8) -> Result<()> {
        self.authority = authority;
        self.total_deposits = 0;
        self.total_users = 0;
        self.is_paused = false;
        self.total_yield_generated = 0;
        self.last_yield_calculation = Clock::get()?.unix_timestamp;
        self.yield_rate = 500; // 5% annual yield
        self.active_strategies = 0;
        self.total_pnl = 0;
        self.bump = bump;
        Ok(())
    }
}

impl UserDeposit {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        8 + // deposit_amount
        8 + // yield_earned
        8 + // last_yield_update
        1; // bump

    pub fn initialize(&mut self, user: Pubkey, bump: u8) -> Result<()> {
        self.user = user;
        self.deposit_amount = 0;
        self.yield_earned = 0;
        self.last_yield_update = Clock::get()?.unix_timestamp;
        self.bump = bump;
        Ok(())
    }
}

impl StrategyState {
    pub const LEN: usize = 8 + // discriminator
        64 + // id (max 64 chars)
        32 + // owner
        64 + // name (max 64 chars)
        256 + // description (max 256 chars)
        16 + // base_token (max 16 chars)
        16 + // quote_token (max 16 chars)
        8 + // position_size
        16 + // time_frame (max 16 chars)
        8 + // execution_interval
        8 + // yield_target
        1 + // yield_accumulation
        1 + // is_active
        8 + // created_at
        8 + // last_execution
        8 + // total_pnl
        4 + // entry_conditions length
        100 + // entry_conditions (max 10 conditions * 10 bytes each)
        4 + // exit_conditions length
        100 + // exit_conditions (max 10 conditions * 10 bytes each)
        1; // bump

    pub fn initialize(
        &mut self,
        id: String,
        owner: Pubkey,
        config: StrategyConfig,
        bump: u8,
    ) -> Result<()> {
        self.id = id;
        self.owner = owner;
        self.name = config.name;
        self.description = config.description;
        self.base_token = config.base_token;
        self.quote_token = config.quote_token;
        self.position_size = config.position_size;
        self.time_frame = config.time_frame;
        self.execution_interval = config.execution_interval;
        self.yield_target = config.yield_target;
        self.yield_accumulation = config.yield_accumulation;
        self.is_active = true;
        self.created_at = Clock::get()?.unix_timestamp;
        self.last_execution = 0;
        self.total_pnl = 0;
        self.entry_conditions = config.entry_conditions;
        self.exit_conditions = config.exit_conditions;
        self.bump = bump;
        Ok(())
    }
} 