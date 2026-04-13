import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("animate-pulse rounded-md bg-slate-800", className)} />
);

export const TableSkeleton = ({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
    <div className="flex gap-4 pb-3 border-b border-slate-800">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", i === 0 ? "flex-[2]" : "flex-1")} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="flex gap-4 items-center py-1.5">
        {Array.from({ length: cols }).map((_, colIdx) => (
          <Skeleton
            key={colIdx}
            className={cn("h-5", colIdx === 0 ? "flex-[2]" : "flex-1")}
          />
        ))}
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <div
    className={cn(
      "grid gap-4",
      count === 4 && "md:grid-cols-2 lg:grid-cols-4",
      count === 3 && "md:grid-cols-3",
      count === 2 && "md:grid-cols-2",
    )}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-2 w-24" />
      </div>
    ))}
  </div>
);

export const PageSkeleton = ({
  stats = 4,
  tableRows = 6,
  tableCols = 5,
  showButton = true,
}: {
  stats?: number;
  tableRows?: number;
  tableCols?: number;
  showButton?: boolean;
}) => (
  <div className="space-y-6">
    {showButton && (
      <div className="flex justify-end">
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
    )}
    <StatCardSkeleton count={stats} />
    <TableSkeleton rows={tableRows} cols={tableCols} />
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-7 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
      ))}
    </div>
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  </div>
);
