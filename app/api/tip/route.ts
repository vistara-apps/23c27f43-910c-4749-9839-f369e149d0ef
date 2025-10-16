import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseUnits } from 'viem';
import { base } from 'viem/chains';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// ERC20 Transfer event ABI
const TRANSFER_EVENT_ABI = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'from', type: 'address' },
    { indexed: true, name: 'to', type: 'address' },
    { indexed: false, name: 'value', type: 'uint256' },
  ],
  name: 'Transfer',
  type: 'event',
} as const;

/**
 * API endpoint for processing tips via x402 protocol
 * This endpoint receives payment verification and records the tip
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipientAddress,
      amount,
      tokenAddress,
      creatorFid,
      tipperFid,
      chainId,
    } = body;

    // Validate required fields
    if (!recipientAddress || !amount || !tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify it's USDC on Base
    if (tokenAddress.toLowerCase() !== USDC_ADDRESS.toLowerCase()) {
      return NextResponse.json(
        { error: 'Only USDC payments are supported' },
        { status: 400 }
      );
    }

    if (chainId !== base.id) {
      return NextResponse.json(
        { error: 'Only Base network is supported' },
        { status: 400 }
      );
    }

    // Get transaction hash from x402 headers
    const transactionHash = request.headers.get('x-transaction-hash');
    
    if (!transactionHash) {
      return NextResponse.json(
        { error: 'Transaction hash not found in headers' },
        { status: 400 }
      );
    }

    // Create public client to verify the transaction
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash as `0x${string}`,
      confirmations: 1,
    });

    // Verify transaction was successful
    if (receipt.status !== 'success') {
      return NextResponse.json(
        { error: 'Transaction failed' },
        { status: 400 }
      );
    }

    // Verify the transfer event in the logs
    const transferLog = receipt.logs.find(
      (log) =>
        log.address.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
    );

    if (!transferLog) {
      return NextResponse.json(
        { error: 'USDC transfer not found in transaction' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Store the tip in your database
    // 2. Update creator and tipper stats
    // 3. Emit events or notifications
    // 4. Generate receipt/badge if applicable

    console.log('Tip processed successfully:', {
      transactionHash,
      creatorFid,
      tipperFid,
      amount,
      blockNumber: receipt.blockNumber,
    });

    // Return success response with transaction details
    return NextResponse.json(
      {
        success: true,
        transactionHash,
        blockNumber: receipt.blockNumber.toString(),
        confirmations: 1,
        tipId: `${receipt.blockNumber}-${receipt.transactionIndex}`,
        amount,
        recipientAddress,
        creatorFid,
        tipperFid,
      },
      {
        status: 200,
        headers: {
          'x-transaction-hash': transactionHash,
        },
      }
    );
  } catch (error: any) {
    console.error('Error processing tip:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process tip',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve tip information
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const txHash = searchParams.get('txHash');

  if (!txHash) {
    return NextResponse.json(
      { error: 'Transaction hash is required' },
      { status: 400 }
    );
  }

  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    return NextResponse.json({
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber.toString(),
      status: receipt.status,
      confirmations: 1, // You would calculate actual confirmations here
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fetch transaction',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
