# 🚀 SafeMate Alias Wallet System - Step-by-Step Walkthrough

## 📋 **Complete Walkthrough Guide**

This guide will walk you through every step of using the new Alias Wallet System, from basic setup to advanced features.

---

## 🎯 **Step 1: Understanding What We Built**

### **The Problem We Solved:**
```
❌ Old System:
User → Operator Account → Simulated Wallet → Fake Balance

✅ New System:
User → Unique Alias → Real Hedera Account → Payment Provider → Real HBAR
```

### **Key Benefits:**
- **Real Blockchain Integration**: Actual Hedera TESTNET accounts
- **No Operator Dependency**: Each user has their own account
- **Direct Payment Integration**: Payment providers fund accounts directly
- **Exchange-Style Experience**: Professional wallet interface

---

## 🛠️ **Step 2: Environment Setup**

### **Prerequisites:**
1. **Android Emulator Running**
   ```bash
   # Check if emulator is running
   adb devices
   # Should show: emulator-5554    device
   ```

2. **Metro Bundler Active**
   ```bash
   # Check if Metro is running
   netstat -ano | findstr :8081
   # Should show port 8081 listening
   ```

3. **SafeMate App Installed**
   ```bash
   # App should be running on emulator
   # Check Android emulator screen
   ```

### **Environment Configuration:**
```typescript
// All services default to TESTNET
const network = 'testnet'; // DEV/PREPROD environment
const hbarPrice = 0.05; // TESTNET price (no real value)
```

---

## 🎮 **Step 3: Basic Usage Examples**

### **Example 1: Create a Complete Wallet**

```typescript
import AliasWalletIntegrationService from './src/services/blockchain/AliasWalletIntegrationService';

const createWallet = async () => {
  try {
    console.log('🚀 Creating Alias Wallet...');
    
    const result = await AliasWalletIntegrationService.createCompleteWallet({
      userId: 'user123',
      userEmail: 'user@example.com',
      plan: 'personal',
      fundingAmount: 100,
      paymentProvider: 'banxa',
      network: 'testnet' // TESTNET for DEV/PREPROD
    });

    if (result.success) {
      console.log('✅ Wallet Created!');
      console.log('Account ID:', result.accountId); // e.g., "0.0.123456"
      console.log('Alias:', result.alias); // e.g., "safemate_user123_abc456_20250115"
      console.log('Payment URL:', result.paymentUrl);
      console.log('Estimated HBAR:', result.estimatedHBAR);
    } else {
      console.error('❌ Failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

**What Happens:**
1. Generates unique alias for user
2. Creates real Hedera TESTNET account
3. Sets up payment integration
4. Returns wallet details and payment URL

### **Example 2: Check Wallet Status**

```typescript
const checkWalletStatus = async (walletId: string) => {
  try {
    console.log('🔍 Checking Wallet Status...');
    
    const status = await AliasWalletIntegrationService.getWalletStatus(walletId);
    
    if (status) {
      console.log('✅ Wallet Status:');
      console.log('Account:', status.accountId);
      console.log('Alias:', status.alias);
      console.log('Balance:', status.balanceInHBAR, 'HBAR');
      console.log('Network:', status.network);
      console.log('Active:', status.isActive);
    } else {
      console.log('❌ No wallet found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

**What Happens:**
1. Retrieves wallet from database
2. Gets real balance from Hedera TESTNET
3. Returns complete wallet status

### **Example 3: Test Payment Providers**

```typescript
const testPaymentProviders = async () => {
  try {
    console.log('💰 Testing Payment Providers...');
    
    const providers = await AliasWalletIntegrationService.getPaymentProvidersWithPricing(100);
    
    providers.forEach(provider => {
      console.log(`${provider.name}:`);
      console.log(`  Estimated HBAR: ${provider.estimatedHBAR}`);
      console.log(`  Fees: ${provider.fees.total} (${provider.fees.percentage}% + $${provider.fees.fixed})`);
      console.log(`  Net Amount: $${provider.netAmount}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

**What Happens:**
1. Gets available payment providers
2. Calculates real-time pricing
3. Shows fee breakdowns
4. Returns estimated HBAR amounts

---

## 🧪 **Step 4: Using the Test Component**

### **Add Test Component to Your App:**

```typescript
import AliasWalletTestComponent from './src/components/AliasWalletTestComponent';

// In your component:
<AliasWalletTestComponent
  userId="demo_user_123"
  userEmail="demo@example.com"
/>
```

### **Test Component Features:**
1. **System Functionality Test** - Validates all components
2. **Wallet Creation Test** - Creates real TESTNET account
3. **Payment Provider Test** - Tests payment integration
4. **Balance Sync Test** - Syncs with Hedera TESTNET
5. **Account Verification Test** - Verifies account exists

### **What You'll See:**
- Real-time test results
- System status indicators
- Wallet creation progress
- Payment provider information
- Account verification results

---

## 🔧 **Step 5: Advanced Usage**

### **Direct Service Usage:**

#### **AliasWalletManager:**
```typescript
import AliasWalletManager from './src/services/blockchain/AliasWalletManager';

// Create wallet with alias
const wallet = await AliasWalletManager.createAliasWallet(
  'user123',
  'user@example.com',
  'testnet'
);

// Get account balance
const balance = await AliasWalletManager.getAccountBalance(
  wallet.accountId,
  'testnet'
);

// Verify account
const isValid = await AliasWalletManager.verifyAccount(
  wallet.accountId,
  'testnet'
);
```

#### **EnhancedPaymentService:**
```typescript
import EnhancedPaymentService from './src/services/payment/EnhancedPaymentService';

// Create payment request
const payment = await EnhancedPaymentService.createRealPayment({
  amount: 100,
  currency: 'HBAR',
  provider: 'banxa',
  userEmail: 'user@example.com',
  userId: 'user123',
  destinationAccount: '0.0.123456', // Real TESTNET account
  alias: 'safemate_user123_abc456_20250115',
  network: 'hedera_testnet'
});

// Check payment status
const status = await EnhancedPaymentService.checkRealPaymentStatus(
  payment.transactionId,
  'banxa'
);
```

#### **EnhancedHederaService:**
```typescript
import EnhancedHederaService from './src/services/blockchain/EnhancedHederaService';

// Create account with alias
const account = await EnhancedHederaService.createAccountWithAlias(
  'safemate_user123_abc456_20250115',
  'testnet'
);

// Get account info
const info = await EnhancedHederaService.getAccountInfo(
  account.accountId,
  'testnet'
);

// Transfer HBAR
const transfer = await EnhancedHederaService.transferHBAR(
  fromAccountId,
  fromPrivateKey,
  toAccountId,
  amount,
  'testnet'
);
```

---

## 📊 **Step 6: Understanding the Flow**

### **Complete Wallet Creation Flow:**

```
1. User Registration
   ↓
2. Generate Unique Alias
   ↓
3. Create Real Hedera Account
   ↓
4. Setup Payment Integration
   ↓
5. Return Wallet Details
```

### **Payment Flow:**

```
1. User Selects Plan
   ↓
2. Choose Payment Provider
   ↓
3. Create Payment Request
   ↓
4. Payment Provider Funds Account
   ↓
5. User Receives Real HBAR
```

### **Account Verification Flow:**

```
1. Check Account Exists
   ↓
2. Verify Account Balance
   ↓
3. Sync with Hedera TESTNET
   ↓
4. Update Local Database
```

---

## 🎯 **Step 7: Testing and Validation**

### **System Health Check:**
```typescript
const testSystem = async () => {
  const status = await AliasWalletIntegrationService.testSystemFunctionality();
  
  console.log('System Status:', status.overall ? '✅ All Systems OK' : '❌ Some Systems Failed');
  console.log('AliasWalletManager:', status.aliasWalletManager ? '✅' : '❌');
  console.log('PaymentService:', status.enhancedPaymentService ? '✅' : '❌');
  console.log('HederaService:', status.enhancedHederaService ? '✅' : '❌');
  console.log('DatabaseService:', status.databaseService ? '✅' : '❌');
};
```

### **Wallet Validation:**
```typescript
const validateWallet = async (walletId: string) => {
  // Check if wallet exists
  const status = await AliasWalletIntegrationService.getWalletStatus(walletId);
  if (!status) {
    console.log('❌ Wallet not found');
    return;
  }

  // Verify account on Hedera
  const isValid = await AliasWalletIntegrationService.verifyWalletAccount(walletId);
  console.log('Account Valid:', isValid ? '✅' : '❌');

  // Sync balance
  const synced = await AliasWalletIntegrationService.syncWalletBalance(walletId);
  console.log('Balance Synced:', synced ? '✅' : '❌');
};
```

---

## 🚨 **Step 8: Troubleshooting**

### **Common Issues:**

#### **1. "No wallet found"**
```typescript
// Check if wallet exists in database
const wallet = await DatabaseService.getWallet(walletId);
if (!wallet) {
  console.log('Wallet not found in database');
}
```

#### **2. "Account verification failed"**
```typescript
// Check if account exists on Hedera TESTNET
const accountInfo = await EnhancedHederaService.getAccountInfo(accountId, 'testnet');
if (accountInfo.isDeleted) {
  console.log('Account is deleted on Hedera');
}
```

#### **3. "Payment creation failed"**
```typescript
// Check payment provider configuration
const providers = EnhancedPaymentService.getPaymentProviders();
console.log('Available providers:', providers);
```

### **Debug Commands:**
```typescript
// Test crypto functionality
const cryptoTest = await AliasWalletManager.testCryptoFunctionality();
console.log('Crypto Working:', cryptoTest.cryptoWorking);

// Check network connectivity
const connectivity = await EnhancedHederaService.checkConnectivity('testnet');
console.log('Network Connected:', connectivity);

// Get network info
const networkInfo = await EnhancedHederaService.getNetworkInfo('testnet');
console.log('Network Info:', networkInfo);
```

---

## 🎉 **Step 9: Success Indicators**

### **What Success Looks Like:**

#### **✅ Wallet Creation Success:**
```
✅ Wallet Created Successfully!
Account ID: 0.0.123456
Alias: safemate_user123_abc456_20250115
Payment URL: https://testnet-banxa.com/checkout?...
Estimated HBAR: 2000
```

#### **✅ System Test Success:**
```
✅ All Systems Operational
AliasWalletManager: ✅
PaymentService: ✅
HederaService: ✅
DatabaseService: ✅
```

#### **✅ Account Verification Success:**
```
✅ Wallet account verified on Hedera
✅ Wallet balance synced: 0 HBAR
✅ Account is active and valid
```

---

## 🚀 **Step 10: Next Steps**

### **Integration with Existing App:**
1. Replace old wallet system with new Alias Wallet
2. Update UI components to show real balances
3. Integrate with existing authentication flow
4. Add real payment processing

### **Production Migration:**
1. Change network from 'testnet' to 'mainnet'
2. Update payment provider APIs to production
3. Configure real HBAR funding
4. Test with real payment providers

### **Advanced Features:**
1. Multi-account support
2. Advanced security features
3. Payment history tracking
4. Real-time balance updates

---

## 📝 **Summary**

The Alias Wallet System provides:

- **Real blockchain integration** with Hedera TESTNET
- **Professional user experience** like exchange wallets
- **Secure architecture** without operator dependencies
- **Complete testing framework** for validation
- **Easy migration path** to production

This walkthrough shows you exactly how to use every component of the system. Start with the basic examples, then move to the test component, and finally integrate with your existing app! 🎉
