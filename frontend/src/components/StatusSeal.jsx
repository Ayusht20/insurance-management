const SEAL_STYLES = {
  active: "border-sage text-sage",
  paid: "border-sage text-sage",
  approved: "border-sage text-sage",
  pending: "border-amber text-amber",
  expired: "border-amber text-amber",
  cancelled: "border-rust text-rust",
  rejected: "border-rust text-rust",
  overdue: "border-rust text-rust",
};

export default function StatusSeal({ status }) {
  const style = SEAL_STYLES[status] || "border-slate-400 text-slate-500";
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full border-2 text-xs font-semibold uppercase tracking-wide ${style}`}
      style={{ fontFamily: "Public Sans, sans-serif" }}
    >
      {status}
    </span>
  );
}