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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InflationChart } from "@/components/inflation-chart"

export default function InflationCalculatorPage() {
  const [amount, setAmount] = useState(1000)
  const [startYear, setStartYear] = useState(2000)
  const [endYear, setEndYear] = useState(2025)
  const [customInflationRate, setCustomInflationRate] = useState(2)
  const [useHistoricalRates, setUseHistoricalRates] = useState(true)
  const [inflationResults, setInflationResults] = useState({})
  const [activeTab, setActiveTab] = useState("calculator")

  // Historical Canadian inflation rates (approximate annual rates)
  const historicalInflationRates = {
    1980: 10.2,
    1981: 12.5,
    1982: 10.8,
    1983: 5.8,
    1984: 4.3,
    1985: 4.0,
    1986: 4.2,
    1987: 4.4,
    1988: 4.0,
    1989: 5.0,
    1990: 4.8,
    1991: 5.6,
    1992: 1.5,
    1993: 1.8,
    1994: 0.2,
    1995: 2.1,
    1996: 1.6,
    1997: 1.6,
    1998: 1.0,
    1999: 1.7,
    2000: 2.7,
    2001: 2.5,
    2002: 2.3,
    2003: 2.8,
    2004: 1.9,
    2005: 2.2,
    2006: 2.0,
    2007: 2.1,
    2008: 2.4,
    2009: 0.3,
    2010: 1.8,
    2011: 2.9,
    2012: 1.5,
    2013: 0.9,
    2014: 2.0,
    2015: 1.1,
    2016: 1.4,
    2017: 1.6,
    2018: 2.3,
    2019: 1.9,
    2020: 0.7,
    2021: 3.4,
    2022: 6.8,
    2023: 3.9,
    2024: 2.8,
    2025: 2.0,
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

  // Calculate inflation
  useEffect(() => {
    if (startYear > endYear) {
      setEndYear(startYear)
      return
    }

    // Calculate inflation-adjusted value
    let adjustedValue = amount
    const yearlyData = []
    let cumulativeInflation = 0

    for (let year = startYear; year <= endYear; year++) {
      const previousValue = adjustedValue

      // Get inflation rate for this year
      let inflationRate = customInflationRate
      if (useHistoricalRates && historicalInflationRates[year]) {
        inflationRate = historicalInflationRates[year]
      }

      // Apply inflation
      adjustedValue *= 1 + inflationRate / 100

      // Calculate cumulative inflation
      cumulativeInflation = (adjustedValue / amount - 1) * 100

      // Record yearly data
      yearlyData.push({
        year,
        value: adjustedValue,
        inflationRate,
        yearlyChange: adjustedValue - previousValue,
        cumulativeInflation,
      })
    }

    // Calculate average annual inflation rate
    const years = endYear - startYear
    const averageAnnualInflation =
      years > 0 ? yearlyData.reduce((sum, data) => sum + data.inflationRate, 0) / years : customInflationRate

    // Calculate purchasing power loss
    const purchasingPowerLoss = ((amount - (amount * 100) / (100 + cumulativeInflation)) / amount) * 100

    setInflationResults({
      startValue: amount,
      endValue: adjustedValue,
      cumulativeInflation,
      purchasingPowerLoss,
      averageAnnualInflation,
      yearlyData,
    })
  }, [amount, startYear, endYear, customInflationRate, useHistoricalRates])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Inflation Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inflation Details</CardTitle>
                <CardDescription>Calculate the effects of inflation over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="font-medium">{formatCurrency(amount)}</div>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max="1000000"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                  <Slider
                    value={[amount]}
                    min={100}
                    max={10000}
                    step={100}
                    onValueChange={(value) => setAmount(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-year">Start Year</Label>
                    <Select value={startYear.toString()} onValueChange={(value) => setStartYear(Number(value))}>
                      <SelectTrigger id="start-year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(historicalInflationRates).map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-year">End Year</Label>
                    <Select
                      value={endYear.toString()}
                      onValueChange={(value) => setEndYear(Number(value))}
                      disabled={startYear >= 2025}
                    >
                      <SelectTrigger id="end-year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(historicalInflationRates)
                          .filter((year) => Number(year) >= startYear)
                          .map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use-historical"
                    checked={useHistoricalRates}
                    onChange={(e) => setUseHistoricalRates(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="use-historical">Use historical Canadian inflation rates</Label>
                </div>

                {!useHistoricalRates && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Label htmlFor="custom-inflation-rate" className="mr-1">
                          Custom Inflation Rate (%)
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                The Bank of Canada aims to keep inflation at 2%, which is the target rate for monetary
                                policy.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="font-medium">{customInflationRate}%</div>
                    </div>
                    <Input
                      id="custom-inflation-rate"
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={customInflationRate}
                      onChange={(e) => setCustomInflationRate(Number(e.target.value))}
                    />
                    <Slider
                      value={[customInflationRate]}
                      min={0}
                      max={10}
                      step={0.1}
                      onValueChange={(value) => setCustomInflationRate(value[0])}
                      className="py-4"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inflation Results</CardTitle>
                  <CardDescription>The impact of inflation on your money</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {inflationResults.endValue ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Value in {startYear}</p>
                        <p className="text-xl font-bold">{formatCurrency(inflationResults.startValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Value in {endYear}</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(inflationResults.endValue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cumulative Inflation</p>
                        <p className="text-xl font-bold">{inflationResults.cumulativeInflation.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Purchasing Power Loss</p>
                        <p className="text-xl font-bold">{inflationResults.purchasingPowerLoss.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Annual Inflation</p>
                        <p className="text-xl font-bold">{inflationResults.averageAnnualInflation.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Years</p>
                        <p className="text-xl font-bold">{endYear - startYear}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Enter your information to see inflation results.</p>
                  )}
                </CardContent>
              </Card>

              {inflationResults.yearlyData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Inflation Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InflationChart yearlyData={inflationResults.yearlyData} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historical">
          <Card>
            <CardHeader>
              <CardTitle>Historical Canadian Inflation Rates</CardTitle>
              <CardDescription>Annual inflation rates in Canada from 1980 to 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Inflation Rate (%)</TableHead>
                      <TableHead>$1,000 Value</TableHead>
                      <TableHead>Cumulative Since 1980</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(historicalInflationRates).map(([year, rate], index, array) => {
                      // Calculate cumulative inflation since 1980
                      let cumulativeValue = 1000
                      for (let i = 0; i <= index; i++) {
                        const [yearI, rateI] = array[i]
                        cumulativeValue *= 1 + rateI / 100
                      }

                      // Calculate value of $1,000 after this year's inflation
                      const yearValue = 1000 * (1 + rate / 100)

                      return (
                        <TableRow key={year}>
                          <TableCell>{year}</TableCell>
                          <TableCell>{rate.toFixed(1)}%</TableCell>
                          <TableCell>{formatCurrency(yearValue)}</TableCell>
                          <TableCell>{formatCurrency(cumulativeValue)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Understanding Inflation</CardTitle>
              <CardDescription>A guide to inflation and its impact on your finances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">What is Inflation?</h3>
                <p className="mt-2">
                  Inflation is the rate at which the general level of prices for goods and services rises, causing
                  purchasing power to fall over time. In other words, as inflation increases, every dollar you own buys
                  a smaller percentage of goods or services.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">How Inflation is Measured in Canada</h3>
                <p className="mt-2">
                  In Canada, inflation is primarily measured by the Consumer Price Index (CPI), which tracks the price
                  changes of a fixed basket of goods and services over time. This basket includes:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Food (groceries and restaurant meals)</li>
                  <li>Shelter (rent, mortgage interest, property taxes)</li>
                  <li>Transportation (vehicles, gas, public transit)</li>
                  <li>Household operations and furnishings</li>
                  <li>Clothing and footwear</li>
                  <li>Health and personal care</li>
                  <li>Recreation, education, and reading</li>
                  <li>Alcoholic beverages and tobacco products</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Inflation in Canada: Historical Context</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>1970s-1980s:</strong> Period of high inflation, peaking at over 12% in 1981 during what
                    economists call the "Great Inflation."
                  </li>
                  <li>
                    <strong>1991:</strong> The Bank of Canada adopted an inflation-targeting framework with a 2% target
                    (within a 1-3% control range).
                  </li>
                  <li>
                    <strong>1990s-2010s:</strong> Generally stable inflation around the 2% target.
                  </li>
                  <li>
                    <strong>2020-2022:</strong> COVID-19 pandemic and supply chain disruptions led to higher inflation,
                    peaking at 8.1% in June 2022.
                  </li>
                  <li>
                    <strong>2023-2025:</strong> Gradual return toward the 2% target as monetary policy tightening takes
                    effect.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">The Impact of Inflation on Your Finances</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Cash and Savings:</strong> Inflation erodes the purchasing power of cash and low-interest
                    savings accounts.
                  </li>
                  <li>
                    <strong>Fixed Income:</strong> Bonds and GICs with fixed interest rates may not keep pace with
                    inflation.
                  </li>
                  <li>
                    <strong>Debt:</strong> Inflation can benefit borrowers with fixed-rate loans as they repay with
                    "cheaper" dollars over time.
                  </li>
                  <li>
                    <strong>Investments:</strong> Certain assets like stocks, real estate, and inflation-protected
                    securities may provide a hedge against inflation.
                  </li>
                  <li>
                    <strong>Retirement Planning:</strong> Long-term retirement plans need to account for the cumulative
                    effects of inflation.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">The Rule of 72</h3>
                <p className="mt-2">
                  The "Rule of 72" is a simple way to estimate how long it will take for prices to double at a given
                  inflation rate:
                </p>
                <p className="mt-1">
                  <strong>Years to double = 72 ÷ Inflation Rate</strong>
                </p>
                <p className="mt-1">
                  For example, at 2% inflation, prices will double in approximately 36 years (72 ÷ 2 = 36).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Protecting Your Money from Inflation</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Invest in Growth Assets:</strong> Stocks have historically outpaced inflation over the long
                    term.
                  </li>
                  <li>
                    <strong>Real Estate:</strong> Property values and rents tend to rise with inflation.
                  </li>
                  <li>
                    <strong>Inflation-Protected Securities:</strong> Real Return Bonds in Canada are indexed to
                    inflation.
                  </li>
                  <li>
                    <strong>Diversification:</strong> Spread investments across different asset classes that respond
                    differently to inflation.
                  </li>
                  <li>
                    <strong>Regular Income Adjustments:</strong> Seek regular salary increases that at least match the
                    inflation rate.
                  </li>
                  <li>
                    <strong>Tax-Advantaged Accounts:</strong> Use TFSAs and RRSPs to maximize after-tax returns.
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

