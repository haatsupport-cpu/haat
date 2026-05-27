export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/60",
    secondary: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-400/30",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400/30",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/50",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
