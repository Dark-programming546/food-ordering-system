// Mock payment service for Telebirr and CBEBirr
// Replace with actual API when you get merchant credentials

class PaymentService {
  // Simulate payment processing delay
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate random success/failure (80% success for testing)
  static simulatePaymentResult() {
    const random = Math.random();
    return random < 0.8; // 80% success rate for testing
  }

  // Process Telebirr payment
  static async processTelebirrPayment(amount, phoneNumber, orderId) {
    console.log(`Processing Telebirr payment: ${amount} ETB from ${phoneNumber}`);
    
    // Simulate API call delay
    await this.delay(2000);
    
    const isSuccess = this.simulatePaymentResult();
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: `TB-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        receiptNumber: `RCPT-${Date.now()}`,
        message: 'Telebirr payment successful',
        paymentDate: new Date()
      };
    } else {
      return {
        success: false,
        error: 'Insufficient balance or invalid phone number',
        message: 'Telebirr payment failed'
      };
    }
  }

  // Process CBEBirr payment
  static async processCBEBirrPayment(amount, phoneNumber, orderId) {
    console.log(`Processing CBEBirr payment: ${amount} ETB from ${phoneNumber}`);
    
    // Simulate API call delay
    await this.delay(2000);
    
    const isSuccess = this.simulatePaymentResult();
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: `CBE-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        receiptNumber: `RCPT-${Date.now()}`,
        message: 'CBEBirr payment successful',
        paymentDate: new Date()
      };
    } else {
      return {
        success: false,
        error: 'Insufficient balance or invalid phone number',
        message: 'CBEBirr payment failed'
      };
    }
  }

  // Verify payment status
  static async verifyPayment(transactionId, paymentMethod) {
    console.log(`Verifying payment: ${transactionId} via ${paymentMethod}`);
    
    await this.delay(1000);
    
    // Simulate verification
    return {
      success: true,
      status: 'completed',
      message: 'Payment verified successfully'
    };
  }

  // Refund payment
  static async refundPayment(transactionId, amount, paymentMethod) {
    console.log(`Refunding ${amount} ETB for transaction ${transactionId}`);
    
    await this.delay(1500);
    
    return {
      success: true,
      refundId: `REF-${Date.now()}`,
      message: 'Payment refunded successfully'
    };
  }
}

module.exports = PaymentService;