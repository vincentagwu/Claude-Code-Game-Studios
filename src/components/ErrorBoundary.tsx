"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-foreground/50 max-w-md text-center">
            An unexpected error occurred. Your saved progress should be safe.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-foreground px-6 py-2 text-sm text-background hover:bg-foreground/80"
            >
              Reload
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
              className="rounded-full border border-foreground/20 px-6 py-2 text-sm hover:bg-foreground/5"
            >
              Back to Title
            </button>
          </div>
          {this.state.error && (
            <pre className="mt-4 text-xs text-foreground/30 max-w-md overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </main>
      );
    }

    return this.props.children;
  }
}
