'use client';

// Base skeleton block
function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-border/50 animate-pulse rounded ${className}`} />;
}

// SkeletonCard - for hackathon cards, team cards
export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <SkeletonBlock className="h-40 rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-1/2" />
        <div className="flex gap-3 pt-1">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

// SkeletonList - for community posts, rankings
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
          <SkeletonBlock className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
          <SkeletonBlock className="h-6 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// SkeletonDetail - for hackathon detail, post detail
export function SkeletonDetail() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <SkeletonBlock className="h-64 rounded-xl" />
      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-9 w-20 rounded-lg" />
        ))}
      </div>
      {/* Content */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <SkeletonBlock className="h-6 w-1/2" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>
    </div>
  );
}

// SkeletonDashboard - for dashboard page
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-4">
        <SkeletonBlock className="w-16 h-16 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-4 w-60" />
        </div>
      </div>
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-8 w-24" />
          </div>
        ))}
      </div>
      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-6 space-y-3">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// SkeletonFilterBar - for filter bars at top of pages
export function SkeletonFilterBar() {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <SkeletonBlock className="h-10 w-40 rounded-lg" />
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-10 w-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default SkeletonBlock;
