# Creator Tip Jar - Base Mini App

Enable gasless, in-feed USDC micro-tips for Farcaster creators.

## Features

- 🎯 **Instant Gasless Tips**: Send USDC tips with zero gas fees via Paymaster
- 🏆 **Wall of Fame**: Showcase top supporters with on-chain badges
- 📱 **Mobile-First**: Optimized for Farcaster mobile experience
- 🔗 **On-Chain Receipts**: Every tip is recorded and shareable
- ⚡ **Base Network**: Fast, low-cost transactions on Base L2

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Base (Ethereum L2)
- **Wallet**: OnchainKit + Coinbase Wallet
- **Styling**: Tailwind CSS with BASE theme
- **Integration**: Farcaster Frame SDK

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
   NEXT_PUBLIC_ENVIRONMENT=development
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Get from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- `NEXT_PUBLIC_ENVIRONMENT`: `development` or `production`

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

## License

MIT
