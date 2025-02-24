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
import { InvestmentChart } from "@/components/investment-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InvestmentCalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  const [investmentYears, setInvestmentYears] = useState(20)
  const [riskProfile, setRiskProfile] = useState("balanced")
  const [expectedReturns, setExpectedReturns] = useState({
    conservative: { average: 4, range: [2, 6] },
    balanced: { average: 6, range: [3, 9] },
    growth: { average: 8, range: [4, 12] },
    aggressive: { average: 10, range: [5, 15] },
  })
  const [selectedReturn, setSelectedReturn] = useState(6)
  const [inflationRate, setInflationRate] = useState(2)
  const [feePercentage, setFeePercentage] = useState(0.5)
  const [taxRate, setTaxRate] = useState(30)
  const [accountType, setAccountType] = useState("tfsa")
  const [investmentResults, setInvestmentResults] = useState({})
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

  // Update selected return when risk profile changes
  useEffect(() => {
    setSelectedReturn(expectedReturns[riskProfile].average)
  }, [riskProfile, expectedReturns])

  // Calculate investment growth
  useEffect(() => {
    const monthlyRate = selectedReturn / 100 / 12
    const totalMonths = investmentYears * 12
    const monthlyFeeRate = feePercentage / 100 / 12

    let balance = initialInvestment
    let contributions = initialInvestment
    let totalFees = 0
    const yearlyData = []

    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly contribution
      balance += monthlyContribution
      contributions += monthlyContribution

      // Apply monthly return
      const monthlyGrowth = balance * monthlyRate
      balance += monthlyGrowth

      // Apply fees
      const monthlyFee = balance * monthlyFeeRate
      balance -= monthlyFee
      totalFees += monthlyFee

      // Record yearly data
      if (month % 12 === 0) {
        const year = month / 12
        const growth = balance - contributions
        yearlyData.push({
          year,
          balance,
          contributions,
          growth,
          fees: totalFees,
        })
      }
    }

    // Calculate final values
    const totalGrowth = balance - contributions
    const totalContributions = contributions

    // Calculate after-tax value
    let afterTaxValue = balance
    if (accountType === "non-registered") {
      const taxableAmount = totalGrowth
      const taxOnGrowth = taxableAmount * (taxRate / 100)
      afterTaxValue = balance - taxOnGrowth
    } else if (accountType === "rrsp") {
      afterTaxValue = balance * (1 - taxRate / 100)
    }

    // Calculate inflation-adjusted value
    const inflationFactor = Math.pow(1 + inflationRate / 100, investmentYears)
    const inflationAdjustedValue = balance / inflationFactor

    // Calculate return metrics
    const annualizedReturn = (Math.pow(balance / initialInvestment, 1 / investmentYears) - 1) * 100
    const effectiveReturn = annualizedReturn - feePercentage

    setInvestmentResults({
      finalBalance: balance,
      totalContributions,
      totalGrowth,
      totalFees,
      afterTaxValue,
      inflationAdjustedValue,
      annualizedReturn,
      effectiveReturn,
      yearlyData,
    })
  }, [
    initialInvestment,
    monthlyContribution,
    investmentYears,
    selectedReturn,
    feePercentage,
    inflationRate,
    taxRate,
    accountType,
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
        <h1 className="text-3xl font-bold">Investment Returns Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="comparison">Investment Comparison</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
                <CardDescription>Enter your investment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="initial-investment">Initial Investment</Label>
                    <div className="font-medium">{formatCurrency(initialInvestment)}</div>
                  </div>
                  <Input
                    id="initial-investment"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  />
                  <Slider
                    value={[initialInvestment]}
                    min={0}
                    max={100000}
                    step={1000}
                    onValueChange={(value) => setInitialInvestment(value[0])}
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
                    step="50"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  />
                  <Slider
                    value={[monthlyContribution]}
                    min={0}
                    max={2000}
                    step={50}
                    onValueChange={(value) => setMonthlyContribution(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="investment-years">Investment Period (years)</Label>
                    <div className="font-medium">{investmentYears} years</div>
                  </div>
                  <Input
                    id="investment-years"
                    type="number"
                    min="1"
                    max="50"
                    step="1"
                    value={investmentYears}
                    onChange={(e) => setInvestmentYears(Number(e.target.value))}
                  />
                  <Slider
                    value={[investmentYears]}
                    min={1}
                    max={40}
                    step={1}
                    onValueChange={(value) => setInvestmentYears(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="risk-profile" className="mr-1">
                      Risk Profile
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Conservative: Lower risk, lower returns. Balanced: Moderate risk and returns. Growth: Higher
                            risk, higher potential returns. Aggressive: Highest risk and potential returns.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={riskProfile} onValueChange={setRiskProfile}>
                    <SelectTrigger id="risk-profile">
                      <SelectValue placeholder="Select risk profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (2-6%)</SelectItem>
                      <SelectItem value="balanced">Balanced (3-9%)</SelectItem>
                      <SelectItem value="growth">Growth (4-12%)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (5-15%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="expected-return" className="mr-1">
                        Expected Annual Return (%)
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              The average annual return you expect from your investments before fees and taxes. This is
                              based on your selected risk profile but can be adjusted.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{selectedReturn.toFixed(1)}%</div>
                  </div>
                  <Slider
                    value={[selectedReturn]}
                    min={expectedReturns[riskProfile].range[0]}
                    max={expectedReturns[riskProfile].range[1]}
                    step={0.1}
                    onValueChange={(value) => setSelectedReturn(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="fee-percentage" className="mr-1">
                        Annual Fee (%)
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              The total annual fees for your investments, including management expense ratios (MER),
                              trading fees, and advisor fees if applicable.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{feePercentage.toFixed(2)}%</div>
                  </div>
                  <Slider
                    value={[feePercentage]}
                    min={0}
                    max={3}
                    step={0.05}
                    onValueChange={(value) => setFeePercentage(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inflation-rate">Inflation Rate (%)</Label>
                    <div className="font-medium">{inflationRate.toFixed(1)}%</div>
                  </div>
                  <Slider
                    value={[inflationRate]}
                    min={0}
                    max={5}
                    step={0.1}
                    onValueChange={(value) => setInflationRate(value[0])}
                    className="py-4"
                  />
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
                            TFSA: Tax-free growth and withdrawals. RRSP: Tax-deferred growth, taxed on withdrawal.
                            Non-registered: Taxable investment income and capital gains.
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
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                  <CardDescription>Your projected investment growth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {investmentResults.finalBalance ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Future Value</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(investmentResults.finalBalance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Contributions</p>
                        <p className="text-xl font-bold">{formatCurrency(investmentResults.totalContributions)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Investment Growth</p>
                        <p className="text-xl font-bold">{formatCurrency(investmentResults.totalGrowth)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Fees Paid</p>
                        <p className="text-xl font-bold">{formatCurrency(investmentResults.totalFees)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">After-Tax Value</p>
                        <p className="text-xl font-bold">{formatCurrency(investmentResults.afterTaxValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Inflation-Adjusted Value</p>
                        <p className="text-xl font-bold">{formatCurrency(investmentResults.inflationAdjustedValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Annualized Return</p>
                        <p className="text-xl font-bold">{investmentResults.annualizedReturn.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Return After Fees</p>
                        <p className="text-xl font-bold">{investmentResults.effectiveReturn.toFixed(2)}%</p>
                      </div>
                    </div>
                  ) : (
                    <p>Enter your information to see your investment projections.</p>
                  )}
                </CardContent>
              </Card>

              {investmentResults.yearlyData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InvestmentChart yearlyData={investmentResults.yearlyData} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Investment Account Comparison</CardTitle>
              <CardDescription>Understanding the differences between investment account types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Feature</TableHead>
                      <TableHead>TFSA</TableHead>
                      <TableHead>RRSP</TableHead>
                      <TableHead>Non-Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Tax on Contributions</TableCell>
                      <TableCell>After-tax dollars (no deduction)</TableCell>
                      <TableCell>Tax-deductible (reduces taxable income)</TableCell>
                      <TableCell>After-tax dollars (no deduction)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tax on Growth</TableCell>
                      <TableCell>Tax-free</TableCell>
                      <TableCell>Tax-deferred</TableCell>
                      <TableCell>Taxable annually</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tax on Withdrawals</TableCell>
                      <TableCell>Tax-free</TableCell>
                      <TableCell>Fully taxable as income</TableCell>
                      <TableCell>No additional tax (already taxed)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2025 Contribution Limit</TableCell>
                      <TableCell>$7,000 + unused room</TableCell>
                      <TableCell>18% of previous year's income up to $31,560 + unused room</TableCell>
                      <TableCell>No limit</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Withdrawal Restrictions</TableCell>
                      <TableCell>None; withdrawn amounts can be recontributed in future years</TableCell>
                      <TableCell>Withdrawals add to taxable income; no recontribution of withdrawn amounts</TableCell>
                      <TableCell>None</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Best For</TableCell>
                      <TableCell>
                        Most investors, especially those expecting to be in the same or higher tax bracket in retirement
                      </TableCell>
                      <TableCell>Higher income earners who expect to be in a lower tax bracket in retirement</TableCell>
                      <TableCell>Investors who have maxed out TFSA and RRSP, or need more flexibility</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Investment Types by Risk Profile</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk Profile</TableHead>
                        <TableHead>Typical Asset Allocation</TableHead>
                        <TableHead>Expected Return Range</TableHead>
                        <TableHead>Suitable For</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Conservative</TableCell>
                        <TableCell>70-80% Fixed Income, 20-30% Equities</TableCell>
                        <TableCell>2-6%</TableCell>
                        <TableCell>Short time horizons (1-5 years), low risk tolerance, near retirement</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Balanced</TableCell>
                        <TableCell>40-60% Fixed Income, 40-60% Equities</TableCell>
                        <TableCell>3-9%</TableCell>
                        <TableCell>Medium time horizons (5-10 years), moderate risk tolerance</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Growth</TableCell>
                        <TableCell>20-30% Fixed Income, 70-80% Equities</TableCell>
                        <TableCell>4-12%</TableCell>
                        <TableCell>Longer time horizons (10+ years), higher risk tolerance</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Aggressive</TableCell>
                        <TableCell>0-10% Fixed Income, 90-100% Equities</TableCell>
                        <TableCell>5-15%</TableCell>
                        <TableCell>Long time horizons (15+ years), high risk tolerance, early in career</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">The Impact of Fees</h3>
                  <p className="text-muted-foreground mb-4">
                    Investment fees can significantly impact your returns over time. Here's how different fee levels
                    affect a $10,000 investment growing at 7% annually over 30 years:
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Annual Fee</TableHead>
                        <TableHead>Final Value</TableHead>
                        <TableHead>Total Fees Paid</TableHead>
                        <TableHead>Reduction in Returns</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>0.25% (ETFs)</TableCell>
                        <TableCell>$73,114</TableCell>
                        <TableCell>$3,886</TableCell>
                        <TableCell>5%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>1.00% (Index Funds)</TableCell>
                        <TableCell>$61,223</TableCell>
                        <TableCell>$15,777</TableCell>
                        <TableCell>21%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2.00% (Mutual Funds)</TableCell>
                        <TableCell>$47,609</TableCell>
                        <TableCell>$29,391</TableCell>
                        <TableCell>38%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2.50% (Managed Funds)</TableCell>
                        <TableCell>$42,478</TableCell>
                        <TableCell>$34,522</TableCell>
                        <TableCell>45%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Investment Guide</CardTitle>
              <CardDescription>Understanding investment concepts for Canadians</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Understanding Investment Returns</h3>
                <p className="mt-2">
                  Investment returns are typically expressed as an annual percentage. These returns come from:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Capital Appreciation:</strong> The increase in the value of your investments over time.
                  </li>
                  <li>
                    <strong>Income:</strong> Dividends from stocks, interest from bonds, or distributions from funds.
                  </li>
                  <li>
                    <strong>Compound Growth:</strong> The effect of earning returns on your previous returns, which
                    accelerates growth over time.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Risk and Return Relationship</h3>
                <p className="mt-2">
                  Generally, higher potential returns come with higher risk. Understanding your risk tolerance is
                  essential for building an appropriate investment portfolio:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Conservative:</strong> Focus on capital preservation with some income. Lower returns but
                    more stability.
                  </li>
                  <li>
                    <strong>Balanced:</strong> Mix of growth and income investments for moderate returns with moderate
                    volatility.
                  </li>
                  <li>
                    <strong>Growth:</strong> Emphasis on capital appreciation with higher volatility but potentially
                    higher long-term returns.
                  </li>
                  <li>
                    <strong>Aggressive:</strong> Maximum growth potential with significant volatility and risk of loss
                    in the short term.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Canadian Tax Considerations</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Interest Income:</strong> Taxed at your full marginal tax rate in non-registered accounts.
                  </li>
                  <li>
                    <strong>Dividend Income:</strong> Canadian dividends receive preferential tax treatment through the
                    dividend tax credit.
                  </li>
                  <li>
                    <strong>Capital Gains:</strong> Only 50% of capital gains are taxable in Canada.
                  </li>
                  <li>
                    <strong>Foreign Income:</strong> May be subject to foreign withholding taxes, even in TFSAs.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Investment Account Strategies</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Tax-Efficient Asset Location:</strong> Hold tax-inefficient investments (like bonds) in
                    registered accounts and more tax-efficient investments (like Canadian dividend stocks) in
                    non-registered accounts.
                  </li>
                  <li>
                    <strong>TFSA Priority:</strong> For most Canadians, maximizing TFSA contributions before other
                    accounts often makes sense due to the tax-free growth and withdrawals.
                  </li>
                  <li>
                    <strong>RRSP for High Income:</strong> RRSPs are particularly valuable for those in high tax
                    brackets who expect to be in lower brackets in retirement.
                  </li>
                  <li>
                    <strong>Diversification:</strong> Spread investments across different asset classes, geographies,
                    and sectors to reduce risk.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Common Investment Vehicles in Canada</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Exchange-Traded Funds (ETFs):</strong> Low-cost funds that track indexes with typical fees
                    of 0.05-0.50%.
                  </li>
                  <li>
                    <strong>Index Mutual Funds:</strong> Similar to ETFs but with slightly higher fees, typically
                    0.30-1.00%.
                  </li>
                  <li>
                    <strong>Actively Managed Mutual Funds:</strong> Professionally managed funds with higher fees,
                    typically 1.50-2.50%.
                  </li>
                  <li>
                    <strong>Robo-Advisors:</strong> Automated investment services with moderate fees, typically
                    0.40-0.80% plus underlying ETF costs.
                  </li>
                  <li>
                    <strong>Individual Stocks and Bonds:</strong> Direct investment in securities with trading
                    commissions but no ongoing management fees.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Investment Tips for Canadians</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Start early to maximize the power of compound growth</li>
                  <li>Invest regularly through automatic contributions</li>
                  <li>Keep costs low by choosing low-fee investment options</li>
                  <li>Rebalance your portfolio periodically to maintain your target asset allocation</li>
                  <li>Consider your time horizon when determining your asset allocation</li>
                  <li>Don't try to time the market; consistent investing over time typically yields better results</li>
                  <li>Review and adjust your investment strategy as your life circumstances change</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

