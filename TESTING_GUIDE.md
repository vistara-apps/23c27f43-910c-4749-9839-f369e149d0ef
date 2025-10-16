# Testing Guide for x402 Payment Flow

## Quick Setup

1. **Create `.env.local` file:**
```bash
cp .env.example .env.local
```

2. **Configure environment variables:**
```env
# Required
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_from_coinbase

# Choose environment
NEXT_PUBLIC_ENVIRONMENT=development  # or production

# Set recipient address (where tips will be sent)
NEXT_PUBLIC_CREATOR_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Optional: Enable gasless transactions
# NEXT_PUBLIC_X402_API_URL=https://your-x402-api.example.com
```

3. **Install and run:**
```bash
npm install
npm run dev
```

## Testing Scenarios

### Scenario 1: Basic Payment Flow (No x402)

**Setup:**
- Leave `NEXT_PUBLIC_X402_API_URL` unset or commented out
- Use Base Sepolia testnet (development environment)
- Ensure you have USDC on Base Sepolia

**Steps:**
1. Open http://localhost:3000
2. Click "Connect Wallet" - should open Coinbase Smart Wallet
3. Complete wallet connection
4. Select a tip amount (e.g., $5)
5. Approve the transaction in your wallet
6. Wait for confirmation
7. Success modal should appear with transaction hash

**Expected Result:**
- Transaction completes successfully
- You pay gas fees
- Transaction visible on [Base Sepolia Explorer](https://sepolia.basescan.org/)

### Scenario 2: Gasless Payment with x402

**Setup:**
- Set `NEXT_PUBLIC_X402_API_URL` to your x402 API endpoint
- Use Base Sepolia testnet
- Ensure your x402 API is running and configured

**Steps:**
1. Open http://localhost:3000
2. Connect wallet
3. Select a tip amount
4. Transaction processes automatically
5. No gas approval needed from user
6. Success modal appears

**Expected Result:**
- Transaction completes without gas fees
- x402 API handles the gas payment
- Transaction visible on block explorer

### Scenario 3: Error Handling

#### 3.1 Insufficient Balance
**Steps:**
1. Connect wallet with 0 USDC balance
2. Try to send a tip
**Expected:** Error message "Insufficient USDC balance"

#### 3.2 User Rejection
**Steps:**
1. Connect wallet with USDC
2. Select tip amount
3. Reject transaction in wallet
**Expected:** Error message about transaction rejection

#### 3.3 Network Issues
**Steps:**
1. Disconnect internet or use network throttling
2. Try to send a tip
**Expected:** Error message about network failure

### Scenario 4: x402 Fallback

**Setup:**
- Set invalid `NEXT_PUBLIC_X402_API_URL`
- This simulates x402 service being down

**Steps:**
1. Connect wallet
2. Select tip amount
3. Watch console for x402 failure log
4. Transaction should fallback to standard flow
5. Approve gas payment in wallet

**Expected Result:**
- Console shows x402 attempt failed
- Automatically falls back to standard payment
- User pays gas
- Transaction still completes successfully

## Verification Checklist

### ✅ Build & Deploy
- [ ] `npm run build` completes without errors
- [ ] No TypeScript compilation errors
- [ ] All dependencies installed correctly

### ✅ Wallet Integration
- [ ] Coinbase Smart Wallet connects successfully
- [ ] Wallet address displays in UI
- [ ] Disconnect/reconnect works properly
- [ ] Wallet state persists on page refresh

### ✅ Payment Flow
- [ ] Can select tip amounts
- [ ] Loading state shows during processing
- [ ] Transaction hash returned on success
- [ ] Success modal displays correctly
- [ ] Recent tips list updates

### ✅ x402 Integration
- [ ] x402-axios installed (`x402-axios@^0.6.6`)
- [ ] Payment interceptor configured correctly
- [ ] Gasless transactions work (when x402 API configured)
- [ ] Fallback to standard transactions works

### ✅ USDC on Base
- [ ] Correct USDC contract address for environment
- [ ] Base Sepolia: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- [ ] Base Mainnet: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- [ ] Amounts converted correctly (6 decimals)

### ✅ Transaction Confirmations
- [ ] Waits for at least 1 confirmation
- [ ] Transaction status verified on-chain
- [ ] Success only shown after confirmation
- [ ] Transaction hash is valid and viewable

### ✅ Error Handling
- [ ] Insufficient balance checked before transaction
- [ ] User rejection handled gracefully
- [ ] Network errors display helpful messages
- [ ] x402 failures fallback properly
- [ ] All errors logged to console

## Debugging Tips

### Check Transaction Status
```bash
# Open Base Sepolia Explorer
# https://sepolia.basescan.org/tx/[YOUR_TX_HASH]
```

### View Console Logs
Open browser DevTools (F12) and check Console for:
- Payment flow logs
- x402 interceptor activity
- Error messages
- Transaction hashes

### Common Issues

**"Wallet not connected"**
- Solution: Click "Connect Wallet" button first

**"Insufficient USDC balance"**
- Solution: Get test USDC from Base Sepolia faucet or swap ETH for USDC

**"Transaction failed"**
- Check gas settings
- Verify network is Base Sepolia
- Check USDC contract address is correct

**x402 not working**
- Verify `NEXT_PUBLIC_X402_API_URL` is set correctly
- Check x402 API is running and accessible
- Review API logs for errors
- Check network tab for 402 responses

### Get Test USDC on Base Sepolia

1. Get Base Sepolia ETH from [Coinbase Faucet](https://portal.cdp.coinbase.com/products/faucet)
2. Swap ETH for USDC on [Uniswap](https://app.uniswap.org) (select Base Sepolia network)
3. Or use a Base Sepolia testnet faucet

## Monitoring Production

### Key Metrics to Track
- Payment success rate
- Average confirmation time
- x402 usage vs fallback rate
- Error types and frequency
- Gas costs for fallback transactions

### Logging
The hook logs important events to console:
- Payment attempts
- x402 failures (with fallback)
- Transaction hashes
- Error details

Consider adding:
- Analytics tracking (e.g., PostHog, Mixpanel)
- Error monitoring (e.g., Sentry)
- Transaction monitoring dashboard

## Next Steps After Testing

1. **Deploy to production:**
```bash
vercel deploy --prod
```

2. **Switch to mainnet:**
- Update `NEXT_PUBLIC_ENVIRONMENT=production`
- Verify USDC contract address
- Test with small amounts first

3. **Set up monitoring:**
- Add error tracking
- Monitor transaction success rates
- Track gas costs

4. **Documentation:**
- Update README with live demo link
- Document any API endpoints
- Create user guide

## Support

If you encounter issues:
1. Check this testing guide
2. Review `IMPLEMENTATION.md` for technical details
3. Check browser console for error messages
4. Verify environment variables are set correctly
5. Ensure you're on the correct network (Base Sepolia for dev)
