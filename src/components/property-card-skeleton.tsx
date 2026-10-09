import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Skeleton className="h-full w-full" />
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>

        <Skeleton className="mb-3 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-full" />

        <div className="flex justify-between">
          <Skeleton className="h-4 w-[30%]" />
          <Skeleton className="h-4 w-[30%]" />
          <Skeleton className="h-4 w-[30%]" />
        </div>

        <div className="mt-3">
          <Skeleton className="h-3 w-1/4" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-4 w-full" />
      </CardFooter>
    </Card>
  );
}
