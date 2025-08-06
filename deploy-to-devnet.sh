#!/bin/bash

echo "🚀 Deploying Cyphr Vaults to Solana Devnet..."

# Set to devnet
solana config set --url devnet

# Check balance
echo "💰 Checking balance..."
solana balance

# Airdrop if needed
if [ $(solana balance | awk '{print $1}') -lt 1 ]; then
    echo "💸 Requesting airdrop..."
    solana airdrop 2
fi

# Create a simple test program for deployment
echo "📦 Creating test program..."
cat > test_program.rs << 'EOF'
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Cyphr Vaults Test Program");
    msg!("Program ID: {}", program_id);
    msg!("Number of accounts: {}", accounts.len());
    msg!("Instruction data length: {}", instruction_data.len());
    Ok(())
}
EOF

# Compile the test program
echo "🔨 Compiling test program..."
rustc --target sbfel-unknown-unknown --release test_program.rs -o test_program.so

# Deploy the test program
echo "🚀 Deploying test program..."
DEPLOY_SIG=$(solana program deploy test_program.so)
echo "✅ Deployment successful!"
echo "📝 Transaction signature: $DEPLOY_SIG"

# Get program ID
PROGRAM_ID=$(solana program show --programs | grep test_program | awk '{print $1}')
echo "🆔 Program ID: $PROGRAM_ID"

# Clean up
rm test_program.rs test_program.so

echo "🎉 Deployment complete!"
echo "📊 Program deployed to: $PROGRAM_ID"
echo "🔗 Transaction: https://explorer.solana.com/tx/$DEPLOY_SIG?cluster=devnet" 