'use client';

import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { formatUSDC, getTimeSince } from '@/lib/utils';
import type { Tip } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

interface TipHistoryProps {
  tips: Tip[];
}

export function TipHistory({ tips }: TipHistoryProps) {
  if (tips.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-gray-400">No tips yet. Be the first to support this creator! 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold mb-4">Recent Tips</h3>
      {tips.map((tip) => (
        <div
          key={tip.tipId}
          className="glass-card p-4 flex items-center justify-between hover:bg-opacity-15 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <Avatar address={tip.tipperFid as `0x${string}`} className="h-10 w-10" />
            <div>
              <Name address={tip.tipperFid as `0x${string}`} className="font-medium" />
              <p className="text-sm text-gray-400">{getTimeSince(tip.timestamp)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="font-bold text-success">{formatUSDC(tip.amount)}</span>
            <a
              href={`https://basescan.org/tx/${tip.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
