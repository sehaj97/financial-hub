"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SavingsChart } from "@/components/savings-chart"

export default function SavingsCalculatorPage() {
  const [initialDeposit, setInitialDeposit] = useState(1000)
  const [monthlyContribution, setMonthlyContribution] = useState(200)
  const [interestRate, setInterestRate] = useState(5)
  const [years, setYears] = useState(10)
  const [compoundingFrequency, setCompoundingFrequency] = useState("annually")
  const [accountType, setAccountType] = useState("tfsa")
  const [taxRate, setTaxRate] = useState(30)
  const [inflationRate, setInflationRate] = useState(2)
  const [futureValue, setFutureValue] = useState(0)
  const [totalContributions, setTotalContributions] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [afterTaxValue, setAfterTaxValue] = useState(0)
  const [inflationAdjustedValue, setInflationAdjustedValue] = useState(0)
  const [yearlyData, setYearlyData] = useState([])

  // Calculate savings growth
  useEffect(() => {
    let compoundPerYear = 1
    switch (compoundingFrequency) {
      case "monthly":
        compoundPerYear = 12
        break
      case "quarterly":
        compoundPerYear = 4
        break
      case "semiannually":
        compoundPerYear = 2
        break
      case "annually":
      default:
        compoundPerYear = 1
        break
    }

    const monthlyRate = interestRate / 100 / 12
    const totalMonths = years * 12
    let balance = initialDeposit
    let contributions = initialDeposit
    const yearlyResults = []

    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly contribution
      balance += monthlyContribution
      contributions += monthlyContribution

      // Apply interest (only on compound months)
      if (month % (12 / compoundPerYear) === 0) {
        const interestEarned = balance * (interestRate / 100 / compoundPerYear)
        balance += interestEarned
      }

      // Record yearly data
      if (month % 12 === 0) {
        const year = month / 12
        const interest = balance - contributions
        yearlyResults.push({
          year,
          balance,
          contributions,
          interest,
        })
      }
    }

    setFutureValue(balance)
    setTotalContributions(contributions)
    setTotalInterest(balance - contributions)
    setYearlyData(yearlyResults)

    // Calculate after-tax value
    if (accountType === "tfsa") {
      // TFSA growth is tax-free
      setAfterTaxValue(balance)
    } else if (accountType === "rrsp") {
      // RRSP is taxed on withdrawal (simplified)
      setAfterTaxValue(balance * (1 - taxRate / 100))
    } else {
      // Non-registered accounts are taxed on interest/gains
      const taxableAmount = balance - contributions
      const taxOnGrowth = taxableAmount * (taxRate / 100)
      setAfterTaxValue(balance - taxOnGrowth)
    }

    // Calculate inflation-adjusted value
    const inflationFactor = Math.pow(1 + inflationRate / 100, years)
    setInflationAdjustedValue(balance / inflationFactor)
  }, [
    initialDeposit,
    monthlyContribution,
    interestRate,
    years,
    compoundingFrequency,
    accountType,
    taxRate,
    inflationRate,
  ])

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Savings Calculator</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Savings Details</CardTitle>
            <CardDescription>Enter your savings information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="initial-deposit">Initial Deposit</Label>
                <div className="font-medium">{formatCurrency(initialDeposit)}</div>
              </div>
              <Input
                id="initial-deposit"
                type="number"
                min="0"
                max="1000000"
                step="100"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(Number(e.target.value))}
              />
              <Slider
                value={[initialDeposit]}
                min={0}
                max={50000}
                step={100}
                onValueChange={(value) => setInitialDeposit(value[0])}
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="monthly-contribution">Monthly Contribution</Label>
                <div className="font-medium">{formatCurrency(monthlyContribution)}</div>
              </div>
              <Input
                id="monthly-contribution"
                type="number"
                min="0"
                max="10000"
                step="10"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              />
              <Slider
                value={[monthlyContribution]}
                min={0}
                max={2000}
                step={10}
                onValueChange={(value) => setMonthlyContribution(value[0])}
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Label htmlFor="interest-rate" className="mr-1">
                    Interest Rate (%)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          The annual interest rate your savings will earn. For reference, Canadian high-interest savings
                          accounts typically offer 3-5%, while long-term investment portfolios may average 6-8%.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="font-medium">{interestRate.toFixed(2)}%</div>
              </div>
              <Input
                id="interest-rate"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
              <Slider
                value={[interestRate]}
                min={0}
                max={10}
                step={0.1}
                onValueChange={(value) => setInterestRate(value[0])}
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="years">Time Period (years)</Label>
                <div className="font-medium">{years} years</div>
              </div>
              <Input
                id="years"
                type="number"
                min="1"
                max="50"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
              />
              <Slider
                value={[years]}
                min={1}
                max={40}
                step={1}
                onValueChange={(value) => setYears(value[0])}
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compounding-frequency">Compounding Frequency</Label>
              <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                <SelectTrigger id="compounding-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="semiannually">Semi-annually</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="account-type" className="mr-1">
                  Account Type
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        TFSA: Tax-Free Savings Account - growth is tax-free. RRSP: Registered Retirement Savings Plan -
                        tax-deferred until withdrawal. Non-registered: Interest and capital gains are taxable annually.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger id="account-type">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tfsa">TFSA</SelectItem>
                  <SelectItem value="rrsp">RRSP</SelectItem>
                  <SelectItem value="non-registered">Non-registered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {accountType !== "tfsa" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tax-rate">Marginal Tax Rate (%)</Label>
                  <div className="font-medium">{taxRate}%</div>
                </div>
                <Input
                  id="tax-rate"
                  type="number"
                  min="0"
                  max="60"
                  step="1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
                <Slider
                  value={[taxRate]}
                  min={0}
                  max={60}
                  step={1}
                  onValueChange={(value) => setTaxRate(value[0])}
                  className="py-4"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="inflation-rate">Inflation Rate (%)</Label>
                <div className="font-medium">{inflationRate}%</div>
              </div>
              <Input
                id="inflation-rate"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
              />
              <Slider
                value={[inflationRate]}
                min={0}
                max={5}
                step={0.1}
                onValueChange={(value) => setInflationRate(value[0])}
                className="py-4"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Savings Summary</CardTitle>
              <CardDescription>Your projected savings growth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Future Value</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(futureValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Contributions</p>
                  <p className="text-xl font-bold">{formatCurrency(totalContributions)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest Earned</p>
                  <p className="text-xl font-bold">{formatCurrency(totalInterest)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">After-Tax Value</p>
                  <p className="text-xl font-bold">{formatCurrency(afterTaxValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inflation-Adjusted Value</p>
                  <p className="text-xl font-bold">{formatCurrency(inflationAdjustedValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Income (4% Rule)</p>
                  <p className="text-xl font-bold">{formatCurrency((futureValue * 0.04) / 12)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Savings Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsChart yearlyData={yearlyData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canadian Savings Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">TFSA Contribution Limits</h3>
                <p className="text-sm text-muted-foreground">
                  The 2025 TFSA contribution limit is $7,000. Unused contribution room accumulates from the year you
                  turned 18 or 2009, whichever is later.
                </p>
              </div>
              <div>
                <h3 className="font-medium">RRSP Contribution Limits</h3>
                <p className="text-sm text-muted-foreground">
                  For 2025, you can contribute up to 18% of your previous year's earned income to a maximum of $31,560,
                  plus any unused contribution room from previous years.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Power of Compound Interest</h3>
                <p className="text-sm text-muted-foreground">
                  Starting early makes a huge difference. Even small regular contributions can grow significantly over
                  time due to compound interest.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

