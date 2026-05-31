function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <section className="grid gap-4">
      <SkeletonBlock className="h-24" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-36" />
        <SkeletonBlock className="h-36" />
        <SkeletonBlock className="h-36" />
        <SkeletonBlock className="h-36" />
      </div>
      <SkeletonBlock className="h-80" />
    </section>
  );
}
