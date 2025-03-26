"use client"

import type React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface RetirementChartProps {
  yearlyData: {
    age: number
    savings: number
    withdrawal: number
    cpp: number
    oas: number
    totalIncome: number
    desiredIncome: number
  }[]
}

export const RetirementChart: React.FC<RetirementChartProps> = ({ yearlyData }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={yearlyData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="age" label={{ value: "Age", position: "bottom" }} />
        <YAxis
          label={{ value: "Savings ($)", angle: -90, position: "left" }}
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-CA", {
              style: "currency",
              currency: "CAD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          }
        />
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
        <Line type="monotone" dataKey="savings" stroke="#8884d8" name="Remaining Savings" activeDot={{ r: 8 }} />
        {/* You can add more lines for withdrawal, cpp, oas, etc., if needed */}
      </LineChart>
    </ResponsiveContainer>
  )
}

