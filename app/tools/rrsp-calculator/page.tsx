"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RRSPChart } from "@/components/rrsp-chart"

export default function RRSPCalculatorPage() {
  const [currentAge, setCurrentAge] = useState(30)
  const [retirementAge, setRetirementAge] = useState(65)
  const [currentIncome, setCurrentIncome] = useState(75000)
  const [currentRRSP, setCurrentRRSP] = useState(25000)
  const [annualContribution, setAnnualContribution] = useState(6000)
  const [expectedReturn, setExpectedReturn] = useState(6)
  const [inflationRate, setInflationRate] = useState(2)
  const [currentTaxRate, setCurrentTaxRate] = useState(30)
  const [retirementTaxRate, setRetirementTaxRate] = useState(20)
  const [rrspResults, setRRSPResults] = useState({})
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

  // Calculate RRSP growth and benefits
  useEffect(() => {
    const yearsToRetirement = retirementAge - currentAge
    if (yearsToRetirement < 0) return

    const realReturnRate = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1

    let rrspBalance = currentRRSP
    let totalContributions = currentRRSP
    let totalTaxSavings = 0
    const yearlyData = []

    for (let year = 1; year <= yearsToRetirement; year++) {
      // Add annual contribution
      rrspBalance += annualContribution
      totalContributions += annualContribution

      // Calculate tax savings for this year's contribution
      const taxSavings = annualContribution * (currentTaxRate / 100)
      totalTaxSavings += taxSavings

      // Apply investment return
      const investmentReturn = rrspBalance * (expectedReturn / 100)
      rrspBalance += investmentReturn

      // Record yearly data
      yearlyData.push({
        age: currentAge + year,
        year,
        balance: rrspBalance,
        contributions: totalContributions,
        taxSavings: totalTaxSavings,
        investmentReturn,
      })
    }

    // Calculate retirement income
    const withdrawalRate = 0.04 // 4% safe withdrawal rate
    const annualRetirementIncome = rrspBalance * withdrawalRate
    const monthlyRetirementIncome = annualRetirementIncome / 12

    // Calculate tax on RRSP withdrawals in retirement
    const taxOnWithdrawals = annualRetirementIncome * (retirementTaxRate / 100)
    const afterTaxRetirementIncome = annualRetirementIncome - taxOnWithdrawals

    // Calculate inflation-adjusted values
    const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToRetirement)
    const inflationAdjustedBalance = rrspBalance / inflationFactor
    const inflationAdjustedIncome = annualRetirementIncome / inflationFactor

    setRRSPResults({
      futureValue: rrspBalance,
      totalContributions,
      totalTaxSavings,
      annualRetirementIncome,
      monthlyRetirementIncome,
      afterTaxRetirementIncome,
      inflationAdjustedBalance,
      inflationAdjustedIncome,
      yearlyData,
    })
  }, [
    currentAge,
    retirementAge,
    currentRRSP,
    annualContribution,
    expectedReturn,
    inflationRate,
    currentTaxRate,
    retirementTaxRate,
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
        <h1 className="text-3xl font-bold">RRSP Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="comparison">RRSP vs TFSA</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>RRSP Details</CardTitle>
                <CardDescription>Enter your RRSP information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="current-age">Current Age</Label>
                      <div className="font-medium">{currentAge}</div>
                    </div>
                    <Input
                      id="current-age"
                      type="number"
                      min="18"
                      max="80"
                      value={currentAge}
                      onChange={(e) => setCurrentAge(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="retirement-age">Retirement Age</Label>
                      <div className="font-medium">{retirementAge}</div>
                    </div>
                    <Input
                      id="retirement-age"
                      type="number"
                      min={currentAge + 1}
                      max="100"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="current-income">Current Annual Income</Label>
                    <div className="font-medium">{formatCurrency(currentIncome)}</div>
                  </div>
                  <Input
                    id="current-income"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={currentIncome}
                    onChange={(e) => setCurrentIncome(Number(e.target.value))}
                  />
                  <Slider
                    value={[currentIncome]}
                    min={0}
                    max={200000}
                    step={1000}
                    onValueChange={(value) => setCurrentIncome(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="current-rrsp">Current RRSP Balance</Label>
                    <div className="font-medium">{formatCurrency(currentRRSP)}</div>
                  </div>
                  <Input
                    id="current-rrsp"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={currentRRSP}
                    onChange={(e) => setCurrentRRSP(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="annual-contribution" className="mr-1">
                        Annual Contribution
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              For 2025, the RRSP contribution limit is 18% of your previous year's earned income up to a
                              maximum of $31,560, plus any unused contribution room from previous years.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{formatCurrency(annualContribution)}</div>
                  </div>
                  <Input
                    id="annual-contribution"
                    type="number"
                    min="0"
                    max="30000"
                    step="500"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(Number(e.target.value))}
                  />
                  <Slider
                    value={[annualContribution]}
                    min={0}
                    max={30000}
                    step={500}
                    onValueChange={(value) => setAnnualContribution(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="expected-return">Expected Annual Return (%)</Label>
                    <div className="font-medium">{expectedReturn}%</div>
                  </div>
                  <Input
                    id="expected-return"
                    type="number"
                    min="0"
                    max="15"
                    step="0.1"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  />
                  <Slider
                    value={[expectedReturn]}
                    min={0}
                    max={10}
                    step={0.1}
                    onValueChange={(value) => setExpectedReturn(value[0])}
                    className="py-4"
                  />
                </div>

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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="current-tax-rate">Current Tax Rate (%)</Label>
                      <div className="font-medium">{currentTaxRate}%</div>
                    </div>
                    <Input
                      id="current-tax-rate"
                      type="number"
                      min="0"
                      max="60"
                      step="1"
                      value={currentTaxRate}
                      onChange={(e) => setCurrentTaxRate(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="retirement-tax-rate">Retirement Tax Rate (%)</Label>
                      <div className="font-medium">{retirementTaxRate}%</div>
                    </div>
                    <Input
                      id="retirement-tax-rate"
                      type="number"
                      min="0"
                      max="60"
                      step="1"
                      value={retirementTaxRate}
                      onChange={(e) => setRetirementTaxRate(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>RRSP Summary</CardTitle>
                  <CardDescription>Your projected RRSP growth and benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {rrspResults.futureValue ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">RRSP at Retirement</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(rrspResults.futureValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Contributions</p>
                        <p className="text-xl font-bold">{formatCurrency(rrspResults.totalContributions)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tax Savings</p>
                        <p className="text-xl font-bold">{formatCurrency(rrspResults.totalTaxSavings)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Investment Growth</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(rrspResults.futureValue - rrspResults.totalContributions)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Annual Retirement Income</p>
                        <p className="text-xl font-bold">{formatCurrency(rrspResults.annualRetirementIncome)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Retirement Income</p>
                        <p className="text-xl font-bold">{formatCurrency(rrspResults.monthlyRetirementIncome)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">After-Tax Retirement Income</p>
                        <p className="text-xl font-bold">{formatCurrency(rrspResults.afterTaxRetirementIncome)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Inflation-Adjusted Value</p>
                        <p className="text-xl font-bold">{formatCurrency(rrspResults.inflationAdjustedBalance)}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Enter your information to see your RRSP projections.</p>
                  )}
                </CardContent>
              </Card>

              {rrspResults.yearlyData && (
                <Card>
                  <CardHeader>
                    <CardTitle>RRSP Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RRSPChart yearlyData={rrspResults.yearlyData} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>RRSP vs TFSA Comparison</CardTitle>
              <CardDescription>Understanding the differences between these tax-advantaged accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Feature</TableHead>
                      <TableHead>RRSP</TableHead>
                      <TableHead>TFSA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Tax Treatment of Contributions</TableCell>
                      <TableCell>Tax-deductible (reduces taxable income)</TableCell>
                      <TableCell>Not tax-deductible (contributed with after-tax dollars)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tax Treatment of Withdrawals</TableCell>
                      <TableCell>Fully taxable as income</TableCell>
                      <TableCell>Tax-free</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2025 Contribution Limit</TableCell>
                      <TableCell>18% of previous year's earned income up to $31,560 + unused room</TableCell>
                      <TableCell>$7,000 + unused room</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Withdrawal Restrictions</TableCell>
                      <TableCell>
                        Withdrawals add to taxable income; no recontribution of withdrawn amounts (except HBP and LLP)
                      </TableCell>
                      <TableCell>No restrictions; withdrawn amounts can be recontributed in future years</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Age Restrictions</TableCell>
                      <TableCell>Must be converted to RRIF by end of year you turn 71</TableCell>
                      <TableCell>No age restrictions</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Impact on Government Benefits</TableCell>
                      <TableCell>Withdrawals may reduce income-tested benefits like OAS and GIS</TableCell>
                      <TableCell>No impact on income-tested benefits</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Best For</TableCell>
                      <TableCell>Higher income earners who expect to be in a lower tax bracket in retirement</TableCell>
                      <TableCell>Those who expect to be in the same or higher tax bracket in retirement</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">When to Choose RRSP</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You're in a high tax bracket now and expect to be in a lower bracket in retirement</li>
                  <li>You want the immediate tax deduction to reduce current taxes</li>
                  <li>You have difficulty saving and the tax penalty on early withdrawals helps you stay committed</li>
                  <li>You want to participate in the Home Buyers' Plan (HBP) or Lifelong Learning Plan (LLP)</li>
                  <li>You've already maxed out your TFSA</li>
                </ul>

                <h3 className="text-lg font-medium">When to Choose TFSA</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You're in a low tax bracket now and expect to be in a higher bracket in retirement</li>
                  <li>You want flexibility to withdraw funds without tax consequences</li>
                  <li>You're saving for short to medium-term goals</li>
                  <li>You're concerned about OAS clawbacks in retirement</li>
                  <li>You've already maxed out your RRSP or are near retirement</li>
                </ul>

                <h3 className="text-lg font-medium">Optimal Strategy</h3>
                <p>For many Canadians, the best approach is to use both accounts strategically:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use RRSP contributions to reduce taxable income to a lower tax bracket</li>
                  <li>Use TFSA for additional savings and for funds you may need before retirement</li>
                  <li>Consider using RRSP tax refunds to fund TFSA contributions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>RRSP Guide</CardTitle>
              <CardDescription>Understanding Registered Retirement Savings Plans in Canada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">What is an RRSP?</h3>
                <p className="mt-2">
                  A Registered Retirement Savings Plan (RRSP) is a tax-advantaged account designed to help Canadians
                  save for retirement. Contributions to an RRSP are tax-deductible, reducing your taxable income in the
                  year you make the contribution. The investments inside your RRSP grow tax-free until withdrawal, at
                  which point they are taxed as income.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">RRSP Contribution Limits</h3>
                <p className="mt-2">
                  For 2025, you can contribute up to 18% of your previous year's earned income to a maximum of $31,560,
                  plus any unused contribution room from previous years. Your specific contribution limit can be found
                  on your most recent Notice of Assessment from the CRA.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">RRSP Tax Benefits</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Immediate Tax Savings:</strong> Contributions reduce your taxable income, potentially
                    resulting in a tax refund.
                  </li>
                  <li>
                    <strong>Tax-Deferred Growth:</strong> Investments grow tax-free inside the RRSP.
                  </li>
                  <li>
                    <strong>Tax Bracket Arbitrage:</strong> If you contribute while in a high tax bracket and withdraw
                    in a lower bracket, you'll pay less tax overall.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">RRSP Withdrawal Rules</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Withdrawals are added to your taxable income for the year.</li>
                  <li>Financial institutions withhold tax at source (10-30% depending on amount and province).</li>
                  <li>Withdrawals permanently reduce your contribution room (unlike TFSAs).</li>
                  <li>
                    By December 31 of the year you turn 71, you must convert your RRSP to a Registered Retirement Income
                    Fund (RRIF) or annuity.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Special RRSP Programs</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Home Buyers' Plan (HBP):</strong> First-time home buyers can withdraw up to $35,000 tax-free
                    from their RRSP to buy a home. The amount must be repaid over 15 years.
                  </li>
                  <li>
                    <strong>Lifelong Learning Plan (LLP):</strong> Withdraw up to $10,000 per year (maximum $20,000
                    total) tax-free to finance full-time education for you or your spouse. Repayments must be made over
                    10 years.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">RRSP Investment Options</h3>
                <p className="mt-2">RRSPs can hold various investments, including:</p>
                <ul className="list-disc pl-6 pt-1 space-y-1">
                  <li>Cash and GICs</li>
                  <li>Bonds and bond ETFs</li>
                  <li>Stocks and equity ETFs</li>
                  <li>Mutual funds</li>
                  <li>Certain alternative investments</li>
                </ul>
                <p className="mt-2">
                  Your investment mix should be based on your risk tolerance, time horizon, and retirement goals.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">RRSP Tips</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    Consider making regular contributions throughout the year rather than a lump sum before the
                    deadline.
                  </li>
                  <li>
                    If you receive a tax refund from your RRSP contribution, consider reinvesting it in your TFSA.
                  </li>
                  <li>
                    Spousal RRSPs can help balance retirement income between spouses, potentially reducing overall tax.
                  </li>
                  <li>
                    As you approach retirement, consider gradually shifting to a more conservative investment mix.
                  </li>
                  <li>Plan your RRSP withdrawals strategically to minimize tax and maximize government benefits.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

