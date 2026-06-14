/**
 * Loading skeletons — shimmer placeholders used while data loads.
 * Pure CSS (see .skeleton in globals.css); no layout shift on load.
 */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/** A leaderboard-row-shaped skeleton (rank + avatar + name + number). */
export function LeaderboardRowSkeleton() {
  return (
    <div className="rounded-xl border border-muted/20 glass-effect p-4 flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-12" />
    </div>
  );
}

/** A friend-list-row skeleton. */
export function FriendRowSkeleton() {
  return (
    <div className="rounded-xl border border-muted/20 glass-effect p-4 flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-9 w-9 rounded-lg" />
    </div>
  );
}

/** Chat message bubbles skeleton. */
export function MessagesSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-10 w-3/5 rounded-2xl" />
      <Skeleton className="h-10 w-2/5 rounded-2xl ml-auto" />
      <Skeleton className="h-10 w-1/2 rounded-2xl" />
    </div>
  );
}
