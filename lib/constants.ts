import { base, baseSepolia } from 'wagmi/chains';

export const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
export const USDC_CONTRACT_ADDRESS_TESTNET = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;

export const CHAIN = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? base : baseSepolia;

export const TIP_AMOUNTS = [1, 5, 10, 25, 50] as const;

export const PLATFORM_FEE_PERCENTAGE = 5;

export const FARCASTER_MANIFEST = {
  name: 'Creator Tip Jar',
  homeUrl: 'https://creator-tip-jar.vercel.app',
  iconUrl: 'https://creator-tip-jar.vercel.app/icon.png',
  version: 'next',
  webhookUrl: 'https://creator-tip-jar.vercel.app/api/webhook',
  splashImageUrl: 'https://creator-tip-jar.vercel.app/splash.png',
  splashBackgroundColor: '#0A0A0A',
} as const;
