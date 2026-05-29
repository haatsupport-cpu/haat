import { motion as Motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function AnalyticsCharts({ chartData = [] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">No analytics trend data is available yet.</p>
        <p className="mt-3 text-slate-600">Recent order and sales history will appear here as new activity arrives.</p>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-w-0 bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Performance</p>
          <h2 className="text-2xl font-semibold text-slate-900">Revenue trend</h2>
        </div>
      </div>

      <div className="h-[320px] min-w-[1px] w-full">
        {ready && (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 8, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 20, border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend verticalAlign="top" height={40} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" fillOpacity={1} fill="url(#revenueGradient)" strokeWidth={3} />
            <Area type="monotone" dataKey="orders" name="Orders" stroke="#0284c7" fillOpacity={1} fill="url(#ordersGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </Motion.div>
  );
}
