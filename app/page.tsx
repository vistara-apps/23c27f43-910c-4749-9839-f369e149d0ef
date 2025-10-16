'use client';

import { useState, useEffect } from 'react';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { TipButton } from '@/components/TipButton';
import { SuccessModal } from '@/components/SuccessModal';
import { TipHistory } from '@/components/TipHistory';
import { TIP_AMOUNTS } from '@/lib/constants';
import type { TipAmount, Tip, TransactionStatus } from '@/lib/types';
import { Heart, Sparkles, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [selectedAmount, setSelectedAmount] = useState<TipAmount | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentTips, setRecentTips] = useState<Tip[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockTips: Tip[] = [
      {
        tipId: '1',
        creatorFid: '0x1234',
        tipperFid: '0x5678',
        amount: 5,
        transactionHash: '0xabcd1234...',
        timestamp: Date.now() - 300000,
        isGasSponsored: true,
      },
      {
        tipId: '2',
        creatorFid: '0x1234',
        tipperFid: '0x9012',
        amount: 10,
        transactionHash: '0xefgh5678...',
        timestamp: Date.now() - 600000,
        isGasSponsored: true,
      },
    ];
    setRecentTips(mockTips);
  }, []);

  const handleTip = async (amount: TipAmount) => {
    setSelectedAmount(amount);
    setTxStatus({ status: 'pending' });

    // Simulate transaction
    setTimeout(() => {
      const mockHash = '0x' + Math.random().toString(16).slice(2, 66);
      setTxStatus({ status: 'success', hash: mockHash });
      setShowSuccess(true);
      
      // Add to recent tips
      const newTip: Tip = {
        tipId: Date.now().toString(),
        creatorFid: '0x1234',
        tipperFid: '0xuser',
        amount,
        transactionHash: mockHash,
        timestamp: Date.now(),
        isGasSponsored: true,
      };
      setRecentTips([newTip, ...recentTips]);
    }, 2000);
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing receipt...');
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary bg-opacity-20 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Creator Tip Jar</h1>
          </div>
          <ConnectWalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="glass-card p-8 mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary bg-opacity-20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Gasless Tips on Base</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">
            Support Your Favorite
            <span className="text-gradient"> Creators</span>
          </h2>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Send instant USDC tips with zero gas fees. Every tip is recorded on-chain and 
            publicly acknowledged.
          </p>

          {/* Tip Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {TIP_AMOUNTS.map((amount) => (
              <TipButton
                key={amount}
                amount={amount}
                onTip={handleTip}
                disabled={txStatus.status === 'pending'}
              />
            ))}
          </div>

          {txStatus.status === 'pending' && (
            <div className="mt-6 flex items-center justify-center gap-2 text-primary">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              <span>Processing your tip...</span>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <p className="text-sm text-gray-400">Total Tips Today</p>
            </div>
            <p className="text-3xl font-bold text-gradient">$1,234</p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-primary" />
              <p className="text-sm text-gray-400">Active Supporters</p>
            </div>
            <p className="text-3xl font-bold text-gradient">89</p>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-warning" />
              <p className="text-sm text-gray-400">Gas Saved</p>
            </div>
            <p className="text-3xl font-bold text-gradient">$45.67</p>
          </div>
        </div>

        {/* Recent Tips */}
        <TipHistory tips={recentTips} />
      </main>

      {/* Success Modal */}
      {showSuccess && txStatus.hash && selectedAmount && (
        <SuccessModal
          amount={selectedAmount}
          transactionHash={txStatus.hash}
          onClose={() => setShowSuccess(false)}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
