"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { DashboardRevenueTrendPoint } from "@/features/dashboard/queries/get-sales-dashboard-data"

const compactCurrencyFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
})

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

function formatTickValue(value: number) {
  if (!value) return "0"
  return compactCurrencyFormatter.format(value).replace(" ", "")
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function RevenueTrendBarChart({ points }: { points: DashboardRevenueTrendPoint[] }) {
  return (
    <div className="h-[20rem] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          barGap={4}
          barCategoryGap="16%"
        >
          <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatTickValue}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent) / 0.22)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}
            formatter={(value) => [formatCurrency(Number(value ?? 0)), "Doanh thu thuần"]}
          />
          <Bar
            dataKey="netRevenue"
            radius={[8, 8, 0, 0]}
            fill="hsl(var(--primary))"
            animationDuration={550}
            animationEasing="ease-out"
            minPointSize={4}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
