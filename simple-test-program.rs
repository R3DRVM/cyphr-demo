use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("🚀 Cyphr Vaults Test Program");
    msg!("📊 Program ID: {}", program_id);
    msg!("👥 Number of accounts: {}", accounts.len());
    msg!("📝 Instruction data length: {}", instruction_data.len());
    
    // Simple vault simulation
    if instruction_data.len() > 0 {
        match instruction_data[0] {
            0 => {
                msg!("💰 Deposit instruction");
                if accounts.len() >= 2 {
                    msg!("💳 From: {}", accounts[0].key);
                    msg!("🏦 To: {}", accounts[1].key);
                }
            },
            1 => {
                msg!("💸 Withdraw instruction");
                if accounts.len() >= 2 {
                    msg!("🏦 From: {}", accounts[0].key);
                    msg!("💳 To: {}", accounts[1].key);
                }
            },
            2 => {
                msg!("🎁 Claim yield instruction");
                if accounts.len() >= 1 {
                    msg!("👤 User: {}", accounts[0].key);
                }
            },
            3 => {
                msg!("📈 Create strategy instruction");
                if accounts.len() >= 1 {
                    msg!("👤 Owner: {}", accounts[0].key);
                }
            },
            4 => {
                msg!("⚡ Execute strategy instruction");
                if accounts.len() >= 1 {
                    msg!("👤 Owner: {}", accounts[0].key);
                }
            },
            _ => {
                msg!("❓ Unknown instruction");
            }
        }
    }
    
    msg!("✅ Transaction successful!");
    Ok(())
} 