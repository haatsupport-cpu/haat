const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-sky-100 text-sky-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  customer: "bg-slate-100 text-slate-700",
  admin: "bg-slate-900 text-white",
  vendor: "bg-cyan-100 text-cyan-800",
  default: "bg-slate-100 text-slate-700",
};

export default function Badge({ label, variant = "default", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[variant] || STATUS_STYLES.default} ${className}`}>
      {label}
    </span>
  );
}
