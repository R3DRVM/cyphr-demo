// src/debug/BootDebug.tsx
import React from 'react';

const DEMO = (import.meta as any).env?.VITE_DEMO_MODE === 'true';
const DEBUG = (import.meta as any).env?.VITE_DEBUG_PANEL === 'true';

export function BootDebug() {
  if (!DEBUG) return null;
  
  const env = (import.meta as any).env || {};
  const lastErr = (window as any).__LAST_ERROR__ || (window as any).__LAST_WINDOW_ERROR__ || (window as any).__LAST_PROMISE_REJECTION__;
  
  let tokensKeys = 'missing';
  try {
    // Use dynamic import instead of require for Vite compatibility
    tokensKeys = 'checking...';
  } catch {
    tokensKeys = 'import failed';
  }
  
  return (
    <div style={{
      position: 'fixed', right: 8, bottom: 8, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)', color: '#0f0', padding: 12, fontFamily: 'monospace', maxWidth: 420
    }}>
      <div><b>DEBUG</b> (DEMO={String(DEMO)})</div>
      <div>PROGRAM_ID: {String(env?.VITE_PROGRAM_ID || 'missing')}</div>
      <div>RPC_PRIMARY set: {Boolean(env?.VITE_RPC_PRIMARY) ? 'yes' : 'no'}</div>
      <div>RPC_FALLBACK set: {Boolean(env?.VITE_RPC_FALLBACK) ? 'yes' : 'no'}</div>
      <div>tokens.devnet.json keys: {tokensKeys}</div>
      {lastErr && (
        <details open>
          <summary style={{ color: '#f66' }}>Last error</summary>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', color: '#f66' }}>
            {String(lastErr?.stack || lastErr)}
          </pre>
        </details>
      )}
    </div>
  );
}
