'use client';

import { useState, useEffect } from 'react';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { TipButton } from '@/components/TipButton';
import { SuccessModal } from '@/components/SuccessModal';
import { TipHistory } from '@/components/TipHistory';
import { TIP_AMOUNTS } from '@/lib/constants';
import type { TipAmount, Tip } from '@/lib/types';
import { Heart, Sparkles, TrendingUp } from 'lucide-react';
import { useX402Payment } from '@/lib/hooks/useX402Payment';

export default function HomePage() {
  const [selectedAmount, setSelectedAmount] = useState<TipAmount | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentTips, setRecentTips] = useState<Tip[]>([]);
  
  // Example creator address - in production, this would come from the creator's profile
  const CREATOR_ADDRESS = process.env.NEXT_PUBLIC_CREATOR_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const X402_API_URL = process.env.NEXT_PUBLIC_X402_API_URL;
  
  const { sendPayment, txStatus, resetStatus, isConnected, address } = useX402Payment({
    recipientAddress: CREATOR_ADDRESS,
    x402ApiUrl: X402_API_URL,
  });

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
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setSelectedAmount(amount);
    
    const result = await sendPayment(amount);
    
    if (result.success && result.transactionHash) {
      setShowSuccess(true);
      
      // Add to recent tips
      const newTip: Tip = {
        tipId: Date.now().toString(),
        creatorFid: '0x1234',
        tipperFid: address || '0xuser',
        amount,
        transactionHash: result.transactionHash,
        timestamp: Date.now(),
        isGasSponsored: !!X402_API_URL,
      };
      setRecentTips([newTip, ...recentTips]);
    } else {
      alert(`Payment failed: ${result.error || 'Unknown error'}`);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing receipt...');
    setShowSuccess(false);
    resetStatus();
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
    resetStatus();
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
          onClose={handleCloseModal}
          onShare={handleShare}
        />
      )}

      {/* Error Message */}
      {txStatus.status === 'error' && txStatus.error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <span>❌</span>
          <div>
            <p className="font-semibold">Payment Failed</p>
            <p className="text-sm">{txStatus.error}</p>
          </div>
          <button 
            onClick={resetStatus}
            className="ml-4 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
