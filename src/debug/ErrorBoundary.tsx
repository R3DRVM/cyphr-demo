// src/debug/ErrorBoundary.tsx
import React from 'react';

type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    (window as any).__LAST_ERROR__ = error;
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    (window as any).__LAST_ERROR_INFO__ = info;
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: 'monospace', color: '#fff', background: '#111' }}>
          <h3>Something went wrong.</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {String(this.state.error?.stack || this.state.error || 'Unknown error')}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

