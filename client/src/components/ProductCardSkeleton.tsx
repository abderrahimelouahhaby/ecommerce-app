import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";

function ProductCardSkeleton() {
  return (
    <Card>
      <div className="aspect-square bg-muted">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCardSkeleton;
