import { Skeleton } from "../ui/skeleton";

export default function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col animate-pulse">
      <Skeleton className="w-full aspect-[16/9]" />
      <div className="p-4 flex-1 flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-10 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
} 