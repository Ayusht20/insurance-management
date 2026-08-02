export default function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-3 border-b">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-3 bg-ink/10 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}