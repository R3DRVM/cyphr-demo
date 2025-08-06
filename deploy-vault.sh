#!/bin/bash

echo "🚀 Deploying Cyphr Vault Program to Solana Devnet..."

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first:"
    echo "   sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install it first:"
    echo "   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    exit 1
fi

# Set to devnet
echo "📡 Setting Solana cluster to devnet..."
solana config set --url devnet

# Check wallet
echo "💰 Checking wallet..."
if ! solana address; then
    echo "❌ No wallet found. Please create or import a wallet:"
    echo "   solana-keygen new"
    exit 1
fi

# Get some devnet SOL if needed
echo "💧 Checking SOL balance..."
BALANCE=$(solana balance)
echo "Current balance: $BALANCE"

if [[ $BALANCE == "0 SOL" ]]; then
    echo "🪙 Requesting devnet SOL..."
    solana airdrop 2
fi

# Build the program
echo "🔨 Building vault program..."
cd vault-program
anchor build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy the program
echo "🚀 Deploying program..."
PROGRAM_ID=$(solana program deploy target/deploy/vault_program.so)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Program deployed successfully!"
echo "📋 Program ID: $PROGRAM_ID"

# Update the program ID in the source code
echo "📝 Updating program ID in source code..."
sed -i '' "s/declare_id!(\"11111111111111111111111111111111\")/declare_id!(\"$PROGRAM_ID\")/" src/lib.rs

# Update the config file
echo "📝 Updating config file..."
cd ..
sed -i '' "s/VAULT_PROGRAM_ID = '11111111111111111111111111111111'/VAULT_PROGRAM_ID = '$PROGRAM_ID'/" src/config/solana.ts

echo "🎉 Vault program deployment complete!"
echo "📋 Program ID: $PROGRAM_ID"
echo "🌐 Network: Devnet"
echo "🔗 You can now use this program ID in your frontend!" 