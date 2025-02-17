"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function MortgageChart({ principal, interest }) {
  const data = [
    { name: "Principal", value: principal },
    { name: "Interest", value: interest },
  ]

  const COLORS = ["#3b82f6", "#ef4444"]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("en-CA", {
                style: "currency",
                currency: "CAD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value)
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

