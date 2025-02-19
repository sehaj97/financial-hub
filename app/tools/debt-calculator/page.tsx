"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DebtChart } from "@/components/debt-chart"

export default function DebtCalculatorPage() {
  const [debts, setDebts] = useState([
    { id: 1, name: "Credit Card", balance: 5000, interestRate: 19.99, minimumPayment: 100 },
    { id: 2, name: "Student Loan", balance: 15000, interestRate: 4.5, minimumPayment: 150 },
    { id: 3, name: "Car Loan", balance: 12000, interestRate: 6.5, minimumPayment: 250 },
  ])
  const [monthlyPayment, setMonthlyPayment] = useState(600)
  const [paymentStrategy, setPaymentStrategy] = useState("avalanche")
  const [payoffResults, setPayoffResults] = useState({})
  const [newDebt, setNewDebt] = useState({ name: "", balance: "", interestRate: "", minimumPayment: "" })
  const [activeTab, setActiveTab] = useState("calculator")

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Add new debt
  const handleAddDebt = () => {
    if (newDebt.name && newDebt.balance && newDebt.interestRate && newDebt.minimumPayment) {
      const newId = debts.length > 0 ? Math.max(...debts.map((debt) => debt.id)) + 1 : 1
      setDebts([
        ...debts,
        {
          id: newId,
          name: newDebt.name,
          balance: Number.parseFloat(newDebt.balance),
          interestRate: Number.parseFloat(newDebt.interestRate),
          minimumPayment: Number.parseFloat(newDebt.minimumPayment),
        },
      ])
      setNewDebt({ name: "", balance: "", interestRate: "", minimumPayment: "" })
    }
  }

  // Remove debt
  const handleRemoveDebt = (id) => {
    setDebts(debts.filter((debt) => debt.id !== id))
  }

  // Calculate debt payoff
  useEffect(() => {
    if (debts.length === 0) {
      setPayoffResults({})
      return
    }

    // Clone debts for calculation
    const debtsCopy = JSON.parse(JSON.stringify(debts))

    // Sort debts based on strategy
    if (paymentStrategy === "avalanche") {
      // Sort by interest rate (highest first)
      debtsCopy.sort((a, b) => b.interestRate - a.interestRate)
    } else if (paymentStrategy === "snowball") {
      // Sort by balance (lowest first)
      debtsCopy.sort((a, b) => a.balance - b.balance)
    }

    const totalMinimumPayment = debtsCopy.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const extraPayment = Math.max(0, monthlyPayment - totalMinimumPayment)

    let months = 0
    let totalInterestPaid = 0
    const payoffSchedule = []
    const debtBalanceHistory = debtsCopy.map((debt) => ({ id: debt.id, name: debt.name, balances: [debt.balance] }))

    // Continue until all debts are paid off
    while (debtsCopy.some((debt) => debt.balance > 0) && months < 600) {
      // 50 years max to prevent infinite loops
      months++
      let monthlyExtraPayment = extraPayment
      const monthRecord = { month: months, debts: [] }

      // Pay minimum on all debts
      for (let i = 0; i < debtsCopy.length; i++) {
        if (debtsCopy[i].balance <= 0) continue

        // Calculate interest for this month
        const monthlyInterestRate = debtsCopy[i].interestRate / 100 / 12
        const interestThisMonth = debtsCopy[i].balance * monthlyInterestRate
        totalInterestPaid += interestThisMonth
        debtsCopy[i].balance += interestThisMonth

        // Apply minimum payment
        const paymentToApply = Math.min(debtsCopy[i].minimumPayment, debtsCopy[i].balance)
        debtsCopy[i].balance -= paymentToApply

        // Record for this month
        monthRecord.debts.push({
          id: debtsCopy[i].id,
          name: debtsCopy[i].name,
          interestPaid: interestThisMonth,
          principalPaid: paymentToApply - interestThisMonth,
          balance: debtsCopy[i].balance,
        })
      }

      // Apply extra payment to highest priority debt
      for (let i = 0; i < debtsCopy.length; i++) {
        if (debtsCopy[i].balance <= 0 || monthlyExtraPayment <= 0) continue

        const extraPaymentToApply = Math.min(monthlyExtraPayment, debtsCopy[i].balance)
        debtsCopy[i].balance -= extraPaymentToApply
        monthlyExtraPayment -= extraPaymentToApply

        // Update the record for this month
        const debtRecord = monthRecord.debts.find((d) => d.id === debtsCopy[i].id)
        if (debtRecord) {
          debtRecord.principalPaid += extraPaymentToApply
          debtRecord.balance = debtsCopy[i].balance
        }

        if (monthlyExtraPayment <= 0) break
      }

      payoffSchedule.push(monthRecord)

      // Update balance history for chart
      for (const debt of debtBalanceHistory) {
        const currentDebt = debtsCopy.find((d) => d.id === debt.id)
        debt.balances.push(currentDebt ? currentDebt.balance : 0)
      }
    }

    // Calculate total debt and time to payoff
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0)
    const totalPayments = months * monthlyPayment

    setPayoffResults({
      months,
      totalInterestPaid,
      totalPayments,
      totalDebt,
      payoffSchedule,
      debtBalanceHistory,
    })
  }, [debts, monthlyPayment, paymentStrategy])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Debt Repayment Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Debts</CardTitle>
                <CardDescription>Enter your debt information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Debt Name</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Min. Payment</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debts.map((debt) => (
                      <TableRow key={debt.id}>
                        <TableCell>{debt.name}</TableCell>
                        <TableCell>{formatCurrency(debt.balance)}</TableCell>
                        <TableCell>{debt.interestRate}%</TableCell>
                        <TableCell>{formatCurrency(debt.minimumPayment)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveDebt(debt.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-5 md:col-span-1">
                    <Label htmlFor="debt-name">Debt Name</Label>
                    <Input
                      id="debt-name"
                      value={newDebt.name}
                      onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                      placeholder="Credit Card"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-1">
                    <Label htmlFor="debt-balance">Balance</Label>
                    <Input
                      id="debt-balance"
                      type="number"
                      value={newDebt.balance}
                      onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-1">
                    <Label htmlFor="debt-interest">Interest Rate (%)</Label>
                    <Input
                      id="debt-interest"
                      type="number"
                      value={newDebt.interestRate}
                      onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
                      placeholder="19.99"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-1">
                    <Label htmlFor="debt-payment">Min. Payment</Label>
                    <Input
                      id="debt-payment"
                      type="number"
                      value={newDebt.minimumPayment}
                      onChange={(e) => setNewDebt({ ...newDebt, minimumPayment: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-1 flex items-end">
                    <Button onClick={handleAddDebt} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Debt
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly-payment">Total Monthly Payment</Label>
                  <Input
                    id="monthly-payment"
                    type="number"
                    min={debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)}
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-strategy">Payment Strategy</Label>
                  <Select value={paymentStrategy} onValueChange={setPaymentStrategy}>
                    <SelectTrigger id="payment-strategy">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avalanche">Debt Avalanche (Highest Interest First)</SelectItem>
                      <SelectItem value="snowball">Debt Snowball (Lowest Balance First)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Debt Summary</CardTitle>
                  <CardDescription>Your debt repayment plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {payoffResults.months ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Debt</p>
                        <p className="text-xl font-bold">{formatCurrency(payoffResults.totalDebt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time to Debt-Free</p>
                        <p className="text-xl font-bold">
                          {Math.floor(payoffResults.months / 12)} years, {payoffResults.months % 12} months
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-xl font-bold">{formatCurrency(payoffResults.totalInterestPaid)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Payments</p>
                        <p className="text-xl font-bold">{formatCurrency(payoffResults.totalPayments)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Interest Savings</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(
                            debts.reduce(
                              (sum, debt) =>
                                sum + debt.balance * (debt.interestRate / 100) * (payoffResults.months / 12),
                              0,
                            ) - payoffResults.totalInterestPaid,
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p>Add your debts to see your repayment plan.</p>
                  )}
                </CardContent>
              </Card>

              {payoffResults.debtBalanceHistory && (
                <Card>
                  <CardHeader>
                    <CardTitle>Debt Payoff Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DebtChart debtBalanceHistory={payoffResults.debtBalanceHistory} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>Month-by-month breakdown of your debt repayment</CardDescription>
            </CardHeader>
            <CardContent>
              {payoffResults.payoffSchedule ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        {debts.map((debt) => (
                          <TableHead key={debt.id}>{debt.name} Balance</TableHead>
                        ))}
                        <TableHead>Total Balance</TableHead>
                        <TableHead>Interest Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoffResults.payoffSchedule
                        .filter((_, index) => index % 3 === 0 || index === payoffResults.payoffSchedule.length - 1)
                        .map((month) => (
                          <TableRow key={month.month}>
                            <TableCell>{month.month}</TableCell>
                            {debts.map((debt) => {
                              const debtInfo = month.debts.find((d) => d.id === debt.id)
                              return (
                                <TableCell key={debt.id}>
                                  {debtInfo ? formatCurrency(debtInfo.balance) : formatCurrency(0)}
                                </TableCell>
                              )
                            })}
                            <TableCell>
                              {formatCurrency(month.debts.reduce((sum, debt) => sum + debt.balance, 0))}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(month.debts.reduce((sum, debt) => sum + debt.interestPaid, 0))}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p>Add your debts to see your payment schedule.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Debt Repayment Guide</CardTitle>
              <CardDescription>Understanding debt repayment strategies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Debt Avalanche vs. Debt Snowball</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Debt Avalanche</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay minimum payments on all debts, then put extra money toward the debt with the highest interest
                      rate.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Pros:</strong> Saves the most money in interest over time.
                    </p>
                    <p className="text-sm">
                      <strong>Cons:</strong> May take longer to pay off your first debt completely.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Debt Snowball</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay minimum payments on all debts, then put extra money toward the debt with the smallest balance.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Pros:</strong> Provides psychological wins as debts are paid off faster.
                    </p>
                    <p className="text-sm">
                      <strong>Cons:</strong> May pay more in interest over the long term.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Canadian Debt Considerations</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Tax Deductibility:</strong> In Canada, interest on loans used for investment purposes may be
                    tax-deductible. Student loan interest may also provide tax credits.
                  </li>
                  <li>
                    <strong>Debt Consolidation:</strong> Consider a line of credit or home equity line of credit (HELOC)
                    to consolidate high-interest debts.
                  </li>
                  <li>
                    <strong>Credit Counselling:</strong> Non-profit credit counselling services are available across
                    Canada to help manage debt.
                  </li>
                  <li>
                    <strong>Consumer Proposals:</strong> A legal process unique to Canada that allows you to settle
                    debts for less than the full amount.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Tips for Faster Debt Repayment</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Increase Your Income:</strong> Consider a side hustle, overtime, or asking for a raise.
                  </li>
                  <li>
                    <strong>Reduce Expenses:</strong> Create a budget and find areas to cut back temporarily.
                  </li>
                  <li>
                    <strong>Windfalls:</strong> Apply tax refunds, bonuses, and gifts toward debt.
                  </li>
                  <li>
                    <strong>Balance Transfers:</strong> Consider 0% balance transfer offers for high-interest credit
                    card debt.
                  </li>
                  <li>
                    <strong>Bi-weekly Payments:</strong> Making payments every two weeks instead of monthly results in
                    an extra payment each year.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">After Becoming Debt-Free</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Build an emergency fund of 3-6 months of expenses.</li>
                  <li>Increase retirement contributions to RRSP or TFSA accounts.</li>
                  <li>Start saving for other financial goals.</li>
                  <li>Consider maintaining your debt payment amount but directing it to savings instead.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

