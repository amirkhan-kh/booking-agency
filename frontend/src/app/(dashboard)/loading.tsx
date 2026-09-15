import { StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <StatCardsSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <TableSkeleton rows={4} cols={2} />
        <TableSkeleton rows={4} cols={2} />
      </div>
    </div>
  );
}
