"use client"

import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from "recharts"

export function RetirementChart({ yearlyData }) {
  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Filter data to show fewer points for clarity
  const filteredData = yearlyData.filter((_, index) => index % 3 === 0 || index === yearlyData.length - 1)

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={filteredData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" label={{ value: "Age", position: "insideBottomRight", offset: -10 }} />
          <YAxis yAxisId="left" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={80} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            width={80}
          />
          <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(value) => `Age ${value}`} />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="savings"
            name="Remaining Savings"
            fill="#3b82f6"
            stroke="#3b82f6"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalIncome"
            name="Annual Income"
            stroke="#10b981"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="desiredIncome"
            name="Desired Income"
            stroke="#ef4444"
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

