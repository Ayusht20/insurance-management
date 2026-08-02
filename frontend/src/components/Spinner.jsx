export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-4 border-ink/20 border-t-brass rounded-full animate-spin" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}