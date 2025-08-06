use anchor_lang::prelude::*;

declare_id!("5iVtTdPWLN8Qk6BN2vudJU4myvu9nnnjsDnhCnCR2C52");

#[program]
pub mod cyphr_vaults {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
