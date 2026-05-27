export default function StatCard({ label, value, icon, subtext }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">{value}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 transition group-hover:bg-emerald-100">
          {icon}
        </div>
      </div>
      {subtext && <p className="mt-4 text-sm text-slate-500">{subtext}</p>}
    </div>
  );
}
