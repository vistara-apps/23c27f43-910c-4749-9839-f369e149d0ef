'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { WallOfFame } from '@/components/WallOfFame';
import { TipHistory } from '@/components/TipHistory';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import type { TipperProfile, Tip } from '@/lib/types';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function CreatorProfilePage() {
  const params = useParams();
  const fid = params.fid as string;
  
  const [topTippers, setTopTippers] = useState<TipperProfile[]>([]);
  const [recentTips, setRecentTips] = useState<Tip[]>([]);

  useEffect(() => {
    // Mock data for demonstration
    const mockTopTippers: TipperProfile[] = [
      {
        fid: '0x1111',
        username: 'alice.eth',
        displayName: 'Alice',
        pfpUrl: '',
        totalTipped: 150,
        tipsGiven: 15,
      },
      {
        fid: '0x2222',
        username: 'bob.base',
        displayName: 'Bob',
        pfpUrl: '',
        totalTipped: 120,
        tipsGiven: 12,
      },
      {
        fid: '0x3333',
        username: 'charlie',
        displayName: 'Charlie',
        pfpUrl: '',
        totalTipped: 100,
        tipsGiven: 10,
      },
    ];

    const mockTips: Tip[] = [
      {
        tipId: '1',
        creatorFid: fid,
        tipperFid: '0x1111',
        amount: 10,
        transactionHash: '0xabcd1234...',
        timestamp: Date.now() - 300000,
        isGasSponsored: true,
      },
      {
        tipId: '2',
        creatorFid: fid,
        tipperFid: '0x2222',
        amount: 5,
        transactionHash: '0xefgh5678...',
        timestamp: Date.now() - 600000,
        isGasSponsored: true,
      },
    ];

    setTopTippers(mockTopTippers);
    setRecentTips(mockTips);
  }, [fid]);

  const totalAmount = topTippers.reduce((sum, tipper) => sum + tipper.totalTipped, 0);
  const totalTips = topTippers.reduce((sum, tipper) => sum + tipper.tipsGiven, 0);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold">Creator Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-secondary flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wall of Fame */}
          <div>
            <WallOfFame
              topTippers={topTippers}
              totalTips={totalTips}
              totalAmount={totalAmount}
            />
          </div>

          {/* Recent Tips */}
          <div>
            <TipHistory tips={recentTips} />
          </div>
        </div>
      </main>
    </div>
  );
}
