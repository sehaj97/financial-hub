"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function RESPChart({ childResults }) {
  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Generate colors for each child
  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Prepare data for chart
  const chartData = []
  const maxYears = Math.max(...childResults.map((child) => child.yearlyData.length))

  for (let year = 1; year <= maxYears; year++) {
    const dataPoint = { year }

    childResults.forEach((child) => {
      const yearData = child.yearlyData.find((y) => y.year === year)
      if (yearData) {
        dataPoint[child.name] = yearData.balance
      }
    })

    chartData.push(dataPoint)
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" label={{ value: "Years", position: "insideBottomRight", offset: -10 }} />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {childResults.map((child, index) => (
            <Line
              key={child.id}
              type="monotone"
              dataKey={child.name}
              stroke={COLORS[index % COLORS.length]}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

