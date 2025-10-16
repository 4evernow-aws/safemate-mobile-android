# 🧪 SafeMate TESTNET Configuration

## 🎯 **Environment Overview**

SafeMate is configured for **DEV/PREPROD environments** using **Hedera TESTNET**. This ensures safe development and testing without affecting production networks or using real funds.

---

## 🔧 **TESTNET Configuration**

### **Hedera Network**
- **Network**: Hedera TESTNET
- **Nodes**: 
  - `0.testnet.hedera.com:50211` (Node 0.0.3)
  - `1.testnet.hedera.com:50211` (Node 0.0.4)
  - `2.testnet.hedera.com:50211` (Node 0.0.5)
- **Account IDs**: Real TESTNET accounts (e.g., `0.0.123456`)
- **HBAR**: TESTNET HBAR (no real value)

### **Payment Providers**
- **Banxa**: TESTNET API endpoints
  - Base URL: `https://testnet-api.banxa.com`
  - Payment URLs: `https://testnet-banxa.com/checkout`
- **Alchemy Pay**: TESTNET API endpoints
  - Base URL: `https://testnet-api.alchemypay.org`
  - Payment URLs: `https://testnet-pay.alchemypay.org/checkout`

### **Environment Variables**
```bash
# Hedera TESTNET Configuration
HEDERA_NETWORK=testnet
HEDERA_TESTNET_NODES=0.testnet.hedera.com:50211,1.testnet.hedera.com:50211,2.testnet.hedera.com:50211

# Payment Provider TESTNET APIs
BANXA_TESTNET_API_KEY=testnet_banxa_api_key
BANXA_TESTNET_MERCHANT_ID=testnet_banxa_merchant_id
ALCHEMY_PAY_TESTNET_API_KEY=testnet_alchemy_pay_api_key
ALCHEMY_PAY_TESTNET_PARTNER_ID=testnet_alchemy_partner_id

# HBAR Pricing (TESTNET)
HBAR_USD_PRICE=0.05
```

---

## 🚀 **Key Features in TESTNET**

### **✅ What Works:**
- Real Hedera account creation on TESTNET
- Real HBAR transfers (TESTNET HBAR)
- Real transaction history
- Real account balances
- Real blockchain operations
- Payment provider integration (TESTNET)

### **⚠️ What's Different:**
- HBAR has no real value (TESTNET tokens)
- Payment providers use TESTNET endpoints
- All transactions are on TESTNET network
- Account IDs are real but on TESTNET

---

## 🧪 **Testing in TESTNET**

### **Account Creation**
```typescript
// Creates real TESTNET account
const wallet = await AliasWalletManager.createAliasWallet(
  'user123',
  'user@example.com',
  'testnet' // TESTNET environment
);

// Result: Real TESTNET account ID (e.g., "0.0.123456")
console.log('TESTNET Account:', wallet.accountId);
```

### **Payment Integration**
```typescript
// Creates TESTNET payment request
const payment = await EnhancedPaymentService.createRealPayment({
  amount: 100,
  destinationAccount: '0.0.123456', // Real TESTNET account
  network: 'hedera_testnet', // TESTNET network
  provider: 'banxa'
});

// Result: TESTNET payment URL
console.log('TESTNET Payment URL:', payment.paymentUrl);
```

### **Balance Checking**
```typescript
// Gets real TESTNET balance
const balance = await EnhancedHederaService.getAccountBalance(
  '0.0.123456', // Real TESTNET account
  'testnet' // TESTNET network
);

// Result: Real TESTNET HBAR balance
console.log('TESTNET Balance:', balance, 'tinybars');
```

---

## 🔄 **Migration to Production**

When ready for production, simply change the network parameter:

### **From TESTNET to MAINNET**
```typescript
// Change from:
network: 'testnet'

// To:
network: 'mainnet'
```

### **Environment Variables Update**
```bash
# Change from:
HEDERA_NETWORK=testnet
BANXA_TESTNET_API_KEY=testnet_banxa_api_key

# To:
HEDERA_NETWORK=mainnet
BANXA_API_KEY=production_banxa_api_key
```

---

## 📊 **TESTNET vs MAINNET Comparison**

| Feature | TESTNET | MAINNET |
|---------|---------|---------|
| Network | Hedera TESTNET | Hedera MAINNET |
| HBAR Value | No real value | Real value |
| Account IDs | Real (0.0.123456) | Real (0.0.123456) |
| Transactions | Real blockchain | Real blockchain |
| Payment APIs | TESTNET endpoints | Production endpoints |
| Cost | Free | Real fees |
| Purpose | Development/Testing | Production |

---

## 🎯 **Benefits of TESTNET Development**

### **1. Safe Development**
- No risk of losing real funds
- No impact on production networks
- Safe to experiment and test

### **2. Real Blockchain Experience**
- Actual Hedera network operations
- Real transaction processing
- Real account management

### **3. Easy Migration**
- Same code works for both networks
- Simple network parameter change
- No code changes needed

### **4. Cost Effective**
- Free TESTNET HBAR
- No real transaction fees
- Unlimited testing

---

## 🚨 **Important Notes**

### **TESTNET Limitations:**
- HBAR has no real value
- Payment providers may not process TESTNET payments
- Some features may be limited in TESTNET

### **Production Readiness:**
- All code is production-ready
- Just change network parameter
- Real payment provider APIs needed
- Real HBAR funding required

---

## 🎉 **Summary**

SafeMate's TESTNET configuration provides:

- **Real blockchain development** on Hedera TESTNET
- **Safe testing environment** with no real funds at risk
- **Production-ready code** that works on both networks
- **Easy migration path** to production when ready

This approach ensures robust development and testing while maintaining the ability to easily transition to production when the time is right! 🚀
