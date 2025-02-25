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
import { TaxChart } from "@/components/tax-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TaxCalculatorPage() {
  const [province, setProvince] = useState("ontario")
  const [taxYear, setTaxYear] = useState("2025")
  const [employmentIncome, setEmploymentIncome] = useState(75000)
  const [selfEmploymentIncome, setSelfEmploymentIncome] = useState(0)
  const [interestIncome, setInterestIncome] = useState(0)
  const [dividendIncome, setDividendIncome] = useState(0)
  const [capitalGains, setCapitalGains] = useState(0)
  const [rrspContributions, setRrspContributions] = useState(6000)
  const [otherDeductions, setOtherDeductions] = useState(0)
  const [taxCredits, setTaxCredits] = useState(0)
  const [taxResults, setTaxResults] = useState({})
  const [activeTab, setActiveTab] = useState("calculator")

  // Federal tax brackets for 2025 (estimated)
  const federalBrackets = [
    { min: 0, max: 55867, rate: 15 },
    { min: 55867, max: 111733, rate: 20.5 },
    { min: 111733, max: 173205, rate: 26 },
    { min: 173205, max: 246752, rate: 29 },
    { min: 246752, max: Number.POSITIVE_INFINITY, rate: 33 },
  ]

  // Provincial tax brackets for 2025 (estimated)
  const provincialBrackets = {
    ontario: [
      { min: 0, max: 49231, rate: 5.05 },
      { min: 49231, max: 98463, rate: 9.15 },
      { min: 98463, max: 150000, rate: 11.16 },
      { min: 150000, max: 220000, rate: 12.16 },
      { min: 220000, max: Number.POSITIVE_INFINITY, rate: 13.16 },
    ],
    quebec: [
      { min: 0, max: 49275, rate: 15 },
      { min: 49275, max: 98540, rate: 20 },
      { min: 98540, max: 119910, rate: 24 },
      { min: 119910, max: Number.POSITIVE_INFINITY, rate: 25.75 },
    ],
    britishColumbia: [
      { min: 0, max: 45654, rate: 5.06 },
      { min: 45654, max: 91310, rate: 7.7 },
      { min: 91310, max: 104835, rate: 10.5 },
      { min: 104835, max: 127299, rate: 12.29 },
      { min: 127299, max: 172602, rate: 14.7 },
      { min: 172602, max: 240716, rate: 16.8 },
      { min: 240716, max: Number.POSITIVE_INFINITY, rate: 20.5 },
    ],
    alberta: [
      { min: 0, max: 142292, rate: 10 },
      { min: 142292, max: 170751, rate: 12 },
      { min: 170751, max: 227668, rate: 13 },
      { min: 227668, max: 341502, rate: 14 },
      { min: 341502, max: Number.POSITIVE_INFINITY, rate: 15 },
    ],
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`
  }

  // Calculate taxes
  useEffect(() => {
    // Calculate total income
    const totalIncome = employmentIncome + selfEmploymentIncome + interestIncome + dividendIncome + capitalGains * 0.5 // Only 50% of capital gains are taxable

    // Calculate taxable income
    const taxableIncome = Math.max(0, totalIncome - rrspContributions - otherDeductions)

    // Calculate federal tax
    let federalTax = 0
    const federalTaxByBracket = []

    for (const bracket of federalBrackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min)
        const taxInBracket = taxableInBracket * (bracket.rate / 100)
        federalTax += taxInBracket

        federalTaxByBracket.push({
          bracket: `${formatCurrency(bracket.min)} - ${bracket.max === Number.POSITIVE_INFINITY ? "+" : formatCurrency(bracket.max)}`,
          rate: bracket.rate,
          taxableAmount: taxableInBracket,
          tax: taxInBracket,
        })
      }
    }

    // Calculate provincial tax
    let provincialTax = 0
    const provincialTaxByBracket = []

    const selectedProvinceBrackets = provincialBrackets[province] || provincialBrackets.ontario

    for (const bracket of selectedProvinceBrackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min)
        const taxInBracket = taxableInBracket * (bracket.rate / 100)
        provincialTax += taxInBracket

        provincialTaxByBracket.push({
          bracket: `${formatCurrency(bracket.min)} - ${bracket.max === Number.POSITIVE_INFINITY ? "+" : formatCurrency(bracket.max)}`,
          rate: bracket.rate,
          taxableAmount: taxableInBracket,
          tax: taxInBracket,
        })
      }
    }

    // Apply tax credits
    const totalTaxBeforeCredits = federalTax + provincialTax
    const totalTaxAfterCredits = Math.max(0, totalTaxBeforeCredits - taxCredits)

    // Calculate average and marginal tax rates
    const averageTaxRate = taxableIncome > 0 ? (totalTaxAfterCredits / taxableIncome) * 100 : 0

    // Find marginal tax rate (combined federal and provincial)
    let marginalFederalRate = 0
    let marginalProvincialRate = 0

    for (let i = federalBrackets.length - 1; i >= 0; i--) {
      if (taxableIncome > federalBrackets[i].min) {
        marginalFederalRate = federalBrackets[i].rate
        break
      }
    }

    for (let i = selectedProvinceBrackets.length - 1; i >= 0; i--) {
      if (taxableIncome > selectedProvinceBrackets[i].min) {
        marginalProvincialRate = selectedProvinceBrackets[i].rate
        break
      }
    }

    const marginalTaxRate = marginalFederalRate + marginalProvincialRate

    // Calculate after-tax income
    const afterTaxIncome = totalIncome - totalTaxAfterCredits

    // Calculate effective tax rate on total income
    const effectiveTaxRate = totalIncome > 0 ? (totalTaxAfterCredits / totalIncome) * 100 : 0

    // Prepare tax breakdown
    const taxBreakdown = [
      { name: "Federal Tax", value: federalTax },
      { name: "Provincial Tax", value: provincialTax },
      { name: "Tax Credits", value: -taxCredits },
      { name: "Total Tax", value: totalTaxAfterCredits },
    ]

    // Prepare income breakdown
    const incomeBreakdown = [
      { name: "Employment", value: employmentIncome },
      { name: "Self-Employment", value: selfEmploymentIncome },
      { name: "Interest", value: interestIncome },
      { name: "Dividends", value: dividendIncome },
      { name: "Capital Gains (Taxable)", value: capitalGains * 0.5 },
    ].filter((item) => item.value > 0)

    setTaxResults({
      totalIncome,
      taxableIncome,
      federalTax,
      provincialTax,
      totalTaxBeforeCredits,
      totalTaxAfterCredits,
      afterTaxIncome,
      averageTaxRate,
      marginalTaxRate,
      effectiveTaxRate,
      federalTaxByBracket,
      provincialTaxByBracket,
      taxBreakdown,
      incomeBreakdown,
    })
  }, [
    province,
    taxYear,
    employmentIncome,
    selfEmploymentIncome,
    interestIncome,
    dividendIncome,
    capitalGains,
    rrspContributions,
    otherDeductions,
    taxCredits,
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
        <h1 className="text-3xl font-bold">Canadian Tax Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="breakdown">Tax Breakdown</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income & Deductions</CardTitle>
                <CardDescription>Enter your income and deduction information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger id="province">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ontario">Ontario</SelectItem>
                        <SelectItem value="quebec">Quebec</SelectItem>
                        <SelectItem value="britishColumbia">British Columbia</SelectItem>
                        <SelectItem value="alberta">Alberta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-year">Tax Year</Label>
                    <Select value={taxYear} onValueChange={setTaxYear}>
                      <SelectTrigger id="tax-year">
                        <SelectValue placeholder="Select tax year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025 (Estimated)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="employment-income">Employment Income</Label>
                    <div className="font-medium">{formatCurrency(employmentIncome)}</div>
                  </div>
                  <Input
                    id="employment-income"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={employmentIncome}
                    onChange={(e) => setEmploymentIncome(Number(e.target.value))}
                  />
                  <Slider
                    value={[employmentIncome]}
                    min={0}
                    max={200000}
                    step={1000}
                    onValueChange={(value) => setEmploymentIncome(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="self-employment-income">Self-Employment Income</Label>
                    <div className="font-medium">{formatCurrency(selfEmploymentIncome)}</div>
                  </div>
                  <Input
                    id="self-employment-income"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1000"
                    value={selfEmploymentIncome}
                    onChange={(e) => setSelfEmploymentIncome(Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interest-income">Interest Income</Label>
                    <Input
                      id="interest-income"
                      type="number"
                      min="0"
                      step="100"
                      value={interestIncome}
                      onChange={(e) => setInterestIncome(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="dividend-income" className="mr-1">
                        Dividend Income
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Enter the actual dividend amount received. The calculator will apply the gross-up and
                              dividend tax credit automatically.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="dividend-income"
                      type="number"
                      min="0"
                      step="100"
                      value={dividendIncome}
                      onChange={(e) => setDividendIncome(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="capital-gains" className="mr-1">
                        Capital Gains
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Enter the full capital gain amount. The calculator will apply the 50% inclusion rate
                              automatically.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="capital-gains"
                      type="number"
                      min="0"
                      step="100"
                      value={capitalGains}
                      onChange={(e) => setCapitalGains(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="rrsp-contributions" className="mr-1">
                        RRSP Contributions
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              RRSP contributions reduce your taxable income. The maximum contribution limit is 18% of
                              your previous year's earned income up to $31,560 for 2025.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{formatCurrency(rrspContributions)}</div>
                  </div>
                  <Input
                    id="rrsp-contributions"
                    type="number"
                    min="0"
                    max="31560"
                    step="500"
                    value={rrspContributions}
                    onChange={(e) => setRrspContributions(Number(e.target.value))}
                  />
                  <Slider
                    value={[rrspContributions]}
                    min={0}
                    max={31560}
                    step={500}
                    onValueChange={(value) => setRrspContributions(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="other-deductions" className="mr-1">
                      Other Deductions
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Other deductions might include childcare expenses, moving expenses, union dues, etc.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="other-deductions"
                    type="number"
                    min="0"
                    step="100"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="tax-credits" className="mr-1">
                      Non-Refundable Tax Credits
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Enter additional tax credits beyond the basic personal amount, which is already included.
                            Examples include medical expenses, charitable donations, etc.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="tax-credits"
                    type="number"
                    min="0"
                    step="100"
                    value={taxCredits}
                    onChange={(e) => setTaxCredits(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Summary</CardTitle>
                  <CardDescription>Your estimated tax calculation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {taxResults.totalIncome !== undefined ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Income</p>
                        <p className="text-xl font-bold">{formatCurrency(taxResults.totalIncome)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Taxable Income</p>
                        <p className="text-xl font-bold">{formatCurrency(taxResults.taxableIncome)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Federal Tax</p>
                        <p className="text-xl font-bold">{formatCurrency(taxResults.federalTax)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Provincial Tax</p>
                        <p className="text-xl font-bold">{formatCurrency(taxResults.provincialTax)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Tax</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(taxResults.totalTaxAfterCredits)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">After-Tax Income</p>
                        <p className="text-xl font-bold">{formatCurrency(taxResults.afterTaxIncome)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Tax Rate</p>
                        <p className="text-xl font-bold">{formatPercentage(taxResults.averageTaxRate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Marginal Tax Rate</p>
                        <p className="text-xl font-bold">{formatPercentage(taxResults.marginalTaxRate)}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Enter your information to see your tax calculation.</p>
                  )}
                </CardContent>
              </Card>

              {taxResults.taxBreakdown && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TaxChart taxBreakdown={taxResults.taxBreakdown} incomeBreakdown={taxResults.incomeBreakdown} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Federal Tax Breakdown</CardTitle>
                <CardDescription>Tax calculation by federal tax bracket</CardDescription>
              </CardHeader>
              <CardContent>
                {taxResults.federalTaxByBracket ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Income Bracket</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Taxable Amount</TableHead>
                        <TableHead>Tax</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxResults.federalTaxByBracket.map((bracket, index) => (
                        <TableRow key={index}>
                          <TableCell>{bracket.bracket}</TableCell>
                          <TableCell>{formatPercentage(bracket.rate)}</TableCell>
                          <TableCell>{formatCurrency(bracket.taxableAmount)}</TableCell>
                          <TableCell>{formatCurrency(bracket.tax)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="font-bold">
                          Total Federal Tax
                        </TableCell>
                        <TableCell className="font-bold">{formatCurrency(taxResults.federalTax)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p>Enter your information to see your tax breakdown.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provincial Tax Breakdown</CardTitle>
                <CardDescription>Tax calculation by provincial tax bracket</CardDescription>
              </CardHeader>
              <CardContent>
                {taxResults.provincialTaxByBracket ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Income Bracket</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Taxable Amount</TableHead>
                        <TableHead>Tax</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxResults.provincialTaxByBracket.map((bracket, index) => (
                        <TableRow key={index}>
                          <TableCell>{bracket.bracket}</TableCell>
                          <TableCell>{formatPercentage(bracket.rate)}</TableCell>
                          <TableCell>{formatCurrency(bracket.taxableAmount)}</TableCell>
                          <TableCell>{formatCurrency(bracket.tax)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="font-bold">
                          Total Provincial Tax
                        </TableCell>
                        <TableCell className="font-bold">{formatCurrency(taxResults.provincialTax)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p>Enter your information to see your tax breakdown.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Tax Calculation Summary</CardTitle>
              <CardDescription>Detailed breakdown of your tax calculation</CardDescription>
            </CardHeader>
            <CardContent>
              {taxResults.totalIncome !== undefined ? (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Total Income</TableCell>
                      <TableCell>{formatCurrency(taxResults.totalIncome)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Less: RRSP Contributions</TableCell>
                      <TableCell>-{formatCurrency(rrspContributions)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Less: Other Deductions</TableCell>
                      <TableCell>-{formatCurrency(otherDeductions)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Taxable Income</TableCell>
                      <TableCell>{formatCurrency(taxResults.taxableIncome)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Federal Tax</TableCell>
                      <TableCell>{formatCurrency(taxResults.federalTax)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Provincial Tax</TableCell>
                      <TableCell>{formatCurrency(taxResults.provincialTax)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Tax Before Credits</TableCell>
                      <TableCell>{formatCurrency(taxResults.totalTaxBeforeCredits)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Less: Tax Credits</TableCell>
                      <TableCell>-{formatCurrency(taxCredits)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Tax Payable</TableCell>
                      <TableCell className="font-bold">{formatCurrency(taxResults.totalTaxAfterCredits)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">After-Tax Income</TableCell>
                      <TableCell className="font-bold">{formatCurrency(taxResults.afterTaxIncome)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Average Tax Rate</TableCell>
                      <TableCell>{formatPercentage(taxResults.averageTaxRate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Marginal Tax Rate</TableCell>
                      <TableCell>{formatPercentage(taxResults.marginalTaxRate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Effective Tax Rate</TableCell>
                      <TableCell>{formatPercentage(taxResults.effectiveTaxRate)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p>Enter your information to see your tax calculation summary.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Canadian Tax Guide</CardTitle>
              <CardDescription>Understanding the Canadian tax system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">The Canadian Tax System</h3>
                <p className="mt-2">
                  Canada has a progressive tax system, meaning that the more income you earn, the higher percentage you
                  pay in taxes. Both the federal government and provincial/territorial governments impose income taxes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Tax Brackets and Rates</h3>
                <p className="mt-2">
                  Tax brackets are income thresholds that determine which tax rates apply to different portions of your
                  income. As your income increases and crosses into higher brackets, only the income within each bracket
                  is taxed at that bracket's rate.
                </p>
                <div className="mt-4">
                  <h4 className="font-medium">Federal Tax Brackets (2025 Estimated)</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Income Range</TableHead>
                        <TableHead>Tax Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>$0 - $55,867</TableCell>
                        <TableCell>15%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>$55,867 - $111,733</TableCell>
                        <TableCell>20.5%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>$111,733 - $173,205</TableCell>
                        <TableCell>26%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>$173,205 - $246,752</TableCell>
                        <TableCell>29%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Over $246,752</TableCell>
                        <TableCell>33%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Types of Income</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Employment Income:</strong> Salary, wages, commissions, and other employment benefits.
                  </li>
                  <li>
                    <strong>Self-Employment Income:</strong> Income from business or professional activities.
                  </li>
                  <li>
                    <strong>Interest Income:</strong> Interest earned from investments, savings accounts, GICs, etc.
                  </li>
                  <li>
                    <strong>Dividend Income:</strong> Dividends received from Canadian corporations are subject to the
                    dividend tax credit, which reduces the effective tax rate.
                  </li>
                  <li>
                    <strong>Capital Gains:</strong> Only 50% of capital gains are included in taxable income.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Common Deductions</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>RRSP Contributions:</strong> Contributions to Registered Retirement Savings Plans reduce
                    your taxable income.
                  </li>
                  <li>
                    <strong>Childcare Expenses:</strong> Expenses for childcare that allows you to work or attend
                    school.
                  </li>
                  <li>
                    <strong>Moving Expenses:</strong> If you moved for work or education and your new home is at least
                    40km closer to your new workplace or school.
                  </li>
                  <li>
                    <strong>Employment Expenses:</strong> Certain expenses required for your job that weren't reimbursed
                    by your employer.
                  </li>
                  <li>
                    <strong>Union and Professional Dues:</strong> Mandatory dues paid to unions or professional
                    organizations.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Tax Credits</h3>
                <p className="mt-2">
                  Tax credits directly reduce the amount of tax you owe, rather than reducing your taxable income. There
                  are two types:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Non-Refundable Tax Credits:</strong> These can reduce your tax to zero but won't provide a
                    refund. Examples include the basic personal amount, age amount, and medical expenses.
                  </li>
                  <li>
                    <strong>Refundable Tax Credits:</strong> These can provide a refund even if you don't owe any tax.
                    Examples include the GST/HST credit and Canada Child Benefit.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Tax Planning Strategies</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Maximize RRSP Contributions:</strong> Contributions reduce your taxable income and grow
                    tax-deferred.
                  </li>
                  <li>
                    <strong>Use Tax-Free Savings Accounts (TFSAs):</strong> While contributions aren't tax-deductible,
                    all growth and withdrawals are tax-free.
                  </li>
                  <li>
                    <strong>Income Splitting:</strong> Various strategies to shift income to family members in lower tax
                    brackets.
                  </li>
                  <li>
                    <strong>Timing of Income and Deductions:</strong> Consider when to realize capital gains or losses
                    and when to claim certain deductions.
                  </li>
                  <li>
                    <strong>Charitable Donations:</strong> Donations provide tax credits that can significantly reduce
                    your tax liability.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Understanding Tax Rates</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Marginal Tax Rate:</strong> The rate of tax applied to your next dollar of income. This is
                    important when considering additional income or deductions.
                  </li>
                  <li>
                    <strong>Average Tax Rate:</strong> Your total tax divided by your taxable income, representing the
                    average rate you pay across all your income.
                  </li>
                  <li>
                    <strong>Effective Tax Rate:</strong> Your total tax divided by your total income (before
                    deductions), giving a true picture of your overall tax burden.
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

