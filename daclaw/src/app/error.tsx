'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => console.error(error), [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle size={64} className="text-error mb-6" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          문제가 발생했습니다
        </h1>
        <p className="text-sm text-text-secondary mb-8 max-w-md">
          페이지를 불러오는 중 오류가 발생했습니다. 다시 시도하거나 홈으로 돌아가 주세요.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-text-on-primary font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
          >
            <RefreshCw size={18} />
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-primary font-medium hover:bg-primary-light hover:border-primary-light transition-all duration-200 active:scale-[0.98]"
          >
            <Home size={18} />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
