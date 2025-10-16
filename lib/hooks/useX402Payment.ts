'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWalletClient, useAccount, usePublicClient, useConnectorClient } from 'wagmi';
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';
import { parseUnits, encodeFunctionData, createWalletClient, custom } from 'viem';
import { USDC_CONTRACT_ADDRESS, CHAIN } from '@/lib/constants';
import type { TransactionStatus } from '@/lib/types';

// USDC ERC20 ABI (minimal - just what we need for transfers)
const USDC_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface UseX402PaymentProps {
  recipientAddress: string;
  x402ApiUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export function useX402Payment({ recipientAddress, x402ApiUrl }: UseX402PaymentProps) {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' });
  const { data: walletClient } = useWalletClient();
  const { connector, address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: connectorClient } = useConnectorClient();

  // Create a combined wallet client for x402 that has both wallet and public client capabilities
  const x402CompatibleClient = useMemo(() => {
    if (!connectorClient || !walletClient) return null;
    
    // Create a wallet client from the connector's provider
    try {
      return createWalletClient({
        account: walletClient.account,
        chain: CHAIN,
        transport: custom(connectorClient.transport),
      });
    } catch (error) {
      console.error('Failed to create x402-compatible wallet client:', error);
      return walletClient;
    }
  }, [connectorClient, walletClient]);

  const sendPayment = useCallback(
    async (amountUSDC: number): Promise<PaymentResult> => {
      if (!isConnected || !walletClient || !address) {
        const error = 'Wallet not connected';
        setTxStatus({ status: 'error', error });
        return { success: false, error };
      }

      if (!recipientAddress) {
        const error = 'Recipient address not provided';
        setTxStatus({ status: 'error', error });
        return { success: false, error };
      }

      try {
        setTxStatus({ status: 'pending' });

        // Convert USDC amount to proper decimals (USDC has 6 decimals)
        const amountInWei = parseUnits(amountUSDC.toString(), 6);

        // Check balance
        if (publicClient) {
          const balance = await publicClient.readContract({
            address: USDC_CONTRACT_ADDRESS,
            abi: USDC_ABI,
            functionName: 'balanceOf',
            args: [address],
          });

          if (balance < amountInWei) {
            const error = 'Insufficient USDC balance';
            setTxStatus({ status: 'error', error });
            return { success: false, error };
          }
        }

        // Prepare the transaction data
        const data = encodeFunctionData({
          abi: USDC_ABI,
          functionName: 'transfer',
          args: [recipientAddress as `0x${string}`, amountInWei],
        });

        // If x402ApiUrl is provided, use x402 for gasless transactions via API
        if (x402ApiUrl && x402CompatibleClient) {
          // Create an Axios client with payment interceptor
          const axiosClient = axios.create({
            baseURL: x402ApiUrl,
          });
          
          const x402Client = withPaymentInterceptor(axiosClient, x402CompatibleClient as any);

          try {
            // Make the payment request to the x402-enabled API
            const response = await x402Client.post('/transfer', {
              to: recipientAddress,
              token: USDC_CONTRACT_ADDRESS,
              amount: amountInWei.toString(),
              chainId: CHAIN.id,
            });

            const txHash = response.data?.transactionHash || response.data?.hash;
            
            if (!txHash) {
              throw new Error('No transaction hash returned from x402 API');
            }

            // Wait for transaction confirmation
            if (publicClient) {
              const receipt = await publicClient.waitForTransactionReceipt({
                hash: txHash as `0x${string}`,
                confirmations: 1,
              });

              if (receipt.status === 'success') {
                setTxStatus({ status: 'success', hash: txHash });
                return { success: true, transactionHash: txHash };
              } else {
                throw new Error('Transaction failed on-chain');
              }
            }

            setTxStatus({ status: 'success', hash: txHash });
            return { success: true, transactionHash: txHash };
          } catch (error: any) {
            // If x402 API fails, fall back to regular transaction
            console.warn('x402 payment failed, falling back to regular transaction:', error);
            if (error.response?.status === 402) {
              throw new Error('Payment required but payment failed');
            }
            // Fall through to regular transaction
          }
        }
        
        // Fallback to regular transaction (user pays gas)
        const txHash = await walletClient.sendTransaction({
          to: USDC_CONTRACT_ADDRESS,
          data,
          chain: CHAIN,
        });

        // Wait for transaction confirmation
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 1,
          });

          if (receipt.status === 'success') {
            setTxStatus({ status: 'success', hash: txHash });
            return { success: true, transactionHash: txHash };
          } else {
            throw new Error('Transaction failed on-chain');
          }
        }

        setTxStatus({ status: 'success', hash: txHash });
        return { success: true, transactionHash: txHash };
      } catch (error: any) {
        console.error('Payment error:', error);
        const errorMessage = error?.message || 'Payment failed';
        setTxStatus({ status: 'error', error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },
    [isConnected, walletClient, address, recipientAddress, x402ApiUrl, publicClient]
  );

  const resetStatus = useCallback(() => {
    setTxStatus({ status: 'idle' });
  }, []);

  return {
    sendPayment,
    txStatus,
    resetStatus,
    isConnected,
    address,
  };
}
