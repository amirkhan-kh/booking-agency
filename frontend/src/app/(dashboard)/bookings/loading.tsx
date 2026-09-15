import { StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <StatCardsSkeleton />
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
