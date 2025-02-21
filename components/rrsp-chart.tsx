"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function RRSPChart({ yearlyData }) {
  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium">Age {label}</p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-primary mr-2 rounded-full"></span>
            RRSP Balance: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-muted-foreground mr-2 rounded-full"></span>
            Contributions: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-full"></span>
            Investment Growth: {formatCurrency(payload[0].value - payload[1].value)}
          </p>
        </div>
      )
    }
    return null
  }

  // Filter data to show fewer points for clarity
  const filteredData = yearlyData
    .filter((_, index) => index % 5 === 0 || index === yearlyData.length - 1)
    .map((item) => ({
      age: item.age,
      balance: item.balance,
      contributions: item.contributions,
    }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={filteredData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" label={{ value: "Age", position: "insideBottomRight", offset: -10 }} />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area type="monotone" dataKey="balance" name="RRSP Balance" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
          <Area
            type="monotone"
            dataKey="contributions"
            name="Contributions"
            stackId="2"
            stroke="#6b7280"
            fill="#6b7280"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

