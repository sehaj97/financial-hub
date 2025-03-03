"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function CPPChart({ benefitsByCollectionAge, selectedAge }) {
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
            Monthly Benefit: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-full"></span>
            Annual Benefit: {formatCurrency(payload[1].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={benefitsByCollectionAge}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" />
          <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `$${(value).toFixed(0)}`} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="monthlyBenefit"
            name="Monthly Benefit"
            fill={selectedAge === 65 ? "#3b82f6" : "#6b7280"}
            fillOpacity={0.8}
          />
          <Bar
            yAxisId="right"
            dataKey="annualBenefit"
            name="Annual Benefit"
            fill={selectedAge === 65 ? "#10b981" : "#d1d5db"}
            fillOpacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

