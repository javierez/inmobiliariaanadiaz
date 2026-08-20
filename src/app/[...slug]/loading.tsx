import { PropertyCardSkeleton } from "~/components/property-card-skeleton";
import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <nav className="py-4" aria-label="Breadcrumb">
          <div className="flex items-center text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mx-2 h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </nav>

        {/* Search Bar Skeleton */}
        <div className="mb-8 mt-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Title and Count Skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>

        {/* Sort Button Skeleton */}
        <div className="mt-8">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </main>
  );
}
