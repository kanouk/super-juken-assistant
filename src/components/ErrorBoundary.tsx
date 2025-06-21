
import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
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

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-orange-800">
              {this.props.name ? `${this.props.name}の読み込みに失敗しました` : '機能の読み込みに失敗しました'}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              ページを再読み込みしてください
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
