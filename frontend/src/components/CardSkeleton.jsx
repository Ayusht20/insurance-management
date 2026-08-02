export default function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-lg shadow animate-pulse">
          <div className="h-4 bg-ink/10 rounded w-2/3 mb-3" />
          <div className="h-3 bg-ink/10 rounded w-full mb-2" />
          <div className="h-3 bg-ink/10 rounded w-5/6 mb-4" />
          <div className="h-8 bg-ink/10 rounded w-full" />
        </div>
      ))}
    </div>
  );
}