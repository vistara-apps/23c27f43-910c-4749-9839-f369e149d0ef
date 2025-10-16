'use client';

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { CheckCircle, Loader2, XCircle, ExternalLink } from 'lucide-react';
import { base } from 'wagmi/chains';

interface TransactionStatusProps {
  hash: string;
  onConfirmed?: () => void;
}

export function TransactionStatus({ hash, onConfirmed }: TransactionStatusProps) {
  const publicClient = usePublicClient({ chainId: base.id });
  const [confirmations, setConfirmations] = useState(0);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);

  useEffect(() => {
    if (!publicClient || !hash) return;

    let isSubscribed = true;

    const checkTransaction = async () => {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: hash as `0x${string}`,
          confirmations: 1,
        });

        if (!isSubscribed) return;

        setBlockNumber(receipt.blockNumber);
        setStatus(receipt.status === 'success' ? 'success' : 'failed');
        
        if (receipt.status === 'success') {
          // Watch for additional confirmations
          const currentBlock = await publicClient.getBlockNumber();
          const confs = Number(currentBlock - receipt.blockNumber) + 1;
          setConfirmations(confs);
          
          if (onConfirmed) {
            onConfirmed();
          }

          // Continue watching for more confirmations
          const unwatch = publicClient.watchBlockNumber({
            onBlockNumber: async (newBlockNumber) => {
              if (!isSubscribed) return;
              const newConfs = Number(newBlockNumber - receipt.blockNumber) + 1;
              setConfirmations(newConfs);
              
              // Stop watching after 6 confirmations
              if (newConfs >= 6) {
                unwatch();
              }
            },
          });

          return () => {
            isSubscribed = false;
            unwatch();
          };
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
        if (isSubscribed) {
          setStatus('failed');
        }
      }
    };

    checkTransaction();

    return () => {
      isSubscribed = false;
    };
  }, [hash, publicClient, onConfirmed]);

  const explorerUrl = `https://basescan.org/tx/${hash}`;

  return (
    <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {status === 'pending' && (
            <>
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="font-medium">Confirming Transaction...</span>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-500">Transaction Confirmed!</span>
            </>
          )}
          {status === 'failed' && (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-500">Transaction Failed</span>
            </>
          )}
        </div>
        
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View on BaseScan
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex justify-between">
          <span>Transaction Hash:</span>
          <span className="font-mono text-xs">
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </span>
        </div>
        
        {blockNumber && (
          <div className="flex justify-between">
            <span>Block Number:</span>
            <span className="font-mono">{blockNumber.toString()}</span>
          </div>
        )}
        
        {status === 'success' && confirmations > 0 && (
          <div className="flex justify-between">
            <span>Confirmations:</span>
            <span className="font-semibold text-green-500">
              {confirmations} / 6
            </span>
          </div>
        )}
      </div>

      {status === 'success' && confirmations >= 6 && (
        <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-green-400">
          ✓ Transaction fully confirmed and secure
        </div>
      )}
    </div>
  );
}
