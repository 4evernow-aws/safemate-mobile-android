/**
 * SafeMate Payment Service
 * Handles fiat-to-crypto payments for wallet funding using Alchemy Pay and Banxa
 */

import { Alert } from 'react-native';

export interface PaymentProvider {
  name: string;
  id: string;
  supportedCurrencies: string[];
  supportedPaymentMethods: string[];
  minAmount: number;
  maxAmount: number;
  fees: {
    percentage: number;
    fixed: number;
  };
}

export interface PaymentRequest {
  amount: number; // USD amount
  currency: string; // Target crypto currency (HBAR)
  provider: 'alchemy' | 'banxa';
  userEmail: string;
  userId: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
  estimatedCryptoAmount?: number;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId: string;
  cryptoAmount?: number;
  fiatAmount: number;
  timestamp: Date;
  provider: string;
}

class PaymentService {
  private static instance: PaymentService;
  
  // Alchemy Pay configuration (TESTNET)
  private readonly ALCHEMY_PAY_CONFIG = {
    apiKey: process.env.ALCHEMY_PAY_TESTNET_API_KEY || 'testnet_alchemy_pay_api_key',
    baseUrl: 'https://testnet-api.alchemypay.org', // Testnet endpoint
    partnerId: process.env.ALCHEMY_PAY_TESTNET_PARTNER_ID || 'testnet_partner_id',
  };

  // Banxa configuration (TESTNET)
  private readonly BANXA_CONFIG = {
    apiKey: process.env.BANXA_TESTNET_API_KEY || 'testnet_banxa_api_key',
    baseUrl: 'https://testnet-api.banxa.com', // Testnet endpoint
    merchantId: process.env.BANXA_TESTNET_MERCHANT_ID || 'testnet_merchant_id',
  };

  // HBAR pricing (this would typically come from an API)
  private readonly HBAR_USD_PRICE = 0.05; // Example price, should be fetched from API

  /**
   * Get available payment providers
   */
  getPaymentProviders(): PaymentProvider[] {
    return [
      {
        name: 'Alchemy Pay',
        id: 'alchemy',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        supportedPaymentMethods: [
          'Credit/Debit Cards',
          'Bank Transfer',
          'PayID',
          'Apple Pay',
          'Google Pay',
          'Cryptocurrency'
        ],
        minAmount: 10,
        maxAmount: 10000,
        fees: {
          percentage: 2.5,
          fixed: 0,
        },
      },
      {
        name: 'Banxa',
        id: 'banxa',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
        supportedPaymentMethods: [
          'Credit/Debit Cards',
          'Bank Transfer',
          'PayID',
          'Apple Pay',
          'Google Pay',
          'Cryptocurrency',
          'Buy Now Pay Later'
        ],
        minAmount: 20,
        maxAmount: 50000,
        fees: {
          percentage: 3.0,
          fixed: 2.99,
        },
      },
    ];
  }

  /**
   * Calculate estimated HBAR amount for given USD amount
   */
  calculateHBARAmount(usdAmount: number, provider: 'alchemy' | 'banxa'): number {
    const providerConfig = this.getPaymentProviders().find(p => p.id === provider);
    if (!providerConfig) return 0;

    // Calculate fees
    const feeAmount = (usdAmount * providerConfig.fees.percentage / 100) + providerConfig.fees.fixed;
    const netAmount = usdAmount - feeAmount;
    
    // Convert to HBAR
    return netAmount / this.HBAR_USD_PRICE;
  }

  /**
   * Create payment request with Alchemy Pay
   */
  async createAlchemyPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Creating Alchemy Pay payment request:', request);

      // Simulate API call to Alchemy Pay
      // In real implementation, you would make an HTTP request to their API
      const estimatedHBAR = this.calculateHBARAmount(request.amount, 'alchemy');
      
      // For demo purposes, we'll simulate a successful payment URL generation (TESTNET)
      const paymentUrl = `https://testnet-pay.alchemypay.org/checkout?amount=${request.amount}&currency=HBAR&user=${request.userId}&network=testnet`;
      
      return {
        success: true,
        paymentUrl,
        transactionId: `alchemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        estimatedCryptoAmount: estimatedHBAR,
      };
    } catch (error) {
      console.error('Alchemy Pay payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * Create payment request with Banxa
   */
  async createBanxaPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Creating Banxa payment request:', request);

      // Simulate API call to Banxa
      // In real implementation, you would make an HTTP request to their API
      const estimatedHBAR = this.calculateHBARAmount(request.amount, 'banxa');
      
      // For demo purposes, we'll simulate a successful payment URL generation (TESTNET)
      const paymentUrl = `https://testnet-banxa.com/checkout?amount=${request.amount}&currency=HBAR&user=${request.userId}&network=testnet`;
      
      return {
        success: true,
        paymentUrl,
        transactionId: `banxa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        estimatedCryptoAmount: estimatedHBAR,
      };
    } catch (error) {
      console.error('Banxa payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * Create payment request
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    switch (request.provider) {
      case 'alchemy':
        return this.createAlchemyPayPayment(request);
      case 'banxa':
        return this.createBanxaPayment(request);
      default:
        return {
          success: false,
          error: 'Unsupported payment provider',
        };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string, provider: 'alchemy' | 'banxa'): Promise<PaymentStatus> {
    try {
      console.log(`Checking payment status for ${provider} transaction:`, transactionId);

      // Simulate API call to check payment status
      // In real implementation, you would make an HTTP request to the provider's API
      
      // For demo purposes, we'll simulate a completed payment
      return {
        status: 'completed',
        transactionId,
        cryptoAmount: 100, // Example: 100 HBAR
        fiatAmount: 10, // Example: $10 USD
        timestamp: new Date(),
        provider,
      };
    } catch (error) {
      console.error('Payment status check failed:', error);
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
   * Show payment options to user
   */
  async showPaymentOptions(
    amount: number,
    userEmail: string,
    userId: string
  ): Promise<PaymentResponse | null> {
    return new Promise((resolve) => {
      const providers = this.getPaymentProviders();
      
      const options = providers.map(provider => ({
        text: `${provider.name} (${provider.name === 'Alchemy Pay' ? '2.5%' : '3.0%'} fee)`,
        onPress: async () => {
          try {
            const request: PaymentRequest = {
              amount,
              currency: 'HBAR',
              provider: provider.id as 'alchemy' | 'banxa',
              userEmail,
              userId,
            };

            const response = await this.createPayment(request);
            resolve(response);
          } catch (error) {
            console.error('Payment creation failed:', error);
            resolve({
              success: false,
              error: 'Payment creation failed',
            });
          }
        },
      }));

      options.push({
        text: 'Cancel',
        onPress: () => resolve(null),
        style: 'cancel' as const,
      });

      // Create detailed message showing supported payment methods
      const supportedMethods = providers.map(provider => 
        `\n${provider.name}:\n• ${provider.supportedPaymentMethods.join('\n• ')}`
      ).join('\n\n');

      Alert.alert(
        'Funding Your Account',
        `Fund your account with $${amount} to get started with Hedera blockchain.\n\nSupported payment methods:${supportedMethods}`,
        options
      );
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }
}

export default PaymentService.getInstance();
