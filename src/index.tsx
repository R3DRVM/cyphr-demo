// Polyfill Node globals for Solana libs
import { Buffer } from 'buffer';
import process from 'process';

if (!(window as any).Buffer) (window as any).Buffer = Buffer as any;
if (!(window as any).process) (window as any).process = process as any;

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './debug/ErrorBoundary';

// Early boot diagnostics
console.info('[BOOT] env', (import.meta as any).env);
console.info('[BOOT] root exists?', !!document.getElementById('root'));
console.info('[BOOT] tokens.devnet.json importable?', 'checking with dynamic import...');

window.addEventListener('error', (e) => { (window as any).__LAST_WINDOW_ERROR__ = e?.error || e?.message; });
window.addEventListener('unhandledrejection', (e) => { (window as any).__LAST_PROMISE_REJECTION__ = e?.reason; });

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
