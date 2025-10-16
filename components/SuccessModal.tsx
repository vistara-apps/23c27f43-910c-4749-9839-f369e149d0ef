'use client';

import { CheckCircle2, ExternalLink, Share2, X } from 'lucide-react';
import { formatUSDC } from '@/lib/utils';
import { TransactionStatus } from './TransactionStatus';

interface SuccessModalProps {
  amount: number;
  transactionHash: string;
  onClose: () => void;
  onShare: () => void;
}

export function SuccessModal({ amount, transactionHash, onClose, onShare }: SuccessModalProps) {
  const explorerUrl = `https://basescan.org/tx/${transactionHash}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="success-modal w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-success bg-opacity-20 p-3 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Success!</h2>
              <p className="text-sm text-gray-400">Tip sent successfully</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-surface rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Amount Sent</span>
            <span className="text-2xl font-bold text-success">{formatUSDC(amount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Network</span>
            <span className="text-primary font-medium">Base</span>
          </div>
        </div>

        <div className="mb-6">
          <TransactionStatus hash={transactionHash} />
        </div>

        <div className="space-y-3">
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 w-full btn-primary"
          >
            <Share2 className="w-4 h-4" />
            Share Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
