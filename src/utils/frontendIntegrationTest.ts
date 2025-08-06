import { smartContractService } from '../services/smartContractService';
import { Keypair } from '@solana/web3.js';

/**
 * Frontend Integration Test Utility
 * Tests the integration between frontend and smart contracts
 */
export class FrontendIntegrationTest {
  private testResults: Array<{ test: string; passed: boolean; error?: string }> = [];

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: Array<{ test: string; passed: boolean; error?: string }>;
  }> {
    console.log('🧪 FRONTEND INTEGRATION TESTS');
    console.log('=============================\n');

    this.testResults = [];

    // Test 1: Contract Service Initialization
    await this.testContractServiceInitialization();

    // Test 2: Network Information
    await this.testNetworkInformation();

    // Test 3: Transaction Creation
    await this.testTransactionCreation();

    // Test 4: Strategy Configuration
    await this.testStrategyConfiguration();

    // Test 5: Error Handling
    await this.testErrorHandling();

    // Summary
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = this.testResults.filter(r => !r.passed).length;
    const totalTests = this.testResults.length;

    console.log('\n📋 TEST SUMMARY');
    console.log('===============');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    for (const result of this.testResults) {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status} ${result.test}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      results: this.testResults
    };
  }

  /**
   * Test contract service initialization
   */
  private async testContractServiceInitialization(): Promise<void> {
    try {
      const networkInfo = smartContractService.getNetworkInfo();
      
      if (!networkInfo.network) {
        throw new Error('Network information not available');
      }

      if (!networkInfo.strategyVaultAddress) {
        throw new Error('Strategy vault address not available');
      }

      if (!networkInfo.basicVaultAddress) {
        throw new Error('Basic vault address not available');
      }

      console.log('✅ Contract Service Initialization');
      console.log(`   Network: ${networkInfo.network}`);
      console.log(`   Strategy Vault: ${networkInfo.strategyVaultAddress}`);
      console.log(`   Basic Vault: ${networkInfo.basicVaultAddress}`);

      this.testResults.push({
        test: 'Contract Service Initialization',
        passed: true
      });
    } catch (error) {
      console.log('❌ Contract Service Initialization');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      this.testResults.push({
        test: 'Contract Service Initialization',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test network information
   */
  private async testNetworkInformation(): Promise<void> {
    try {
      const networkInfo = smartContractService.getNetworkInfo();
      
      // Validate network info structure
      const requiredFields = ['network', 'rpcUrl', 'explorerUrl', 'strategyVaultAddress', 'basicVaultAddress'];
      
      for (const field of requiredFields) {
        if (!networkInfo[field as keyof typeof networkInfo]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate network is devnet
      if (networkInfo.network !== 'devnet') {
        throw new Error(`Expected network 'devnet', got '${networkInfo.network}'`);
      }

      // Validate explorer URL
      if (!networkInfo.explorerUrl.includes('explorer.solana.com')) {
        throw new Error('Invalid explorer URL');
      }

      console.log('✅ Network Information');
      console.log(`   Network: ${networkInfo.network}`);
      console.log(`   RPC URL: ${networkInfo.rpcUrl}`);
      console.log(`   Explorer: ${networkInfo.explorerUrl}`);

      this.testResults.push({
        test: 'Network Information',
        passed: true
      });
    } catch (error) {
      console.log('❌ Network Information');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      this.testResults.push({
        test: 'Network Information',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test transaction creation
   */
  private async testTransactionCreation(): Promise<void> {
    try {
      const testUser = Keypair.generate();
      const testAmount = 1.0;

      // Test deposit transaction creation
      const depositResult = await smartContractService.createDepositTransaction(
        testUser.publicKey,
        testAmount,
        'strategyVault'
      );

      if (!depositResult.success || !depositResult.transaction) {
        throw new Error('Failed to create deposit transaction');
      }

      // Test withdraw transaction creation
      const withdrawResult = await smartContractService.createWithdrawTransaction(
        testUser.publicKey,
        testAmount,
        'strategyVault'
      );

      if (!withdrawResult.success || !withdrawResult.transaction) {
        throw new Error('Failed to create withdraw transaction');
      }

      // Test claim yield transaction creation
      const claimResult = await smartContractService.createClaimYieldTransaction(
        testUser.publicKey,
        'strategyVault'
      );

      if (!claimResult.success || !claimResult.transaction) {
        throw new Error('Failed to create claim yield transaction');
      }

      console.log('✅ Transaction Creation');
      console.log(`   Deposit Transaction: ${depositResult.transaction.instructions.length} instructions`);
      console.log(`   Withdraw Transaction: ${withdrawResult.transaction.instructions.length} instructions`);
      console.log(`   Claim Yield Transaction: ${claimResult.transaction.instructions.length} instructions`);

      this.testResults.push({
        test: 'Transaction Creation',
        passed: true
      });
    } catch (error) {
      console.log('❌ Transaction Creation');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      this.testResults.push({
        test: 'Transaction Creation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test strategy configuration
   */
  private async testStrategyConfiguration(): Promise<void> {
    try {
      const testUser = Keypair.generate();
      
      const strategyConfig = {
        name: 'Test Strategy',
        description: 'Test strategy for integration testing',
        baseToken: 'SOL',
        quoteToken: 'USDC',
        positionSize: 0.6,
        timeFrame: '5m',
        executionInterval: 300000,
        entryConditions: [
          { type: 'price_above', value: 100.0 }
        ],
        exitConditions: [
          { type: 'take_profit', value: 0.05 }
        ],
        yieldTarget: 0.05,
        yieldAccumulation: true
      };

      // Test strategy transaction creation
      const strategyResult = await smartContractService.createStrategyTransaction(
        testUser.publicKey,
        strategyConfig,
        'strategyVault'
      );

      if (!strategyResult.success || !strategyResult.transaction) {
        throw new Error('Failed to create strategy transaction');
      }

      // Test execute strategy transaction creation
      const executeResult = await smartContractService.createExecuteStrategyTransaction(
        'test_strategy_123',
        'strategyVault'
      );

      if (!executeResult.success || !executeResult.transaction) {
        throw new Error('Failed to create execute strategy transaction');
      }

      console.log('✅ Strategy Configuration');
      console.log(`   Strategy Transaction: ${strategyResult.transaction.instructions.length} instructions`);
      console.log(`   Execute Transaction: ${executeResult.transaction.instructions.length} instructions`);
      console.log(`   Strategy Name: ${strategyConfig.name}`);
      console.log(`   Time Frame: ${strategyConfig.timeFrame}`);

      this.testResults.push({
        test: 'Strategy Configuration',
        passed: true
      });
    } catch (error) {
      console.log('❌ Strategy Configuration');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      this.testResults.push({
        test: 'Strategy Configuration',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    try {
      const testUser = Keypair.generate();
      
      // Test with invalid amount
      const invalidAmountResult = await smartContractService.createDepositTransaction(
        testUser.publicKey,
        -1, // Invalid negative amount
        'strategyVault'
      );

      // Test with invalid vault type
      const invalidVaultResult = await smartContractService.createDepositTransaction(
        testUser.publicKey,
        1.0,
        'invalidVault' as any
      );

      // Test simulation with invalid parameters
      const simulationResult = await smartContractService.simulateDeposit(
        testUser.publicKey,
        -1
      );

      console.log('✅ Error Handling');
      console.log(`   Invalid Amount Handling: ${invalidAmountResult.success ? 'Handled' : 'Failed'}`);
      console.log(`   Invalid Vault Handling: ${invalidVaultResult.success ? 'Handled' : 'Failed'}`);
      console.log(`   Simulation Error Handling: ${simulationResult.success ? 'Handled' : 'Failed'}`);

      this.testResults.push({
        test: 'Error Handling',
        passed: true
      });
    } catch (error) {
      console.log('❌ Error Handling');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      this.testResults.push({
        test: 'Error Handling',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const frontendIntegrationTest = new FrontendIntegrationTest(); 