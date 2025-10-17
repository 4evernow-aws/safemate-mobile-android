/**
 * SafeMate Self-Funded Wallet Manager
 * Handles wallet creation with user-funded HBAR purchases via Alchemy Pay and Banxa
 */

import { Alert } from 'react-native';
import WalletManager from './WalletManager';
import PaymentService from '../payment/PaymentService';
import HederaService from './HederaService';
import DatabaseService from '../../database/DatabaseService';
import { Wallet } from '../../types';

export interface FundingOptions {
  amount: number; // USD amount to fund
  provider: 'alchemy' | 'banxa';
  userEmail: string;
  userId: string;
  estimatedHBAR?: number; // Optional estimated HBAR from payment provider
}

export interface FundingResult {
  success: boolean;
  wallet?: Wallet;
  paymentUrl?: string;
  transactionId?: string;
  estimatedHBAR?: number;
  error?: string;
}

class SelfFundedWalletManager {
  private static instance: SelfFundedWalletManager;
  
  private static readonly ONBOARDING_SEED_HBAR = 100;

  /**
   * Create a self-funded wallet with user payment
   */
  async createSelfFundedWallet(options: FundingOptions): Promise<FundingResult> {
    try {
      console.log('Creating self-funded wallet with options:', options);

      // Step 1: Skip payment options dialog and proceed directly
      const paymentResponse = {
        success: true,
        provider: options.provider || 'banxa',
        amount: options.amount
      };

      // Step 2: Create wallet with simulated account (for TESTNET development)
      console.log('Creating wallet with simulated Hedera account...');
      const actualEstimatedHBAR = options.estimatedHBAR || SelfFundedWalletManager.ONBOARDING_SEED_HBAR;
      const wallet = await this.createWalletWithSimulatedAccount(actualEstimatedHBAR);

      // Step 3: Store payment information
      await this.storePaymentInfo(wallet.id, {
        transactionId: paymentResponse.transactionId!,
        amount: options.amount,
        provider: options.provider,
        estimatedHBAR: actualEstimatedHBAR,
        paymentUrl: paymentResponse.paymentUrl,
      });

      return {
        success: true,
        wallet,
        paymentUrl: paymentResponse.paymentUrl,
        transactionId: paymentResponse.transactionId,
        estimatedHBAR: actualEstimatedHBAR,
      };
    } catch (error) {
      console.error('Self-funded wallet creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Wallet creation failed',
      };
    }
  }

  /**
   * Create wallet with simulated Hedera account (for TESTNET development)
   */
  private async createWalletWithSimulatedAccount(estimatedHBAR: number = SelfFundedWalletManager.ONBOARDING_SEED_HBAR): Promise<Wallet> {
    try {
      // Generate simulated account data for TESTNET
      const simulatedAccountId = `0.0.${Math.floor(Math.random() * 1000000)}`;
      // Generate proper 32-byte private key (64 hex characters)
      const privateKeyBytes = Array.from({length: 32}, () => Math.floor(Math.random() * 256));
      const privateKeyHex = privateKeyBytes.map(b => b.toString(16).padStart(2, '0')).join('');
      const simulatedPrivateKey = `302e020100300506032b657004220420${privateKeyHex}`;
      // Generate proper 32-byte public key (64 hex characters)
      const publicKeyBytes = Array.from({length: 32}, () => Math.floor(Math.random() * 256));
      const publicKeyHex = publicKeyBytes.map(b => b.toString(16).padStart(2, '0')).join('');
      const simulatedPublicKey = `302a300506032b6570032100${publicKeyHex}`;

      // Convert HBAR to tinybars (1 HBAR = 100,000,000 tinybars)
      const balanceInTinybars = Math.floor(estimatedHBAR * 100000000);

      // Create wallet object
      const walletData: Omit<Wallet, 'id' | 'createdAt' | 'lastSynced'> = {
        accountId: simulatedAccountId,
        publicKey: simulatedPublicKey,
        privateKey: simulatedPrivateKey,
        balance: balanceInTinybars,
        isActive: true,
        network: 'testnet',
      };

      // Save to database
      const savedWallet = await DatabaseService.createWallet(walletData);
      
      // Encrypt private key before storing in keychain
      const encryptedPrivateKey = WalletManager.encryptPrivateKey(simulatedPrivateKey);
      await WalletManager.storePrivateKeyInKeychain(savedWallet.id, encryptedPrivateKey);
      
      // Set wallet in Hedera service
      HederaService.setWallet(savedWallet);

      return savedWallet;
    } catch (error) {
      console.error('Failed to create account with simulated Hedera account:', error);
      throw error;
    }
  }

  /**
   * Store payment information in database
   */
  private async storePaymentInfo(
    walletId: string,
    paymentInfo: {
      transactionId: string;
      amount: number;
      provider: string;
      estimatedHBAR: number;
      paymentUrl?: string;
    }
  ): Promise<void> {
    try {
      // In a real implementation, you would store this in a payments table
      // For now, we'll just log it
      console.log('Payment information stored:', {
        walletId,
        ...paymentInfo,
      });
    } catch (error) {
      console.error('Failed to store payment information:', error);
      // Don't throw error as wallet creation was successful
    }
  }

  /**
   * Check payment status and update wallet balance
   */
  async checkPaymentStatus(transactionId: string, provider: 'alchemy' | 'banxa'): Promise<{
    status: 'pending' | 'completed' | 'failed';
    hbarAmount?: number;
    error?: string;
  }> {
    try {
      console.log(`Checking payment status for ${provider} transaction:`, transactionId);

      // Check payment status with provider
      const paymentStatus = await PaymentService.checkPaymentStatus(transactionId, provider);

      if (paymentStatus.status === 'completed' && paymentStatus.cryptoAmount) {
        // Update wallet balance in database
        const wallets = await DatabaseService.getWallets();
        const wallet = wallets.find(w => w.isActive);
        
        if (wallet) {
          await DatabaseService.updateWallet(wallet.id, {
            balance: paymentStatus.cryptoAmount,
            lastSynced: new Date(),
          });
          console.log('Account balance updated with payment:', paymentStatus.cryptoAmount, 'HBAR');
        }
      }

      return {
        status: paymentStatus.status,
        hbarAmount: paymentStatus.cryptoAmount,
      };
    } catch (error) {
      console.error('Payment status check failed:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Status check failed',
      };
    }
  }

  /**
   * Show funding options to user
   */
  async showFundingOptions(userEmail: string, userId: string): Promise<FundingResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Fund Your Account',
        'To create your Hedera blockchain account, you need to fund it with HBAR tokens. Choose your preferred payment method:',
        [
          {
            text: 'Alchemy Pay ($10)',
            onPress: async () => {
              const result = await this.createSelfFundedWallet({
                amount: 10,
                provider: 'alchemy',
                userEmail,
                userId,
              });
              resolve(result);
            },
          },
          {
            text: 'Banxa ($10)',
            onPress: async () => {
              const result = await this.createSelfFundedWallet({
                amount: 10,
                provider: 'banxa',
                userEmail,
                userId,
              });
              resolve(result);
            },
          },
          {
            text: 'Cancel',
            onPress: () => resolve(null),
            style: 'cancel',
          },
        ]
      );
    });
  }

  /**
   * Get estimated HBAR amount for USD amount
   */
  getEstimatedHBAR(usdAmount: number, provider: 'alchemy' | 'banxa'): number {
    return PaymentService.calculateHBARAmount(usdAmount, provider);
  }

  /**
   * Get available payment providers
   */
  getPaymentProviders() {
    return PaymentService.getPaymentProviders();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SelfFundedWalletManager {
    if (!SelfFundedWalletManager.instance) {
      SelfFundedWalletManager.instance = new SelfFundedWalletManager();
    }
    return SelfFundedWalletManager.instance;
  }
}

export default SelfFundedWalletManager.getInstance();
