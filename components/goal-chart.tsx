"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function GoalChart({ goals }) {
  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Prepare chart data
  // We need to transform the data to have a consistent x-axis (months)
  const maxMonths = Math.max(...goals.map((goal) => goal.months))
  const chartData = []

  // Create data points for every 3 months
  for (let month = 0; month <= maxMonths; month += 3) {
    const dataPoint = { month }

    goals.forEach((goal) => {
      // Find the closest data point in the goal's projected data
      const closestDataPoint =
        goal.projectedData.find((d) => d.month === month) ||
        goal.projectedData.find((d) => d.month > month) ||
        goal.projectedData[goal.projectedData.length - 1]

      if (closestDataPoint) {
        dataPoint[goal.name] = closestDataPoint.balance
      } else if (month === 0) {
        dataPoint[goal.name] = goal.currentAmount
      }
    })

    chartData.push(dataPoint)
  }

  // Generate colors for each goal
  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const months = label
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12

      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium">
            {years > 0 ? `${years} year${years !== 1 ? "s" : ""}` : ""}
            {remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}` : ""}
          </p>
          <div className="mt-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                <span className="mr-2">{entry.name}:</span>
                <span className="font-medium">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            label={{
              value: "Months",
              position: "insideBottomRight",
              offset: -10,
            }}
            tickFormatter={(value) => {
              const years = Math.floor(value / 12)
              const months = value % 12
              return years > 0 ? `${years}y${months > 0 ? ` ${months}m` : ""}` : `${months}m`
            }}
          />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {goals.map((goal, index) => (
            <Line
              key={goal.id}
              type="monotone"
              dataKey={goal.name}
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

