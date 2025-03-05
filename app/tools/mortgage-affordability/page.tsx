"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

export default function MortgageAffordabilityPage() {
  const [annualIncome, setAnnualIncome] = useState(80000)
  const [additionalIncome, setAdditionalIncome] = useState(0)
  const [monthlyDebts, setMonthlyDebts] = useState(500)
  const [downPayment, setDownPayment] = useState(50000)
  const [interestRate, setInterestRate] = useState(5.0)
  const [amortizationPeriod, setAmortizationPeriod] = useState(25)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.0)
  const [heatingCosts, setHeatingCosts] = useState(150)
  const [condoFees, setCondoFees] = useState(0)
  const [affordabilityResults, setAffordabilityResults] = useState({})
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

  // Calculate mortgage affordability
  useEffect(() => {
    // Calculate total annual income
    const totalAnnualIncome = annualIncome + additionalIncome
    const monthlyIncome = totalAnnualIncome / 12

    // Calculate GDS and TDS ratios
    const maxGDSRatio = 0.32 // 32% of gross income for housing costs
    const maxTDSRatio = 0.4 // 40% of gross income for all debt obligations

    // Calculate maximum monthly housing costs based on GDS
    const maxMonthlyHousingCosts = monthlyIncome * maxGDSRatio

    // Calculate maximum monthly debt obligations based on TDS
    const maxMonthlyDebtObligations = monthlyIncome * maxTDSRatio
    const maxMonthlyMortgagePayment = maxMonthlyDebtObligations - monthlyDebts

    // Calculate maximum mortgage amount
    const monthlyInterestRate = interestRate / 100 / 12
    const numberOfPayments = amortizationPeriod * 12

    let maxMortgageAmount = 0
    if (monthlyInterestRate > 0) {
      maxMortgageAmount =
        maxMonthlyMortgagePayment * ((1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments)) / monthlyInterestRate)
    } else {
      maxMortgageAmount = maxMonthlyMortgagePayment * numberOfPayments
    }

    // Calculate maximum home price
    const maxHomePrice = maxMortgageAmount + downPayment

    // Calculate stress test (qualifying rate is typically 2% higher than contract rate)
    const stressTestRate = interestRate + 2.0
    const stressTestMonthlyRate = stressTestRate / 100 / 12

    let stressTestMaxMortgageAmount = 0
    if (stressTestMonthlyRate > 0) {
      stressTestMaxMortgageAmount =
        maxMonthlyMortgagePayment *
        ((1 - Math.pow(1 + stressTestMonthlyRate, -numberOfPayments)) / stressTestMonthlyRate)
    } else {
      stressTestMaxMortgageAmount = maxMonthlyMortgagePayment * numberOfPayments
    }

    const stressTestMaxHomePrice = stressTestMaxMortgageAmount + downPayment

    // Calculate monthly costs for the maximum affordable home
    const monthlyMortgagePayment = maxMonthlyMortgagePayment
    const monthlyPropertyTax = (maxHomePrice * (propertyTaxRate / 100)) / 12
    const totalMonthlyPayment = monthlyMortgagePayment + monthlyPropertyTax + heatingCosts + condoFees

    // Calculate minimum income required for desired home price
    const desiredHomePrice = 500000 // Example desired home price
    const desiredMortgageAmount = Math.max(0, desiredHomePrice - downPayment)

    let desiredMonthlyMortgagePayment = 0
    if (monthlyInterestRate > 0) {
      desiredMonthlyMortgagePayment =
        (desiredMortgageAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
    } else {
      desiredMonthlyMortgagePayment = desiredMortgageAmount / numberOfPayments
    }

    const desiredMonthlyPropertyTax = (desiredHomePrice * (propertyTaxRate / 100)) / 12
    const desiredTotalMonthlyPayment =
      desiredMonthlyMortgagePayment + desiredMonthlyPropertyTax + heatingCosts + condoFees

    const minimumIncomeGDS = (desiredTotalMonthlyPayment / maxGDSRatio) * 12
    const minimumIncomeTDS = ((desiredTotalMonthlyPayment + monthlyDebts) / maxTDSRatio) * 12
    const minimumIncomeRequired = Math.max(minimumIncomeGDS, minimumIncomeTDS)

    // Calculate down payment requirements
    let minimumDownPaymentPercent = 0.05 // 5% for homes under $500,000
    let minimumDownPaymentAmount = 0

    if (maxHomePrice <= 500000) {
      minimumDownPaymentAmount = maxHomePrice * 0.05
    } else if (maxHomePrice <= 999999) {
      minimumDownPaymentAmount = 25000 + (maxHomePrice - 500000) * 0.1
    } else {
      minimumDownPaymentAmount = maxHomePrice * 0.2
    }

    minimumDownPaymentPercent = (minimumDownPaymentAmount / maxHomePrice) * 100

    // Calculate CMHC insurance if applicable
    let cmhcInsurance = 0
    const downPaymentPercent = (downPayment / maxHomePrice) * 100

    if (downPaymentPercent < 20) {
      if (downPaymentPercent >= 15) {
        cmhcInsurance = (maxHomePrice - downPayment) * 0.028
      } else if (downPaymentPercent >= 10) {
        cmhcInsurance = (maxHomePrice - downPayment) * 0.031
      } else if (downPaymentPercent >= 5) {
        cmhcInsurance = (maxHomePrice - downPayment) * 0.04
      }
    }

    // Calculate affordability metrics
    const gdsPct = (totalMonthlyPayment / monthlyIncome) * 100
    const tdsPct = ((totalMonthlyPayment + monthlyDebts) / monthlyIncome) * 100

    setAffordabilityResults({
      maxHomePrice,
      stressTestMaxHomePrice,
      maxMortgageAmount,
      monthlyMortgagePayment,
      monthlyPropertyTax,
      totalMonthlyPayment,
      minimumIncomeRequired,
      minimumDownPaymentAmount,
      minimumDownPaymentPercent,
      cmhcInsurance,
      gdsPct,
      tdsPct,
    })
  }, [
    annualIncome,
    additionalIncome,
    monthlyDebts,
    downPayment,
    interestRate,
    amortizationPeriod,
    propertyTaxRate,
    heatingCosts,
    condoFees,
  ])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Mortgage Affordability Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="details">Affordability Details</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income & Expenses</CardTitle>
                <CardDescription>Enter your financial information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="annual-income">Annual Income</Label>
                    <div className="font-medium">{formatCurrency(annualIncome)}</div>
                  </div>
                  <Input
                    id="annual-income"
                    type="number"
                    min="0"
                    max="500000"
                    step="1000"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  />
                  <Slider
                    value={[annualIncome]}
                    min={0}
                    max={200000}
                    step={1000}
                    onValueChange={(value) => setAnnualIncome(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="additional-income">Additional Annual Income</Label>
                    <div className="font-medium">{formatCurrency(additionalIncome)}</div>
                  </div>
                  <Input
                    id="additional-income"
                    type="number"
                    min="0"
                    max="500000"
                    step="1000"
                    value={additionalIncome}
                    onChange={(e) => setAdditionalIncome(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="monthly-debts" className="mr-1">
                        Monthly Debt Payments
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Include car loans, student loans, credit card minimum payments, and other debt
                              obligations.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{formatCurrency(monthlyDebts)}</div>
                  </div>
                  <Input
                    id="monthly-debts"
                    type="number"
                    min="0"
                    max="10000"
                    step="50"
                    value={monthlyDebts}
                    onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="down-payment">Down Payment</Label>
                    <div className="font-medium">{formatCurrency(downPayment)}</div>
                  </div>
                  <Input
                    id="down-payment"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                  />
                  <Slider
                    value={[downPayment]}
                    min={0}
                    max={200000}
                    step={1000}
                    onValueChange={(value) => setDownPayment(value[0])}
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
                    step="0.05"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                  />
                  <Slider
                    value={[interestRate]}
                    min={1}
                    max={10}
                    step={0.05}
                    onValueChange={(value) => setInterestRate(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amortization-period">Amortization Period (years)</Label>
                    <div className="font-medium">{amortizationPeriod} years</div>
                  </div>
                  <Select
                    value={amortizationPeriod.toString()}
                    onValueChange={(value) => setAmortizationPeriod(Number(value))}
                  >
                    <SelectTrigger id="amortization-period">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 years</SelectItem>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="25">25 years</SelectItem>
                      <SelectItem value="30">30 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="property-tax-rate" className="mr-1">
                        Property Tax Rate (%)
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Property tax rates vary by municipality. The average in Canada is around 1% of the
                              property value annually.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{propertyTaxRate.toFixed(2)}%</div>
                  </div>
                  <Input
                    id="property-tax-rate"
                    type="number"
                    min="0"
                    max="5"
                    step="0.05"
                    value={propertyTaxRate}
                    onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heating-costs">Monthly Heating Costs</Label>
                    <Input
                      id="heating-costs"
                      type="number"
                      min="0"
                      max="1000"
                      step="10"
                      value={heatingCosts}
                      onChange={(e) => setHeatingCosts(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condo-fees">Monthly Condo Fees</Label>
                    <Input
                      id="condo-fees"
                      type="number"
                      min="0"
                      max="2000"
                      step="10"
                      value={condoFees}
                      onChange={(e) => setCondoFees(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Affordability Summary</CardTitle>
                  <CardDescription>Your estimated home buying power</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {affordabilityResults.maxHomePrice ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Maximum Home Price</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(affordabilityResults.maxHomePrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Maximum Mortgage Amount</p>
                          <p className="text-xl font-bold">{formatCurrency(affordabilityResults.maxMortgageAmount)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Stress Test Maximum (at {(interestRate + 2).toFixed(2)}%)</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(affordabilityResults.stressTestMaxHomePrice)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Monthly Payment Breakdown</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Mortgage Payment</p>
                            <p className="font-medium">{formatCurrency(affordabilityResults.monthlyMortgagePayment)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Property Tax</p>
                            <p className="font-medium">{formatCurrency(affordabilityResults.monthlyPropertyTax)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Heating & Condo Fees</p>
                            <p className="font-medium">{formatCurrency(heatingCosts + condoFees)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Monthly Payment</p>
                            <p className="font-medium">{formatCurrency(affordabilityResults.totalMonthlyPayment)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">GDS Ratio (max 32%)</p>
                          <p className="text-sm font-medium">{affordabilityResults.gdsPct.toFixed(1)}%</p>
                        </div>
                        <Progress
                          value={affordabilityResults.gdsPct}
                          max={32}
                          className="h-2"
                          color={affordabilityResults.gdsPct > 32 ? "bg-red-500" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">TDS Ratio (max 40%)</p>
                          <p className="text-sm font-medium">{affordabilityResults.tdsPct.toFixed(1)}%</p>
                        </div>
                        <Progress
                          value={affordabilityResults.tdsPct}
                          max={40}
                          className="h-2"
                          color={affordabilityResults.tdsPct > 40 ? "bg-red-500" : ""}
                        />
                      </div>
                    </div>
                  ) : (
                    <p>Enter your information to see your affordability estimate.</p>
                  )}
                </CardContent>
              </Card>

              {affordabilityResults.maxHomePrice && (
                <Card>
                  <CardHeader>
                    <CardTitle>Down Payment Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Minimum Down Payment</p>
                        <p className="font-medium">{formatCurrency(affordabilityResults.minimumDownPaymentAmount)}</p>
                        <p className="text-xs text-muted-foreground">
                          ({affordabilityResults.minimumDownPaymentPercent.toFixed(1)}% of purchase price)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Your Down Payment</p>
                        <p className="font-medium">{formatCurrency(downPayment)}</p>
                        <p className="text-xs text-muted-foreground">
                          ({((downPayment / affordabilityResults.maxHomePrice) * 100).toFixed(1)}% of purchase price)
                        </p>
                      </div>
                    </div>

                    {affordabilityResults.cmhcInsurance > 0 && (
                      <div className="rounded-lg border bg-muted p-4 mt-2">
                        <p className="font-medium">CMHC Insurance</p>
                        <p className="text-xl font-bold text-primary mt-1">
                          {formatCurrency(affordabilityResults.cmhcInsurance)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Required for down payments less than 20%. This can be added to your mortgage amount.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Affordability Details</CardTitle>
              <CardDescription>Understanding your mortgage affordability factors</CardDescription>
            </CardHeader>
            <CardContent>
              {affordabilityResults.maxHomePrice ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Income Analysis</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Annual Income</TableCell>
                            <TableCell>{formatCurrency(annualIncome)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Additional Income</TableCell>
                            <TableCell>{formatCurrency(additionalIncome)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Total Annual Income</TableCell>
                            <TableCell>{formatCurrency(annualIncome + additionalIncome)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Monthly Income</TableCell>
                            <TableCell>{formatCurrency((annualIncome + additionalIncome) / 12)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Debt Service Ratios</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">GDS Ratio</TableCell>
                            <TableCell>{affordabilityResults.gdsPct.toFixed(1)}% (max 32%)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">TDS Ratio</TableCell>
                            <TableCell>{affordabilityResults.tdsPct.toFixed(1)}% (max 40%)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Monthly Housing Costs</TableCell>
                            <TableCell>{formatCurrency(affordabilityResults.totalMonthlyPayment)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Monthly Debt Payments</TableCell>
                            <TableCell>{formatCurrency(monthlyDebts)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Mortgage Details</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Maximum Home Price</TableCell>
                          <TableCell>{formatCurrency(affordabilityResults.maxHomePrice)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Maximum Mortgage Amount</TableCell>
                          <TableCell>{formatCurrency(affordabilityResults.maxMortgageAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Down Payment</TableCell>
                          <TableCell>
                            {formatCurrency(downPayment)} (
                            {((downPayment / affordabilityResults.maxHomePrice) * 100).toFixed(1)}%)
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">CMHC Insurance</TableCell>
                          <TableCell>{formatCurrency(affordabilityResults.cmhcInsurance)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Interest Rate</TableCell>
                          <TableCell>{interestRate.toFixed(2)}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Amortization Period</TableCell>
                          <TableCell>{amortizationPeriod} years</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Monthly Mortgage Payment</TableCell>
                          <TableCell>{formatCurrency(affordabilityResults.monthlyMortgagePayment)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Stress Test Analysis</h3>
                    <p className="text-muted-foreground">
                      Canadian mortgage regulations require lenders to use a "stress test" to ensure borrowers can
                      afford their mortgage if interest rates rise. This test uses the higher of the Bank of Canada's
                      qualifying rate or your contract rate plus 2%.
                    </p>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Contract Rate</TableCell>
                          <TableCell>{interestRate.toFixed(2)}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Stress Test Rate</TableCell>
                          <TableCell>{(interestRate + 2).toFixed(2)}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Stress Test Maximum Home Price</TableCell>
                          <TableCell>{formatCurrency(affordabilityResults.stressTestMaxHomePrice)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ways to Increase Your Affordability</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border p-4">
                        <p className="font-medium">Increase Down Payment</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          A larger down payment reduces your mortgage amount and may eliminate CMHC insurance if you
                          reach 20%.
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="font-medium">Reduce Existing Debt</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Paying off credit cards, car loans, or other debts improves your TDS ratio and increases
                          affordability.
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="font-medium">Increase Income</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          A higher income directly increases your maximum affordability under both GDS and TDS ratios.
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="font-medium">Extend Amortization Period</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          A longer amortization period reduces monthly payments but increases total interest paid.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Enter your information in the calculator tab to see detailed affordability analysis.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Mortgage Affordability Guide</CardTitle>
              <CardDescription>Understanding how lenders determine how much you can borrow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">How Lenders Determine Affordability</h3>
                <p className="mt-2">
                  Canadian lenders use two key debt service ratios to determine how much mortgage you can afford:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Gross Debt Service (GDS) Ratio:</strong> The percentage of your gross income needed to pay
                    housing costs (mortgage, property taxes, heating, and 50% of condo fees). This should not exceed
                    32%.
                  </li>
                  <li>
                    <strong>Total Debt Service (TDS) Ratio:</strong> The percentage of your gross income needed to pay
                    all debt obligations, including housing costs and other debts (credit cards, car loans, etc.). This
                    should not exceed 40%.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">The Mortgage Stress Test</h3>
                <p className="mt-2">
                  Since 2018, all Canadian homebuyers must pass a "stress test" when applying for a mortgage:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    You must qualify at the higher of the Bank of Canada's benchmark rate (currently 5.25%) or your
                    contract rate plus 2%.
                  </li>
                  <li>This ensures you can still afford your mortgage if interest rates rise.</li>
                  <li>The stress test typically reduces your maximum affordability by 20-25%.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Down Payment Requirements</h3>
                <p className="mt-2">The minimum down payment in Canada depends on the home price:</p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>For homes under $500,000: 5% of the purchase price</li>
                  <li>
                    For homes between $500,000 and $999,999: 5% of the first $500,000 plus 10% of the portion above
                    $500,000
                  </li>
                  <li>For homes $1 million or more: 20% of the purchase price</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">CMHC Mortgage Insurance</h3>
                <p className="mt-2">
                  If your down payment is less than 20% of the purchase price, you'll need mortgage default insurance
                  (often called CMHC insurance):
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Down payment of 5-9.99%: Premium is 4.00% of the mortgage amount</li>
                  <li>Down payment of 10-14.99%: Premium is 3.10% of the mortgage amount</li>
                  <li>Down payment of 15-19.99%: Premium is 2.80% of the mortgage amount</li>
                  <li>The premium can be added to your mortgage amount</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Other Costs to Consider</h3>
                <p className="mt-2">Beyond the mortgage payment, homeownership includes several other costs:</p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Closing Costs:</strong> Typically 1.5-4% of the purchase price, including legal fees, land
                    transfer tax, home inspection, etc.
                  </li>
                  <li>
                    <strong>Property Taxes:</strong> Vary by municipality, typically 0.5-2.5% of the property value
                    annually.
                  </li>
                  <li>
                    <strong>Home Insurance:</strong> Required by all mortgage lenders, typically $700-1,500 per year.
                  </li>
                  <li>
                    <strong>Utilities:</strong> Electricity, water, gas, internet, etc.
                  </li>
                  <li>
                    <strong>Maintenance:</strong> Budget 1-3% of your home's value annually for maintenance and repairs.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Affordability Tips</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>The 32% Rule:</strong> Even if you qualify for more, consider keeping your housing costs
                    below 32% of your gross income for financial comfort.
                  </li>
                  <li>
                    <strong>Pre-Approval:</strong> Get pre-approved for a mortgage before house hunting to understand
                    your budget.
                  </li>
                  <li>
                    <strong>Emergency Fund:</strong> Maintain 3-6 months of expenses in an emergency fund, separate from
                    your down payment.
                  </li>
                  <li>
                    <strong>Future-Proof:</strong> Consider how life changes (children, job changes) might affect your
                    ability to make payments.
                  </li>
                  <li>
                    <strong>First-Time Buyer Programs:</strong> Look into the First-Time Home Buyer Incentive, Home
                    Buyers' Plan (RRSP), and First Home Savings Account (FHSA).
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

