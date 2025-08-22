import React from 'react';

export function shortSig(sig: string): string {
  return `${sig.slice(0, 3)}…${sig.slice(-3)}`;
}

interface TxInlineProps {
  sig: string;
  href: string;
  status: 'pending' | 'completed' | 'failed';
}

export default function TxInline({ sig, href, status }: TxInlineProps) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs opacity-80">
      <span>{shortSig(sig)}</span>
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="underline opacity-90 hover:opacity-100 text-blue-400"
      >
        (View)
      </a>
      <span>· Status: {status}</span>
    </span>
  );
}
