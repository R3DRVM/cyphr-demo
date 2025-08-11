// src/hooks/useBorrow.ts
import { useMemo, useState } from 'react';
import { BorrowAdapter } from '../adapters/borrow/types';
import { solanaBorrowAdapter } from '../adapters/borrow/solanaAnchor';
import { rootsBorrowAdapter } from '../adapters/borrow/roots';

export function useBorrow() {
  const [provider, setProvider] = useState<'solana' | 'roots'>('solana');

  const adapter: BorrowAdapter = useMemo(() => {
    return provider === 'roots' ? rootsBorrowAdapter : solanaBorrowAdapter;
  }, [provider]);

  return { provider, setProvider, adapter };
}
