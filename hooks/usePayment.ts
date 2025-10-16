import { useState, useCallback } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { processPayment, type PaymentConfig, type PaymentResult } from '@/lib/payment';

export interface UsePaymentReturn {
  processPayment: (config: PaymentConfig) => Promise<PaymentResult>;
  isProcessing: boolean;
  error: string | null;
  lastResult: PaymentResult | null;
}

/**
 * Hook for processing payments using x402 protocol
 */
export function usePayment(): UsePaymentReturn {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PaymentResult | null>(null);

  const handlePayment = useCallback(
    async (config: PaymentConfig): Promise<PaymentResult> => {
      setIsProcessing(true);
      setError(null);

      try {
        if (!isConnected) {
          const result: PaymentResult = {
            success: false,
            error: 'Wallet not connected. Please connect your wallet first.',
          };
          setError(result.error ?? null);
          setLastResult(result);
          return result;
        }

        if (!walletClient) {
          const result: PaymentResult = {
            success: false,
            error: 'Wallet client not available. Please try again.',
          };
          setError(result.error ?? null);
          setLastResult(result);
          return result;
        }

        const result = await processPayment(walletClient, config);
        
        if (!result.success) {
          setError(result.error ?? 'Payment failed');
        }
        
        setLastResult(result);
        return result;
      } catch (err: any) {
        const result: PaymentResult = {
          success: false,
          error: err.message || 'An unexpected error occurred',
        };
        setError(result.error ?? null);
        setLastResult(result);
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [walletClient, isConnected]
  );

  return {
    processPayment: handlePayment,
    isProcessing,
    error,
    lastResult,
  };
}
