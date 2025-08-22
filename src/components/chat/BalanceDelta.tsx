import React from 'react';

interface BalanceDeltaProps {
  pre: number;
  post: number;
}

export default function BalanceDelta({ pre, post }: BalanceDeltaProps) {
  const delta = +(post - pre).toFixed(4);
  const sign = delta >= 0 ? '+' : '';
  
  return (
    <span className="font-mono text-xs opacity-80 text-green-400">
      wallet: {pre.toFixed(4)} → {post.toFixed(4)} SOL ({sign}{delta.toFixed(4)})
    </span>
  );
}
