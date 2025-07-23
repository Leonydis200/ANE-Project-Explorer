import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // You can log the error or error info here
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
