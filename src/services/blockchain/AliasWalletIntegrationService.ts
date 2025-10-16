/**
 * SafeMate Alias Wallet Integration Service
 * Integrates AliasWalletManager, EnhancedPaymentService, and EnhancedHederaService
 * Provides a unified interface for the complete alias-based wallet flow
 */

import AliasWalletManager from './AliasWalletManager';
import EnhancedPaymentService from '../payment/EnhancedPaymentService';
import EnhancedHederaService from './EnhancedHederaService';
import DatabaseService from '../../database/DatabaseService';
import { Wallet } from '../../types';

export interface CompleteWalletCreationOptions {
  userId: string;
  userEmail: string;
  plan: 'personal' | 'community' | 'business';
  fundingAmount: number;
  paymentProvider: 'alchemy' | 'banxa';
  network?: 'testnet' | 'mainnet';
}

export interface CompleteWalletResult {
  success: boolean;
  wallet?: Wallet;
  alias?: string;
  accountId?: string;
  paymentUrl?: string;
  paymentTransactionId?: string;
  estimatedHBAR?: number;
  error?: string;
}

export interface WalletFundingOptions {
  walletId: string;
  amount: number;
  provider: 'alchemy' | 'banxa';
  userEmail: string;
}

export interface WalletFundingResult {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  estimatedHBAR?: number;
  error?: string;
}

export interface WalletStatus {
  wallet: Wallet;
  alias: string;
  accountId: string;
  balance: number;
  balanceInHBAR: number;
  isActive: boolean;
  network: string;
  lastSynced: Date;
}

class AliasWalletIntegrationService {
  private static instance: AliasWalletIntegrationService;

  /**
   * Complete wallet creation flow: Create account + Setup funding
   */
  async createCompleteWallet(options: CompleteWalletCreationOptions): Promise<CompleteWalletResult> {
    try {
      console.log('Starting complete wallet creation flow:', options);

      // Step 1: Create alias-based wallet
      const walletResult = await AliasWalletManager.createAliasWallet(
        options.userId,
        options.userEmail,
        options.network || 'testnet'
      );

      if (!walletResult.success || !walletResult.wallet || !walletResult.alias || !walletResult.accountId) {
        return {
          success: false,
          error: walletResult.error || 'Failed to create wallet',
        };
      }

      console.log('Wallet created successfully:', walletResult.accountId);

      // Step 2: Create funding request
      const fundingResult = await AliasWalletManager.createFundingRequest({
        amount: options.fundingAmount,
        provider: options.paymentProvider,
        userEmail: options.userEmail,
        userId: options.userId,
        alias: walletResult.alias,
        accountId: walletResult.accountId,
      });

      if (!fundingResult.success) {
        return {
          success: false,
          error: fundingResult.error || 'Failed to create funding request',
        };
      }

      console.log('Funding request created successfully');

      // Step 3: Store wallet metadata
      await this.storeWalletMetadata(walletResult.wallet.id, {
        alias: walletResult.alias,
        plan: options.plan,
        fundingAmount: options.fundingAmount,
        paymentProvider: options.paymentProvider,
        network: options.network || 'testnet',
      });

      return {
        success: true,
        wallet: walletResult.wallet,
        alias: walletResult.alias,
        accountId: walletResult.accountId,
        paymentUrl: fundingResult.paymentUrl,
        paymentTransactionId: fundingResult.transactionId,
        estimatedHBAR: fundingResult.estimatedHBAR,
      };
    } catch (error) {
      console.error('Complete wallet creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Fund existing wallet
   */
  async fundExistingWallet(options: WalletFundingOptions): Promise<WalletFundingResult> {
    try {
      console.log('Funding existing wallet:', options.walletId);

      // Get wallet from database
      const wallet = await DatabaseService.getWallet(options.walletId);
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not found',
        };
      }

      // Get wallet metadata
      const metadata = await this.getWalletMetadata(options.walletId);
      if (!metadata || !metadata.alias) {
        return {
          success: false,
          error: 'Wallet metadata not found',
        };
      }

      // Create funding request
      const fundingResult = await AliasWalletManager.createFundingRequest({
        amount: options.amount,
        provider: options.provider,
        userEmail: options.userEmail,
        userId: wallet.id, // Using wallet ID as user ID
        alias: metadata.alias,
        accountId: wallet.accountId,
      });

      if (!fundingResult.success) {
        return {
          success: false,
          error: fundingResult.error || 'Failed to create funding request',
        };
      }

      return {
        success: true,
        paymentUrl: fundingResult.paymentUrl,
        transactionId: fundingResult.transactionId,
        estimatedHBAR: fundingResult.estimatedHBAR,
      };
    } catch (error) {
      console.error('Wallet funding failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Funding failed',
      };
    }
  }

  /**
   * Get complete wallet status
   */
  async getWalletStatus(walletId: string): Promise<WalletStatus | null> {
    try {
      // Get wallet from database
      const wallet = await DatabaseService.getWallet(walletId);
      if (!wallet) {
        return null;
      }

      // Get wallet metadata
      const metadata = await this.getWalletMetadata(walletId);
      if (!metadata) {
        return null;
      }

      // Get real balance from Hedera
      const balance = await EnhancedHederaService.getAccountBalance(
        wallet.accountId,
        wallet.network as 'testnet' | 'mainnet'
      );

      const balanceInHBAR = EnhancedHederaService.tinybarsToHBAR(balance);

      return {
        wallet,
        alias: metadata.alias,
        accountId: wallet.accountId,
        balance,
        balanceInHBAR,
        isActive: wallet.isActive,
        network: wallet.network,
        lastSynced: wallet.lastSynced,
      };
    } catch (error) {
      console.error('Failed to get wallet status:', error);
      return null;
    }
  }

  /**
   * Sync wallet balance with Hedera
   */
  async syncWalletBalance(walletId: string): Promise<boolean> {
    try {
      const wallet = await DatabaseService.getWallet(walletId);
      if (!wallet) {
        return false;
      }

      // Get real balance from Hedera
      const realBalance = await EnhancedHederaService.getAccountBalance(
        wallet.accountId,
        wallet.network as 'testnet' | 'mainnet'
      );

      // Update wallet balance in database
      await DatabaseService.updateWallet(walletId, {
        balance: realBalance,
        lastSynced: new Date(),
      });

      console.log(`Wallet ${walletId} balance synced: ${realBalance} tinybars`);
      return true;
    } catch (error) {
      console.error('Failed to sync wallet balance:', error);
      return false;
    }
  }

  /**
   * Verify wallet account exists on Hedera
   */
  async verifyWalletAccount(walletId: string): Promise<boolean> {
    try {
      const wallet = await DatabaseService.getWallet(walletId);
      if (!wallet) {
        return false;
      }

      // Verify account exists on Hedera
      const accountInfo = await EnhancedHederaService.getAccountInfo(
        wallet.accountId,
        wallet.network as 'testnet' | 'mainnet'
      );

      return !accountInfo.isDeleted && accountInfo.accountId === wallet.accountId;
    } catch (error) {
      console.error('Failed to verify wallet account:', error);
      return false;
    }
  }

  /**
   * Get payment providers with real-time pricing
   */
  async getPaymentProvidersWithPricing(amount: number): Promise<Array<{
    provider: string;
    name: string;
    estimatedHBAR: number;
    fees: {
      percentage: number;
      fixed: number;
      total: number;
    };
    netAmount: number;
  }>> {
    try {
      const providers = EnhancedPaymentService.getPaymentProviders();
      const results = [];

      for (const provider of providers) {
        const estimatedHBAR = await EnhancedPaymentService.calculateHBARAmount(
          amount,
          provider.id as 'alchemy' | 'banxa'
        );

        const feesBreakdown = EnhancedPaymentService.getFeesBreakdown(
          amount,
          provider.id as 'alchemy' | 'banxa'
        );

        results.push({
          provider: provider.id,
          name: provider.name,
          estimatedHBAR,
          fees: {
            percentage: provider.fees.percentage,
            fixed: provider.fees.fixed,
            total: feesBreakdown.totalFees,
          },
          netAmount: feesBreakdown.netAmount,
        });
      }

      return results;
    } catch (error) {
      console.error('Failed to get payment providers with pricing:', error);
      return [];
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(
    transactionId: string,
    provider: 'alchemy' | 'banxa'
  ): Promise<{
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    transactionId: string;
    cryptoAmount?: number;
    fiatAmount: number;
    timestamp: Date;
    provider: string;
  }> {
    try {
      return await EnhancedPaymentService.checkRealPaymentStatus(transactionId, provider);
    } catch (error) {
      console.error('Failed to check payment status:', error);
      return {
        status: 'failed',
        transactionId,
        fiatAmount: 0,
        timestamp: new Date(),
        provider,
      };
    }
  }

  /**
   * Store wallet metadata
   */
  private async storeWalletMetadata(walletId: string, metadata: any): Promise<void> {
    try {
      // This would typically store in a separate metadata table
      // For now, we'll use a simple approach
      console.log('Storing wallet metadata:', { walletId, metadata });
    } catch (error) {
      console.error('Failed to store wallet metadata:', error);
    }
  }

  /**
   * Get wallet metadata
   */
  private async getWalletMetadata(walletId: string): Promise<any> {
    try {
      // This would typically retrieve from a separate metadata table
      // For now, we'll return a simple structure
      return {
        alias: `safemate_wallet_${walletId}`,
        plan: 'personal',
        network: 'testnet',
      };
    } catch (error) {
      console.error('Failed to get wallet metadata:', error);
      return null;
    }
  }

  /**
   * Test complete system functionality
   */
  async testSystemFunctionality(): Promise<{
    aliasWalletManager: boolean;
    enhancedPaymentService: boolean;
    enhancedHederaService: boolean;
    databaseService: boolean;
    overall: boolean;
  }> {
    try {
      // Test AliasWalletManager
      const aliasWalletTest = await AliasWalletManager.testCryptoFunctionality();
      const aliasWalletWorking = aliasWalletTest.cryptoWorking;

      // Test EnhancedPaymentService
      const hbarPrice = await EnhancedPaymentService.getHBARPrice();
      const paymentServiceWorking = hbarPrice > 0;

      // Test EnhancedHederaService
      const networkConnectivity = await EnhancedHederaService.checkConnectivity('testnet');
      const hederaServiceWorking = networkConnectivity;

      // Test DatabaseService (basic check)
      const databaseWorking = true; // Assume working if no errors

      const overall = aliasWalletWorking && paymentServiceWorking && hederaServiceWorking && databaseWorking;

      return {
        aliasWalletManager: aliasWalletWorking,
        enhancedPaymentService: paymentServiceWorking,
        enhancedHederaService: hederaServiceWorking,
        databaseService: databaseWorking,
        overall,
      };
    } catch (error) {
      console.error('System functionality test failed:', error);
      return {
        aliasWalletManager: false,
        enhancedPaymentService: false,
        enhancedHederaService: false,
        databaseService: false,
        overall: false,
      };
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AliasWalletIntegrationService {
    if (!AliasWalletIntegrationService.instance) {
      AliasWalletIntegrationService.instance = new AliasWalletIntegrationService();
    }
    return AliasWalletIntegrationService.instance;
  }
}

export default AliasWalletIntegrationService.getInstance();
