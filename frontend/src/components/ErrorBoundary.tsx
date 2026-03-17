import { Component, ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UI ERROR BOUNDARY]', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-20 max-w-lg rounded border border-red-200 bg-red-50 p-4 text-red-700">
          Произошла критическая ошибка интерфейса. Пожалуйста, перезагрузите страницу.
        </div>
      );
    }

    return this.props.children;
  }
}
