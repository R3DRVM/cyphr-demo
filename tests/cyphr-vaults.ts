import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CyphrVaults } from "../target/types/cyphr_vaults";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";

describe("cyphr-vaults", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CyphrVaults as Program<CyphrVaults>;
  
  // Test accounts
  const authority = Keypair.generate();
  const user = Keypair.generate();
  const strategyOwner = Keypair.generate();

  // PDAs
  let basicVaultPda: PublicKey;
  let strategyVaultPda: PublicKey;
  let userDepositPda: PublicKey;
  let strategyUserDepositPda: PublicKey;
  let strategyPda: PublicKey;

  before(async () => {
    // Airdrop SOL to test accounts
    const signature1 = await provider.connection.requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(signature1);
    
    const signature2 = await provider.connection.requestAirdrop(user.publicKey, 5 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(signature2);
    
    const signature3 = await provider.connection.requestAirdrop(strategyOwner.publicKey, 5 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(signature3);

    // Find PDAs
    [basicVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("basic_vault")],
      program.programId
    );

    [strategyVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("strategy_vault")],
      program.programId
    );

    [userDepositPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_deposit"), user.publicKey.toBuffer()],
      program.programId
    );

    [strategyUserDepositPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("strategy_user_deposit"), user.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("Basic Vault", () => {
    it("Should initialize basic vault", async () => {
      await program.methods
        .initializeBasicVault()
        .accounts({
          vaultState: basicVaultPda,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const vaultState = await program.account.basicVaultState.fetch(basicVaultPda);
      expect(vaultState.authority.toString()).to.equal(authority.publicKey.toString());
      expect(vaultState.totalDeposits.toNumber()).to.equal(0);
      expect(vaultState.totalUsers).to.equal(0);
      expect(vaultState.isPaused).to.be.false;
      expect(vaultState.yieldRate.toNumber()).to.equal(500); // 5%
    });

    it("Should deposit SOL to basic vault", async () => {
      const depositAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);

      await program.methods
        .depositSol(depositAmount)
        .accounts({
          vaultState: basicVaultPda,
          userDeposit: userDepositPda,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const vaultState = await program.account.basicVaultState.fetch(basicVaultPda);
      const userDeposit = await program.account.userDeposit.fetch(userDepositPda);

      expect(vaultState.totalDeposits.toNumber()).to.equal(depositAmount.toNumber());
      expect(vaultState.totalUsers).to.equal(1);
      expect(userDeposit.depositAmount.toNumber()).to.equal(depositAmount.toNumber());
      expect(userDeposit.user.toString()).to.equal(user.publicKey.toString());
    });

    it("Should claim yield from basic vault", async () => {
      // Wait a bit to accumulate yield
      await new Promise(resolve => setTimeout(resolve, 2000));

      await program.methods
        .claimYield()
        .accounts({
          vaultState: basicVaultPda,
          userDeposit: userDepositPda,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const userDeposit = await program.account.userDeposit.fetch(userDepositPda);
      expect(userDeposit.yieldEarned.toNumber()).to.equal(0); // Should be reset after claiming
    });

    it("Should withdraw SOL from basic vault", async () => {
      const withdrawAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL);

      await program.methods
        .withdrawSol(withdrawAmount)
        .accounts({
          vaultState: basicVaultPda,
          userDeposit: userDepositPda,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const vaultState = await program.account.basicVaultState.fetch(basicVaultPda);
      const userDeposit = await program.account.userDeposit.fetch(userDepositPda);

      expect(vaultState.totalDeposits.toNumber()).to.equal(0.5 * LAMPORTS_PER_SOL);
      expect(userDeposit.depositAmount.toNumber()).to.equal(0.5 * LAMPORTS_PER_SOL);
    });
  });

  describe("Strategy Vault", () => {
    it("Should initialize strategy vault", async () => {
      await program.methods
        .initializeStrategyVault()
        .accounts({
          vaultState: strategyVaultPda,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const vaultState = await program.account.strategyVaultState.fetch(strategyVaultPda);
      expect(vaultState.authority.toString()).to.equal(authority.publicKey.toString());
      expect(vaultState.totalDeposits.toNumber()).to.equal(0);
      expect(vaultState.totalUsers).to.equal(0);
      expect(vaultState.isPaused).to.be.false;
      expect(vaultState.yieldRate.toNumber()).to.equal(500); // 5%
      expect(vaultState.activeStrategies).to.equal(0);
    });

    it("Should create a strategy", async () => {
      const strategyConfig = {
        name: "Test Strategy",
        description: "A test strategy for SOL/USDC",
        baseToken: "SOL",
        quoteToken: "USDC",
        positionSize: new anchor.BN(6000), // 60%
        timeFrame: "1h",
        executionInterval: new anchor.BN(3600), // 1 hour
        yieldTarget: new anchor.BN(1500), // 15%
        yieldAccumulation: true,
        entryConditions: [
          { conditionType: "price_above", value: new anchor.BN(100) }
        ],
        exitConditions: [
          { conditionType: "price_below", value: new anchor.BN(90) }
        ]
      };

      [strategyPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("strategy"),
          strategyOwner.publicKey.toBuffer(),
          Buffer.from(strategyConfig.name)
        ],
        program.programId
      );

      await program.methods
        .createStrategy(strategyConfig)
        .accounts({
          vaultState: strategyVaultPda,
          strategyState: strategyPda,
          owner: strategyOwner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([strategyOwner])
        .rpc();

      const vaultState = await program.account.strategyVaultState.fetch(strategyVaultPda);
      const strategyState = await program.account.strategyState.fetch(strategyPda);

      expect(vaultState.activeStrategies).to.equal(1);
      expect(strategyState.name).to.equal("Test Strategy");
      expect(strategyState.owner.toString()).to.equal(strategyOwner.publicKey.toString());
      expect(strategyState.isActive).to.be.true;
    });

    it("Should deposit SOL to strategy vault", async () => {
      const depositAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);

      await program.methods
        .depositStrategySol(depositAmount)
        .accounts({
          vaultState: strategyVaultPda,
          userDeposit: strategyUserDepositPda,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const vaultState = await program.account.strategyVaultState.fetch(strategyVaultPda);
      const userDeposit = await program.account.userDeposit.fetch(strategyUserDepositPda);

      expect(vaultState.totalDeposits.toNumber()).to.equal(depositAmount.toNumber());
      expect(vaultState.totalUsers).to.equal(1);
      expect(userDeposit.depositAmount.toNumber()).to.equal(depositAmount.toNumber());
    });

    it("Should execute strategy", async () => {
      await program.methods
        .executeStrategy("Test Strategy")
        .accounts({
          vaultState: strategyVaultPda,
          strategyState: strategyPda,
          owner: strategyOwner.publicKey,
        })
        .signers([strategyOwner])
        .rpc();

      const strategyState = await program.account.strategyState.fetch(strategyPda);
      expect(strategyState.lastExecution.toNumber()).to.be.greaterThan(0);
    });

    it("Should claim yield from strategy vault", async () => {
      // Wait a bit to accumulate yield
      await new Promise(resolve => setTimeout(resolve, 2000));

      await program.methods
        .claimStrategyYield()
        .accounts({
          vaultState: strategyVaultPda,
          userDeposit: strategyUserDepositPda,
          user: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const userDeposit = await program.account.userDeposit.fetch(strategyUserDepositPda);
      expect(userDeposit.yieldEarned.toNumber()).to.equal(0); // Should be reset after claiming
    });
  });
}); 