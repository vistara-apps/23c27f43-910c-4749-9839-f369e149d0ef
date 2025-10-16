export interface Tip {
  tipId: string;
  creatorFid: string;
  tipperFid: string;
  amount: number;
  transactionHash: string;
  timestamp: number;
  isGasSponsored: boolean;
  receiptFrameUrl?: string;
}

export interface CreatorProfile {
  creatorFid: string;
  totalTipsReceived: number;
  totalTippers: number;
  topTippers: string[];
  basenames: string[];
  badgesEarned: string[];
}

export interface TipperProfile {
  fid: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  totalTipped: number;
  tipsGiven: number;
}

export type TipAmount = 1 | 5 | 10 | 25 | 50;

export interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash?: string;
  error?: string;
}
