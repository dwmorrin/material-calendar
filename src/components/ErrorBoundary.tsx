import React from "react";
import ErrorPage from "./ErrorPage";

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component {
  state: ErrorBoundaryState = { error: null };

  constructor(props: Record<string, unknown>) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  render(): JSX.Element | React.ReactNode {
    if (this.state.error) return <ErrorPage open error={this.state.error} />;
    return this.props.children;
  }
}

export default ErrorBoundary;
