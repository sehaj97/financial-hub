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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FHSAChart } from "@/components/fhsa-chart"

export default function FHSACalculatorPage() {
  const [currentAge, setCurrentAge] = useState(30)
  const [annualIncome, setAnnualIncome] = useState(80000)
  const [marginalTaxRate, setMarginalTaxRate] = useState(30)
  const [currentFHSA, setCurrentFHSA] = useState(0)
  const [annualContribution, setAnnualContribution] = useState(8000)
  const [expectedReturn, setExpectedReturn] = useState(5)
  const [inflationRate, setInflationRate] = useState(2)
  const [targetHomePrice, setTargetHomePrice] = useState(500000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [fhsaResults, setFhsaResults] = useState({})
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

  // Calculate FHSA growth and benefits
  useEffect(() => {
    // FHSA lifetime contribution limit
    const lifetimeLimit = 40000

    // FHSA annual contribution limit
    const annualLimit = 8000

    // Calculate adjusted annual contribution (respecting limits)
    const adjustedAnnualContribution = Math.min(annualContribution, annualLimit, lifetimeLimit - currentFHSA)

    // Calculate years to reach lifetime limit
    const yearsToLimit = Math.ceil((lifetimeLimit - currentFHSA) / adjustedAnnualContribution)

    // Calculate target down payment
    const targetDownPayment = targetHomePrice * (downPaymentPercent / 100)

    // Calculate FHSA growth
    let fhsaBalance = currentFHSA
    let totalContributions = currentFHSA
    let totalTaxSavings = 0
    const yearlyData = []
    const maxYears = 15 // FHSA must be used within 15 years of opening

    for (let year = 1; year <= Math.min(yearsToLimit, maxYears); year++) {
      // Add annual contribution if we haven't reached the lifetime limit
      if (totalContributions < lifetimeLimit) {
        const yearContribution = Math.min(adjustedAnnualContribution, lifetimeLimit - totalContributions)

        fhsaBalance += yearContribution
        totalContributions += yearContribution

        // Calculate tax savings for this year's contribution
        const taxSavings = yearContribution * (marginalTaxRate / 100)
        totalTaxSavings += taxSavings
      }

      // Apply investment return
      const investmentReturn = fhsaBalance * (expectedReturn / 100)
      fhsaBalance += investmentReturn

      // Record yearly data
      yearlyData.push({
        year,
        age: currentAge + year,
        contribution:
          totalContributions < lifetimeLimit
            ? Math.min(
                adjustedAnnualContribution,
                lifetimeLimit -
                  (totalContributions - (yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].contribution : 0)),
              )
            : 0,
        balance: fhsaBalance,
        totalContributions,
        taxSavings: totalTaxSavings,
        investmentReturn,
      })

      // Stop if we've reached the lifetime limit and completed a full year after
      if (totalContributions >= lifetimeLimit && year > yearsToLimit) {
        break
      }
    }

    // Calculate years to reach down payment target
    let yearsToDownPayment = 0
    for (const data of yearlyData) {
      if (data.balance >= targetDownPayment) {
        yearsToDownPayment = data.year
        break
      }
    }

    // If we never reach the target down payment within the calculated years
    if (yearsToDownPayment === 0 && yearlyData.length > 0) {
      yearsToDownPayment = "15+"
    }

    // Calculate inflation-adjusted values
    const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToLimit)
    const inflationAdjustedBalance = fhsaBalance / inflationFactor

    // Calculate percentage of down payment achieved
    const downPaymentPercentAchieved = Math.min(100, (fhsaBalance / targetDownPayment) * 100)

    // Calculate additional savings needed outside FHSA
    const additionalSavingsNeeded = Math.max(0, targetDownPayment - fhsaBalance)

    setFhsaResults({
      adjustedAnnualContribution,
      yearsToLimit,
      finalBalance: fhsaBalance,
      totalContributions,
      totalTaxSavings,
      inflationAdjustedBalance,
      targetDownPayment,
      downPaymentPercentAchieved,
      additionalSavingsNeeded,
      yearsToDownPayment,
      yearlyData,
    })
  }, [
    currentAge,
    annualIncome,
    marginalTaxRate,
    currentFHSA,
    annualContribution,
    expectedReturn,
    inflationRate,
    targetHomePrice,
    downPaymentPercent,
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
        <h1 className="text-3xl font-bold">First Home Savings Account (FHSA) Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="comparison">FHSA vs Alternatives</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>FHSA Details</CardTitle>
                <CardDescription>Enter your FHSA information</CardDescription>
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
                      max="71"
                      value={currentAge}
                      onChange={(e) => setCurrentAge(Number(e.target.value))}
                    />
                  </div>

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
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="marginal-tax-rate" className="mr-1">
                        Marginal Tax Rate (%)
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Your marginal tax rate is the tax rate you pay on your last dollar of income. FHSA
                              contributions provide a tax deduction at this rate.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{marginalTaxRate}%</div>
                  </div>
                  <Input
                    id="marginal-tax-rate"
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    value={marginalTaxRate}
                    onChange={(e) => setMarginalTaxRate(Number(e.target.value))}
                  />
                  <Slider
                    value={[marginalTaxRate]}
                    min={15}
                    max={54}
                    step={1}
                    onValueChange={(value) => setMarginalTaxRate(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="current-fhsa">Current FHSA Balance</Label>
                    <div className="font-medium">{formatCurrency(currentFHSA)}</div>
                  </div>
                  <Input
                    id="current-fhsa"
                    type="number"
                    min="0"
                    max="40000"
                    step="1000"
                    value={currentFHSA}
                    onChange={(e) => setCurrentFHSA(Number(e.target.value))}
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
                              The annual contribution limit for an FHSA is $8,000, with a lifetime limit of $40,000.
                              Unused contribution room can be carried forward to the next year.
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
                    max="8000"
                    step="500"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(Number(e.target.value))}
                  />
                  <Slider
                    value={[annualContribution]}
                    min={0}
                    max={8000}
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="target-home-price">Target Home Price</Label>
                    <div className="font-medium">{formatCurrency(targetHomePrice)}</div>
                  </div>
                  <Input
                    id="target-home-price"
                    type="number"
                    min="100000"
                    max="2000000"
                    step="10000"
                    value={targetHomePrice}
                    onChange={(e) => setTargetHomePrice(Number(e.target.value))}
                  />
                  <Slider
                    value={[targetHomePrice]}
                    min={100000}
                    max={1000000}
                    step={10000}
                    onValueChange={(value) => setTargetHomePrice(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="down-payment-percent" className="mr-1">
                        Down Payment (%)
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
                              remainder. For homes $1 million or more, a minimum 20% down payment is required.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{downPaymentPercent}%</div>
                  </div>
                  <Slider
                    value={[downPaymentPercent]}
                    min={5}
                    max={20}
                    step={1}
                    onValueChange={(value) => setDownPaymentPercent(value[0])}
                    className="py-4"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>FHSA Summary</CardTitle>
                  <CardDescription>Your projected FHSA growth and benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {fhsaResults.finalBalance ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">FHSA Balance</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(fhsaResults.finalBalance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Contributions</p>
                        <p className="text-xl font-bold">{formatCurrency(fhsaResults.totalContributions)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tax Savings</p>
                        <p className="text-xl font-bold">{formatCurrency(fhsaResults.totalTaxSavings)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Investment Growth</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(fhsaResults.finalBalance - fhsaResults.totalContributions)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Years to Max FHSA</p>
                        <p className="text-xl font-bold">{fhsaResults.yearsToLimit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Inflation-Adjusted Value</p>
                        <p className="text-xl font-bold">{formatCurrency(fhsaResults.inflationAdjustedBalance)}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Enter your information to see your FHSA projections.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Down Payment Progress</CardTitle>
                  <CardDescription>FHSA contribution toward your home purchase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fhsaResults.targetDownPayment ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Target Down Payment</p>
                          <p className="text-xl font-bold">{formatCurrency(fhsaResults.targetDownPayment)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Years to Target</p>
                          <p className="text-xl font-bold">{fhsaResults.yearsToDownPayment}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Down Payment Progress</p>
                          <p className="text-sm font-medium">{fhsaResults.downPaymentPercentAchieved.toFixed(1)}%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${fhsaResults.downPaymentPercentAchieved}%` }}
                          ></div>
                        </div>
                      </div>

                      {fhsaResults.additionalSavingsNeeded > 0 && (
                        <div className="rounded-lg border bg-muted p-4 mt-4">
                          <p className="font-medium">Additional Savings Needed</p>
                          <p className="text-xl font-bold text-primary mt-1">
                            {formatCurrency(fhsaResults.additionalSavingsNeeded)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Consider saving this amount in a TFSA or other account to reach your full down payment goal.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>Enter your information to see your down payment progress.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {fhsaResults.yearlyData && (
            <Card>
              <CardHeader>
                <CardTitle>FHSA Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <FHSAChart yearlyData={fhsaResults.yearlyData} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>FHSA vs Other Savings Options</CardTitle>
              <CardDescription>Comparing the FHSA to other ways to save for a home</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Feature</TableHead>
                      <TableHead>FHSA</TableHead>
                      <TableHead>RRSP Home Buyers' Plan</TableHead>
                      <TableHead>TFSA</TableHead>
                      <TableHead>Non-Registered Account</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Tax Treatment of Contributions</TableCell>
                      <TableCell>Tax-deductible (reduces taxable income)</TableCell>
                      <TableCell>Tax-deductible (reduces taxable income)</TableCell>
                      <TableCell>Not tax-deductible (contributed with after-tax dollars)</TableCell>
                      <TableCell>Not tax-deductible (contributed with after-tax dollars)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tax Treatment of Withdrawals</TableCell>
                      <TableCell>Tax-free when used for eligible first home purchase</TableCell>
                      <TableCell>Tax-free loan from your RRSP that must be repaid</TableCell>
                      <TableCell>Tax-free</TableCell>
                      <TableCell>No additional tax on principal; gains are taxable</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Contribution Limits</TableCell>
                      <TableCell>$8,000 annually, $40,000 lifetime</TableCell>
                      <TableCell>Up to $35,000 withdrawal limit</TableCell>
                      <TableCell>$7,000 annual limit (2025) + unused room</TableCell>
                      <TableCell>No limit</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Repayment Requirements</TableCell>
                      <TableCell>None</TableCell>
                      <TableCell>Must repay over 15 years or face tax consequences</TableCell>
                      <TableCell>None</TableCell>
                      <TableCell>None</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Time Restrictions</TableCell>
                      <TableCell>Must be used within 15 years of opening or converted to RRSP</TableCell>
                      <TableCell>Must be a first-time home buyer (not owned in last 4 years)</TableCell>
                      <TableCell>No restrictions</TableCell>
                      <TableCell>No restrictions</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Key Advantage</TableCell>
                      <TableCell>Combines tax deduction of RRSP with tax-free withdrawal of TFSA</TableCell>
                      <TableCell>Access to larger existing RRSP savings</TableCell>
                      <TableCell>Flexibility for any purpose, not just home buying</TableCell>
                      <TableCell>No contribution limits, full liquidity</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">FHSA Advantages</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Tax deduction for contributions (like an RRSP)</li>
                    <li>Tax-free growth and withdrawals for home purchase (like a TFSA)</li>
                    <li>No repayment required (unlike the RRSP Home Buyers' Plan)</li>
                    <li>Can be converted to an RRSP if not used for home purchase (maintaining tax-deferred status)</li>
                    <li>Contribution room carries forward (unused portion of $8,000 annual limit)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">FHSA Limitations</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Only available to first-time home buyers (haven't owned a home in current year or previous 4
                      calendar years)
                    </li>
                    <li>Limited to $40,000 lifetime contributions</li>
                    <li>Must be used within 15 years of opening the account</li>
                    <li>Must be closed in the year after first withdrawal for home purchase</li>
                    <li>Age limit: Cannot contribute after the year you turn 71</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Optimal Strategy</h3>
                  <p className="text-muted-foreground mb-4">
                    For most first-time home buyers in Canada, the optimal strategy is:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Maximize FHSA contributions first ($8,000/year up to $40,000 lifetime)</li>
                    <li>Use TFSA for additional savings beyond FHSA limits</li>
                    <li>Consider RRSP Home Buyers' Plan as a supplement if more funds are needed</li>
                    <li>Use non-registered accounts only after maximizing tax-advantaged options</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>FHSA Guide</CardTitle>
              <CardDescription>Understanding the First Home Savings Account in Canada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">What is an FHSA?</h3>
                <p className="mt-2">
                  The First Home Savings Account (FHSA) is a registered account introduced in Canada in 2023 to help
                  Canadians save for their first home. It combines the tax advantages of both RRSPs and TFSAs:
                  contributions are tax-deductible (like an RRSP) and withdrawals for eligible home purchases are
                  tax-free (like a TFSA).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">FHSA Eligibility</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Must be a Canadian resident</li>
                  <li>Must be at least 18 years old</li>
                  <li>
                    Must be a first-time home buyer (haven't owned a home in the current year or previous four calendar
                    years)
                  </li>
                  <li>Cannot contribute after December 31 of the year you turn 71</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">FHSA Contribution Limits</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Annual Limit:</strong> $8,000 per year
                  </li>
                  <li>
                    <strong>Lifetime Limit:</strong> $40,000 total
                  </li>
                  <li>
                    <strong>Carry Forward:</strong> Unused annual contribution room can be carried forward to the next
                    year (up to the lifetime limit)
                  </li>
                  <li>
                    <strong>No Spousal Contributions:</strong> Unlike RRSPs, there are no spousal FHSAs
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">FHSA Time Limits</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>The account must be closed by December 31 of the 15th year after it was opened</li>
                  <li>The account must be closed by December 31 of the year after the first qualifying withdrawal</li>
                  <li>
                    If not used for a home purchase, the FHSA can be transferred to an RRSP or RRIF without affecting
                    RRSP contribution room
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Qualifying Home Purchase</h3>
                <p className="mt-2">To use FHSA funds for a home purchase, the following conditions must be met:</p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>The property must be located in Canada</li>
                  <li>You must intend to occupy the home as your principal residence within one year of purchase</li>
                  <li>You must be a first-time home buyer at the time of withdrawal</li>
                  <li>You must have a written agreement to buy or build a qualifying home</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">FHSA Investment Options</h3>
                <p className="mt-2">FHSAs can hold the same types of investments as TFSAs and RRSPs, including:</p>
                <ul className="list-disc pl-6 pt-1 space-y-1">
                  <li>Cash and GICs</li>
                  <li>Bonds and bond ETFs</li>
                  <li>Stocks and equity ETFs</li>
                  <li>Mutual funds</li>
                  <li>Certain alternative investments</li>
                </ul>
                <p className="mt-2">
                  Your investment mix should be based on your time horizon for home purchase, risk tolerance, and
                  financial goals.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Tax Implications</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Contributions:</strong> Tax-deductible in the year they are made or carried forward to
                    future tax years
                  </li>
                  <li>
                    <strong>Growth:</strong> All interest, dividends, and capital gains grow tax-free within the account
                  </li>
                  <li>
                    <strong>Qualifying Withdrawals:</strong> Tax-free when used for an eligible first home purchase
                  </li>
                  <li>
                    <strong>Non-Qualifying Withdrawals:</strong> Fully taxable as income (unless transferred to an RRSP
                    or RRIF)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">FHSA Tips</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Open an FHSA as early as possible to maximize the tax-free growth period</li>
                  <li>Consider front-loading contributions if you have the means (up to $8,000 per year)</li>
                  <li>Adjust your investment strategy based on your home purchase timeline</li>
                  <li>For purchases within 1-3 years: Focus on safety with GICs and high-interest savings</li>
                  <li>
                    For purchases in 3-5 years: Consider a balanced approach with some fixed income and some equities
                  </li>
                  <li>For purchases beyond 5 years: You may consider a more growth-oriented portfolio</li>
                  <li>
                    If you already have a TFSA, consider whether transferring some funds to an FHSA makes sense for the
                    tax deduction
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">FHSA vs. HBP</h3>
                <p className="mt-2">The FHSA offers several advantages over the RRSP Home Buyers' Plan (HBP):</p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>No repayment required (HBP requires repayment over 15 years)</li>
                  <li>Withdrawals are completely tax-free (HBP withdrawals must be repaid or become taxable)</li>
                  <li>More flexibility if plans change (can be converted to RRSP)</li>
                </ul>
                <p className="mt-2">
                  However, the HBP allows access to existing RRSP savings and has a higher withdrawal limit ($35,000 vs.
                  FHSA's $40,000 lifetime contribution limit).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

