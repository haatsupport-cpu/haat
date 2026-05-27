export default function Input({
  label,
  id,
  error,
  className = "",
  ...props
}) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`} htmlFor={id}>
      {label && <span className="block mb-2">{label}</span>}
      <input
        id={id}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
        {...props}
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </label>
  );
}
