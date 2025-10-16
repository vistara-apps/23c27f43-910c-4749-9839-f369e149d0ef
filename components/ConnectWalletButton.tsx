'use client';

import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';

export function ConnectWalletButton() {
  return (
    <Wallet>
      <ConnectWallet className="btn-primary">
        <Avatar className="h-6 w-6" />
        <Name className="ml-2" />
      </ConnectWallet>
    </Wallet>
  );
}
