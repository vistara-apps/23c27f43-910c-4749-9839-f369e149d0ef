import { WalletClient, parseUnits } from 'viem';
import { base } from 'wagmi/chains';
import axios from 'axios';

export interface PaymentConfig {
  recipientAddress: string;
  amount: number; // in USDC (e.g., 5 = 5 USDC)
  creatorFid?: string;
  tipperFid?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  receipt?: any;
}

// USDC contract address on Base mainnet
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// ERC20 Transfer ABI
const ERC20_TRANSFER_ABI = [
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
] as const;

/**
 * Process a USDC payment using x402 protocol
 * @param walletClient - Wagmi wallet client
 * @param config - Payment configuration
 */
export async function processPayment(
  walletClient: WalletClient,
  config: PaymentConfig
): Promise<PaymentResult> {
  try {
    if (!walletClient.account) {
      return {
        success: false,
        error: 'No wallet account found. Please connect your wallet.',
      };
    }

    // Convert USDC amount to proper decimals (USDC has 6 decimals)
    const amountInBaseUnits = parseUnits(config.amount.toString(), 6);

    console.log('Processing payment:', {
      recipient: config.recipientAddress,
      amount: config.amount,
      amountInBaseUnits: amountInBaseUnits.toString(),
    });

    // Send USDC transfer transaction
    const hash = await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: [config.recipientAddress as `0x${string}`, amountInBaseUnits],
      account: walletClient.account,
      chain: base,
    });

    console.log('Transaction hash:', hash);

    // Call the API endpoint to record the tip (x402 flow)
    try {
      const response = await axios.post(
        '/api/tip',
        {
          recipientAddress: config.recipientAddress,
          amount: amountInBaseUnits.toString(),
          tokenAddress: USDC_ADDRESS,
          creatorFid: config.creatorFid,
          tipperFid: config.tipperFid,
          chainId: base.id,
        },
        {
          headers: {
            'x-transaction-hash': hash,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        transactionHash: hash,
        receipt: response.data,
      };
    } catch (apiError: any) {
      console.warn('API call failed, but transaction succeeded:', apiError);
      // Transaction succeeded even if API call failed
      return {
        success: true,
        transactionHash: hash,
        error: 'Transaction succeeded but recording failed',
      };
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    
    let errorMessage = 'Payment failed. Please try again.';
    
    if (error.message?.includes('rejected') || error.code === 'ACTION_REJECTED') {
      errorMessage = 'Transaction was rejected by user.';
    } else if (error.message?.includes('insufficient') || error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient USDC balance.';
    } else if (error.message?.includes('allowance')) {
      errorMessage = 'Please approve USDC spending first.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get USDC balance for an address
 */
export async function getUSDCBalance(
  walletClient: WalletClient,
  address: string
): Promise<bigint> {
  try {
    const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    
    // ERC20 balanceOf ABI
    const balanceOfABI = [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const;

    const balance = await walletClient.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: balanceOfABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });

    return balance;
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    return BigInt(0);
  }
}

/**
 * Format USDC amount from base units to decimal
 */
export function formatUSDCFromBaseUnits(amount: bigint): string {
  const value = Number(amount) / 1_000_000;
  return value.toFixed(2);
}
