import { Component, type ReactNode, type ErrorInfo } from 'react'

type Props = { name: string; children: ReactNode }
type State = { error: Error | null }

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name} panel error]`, error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
          <p className="font-medium text-destructive">Panel crashed</p>
          <p>{this.state.error.message}</p>
          <button
            className="mt-2 text-xs underline"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
