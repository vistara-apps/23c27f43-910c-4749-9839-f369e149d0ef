'use client';

import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { formatUSDC } from '@/lib/utils';
import type { TipperProfile } from '@/lib/types';
import { Trophy, Medal, Award } from 'lucide-react';

interface WallOfFameProps {
  topTippers: TipperProfile[];
  totalTips: number;
  totalAmount: number;
}

export function WallOfFame({ topTippers, totalTips, totalAmount }: WallOfFameProps) {
  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="metric-card">
          <p className="text-sm text-gray-400 mb-1">Total Tips</p>
          <p className="text-3xl font-bold text-gradient">{totalTips}</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-gray-400 mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-gradient">{formatUSDC(totalAmount)}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Top Supporters
        </h3>
        
        <div className="space-y-3">
          {topTippers.map((tipper, index) => (
            <div
              key={tipper.fid}
              className="glass-card p-4 flex items-center justify-between hover:bg-opacity-15 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar address={tipper.fid as `0x${string}`} className="h-12 w-12" />
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1">
                      {getMedalIcon(index)}
                    </div>
                  )}
                </div>
                <div>
                  <Name address={tipper.fid as `0x${string}`} className="font-medium" />
                  <p className="text-sm text-gray-400">{tipper.tipsGiven} tips</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-success">{formatUSDC(tipper.totalTipped)}</p>
                <p className="text-xs text-gray-400">total</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
