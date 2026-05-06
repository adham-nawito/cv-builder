import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  panelName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PanelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.panelName}] panel error:`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 gap-3 text-center h-full min-h-[120px]">
          <p className="text-sm font-medium text-destructive">{this.props.panelName} failed to load</p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            {this.state.error?.message ?? 'Unexpected error'}
          </p>
          <button
            className="text-xs px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
