import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h1 className="text-lg font-bold mb-2">Something went wrong</h1>
            <p className="mb-4">{this.state.error?.message}</p>
            {this.state.errorInfo && (
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">Error Stack</summary>
                <pre className="mt-2 bg-red-200 p-2 rounded text-xs overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
