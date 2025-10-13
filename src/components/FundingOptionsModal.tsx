/**
 * SafeMate Funding Options Modal
 * 3-tab interface: Banxa, Alchemy Pay, Crypto with sub-options and costs
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaymentService from '../services/payment/PaymentService';

interface FundingOptionsModalProps {
  visible: boolean;
  amount: number;
  userEmail: string;
  userId: string;
  onClose: () => void;
  onSuccess: (result: any) => void;
  onCancel: () => void;
}

const FundingOptionsModal: React.FC<FundingOptionsModalProps> = ({
  visible,
  amount,
  userEmail,
  userId,
  onClose,
  onSuccess,
  onCancel,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedProvider, setSelectedProvider] = useState<'Banxa' | 'Alchemy Pay' | 'Crypto'>('Banxa');
  const [selectedSubOption, setSelectedSubOption] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSelection = async (provider: 'Banxa' | 'Alchemy Pay' | 'Crypto') => {
    setIsProcessing(true);
    
    try {
      let providerKey = '';
      let feePct = 0;
      
      // Set provider key and fee based on selection
      switch (provider) {
        case 'Alchemy Pay':
          providerKey = 'alchemy';
          feePct = 0.025; // 2.5% Alchemy Pay fee
          break;
        case 'Banxa':
          providerKey = 'banxa';
          feePct = 0.03; // 3% Banxa fee
          break;
        case 'Crypto':
          providerKey = 'crypto';
          feePct = 0.015; // 1.5% crypto fee
          break;
      }
      
      const total = (amount * (1 + feePct)).toFixed(2);
      const estHBAR = PaymentService.calculateHBARAmount(amount, providerKey as any);

      // Show payment options with the selected provider
      const paymentResult = await PaymentService.showPaymentOptions(
        amount,
        userEmail,
        userId
      );

      if (paymentResult && paymentResult.success) {
        onSuccess({
          success: true,
          provider: providerKey,
          amount: amount,
          total: parseFloat(total),
          estimatedHBAR: estHBAR,
          paymentResult: paymentResult
        });
      } else {
        onCancel();
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      onCancel();
    } finally {
      setIsProcessing(false);
    }
  };

  // Get sub-options for each payment method with costs
  const getSubOptions = () => {
    switch (selectedProvider) {
      case 'Alchemy Pay':
        return [
          { name: 'PayID', fee: 0.01, description: 'Australian PayID instant transfer' },
          { name: 'Credit Card', fee: 0.029, description: 'Visa, Mastercard, Amex' },
          { name: 'Bank Transfer', fee: 0.015, description: 'Direct bank transfer' },
          { name: 'Apple Pay', fee: 0.025, description: 'Apple Pay integration' },
          { name: 'Google Pay', fee: 0.025, description: 'Google Pay integration' },
          { name: 'Alipay', fee: 0.02, description: 'Alipay wallet' },
          { name: 'WeChat Pay', fee: 0.02, description: 'WeChat Pay wallet' }
        ];
      case 'Banxa':
        return [
          { name: 'PayID', fee: 0.008, description: 'Australian PayID instant transfer' },
          { name: 'Credit Card', fee: 0.035, description: 'Visa, Mastercard, Amex' },
          { name: 'Bank Transfer', fee: 0.01, description: 'Direct bank transfer' },
          { name: 'SEPA', fee: 0.005, description: 'European bank transfer' },
          { name: 'Faster Payments', fee: 0.008, description: 'UK instant transfer' },
          { name: 'Wire Transfer', fee: 0.012, description: 'International wire' }
        ];
      case 'Crypto':
        return [
          { name: 'Bitcoin (BTC)', fee: 0.01, description: 'Bitcoin network' },
          { name: 'Ethereum (ETH)', fee: 0.015, description: 'Ethereum network' },
          { name: 'USDC', fee: 0.005, description: 'USD Coin stablecoin' },
          { name: 'USDT', fee: 0.005, description: 'Tether stablecoin' },
          { name: 'Litecoin (LTC)', fee: 0.008, description: 'Litecoin network' },
          { name: 'Bitcoin Cash (BCH)', fee: 0.008, description: 'Bitcoin Cash network' }
        ];
      default:
        return [];
    }
  };

  // Calculate provider details based on selection
  const getProviderDetails = () => {
    switch (selectedProvider) {
      case 'Alchemy Pay':
        return { key: 'alchemy', fee: 0.025, description: 'Choose your preferred payment method' };
      case 'Banxa':
        return { key: 'banxa', fee: 0.03, description: 'Select your preferred transfer method' };
      case 'Crypto':
        return { key: 'crypto', fee: 0.015, description: 'Select the cryptocurrency you want to use' };
      default:
        return { key: 'banxa', fee: 0.03, description: 'Select your preferred transfer method' };
    }
  };

  const providerDetails = getProviderDetails();
  const subOptions = getSubOptions();
  
  // Get the selected sub-option's fee, or use provider default if none selected
  const selectedSubOptionData = subOptions.find(option => option.name === selectedSubOption);
  const currentFee = selectedSubOptionData ? selectedSubOptionData.fee : providerDetails.fee;
  
  const total = (amount * (1 + currentFee)).toFixed(2);
  const estHBAR = PaymentService.calculateHBARAmount(amount, providerDetails.key as any);

  // Reset sub-option when provider changes
  const handleProviderChange = (provider: 'Banxa' | 'Alchemy Pay' | 'Crypto') => {
    setSelectedProvider(provider);
    setSelectedSubOption(''); // Reset sub-option when provider changes
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Fund Your Account
          </Text>
          <Text style={[styles.subtitle, isDarkMode && styles.darkSubtext]}>
            Choose your payment method to get started
          </Text>
        </View>

        {/* Payment Options - 3 Tabs */}
        <View style={styles.paymentOptionsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.paymentOptionsScroll}
          >
            {['Banxa', 'Alchemy Pay', 'Crypto'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.paymentOption,
                  selectedProvider === option && styles.activePaymentOption,
                  isDarkMode && styles.darkPaymentOption,
                  selectedProvider === option && isDarkMode && styles.darkActivePaymentOption
                ]}
                onPress={() => handleProviderChange(option as any)}
              >
                <Text style={[
                  styles.paymentOptionText,
                  selectedProvider === option && styles.activePaymentOptionText,
                  isDarkMode && styles.darkPaymentOptionText,
                  selectedProvider === option && isDarkMode && styles.darkActivePaymentOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Details */}
        <View style={[styles.tabPanel, isDarkMode && styles.darkTabPanel]}>
          <Text style={[styles.description, isDarkMode && styles.darkSubtext]}>
            {providerDetails.description}
          </Text>

          {/* Sub-options with costs */}
          <View style={styles.subOptionsContainer}>
            <Text style={[styles.subOptionsTitle, isDarkMode && styles.darkText]}>
              Select Option:
            </Text>
            <View style={styles.subOptionsGrid}>
              {subOptions.map((option) => (
                <TouchableOpacity
                  key={option.name}
                  style={[
                    styles.subOption,
                    selectedSubOption === option.name && styles.activeSubOption,
                    isDarkMode && styles.darkSubOption,
                    selectedSubOption === option.name && isDarkMode && styles.darkActiveSubOption
                  ]}
                  onPress={() => setSelectedSubOption(option.name)}
                >
                  <Text style={[
                    styles.subOptionText,
                    selectedSubOption === option.name && styles.activeSubOptionText,
                    isDarkMode && styles.darkSubOptionText,
                    selectedSubOption === option.name && isDarkMode && styles.darkActiveSubOptionText
                  ]}>
                    {option.name}
                  </Text>
                  <Text style={[
                    styles.subOptionFee,
                    selectedSubOption === option.name && styles.activeSubOptionFee,
                    isDarkMode && styles.darkSubOptionFee,
                    selectedSubOption === option.name && isDarkMode && styles.darkActiveSubOptionFee
                  ]}>
                    {(option.fee * 100).toFixed(1)}% fee
                  </Text>
                  <Text style={[
                    styles.subOptionDescription,
                    selectedSubOption === option.name && styles.activeSubOptionDescription,
                    isDarkMode && styles.darkSubOptionDescription,
                    selectedSubOption === option.name && isDarkMode && styles.darkActiveSubOptionDescription
                  ]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Amount:</Text>
              <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>${amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Fee:</Text>
              <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{(currentFee * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Total:</Text>
              <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>${total}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, isDarkMode && styles.darkText]}>Est. HBAR:</Text>
              <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{estHBAR.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton, 
              isDarkMode && styles.darkContinueButton, 
              (isProcessing || !selectedSubOption) && styles.disabledButton
            ]}
            onPress={() => handlePaymentSelection(selectedProvider)}
            disabled={isProcessing || !selectedSubOption}
          >
            <Text style={[styles.continueButtonText, (isProcessing || !selectedSubOption) && styles.disabledButtonText]}>
              {isProcessing ? 'Processing...' : 
               !selectedSubOption ? 'Please select an option' : 
               `Continue with ${selectedSubOption}`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cancelButton, isDarkMode && styles.darkCancelButton]}
            onPress={onCancel}
          >
            <Text style={[styles.cancelButtonText, isDarkMode && styles.darkText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  darkHeader: {
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  darkText: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  darkSubtext: {
    color: '#bdc3c7',
  },
  paymentOptionsContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  paymentOptionsScroll: {
    paddingHorizontal: 4,
  },
  paymentOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    minWidth: 120,
    alignItems: 'center',
  },
  darkPaymentOption: {
    backgroundColor: '#34495e',
    borderColor: '#5d6d7e',
  },
  activePaymentOption: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  darkActivePaymentOption: {
    backgroundColor: '#2980b9',
    borderColor: '#2980b9',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    textAlign: 'center',
  },
  darkPaymentOptionText: {
    color: '#bdc3c7',
  },
  activePaymentOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  darkActivePaymentOptionText: {
    color: '#ffffff',
  },
  subOptionsContainer: {
    marginBottom: 20,
  },
  subOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  subOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    marginRight: 8,
    marginBottom: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  darkSubOption: {
    backgroundColor: '#34495e',
    borderColor: '#5d6d7e',
  },
  activeSubOption: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  darkActiveSubOption: {
    backgroundColor: '#2980b9',
    borderColor: '#2980b9',
  },
  subOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  darkSubOptionText: {
    color: '#ffffff',
  },
  activeSubOptionText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  darkActiveSubOptionText: {
    color: '#ffffff',
  },
  subOptionFee: {
    fontSize: 12,
    fontWeight: '500',
    color: '#e74c3c',
    marginBottom: 2,
  },
  darkSubOptionFee: {
    color: '#e67e22',
  },
  activeSubOptionFee: {
    color: '#ffffff',
    fontWeight: '600',
  },
  darkActiveSubOptionFee: {
    color: '#ffffff',
  },
  subOptionDescription: {
    fontSize: 10,
    fontWeight: '400',
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 12,
  },
  darkSubOptionDescription: {
    color: '#bdc3c7',
  },
  activeSubOptionDescription: {
    color: '#ffffff',
    opacity: 0.9,
  },
  darkActiveSubOptionDescription: {
    color: '#ffffff',
    opacity: 0.9,
  },
  tabPanel: {
    flex: 1,
    margin: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  darkTabPanel: {
    backgroundColor: '#2c3e50',
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  detailsContainer: {
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  darkContinueButton: {
    backgroundColor: '#2980b9',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#7f8c8d',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  darkCancelButton: {
    // Same as light mode for now
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '500',
  },
});

export default FundingOptionsModal;