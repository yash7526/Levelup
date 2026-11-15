import { Skeleton } from "@/components/ui/skeleton";

const spans = [
  "md:col-span-2 lg:col-span-5",
  "md:col-span-2 lg:col-span-7",
  "md:col-span-2 lg:col-span-7",
  "md:col-span-2 lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "md:col-span-2 lg:col-span-4",
];

export default function DashboardLoading() {
  return (
    <div className="grid gap-6 lg:gap-8" role="status" aria-label="Loading dashboard">
      <div className="grid gap-3">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
        {spans.map((span, index) => (
          <Skeleton key={index} className={`h-72 rounded-2xl ${span}`} />
        ))}
      </div>
    </div>
  );
}
