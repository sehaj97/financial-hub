"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, HelpCircle, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MortgageChart } from "@/components/mortgage-chart"
import { AmortizationTable } from "@/components/amortization-table"

export default function MortgageCalculatorPage() {
  const [propertyValue, setPropertyValue] = useState(500000)
  const [downPayment, setDownPayment] = useState(100000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(5.0)
  const [amortizationPeriod, setAmortizationPeriod] = useState(25)
  const [paymentFrequency, setPaymentFrequency] = useState("monthly")
  const [mortgageInsurance, setMortgageInsurance] = useState(0)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [activeTab, setActiveTab] = useState("calculator")

  // Calculate mortgage insurance (CMHC)
  const calculateMortgageInsurance = (propertyValue, downPaymentPercent) => {
    if (downPaymentPercent >= 20) {
      return 0
    } else if (downPaymentPercent >= 15) {
      return (propertyValue - downPayment) * 0.028
    } else if (downPaymentPercent >= 10) {
      return (propertyValue - downPayment) * 0.031
    } else if (downPaymentPercent >= 5) {
      return (propertyValue - downPayment) * 0.04
    }
    return 0
  }

  // Handle down payment changes
  const handleDownPaymentChange = (value) => {
    const newDownPayment = Math.min(value, propertyValue)
    setDownPayment(newDownPayment)
    const newPercent = (newDownPayment / propertyValue) * 100
    setDownPaymentPercent(Number.parseFloat(newPercent.toFixed(2)))
  }

  // Handle down payment percent changes
  const handleDownPaymentPercentChange = (value) => {
    const newPercent = Number.parseFloat(value[0].toFixed(2))
    setDownPaymentPercent(newPercent)
    const newDownPayment = (propertyValue * newPercent) / 100
    setDownPayment(Math.round(newDownPayment))
  }

  // Calculate mortgage payment
  useEffect(() => {
    const loanAmount = propertyValue - downPayment
    const insuranceAmount = calculateMortgageInsurance(propertyValue, downPaymentPercent)
    setMortgageInsurance(insuranceAmount)

    const totalLoan = loanAmount + insuranceAmount
    const monthlyInterestRate = interestRate / 100 / 12
    const numberOfPayments = amortizationPeriod * 12

    if (monthlyInterestRate === 0) {
      const payment = totalLoan / numberOfPayments
      setMonthlyPayment(payment)
      setTotalCost(payment * numberOfPayments)
      setTotalInterest(0)
    } else {
      const payment =
        (totalLoan * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

      setMonthlyPayment(payment)
      setTotalCost(payment * numberOfPayments)
      setTotalInterest(payment * numberOfPayments - totalLoan)
    }
  }, [propertyValue, downPayment, downPaymentPercent, interestRate, amortizationPeriod])

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format currency with cents
  const formatCurrencyWithCents = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
        <h1 className="text-3xl font-bold">Mortgage Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="amortization">Amortization Schedule</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mortgage Details</CardTitle>
                <CardDescription>Enter your mortgage information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="property-value">Property Value</Label>
                    <div className="font-medium">{formatCurrency(propertyValue)}</div>
                  </div>
                  <Input
                    id="property-value"
                    type="number"
                    min="50000"
                    max="10000000"
                    step="10000"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="down-payment" className="mr-1">
                        Down Payment
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              In Canada, a minimum down payment of 5% is required for homes under $500,000. For homes
                              between $500,000 and $999,999, 5% is required for the first $500,000 and 10% for the
                              remainder.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(downPayment)} ({downPaymentPercent.toFixed(1)}%)
                    </div>
                  </div>
                  <Input
                    id="down-payment"
                    type="number"
                    min={propertyValue * 0.05}
                    max={propertyValue}
                    step="1000"
                    value={downPayment}
                    onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                  />
                  <Slider
                    value={[downPaymentPercent]}
                    min={5}
                    max={100}
                    step={0.1}
                    onValueChange={handleDownPaymentPercentChange}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                    <div className="font-medium">{interestRate.toFixed(2)}%</div>
                  </div>
                  <Input
                    id="interest-rate"
                    type="number"
                    min="0"
                    max="20"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amortization-period">Amortization Period (years)</Label>
                    <div className="font-medium">{amortizationPeriod} years</div>
                  </div>
                  <Tabs defaultValue="25" onValueChange={(value) => setAmortizationPeriod(Number(value))}>
                    <TabsList className="grid grid-cols-4">
                      <TabsTrigger value="10">10</TabsTrigger>
                      <TabsTrigger value="15">15</TabsTrigger>
                      <TabsTrigger value="20">20</TabsTrigger>
                      <TabsTrigger value="25">25</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment-frequency">Payment Frequency</Label>
                  </div>
                  <Tabs defaultValue="monthly" onValueChange={setPaymentFrequency}>
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="biweekly">Bi-weekly</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mortgage Summary</CardTitle>
                  <CardDescription>Your mortgage payment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mortgage Amount</p>
                      <p className="text-xl font-bold">{formatCurrency(propertyValue - downPayment)}</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm text-muted-foreground mr-1">CMHC Insurance</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Mortgage insurance is required for down payments less than 20% of the property value.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-xl font-bold">{formatCurrency(mortgageInsurance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrencyWithCents(monthlyPayment)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Interest</p>
                      <p className="text-xl font-bold">{formatCurrency(totalInterest)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Principal</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(propertyValue - downPayment + mortgageInsurance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <MortgageChart principal={propertyValue - downPayment + mortgageInsurance} interest={totalInterest} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="amortization">
          <Card>
            <CardHeader>
              <CardTitle>Amortization Schedule</CardTitle>
              <CardDescription>See how your mortgage is paid off over time</CardDescription>
            </CardHeader>
            <CardContent>
              <AmortizationTable
                principal={propertyValue - downPayment + mortgageInsurance}
                interestRate={interestRate}
                amortizationPeriod={amortizationPeriod}
                paymentFrequency={paymentFrequency}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Mortgage Calculator Guide</CardTitle>
              <CardDescription>Learn how to use this calculator effectively</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Understanding Your Inputs</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Property Value:</strong> The purchase price of the home you're buying.
                  </li>
                  <li>
                    <strong>Down Payment:</strong> The amount you'll pay upfront. In Canada, minimum down payment
                    requirements are:
                    <ul className="list-disc pl-6 pt-1">
                      <li>5% for homes under $500,000</li>
                      <li>
                        5% for the first $500,000 and 10% for the portion above $500,000 for homes between $500,000 and
                        $999,999
                      </li>
                      <li>20% for homes $1 million or more</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Interest Rate:</strong> The annual interest rate for your mortgage.
                  </li>
                  <li>
                    <strong>Amortization Period:</strong> The total length of time it will take to pay off your mortgage
                    completely.
                  </li>
                  <li>
                    <strong>Payment Frequency:</strong> How often you make payments. More frequent payments can save
                    interest over time.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Canadian Mortgage Insurance (CMHC)</h3>
                <p className="pt-2">
                  Mortgage insurance is required when your down payment is less than 20% of the property value. The
                  insurance rates are:
                </p>
                <ul className="list-disc pl-6 pt-1">
                  <li>Down payment of 5-9.99%: 4.00% of loan amount</li>
                  <li>Down payment of 10-14.99%: 3.10% of loan amount</li>
                  <li>Down payment of 15-19.99%: 2.80% of loan amount</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Understanding Your Results</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Monthly Payment:</strong> The amount you'll pay each month, including principal and
                    interest.
                  </li>
                  <li>
                    <strong>Total Cost:</strong> The total amount you'll pay over the life of the mortgage, including
                    principal and interest.
                  </li>
                  <li>
                    <strong>Total Interest:</strong> The total amount of interest you'll pay over the life of the
                    mortgage.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Tips for Using This Calculator</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    Try different down payment amounts to see how it affects your mortgage insurance and monthly
                    payments.
                  </li>
                  <li>
                    Compare different amortization periods to see the trade-off between monthly payment amount and total
                    interest paid.
                  </li>
                  <li>
                    Use the amortization schedule to understand how your payments are applied to principal and interest
                    over time.
                  </li>
                  <li>
                    Consider how changes in interest rates might affect your payments before finalizing your mortgage.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Canadian Mortgage Considerations</h3>
                <p className="pt-2">When planning your mortgage in Canada, also consider:</p>
                <ul className="list-disc pl-6 pt-1">
                  <li>Fixed vs. variable interest rates</li>
                  <li>Open vs. closed mortgages</li>
                  <li>Prepayment privileges</li>
                  <li>Mortgage term length (typically 1-5 years in Canada)</li>
                  <li>Land transfer tax and other closing costs</li>
                  <li>First-time home buyer incentives and tax credits</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

