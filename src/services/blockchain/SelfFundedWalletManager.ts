/**
 * SafeMate Self-Funded Wallet Manager
 * Handles wallet creation with user-funded HBAR purchases via Alchemy Pay and Banxa
 */

import { Alert } from 'react-native';
import WalletManager from './WalletManager';
import HederaService from './HederaService';
import DatabaseService from '../../database/DatabaseService';
import PayIDService from '../payment/PayIDService';
import { Wallet } from '../../types';

export interface FundingOptions {
  amount: number; // USD amount to fund
  provider: 'alchemy' | 'banxa' | 'payid';
  userEmail: string;
  userId: string;
  paymentMethod?: string; // Specific payment method like 'credit_card', 'payid', etc.
}

export interface FundingResult {
  success: boolean;
  wallet?: Wallet;
  paymentUrl?: string;
  transactionId?: string;
  estimatedHBAR?: number;
  payIDAddress?: string;
  error?: string;
}

class SelfFundedWalletManager {
  private static instance: SelfFundedWalletManager;

  /**
   * Create a self-funded wallet with user payment
   */
  async createSelfFundedWallet(options: FundingOptions): Promise<FundingResult> {
    try {
      console.log('Creating self-funded wallet with options:', options);

      // Step 1: Process payment based on provider
      console.log('Processing payment for:', options.provider, options.amount);
      
      let paymentResponse;
      
      if (options.provider === 'payid' || options.paymentMethod === 'payid') {
        // Handle PayID payment
        paymentResponse = await this.processPayIDPayment(options);
      } else {
        // Handle Alchemy Pay or Banxa payment
        paymentResponse = {
          success: true,
          paymentUrl: `https://testnet-${options.provider}.com/checkout?amount=${options.amount}`,
          transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          estimatedCryptoAmount: options.amount / 0.1, // Simulate HBAR conversion
        };
      }

      // Step 2: Create wallet with simulated account (for TESTNET development)
      console.log('Creating wallet with simulated Hedera account...');
      const wallet = await this.createWalletWithSimulatedAccount();

      // Step 3: Create PayID account for the user
      console.log('Creating PayID account for user...');
      const payIDService = PayIDService.getInstance();
      const payIDAccount = await payIDService.createPayIDAccount(
        options.userId,
        options.userEmail,
        wallet.accountId,
        true // isTestnet
      );
      
      console.log(`✅ PayID account created: ${payIDAccount.address}`);

      // Step 4: Store payment information
      await this.storePaymentInfo(wallet.id, {
        transactionId: paymentResponse.transactionId!,
        amount: options.amount,
        provider: options.provider,
        estimatedHBAR: paymentResponse.estimatedCryptoAmount || 0,
        paymentUrl: paymentResponse.paymentUrl,
        payIDAddress: payIDAccount.address,
      });

      return {
        success: true,
        wallet,
        paymentUrl: paymentResponse.paymentUrl,
        transactionId: paymentResponse.transactionId,
        estimatedHBAR: paymentResponse.estimatedCryptoAmount,
        payIDAddress: payIDAccount.address,
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
  private async createWalletWithSimulatedAccount(): Promise<Wallet> {
    try {
      // Generate simulated account data for TESTNET
      const simulatedAccountId = `0.0.${Math.floor(Math.random() * 1000000)}`;
      
      // Generate proper 32-byte ED25519 private key
      const privateKeyBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        privateKeyBytes[i] = Math.floor(Math.random() * 256);
      }
      
      // Convert to DER format for Hedera
      const privateKeyHex = Array.from(privateKeyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const simulatedPrivateKey = `302e020100300506032b657004220420${privateKeyHex}`;
      
      // Generate corresponding public key (simplified for testnet)
      const publicKeyBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        publicKeyBytes[i] = Math.floor(Math.random() * 256);
      }
      const publicKeyHex = Array.from(publicKeyBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const simulatedPublicKey = `302a300506032b6570032100${publicKeyHex}`;

      console.log('TESTNET: Creating account with simulated Hedera account:', simulatedAccountId);

      // Create account data for WalletManager
      const accountData = {
        accountId: simulatedAccountId,
        publicKey: simulatedPublicKey,
        privateKey: simulatedPrivateKey,
      };

      // Use WalletManager to create wallet (this will handle keychain storage)
      const walletManager = WalletManager.getInstance();
      const savedWallet = await walletManager.createWallet(accountData);
      
      // Update balance to reflect HBAR purchase
      await DatabaseService.updateWalletBalance(savedWallet.id, 100);

      console.log('TESTNET: Self-funded account created successfully:', savedWallet.accountId);
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
   * Process PayID payment (TESTNET simulation)
   */
  private async processPayIDPayment(options: FundingOptions): Promise<{
    success: boolean;
    paymentUrl?: string;
    transactionId: string;
    estimatedCryptoAmount: number;
    payIDAddress?: string;
  }> {
    try {
      console.log('🧪 TESTNET: Processing PayID payment...');
      
      // Generate PayID address for the user
      const payIDService = PayIDService.getInstance();
      const payIDAddress = payIDService.generatePayIDAddress(options.userEmail, true);
      
      console.log(`Generated PayID address: ${payIDAddress}`);
      
      // Create payment request
      const paymentRequest = payIDService.createPaymentRequest(
        payIDAddress,
        options.amount,
        'USD',
        `SafeMate account funding for ${options.userEmail}`
      );
      
      // Simulate PayID payment processing
      const payIDResult = await payIDService.simulatePayIDPayment(
        paymentRequest,
        '0.0.123456' // Placeholder wallet address
      );
      
      console.log('✅ PayID payment processed successfully:', payIDResult);
      
      return {
        success: true,
        paymentUrl: `payid://${payIDAddress}?amount=${options.amount}&currency=USD`,
        transactionId: payIDResult.transactionId,
        estimatedCryptoAmount: options.amount / 0.1, // Simulate HBAR conversion
        payIDAddress: payIDAddress
      };
      
    } catch (error) {
      console.error('PayID payment processing failed:', error);
      throw new Error(`PayID payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
