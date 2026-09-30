import React, { Component, ErrorInfo, ReactNode } from 'react';
import InlineErrorCard from './InlineErrorCard';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

export class TelemetryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('TelemetryErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ isRetrying: true });
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      });
    }, 400);
  };

  render() {
    if (this.state.hasError) {
      return (
        <InlineErrorCard
          title={this.props.fallbackTitle || `RENDER ERROR IN ${this.props.moduleName || 'TELEMETRY PANEL'}`}
          errorCode="ERR_COMPONENT_PANEL_FAULT"
          errorMessage={
            this.state.error?.message ||
            'An unexpected error occurred while parsing telemetry packets or rendering real-time curves.'
          }
          technicalDetails={`Stack: ${this.state.error?.stack?.slice(0, 180) || 'Component render trace captured by SCADA error boundary.'}`}
          onRetry={this.handleRetry}
          isRetrying={this.state.isRetrying}
          className="my-2"
        />
      );
    }

    return this.props.children;
  }
}

export default TelemetryErrorBoundary;
