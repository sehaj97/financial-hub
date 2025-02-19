"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function DebtChart({ debtBalanceHistory }) {
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
  const chartData = []
  const maxMonths = debtBalanceHistory[0]?.balances.length || 0

  for (let month = 0; month < maxMonths; month++) {
    if (month % 3 === 0 || month === maxMonths - 1) {
      // Show every 3 months for clarity
      const dataPoint = { month }

      // Add balance for each debt
      for (const debt of debtBalanceHistory) {
        dataPoint[debt.name] = debt.balances[month]
      }

      // Add total balance
      dataPoint.Total = debtBalanceHistory.reduce((sum, debt) => sum + debt.balances[month], 0)

      chartData.push(dataPoint)
    }
  }

  // Generate colors for each debt
  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: -10 }} />
          <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} width={80} />
          <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(value) => `Month ${value}`} />
          <Legend />

          {debtBalanceHistory.map((debt, index) => (
            <Line
              key={debt.id}
              type="monotone"
              dataKey={debt.name}
              stroke={colors[index % colors.length]}
              activeDot={{ r: 8 }}
            />
          ))}

          <Line type="monotone" dataKey="Total" stroke="#6b7280" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

