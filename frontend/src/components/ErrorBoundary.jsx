import React from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    console.error('ErrorBoundary:', err, info);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950 px-4 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-200 max-w-md">
            Bir hata oluştu (kaydetme veya yükleme sırasında boş ekran genelde bundandır).
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sayfayı yenile
          </button>
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            Panele dön
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
