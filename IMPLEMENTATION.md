# x402 Payment Flow Implementation

## Overview
This document describes the implementation of the x402 payment protocol for the Creator Tip Jar application, enabling gasless USDC tips on Base blockchain.

## Components Implemented

### 1. Payment Hook (`lib/hooks/useX402Payment.ts`)
A custom React hook that handles all payment logic using wagmi's `useWalletClient` and x402-axios.

**Features:**
- USDC transfers on Base/Base Sepolia
- x402 gasless payment support (when API URL is configured)
- Fallback to regular transactions (user pays gas)
- Balance checking before transactions
- Transaction confirmation waiting
- Comprehensive error handling

**Usage:**
```typescript
const { sendPayment, txStatus, resetStatus, isConnected, address } = useX402Payment({
  recipientAddress: '0x...',
  x402ApiUrl: process.env.NEXT_PUBLIC_X402_API_URL,
});

// Send a payment
const result = await sendPayment(amountUSDC);
if (result.success) {
  console.log('Transaction hash:', result.transactionHash);
}
```

### 2. Wagmi Provider Configuration (`app/providers.tsx`)
Updated providers to include full wagmi configuration with:
- WagmiProvider with proper config
- QueryClientProvider for React Query
- OnchainKitProvider for OnchainKit components
- Coinbase Smart Wallet connector
- Support for both Base and Base Sepolia

### 3. Main Page Integration (`app/page.tsx`)
Updated the home page to use real payments instead of mock data:
- Integrated `useX402Payment` hook
- Real-time transaction status updates
- Error handling UI
- Success modal with transaction hash
- Wallet connection requirement checks

### 4. Environment Configuration (`.env.example`)
Added environment variables for configuration:
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - OnchainKit API key
- `NEXT_PUBLIC_ENVIRONMENT` - production or development
- `NEXT_PUBLIC_CREATOR_ADDRESS` - Recipient wallet address
- `NEXT_PUBLIC_X402_API_URL` - Optional x402 API endpoint for gasless txs

## Payment Flow

### Standard Flow (User Pays Gas)
1. User connects wallet via Coinbase Smart Wallet
2. User clicks tip amount button
3. Hook checks wallet connection and USDC balance
4. Prepares ERC20 transfer transaction data
5. Sends transaction via wallet client
6. Waits for transaction confirmation
7. Displays success modal with transaction hash

### x402 Gasless Flow (When Configured)
1. User connects wallet via Coinbase Smart Wallet
2. User clicks tip amount button
3. Hook checks wallet connection and USDC balance
4. Creates axios client with x402 payment interceptor
5. Makes API request to x402-enabled endpoint
6. x402-axios automatically handles:
   - 402 Payment Required response
   - Payment header generation and signing
   - Request retry with payment header
7. API executes gasless transaction
8. Waits for transaction confirmation
9. Displays success modal with transaction hash

### Fallback Behavior
- If x402 API fails or returns error, automatically falls back to standard flow
- Ensures users can always complete payments even if gasless service is unavailable

## Technical Details

### USDC Contract Integration
- **Mainnet (Base):** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Testnet (Base Sepolia):** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Uses standard ERC20 `transfer` function
- 6 decimal places for amounts

### Transaction Confirmation
- Waits for at least 1 block confirmation
- Uses wagmi's `publicClient.waitForTransactionReceipt`
- Verifies transaction status before showing success

### Error Handling
Comprehensive error handling for:
- Wallet not connected
- Insufficient USDC balance
- Transaction failures
- Network errors
- x402 API failures (with fallback)
- Transaction rejection by user

## Testing Checklist

### Prerequisites
- [ ] Set up environment variables in `.env.local`
- [ ] Fund test wallet with USDC on Base Sepolia
- [ ] (Optional) Configure x402 API endpoint

### Test Cases

#### 1. Wallet Connection
- [ ] Connect wallet successfully
- [ ] Wallet address displays correctly
- [ ] Disconnect and reconnect works

#### 2. Standard Payment Flow (Without x402)
- [ ] Leave `NEXT_PUBLIC_X402_API_URL` unset
- [ ] Attempt to tip without connecting wallet (should show error)
- [ ] Connect wallet
- [ ] Select tip amount
- [ ] Approve transaction in wallet
- [ ] Transaction confirms successfully
- [ ] Success modal shows correct amount and transaction hash
- [ ] Transaction visible on block explorer

#### 3. Gasless Payment Flow (With x402)
- [ ] Set `NEXT_PUBLIC_X402_API_URL` to x402 endpoint
- [ ] Connect wallet
- [ ] Select tip amount
- [ ] Payment processes without gas fees
- [ ] Transaction confirms successfully
- [ ] Success modal shows correct amount and transaction hash

#### 4. Error Scenarios
- [ ] Insufficient USDC balance (should show error)
- [ ] User rejects transaction (should handle gracefully)
- [ ] Network error during transaction (should show error)
- [ ] x402 API down (should fallback to standard flow)

#### 5. UI/UX
- [ ] Loading state shows during transaction
- [ ] Error messages are clear and helpful
- [ ] Success modal displays correctly
- [ ] Transaction hash is clickable/copyable
- [ ] Recent tips list updates after successful tip

## Integration with x402 API

To enable gasless transactions, your x402 API endpoint should:

1. Accept POST requests to `/transfer` with:
```json
{
  "to": "0x...",           // recipient address
  "token": "0x...",        // USDC contract address
  "amount": "1000000",     // amount in wei (6 decimals for USDC)
  "chainId": 8453          // Base mainnet = 8453, Base Sepolia = 84532
}
```

2. Return 402 Payment Required with payment requirements when needed
3. Process payment header from x402-axios
4. Execute transaction and return:
```json
{
  "transactionHash": "0x...",
  "status": "success"
}
```

## Dependencies Added
- `x402-axios@^0.6.6` - x402 payment protocol for axios

## Build & Deploy

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
npm run dev

# Deploy to Vercel
vercel deploy
```

## Next Steps

1. **Set up x402 API endpoint** - Configure a backend that supports x402 protocol
2. **Test on testnet** - Thoroughly test all flows on Base Sepolia
3. **Monitor transactions** - Set up transaction monitoring and logging
4. **Gas optimization** - Monitor gas costs for fallback transactions
5. **Analytics** - Track payment success rates and error types

## Support & Resources

- [x402 Protocol Documentation](https://github.com/coinbase/x402)
- [OnchainKit Documentation](https://onchainkit.xyz)
- [Wagmi Documentation](https://wagmi.sh)
- [Base Documentation](https://docs.base.org)
