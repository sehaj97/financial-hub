"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function AmortizationTable({ principal, interestRate, amortizationPeriod, paymentFrequency }) {
  const [amortizationData, setAmortizationData] = useState([])
  const [chartData, setChartData] = useState([])
  const [displayMode, setDisplayMode] = useState("yearly")

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  useEffect(() => {
    // Calculate payment frequency
    let paymentsPerYear = 12
    switch (paymentFrequency) {
      case "weekly":
        paymentsPerYear = 52
        break
      case "biweekly":
        paymentsPerYear = 26
        break
      case "monthly":
      default:
        paymentsPerYear = 12
        break
    }

    const totalPayments = amortizationPeriod * paymentsPerYear
    const periodicInterestRate = interestRate / 100 / paymentsPerYear

    // Calculate payment amount
    const paymentAmount =
      (principal * (periodicInterestRate * Math.pow(1 + periodicInterestRate, totalPayments))) /
      (Math.pow(1 + periodicInterestRate, totalPayments) - 1)

    let balance = principal
    const yearlyData = []
    const monthlyData = []
    let totalInterestPaid = 0

    for (let payment = 1; payment <= totalPayments; payment++) {
      const interestPayment = balance * periodicInterestRate
      const principalPayment = paymentAmount - interestPayment

      totalInterestPaid += interestPayment
      balance -= principalPayment

      // Ensure balance doesn't go below zero due to rounding
      if (balance < 0) balance = 0

      // Record monthly data
      if (payment % (paymentsPerYear / 12) === 0) {
        const month = payment / (paymentsPerYear / 12)
        const year = Math.ceil(month / 12)
        const monthOfYear = ((month - 1) % 12) + 1

        monthlyData.push({
          payment,
          month,
          year,
          monthOfYear,
          principalPayment,
          interestPayment,
          totalPayment: principalPayment + interestPayment,
          remainingBalance: balance,
          totalInterestPaid,
        })
      }

      // Record yearly data
      if (payment % paymentsPerYear === 0) {
        const year = payment / paymentsPerYear

        yearlyData.push({
          payment,
          year,
          principalPayment: principal - balance,
          interestPayment: totalInterestPaid,
          remainingBalance: balance,
          totalPaid: principal - balance + totalInterestPaid,
        })
      }
    }

    setAmortizationData(yearlyData)

    // Prepare chart data
    const chartDataPoints = yearlyData.map((item) => ({
      year: item.year,
      principal: principal - item.remainingBalance,
      interest: item.interestPayment,
      balance: item.remainingBalance,
    }))

    setChartData(chartDataPoints)
  }, [principal, interestRate, amortizationPeriod, paymentFrequency])

  return (
    <div className="space-y-6">
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
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(value) => `Year ${value}`} />
            <Legend />
            <Line type="monotone" dataKey="principal" name="Principal Paid" stroke="#3b82f6" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="interest" name="Interest Paid" stroke="#ef4444" />
            <Line type="monotone" dataKey="balance" name="Remaining Balance" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>Principal Paid</TableHead>
            <TableHead>Interest Paid</TableHead>
            <TableHead>Total Paid</TableHead>
            <TableHead>Remaining Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {amortizationData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.year}</TableCell>
              <TableCell>{formatCurrency(principal - row.remainingBalance)}</TableCell>
              <TableCell>{formatCurrency(row.interestPayment)}</TableCell>
              <TableCell>{formatCurrency(principal - row.remainingBalance + row.interestPayment)}</TableCell>
              <TableCell>{formatCurrency(row.remainingBalance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

