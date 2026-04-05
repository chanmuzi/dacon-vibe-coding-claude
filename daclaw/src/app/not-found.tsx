import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileQuestion size={64} className="text-text-secondary mb-6" />
        <h1 className="text-6xl font-bold font-mono text-primary mb-4">404</h1>
        <p className="text-xl font-semibold text-text-primary mb-2">
          페이지를 찾을 수 없습니다
        </p>
        <p className="text-sm text-text-secondary mb-8 max-w-md">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-text-on-primary font-medium hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <Home size={18} />
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}
