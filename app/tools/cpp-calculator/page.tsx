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
import { CPPChart } from "@/components/cpp-chart"

export default function CPPCalculatorPage() {
  const [birthYear, setBirthYear] = useState(1985)
  const [retirementAge, setRetirementAge] = useState(65)
  const [startCollectingAge, setStartCollectingAge] = useState(65)
  const [averageAnnualIncome, setAverageAnnualIncome] = useState(60000)
  const [yearsContributed, setYearsContributed] = useState(35)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [cppResults, setCppResults] = useState({})
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

  // Calculate CPP benefits
  useEffect(() => {
    // CPP constants (2025 values)
    const maxAnnualPension65 = 15678 // Maximum annual CPP retirement pension at age 65
    const ympe = 68500 // Year's Maximum Pensionable Earnings
    const ybd = 3500 // Year's Basic Exemption

    // Calculate age
    const currentAge = currentYear - birthYear
    const yearsUntilRetirement = Math.max(0, retirementAge - currentAge)

    // Calculate contribution period
    const maxContributionPeriod = 39 // Maximum number of years used in CPP calculation
    const dropoutYears = Math.floor(maxContributionPeriod * 0.17) // 17% dropout provision
    const effectiveContributionPeriod = Math.min(maxContributionPeriod - dropoutYears, yearsContributed)
    const contributionRatio = effectiveContributionPeriod / (maxContributionPeriod - dropoutYears)

    // Calculate income ratio (capped at YMPE)
    const cappedIncome = Math.min(averageAnnualIncome, ympe)
    const incomeRatio = (cappedIncome - ybd) / (ympe - ybd)

    // Calculate base CPP benefit at age 65
    const baseCppBenefit = maxAnnualPension65 * contributionRatio * incomeRatio

    // Apply early or late retirement adjustment
    let adjustmentFactor = 1.0

    if (startCollectingAge < 65) {
      // Reduction of 0.6% per month before age 65 (7.2% per year)
      const monthsEarly = (65 - startCollectingAge) * 12
      adjustmentFactor = 1.0 - 0.006 * monthsEarly
    } else if (startCollectingAge > 65) {
      // Increase of 0.7% per month after age 65 (8.4% per year)
      const monthsLate = (startCollectingAge - 65) * 12
      adjustmentFactor = 1.0 + 0.007 * monthsLate
    }

    // Calculate adjusted CPP benefit
    const adjustedCppBenefit = baseCppBenefit * adjustmentFactor

    // Calculate monthly CPP benefit
    const monthlyCppBenefit = adjustedCppBenefit / 12

    // Calculate lifetime CPP benefits (assuming life expectancy of 85)
    const yearsCollecting = 85 - startCollectingAge
    const lifetimeCppBenefits = adjustedCppBenefit * yearsCollecting

    // Calculate CPP benefits at different collection ages
    const collectionAgeOptions = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]
    const benefitsByCollectionAge = collectionAgeOptions.map((age) => {
      let ageFactor = 1.0

      if (age < 65) {
        const monthsEarly = (65 - age) * 12
        ageFactor = 1.0 - 0.006 * monthsEarly
      } else if (age > 65) {
        const monthsLate = (age - 65) * 12
        ageFactor = 1.0 + 0.007 * monthsLate
      }

      const annualBenefit = baseCppBenefit * ageFactor
      const monthlyBenefit = annualBenefit / 12
      const yearsReceiving = 85 - age
      const lifetimeBenefit = annualBenefit * yearsReceiving

      return {
        age,
        monthlyBenefit,
        annualBenefit,
        yearsReceiving,
        lifetimeBenefit,
        adjustmentFactor: ageFactor,
      }
    })

    setCppResults({
      baseCppBenefit,
      adjustedCppBenefit,
      monthlyCppBenefit,
      lifetimeCppBenefits,
      adjustmentFactor,
      yearsCollecting,
      benefitsByCollectionAge,
    })
  }, [birthYear, retirementAge, startCollectingAge, averageAnnualIncome, yearsContributed, currentYear])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">CPP Benefits Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="comparison">Collection Age Comparison</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Enter your CPP contribution details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="birth-year">Birth Year</Label>
                      <div className="font-medium">{birthYear}</div>
                    </div>
                    <Input
                      id="birth-year"
                      type="number"
                      min="1930"
                      max="2005"
                      value={birthYear}
                      onChange={(e) => setBirthYear(Number(e.target.value))}
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
                      min="55"
                      max="75"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="start-collecting-age" className="mr-1">
                        CPP Start Age
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              You can start collecting CPP as early as age 60 (with a reduction) or as late as age 70
                              (with an increase). The standard age is 65.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{startCollectingAge}</div>
                  </div>
                  <Select
                    value={startCollectingAge.toString()}
                    onValueChange={(value) => setStartCollectingAge(Number(value))}
                  >
                    <SelectTrigger id="start-collecting-age">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60 (reduced by 36%)</SelectItem>
                      <SelectItem value="61">61 (reduced by 28.8%)</SelectItem>
                      <SelectItem value="62">62 (reduced by 21.6%)</SelectItem>
                      <SelectItem value="63">63 (reduced by 14.4%)</SelectItem>
                      <SelectItem value="64">64 (reduced by 7.2%)</SelectItem>
                      <SelectItem value="65">65 (standard)</SelectItem>
                      <SelectItem value="66">66 (increased by 8.4%)</SelectItem>
                      <SelectItem value="67">67 (increased by 16.8%)</SelectItem>
                      <SelectItem value="68">68 (increased by 25.2%)</SelectItem>
                      <SelectItem value="69">69 (increased by 33.6%)</SelectItem>
                      <SelectItem value="70">70 (increased by 42%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="average-income">Average Annual Income</Label>
                    <div className="font-medium">{formatCurrency(averageAnnualIncome)}</div>
                  </div>
                  <Input
                    id="average-income"
                    type="number"
                    min="0"
                    max="200000"
                    step="1000"
                    value={averageAnnualIncome}
                    onChange={(e) => setAverageAnnualIncome(Number(e.target.value))}
                  />
                  <Slider
                    value={[averageAnnualIncome]}
                    min={0}
                    max={100000}
                    step={1000}
                    onValueChange={(value) => setAverageAnnualIncome(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="years-contributed" className="mr-1">
                        Years Contributed
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              The CPP calculation is based on your contributions from age 18 to when you start receiving
                              your pension. The CPP allows for up to 8 years of your lowest earnings to be dropped from
                              the calculation.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">{yearsContributed} years</div>
                  </div>
                  <Input
                    id="years-contributed"
                    type="number"
                    min="1"
                    max="47"
                    value={yearsContributed}
                    onChange={(e) => setYearsContributed(Number(e.target.value))}
                  />
                  <Slider
                    value={[yearsContributed]}
                    min={1}
                    max={47}
                    step={1}
                    onValueChange={(value) => setYearsContributed(value[0])}
                    className="py-4"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>CPP Benefit Estimate</CardTitle>
                  <CardDescription>Your projected Canada Pension Plan benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cppResults.monthlyCppBenefit ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly CPP Benefit</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(cppResults.monthlyCppBenefit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Annual CPP Benefit</p>
                        <p className="text-xl font-bold">{formatCurrency(cppResults.adjustedCppBenefit)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Base Benefit at Age 65</p>
                        <p className="text-xl font-bold">{formatCurrency(cppResults.baseCppBenefit)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Adjustment Factor</p>
                        <p className="text-xl font-bold">{(cppResults.adjustmentFactor * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Years Collecting (to age 85)</p>
                        <p className="text-xl font-bold">{cppResults.yearsCollecting} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lifetime CPP Benefits</p>
                        <p className="text-xl font-bold">{formatCurrency(cppResults.lifetimeCppBenefits)}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Enter your information to see your CPP benefit estimate.</p>
                  )}
                </CardContent>
              </Card>

              {cppResults.benefitsByCollectionAge && (
                <Card>
                  <CardHeader>
                    <CardTitle>Collection Age Comparison</CardTitle>
                    <CardDescription>How your start age affects your benefits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CPPChart
                      benefitsByCollectionAge={cppResults.benefitsByCollectionAge}
                      selectedAge={startCollectingAge}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>CPP Collection Age Comparison</CardTitle>
              <CardDescription>Detailed comparison of benefits at different collection ages</CardDescription>
            </CardHeader>
            <CardContent>
              {cppResults.benefitsByCollectionAge ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Collection Age</TableHead>
                      <TableHead>Adjustment</TableHead>
                      <TableHead>Monthly Benefit</TableHead>
                      <TableHead>Annual Benefit</TableHead>
                      <TableHead>Years Collecting</TableHead>
                      <TableHead>Lifetime Benefit</TableHead>
                      <TableHead>Break-Even Age</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cppResults.benefitsByCollectionAge.map((benefit) => (
                      <TableRow key={benefit.age} className={benefit.age === startCollectingAge ? "bg-muted" : ""}>
                        <TableCell className="font-medium">{benefit.age}</TableCell>
                        <TableCell>{(benefit.adjustmentFactor * 100).toFixed(1)}%</TableCell>
                        <TableCell>{formatCurrency(benefit.monthlyBenefit)}</TableCell>
                        <TableCell>{formatCurrency(benefit.annualBenefit)}</TableCell>
                        <TableCell>{benefit.yearsReceiving}</TableCell>
                        <TableCell>{formatCurrency(benefit.lifetimeBenefit)}</TableCell>
                        <TableCell>
                          {benefit.age === 65
                            ? "N/A"
                            : benefit.age < 65
                              ? `${Math.round(65 + (65 - benefit.age) / (1 - benefit.adjustmentFactor / 1.0))}`
                              : `${Math.round(65 + (benefit.age - 65) / (benefit.adjustmentFactor / 1.0 - 1))}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Enter your information to see the comparison.</p>
              )}

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">When to Start Collecting CPP</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <p className="font-medium">Early Collection (Before Age 65)</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Pros:</strong> Get money sooner, may be beneficial if you need the income immediately or
                        have health concerns.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Cons:</strong> Permanently reduced payments (0.6% reduction for each month before age
                        65, up to 36% at age 60).
                      </p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="font-medium">Standard Collection (Age 65)</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Pros:</strong> Receive the standard benefit amount without reductions or increases.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Cons:</strong> Miss out on potential increases from delaying.
                      </p>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="font-medium">Delayed Collection (After Age 65)</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Pros:</strong> Permanently increased payments (0.7% increase for each month after age
                        65, up to 42% at age 70).
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Cons:</strong> Fewer years of collecting benefits, may not be optimal if you have health
                        concerns.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Understanding Break-Even Age</h3>
                  <p className="text-muted-foreground">
                    The break-even age is when the total benefits received from delaying CPP equal the total benefits
                    you would have received by taking CPP earlier. If you live beyond the break-even age, delaying CPP
                    results in higher lifetime benefits.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    For example, if you delay CPP from age 60 to 65, the break-even age is typically around 74. If you
                    expect to live beyond 74, waiting until 65 will result in higher lifetime benefits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>CPP Guide</CardTitle>
              <CardDescription>Understanding the Canada Pension Plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">What is the CPP?</h3>
                <p className="mt-2">
                  The Canada Pension Plan (CPP) is a contributory, earnings-related social insurance program that
                  provides a basic level of earnings replacement in retirement for Canadian workers. It also provides
                  disability, survivor, and death benefits.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">CPP Contributions</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Who Contributes:</strong> All working Canadians between the ages of 18 and 70 who earn more
                    than the Year's Basic Exemption (YBE) of $3,500.
                  </li>
                  <li>
                    <strong>Contribution Rate:</strong> For 2025, the contribution rate is 5.95% for employees and
                    employers each (total of 11.9%). Self-employed individuals pay both portions (11.9%).
                  </li>
                  <li>
                    <strong>Maximum Contribution:</strong> Contributions are made on earnings between the YBE ($3,500)
                    and the Year's Maximum Pensionable Earnings (YMPE), which is $68,500 for 2025.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">CPP Retirement Benefits</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Standard Retirement Age:</strong> 65 years old.
                  </li>
                  <li>
                    <strong>Early Retirement:</strong> You can start receiving CPP as early as age 60, but your benefit
                    will be permanently reduced by 0.6% for each month you receive it before age 65 (up to a 36%
                    reduction at age 60).
                  </li>
                  <li>
                    <strong>Delayed Retirement:</strong> You can delay receiving CPP until age 70, increasing your
                    benefit by 0.7% for each month you delay after age 65 (up to a 42% increase at age 70).
                  </li>
                  <li>
                    <strong>Maximum Benefit:</strong> The maximum monthly retirement pension at age 65 is $1,306.57 for
                    2025 ($15,678.84 annually), but the average is much lower (around $750 per month).
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">How CPP Benefits Are Calculated</h3>
                <p className="mt-2">
                  CPP retirement benefits are based on how much and for how long you contributed to the plan. The
                  calculation is complex, but here are the key factors:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Contributory Period:</strong> The time from age 18 to when you start receiving your pension
                    (or age 70, whichever comes first).
                  </li>
                  <li>
                    <strong>Dropout Provision:</strong> Up to 8 years (17%) of your lowest earning years can be dropped
                    from the calculation.
                  </li>
                  <li>
                    <strong>Child-Rearing Provision:</strong> Periods of low or zero earnings while raising children
                    under 7 can be excluded from the calculation.
                  </li>
                  <li>
                    <strong>Disability Exclusion:</strong> Periods when you were eligible for CPP disability benefits
                    can be excluded.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">CPP Enhancement</h3>
                <p className="mt-2">
                  Starting in 2019, the CPP is being gradually enhanced to provide more benefits. By 2065:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>The income replacement rate will increase from 25% to 33.33% of eligible earnings.</li>
                  <li>The maximum pensionable earnings will increase by 14%.</li>
                  <li>Contribution rates will gradually increase to fund these enhancements.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">CPP and Other Retirement Income</h3>
                <p className="mt-2">CPP is just one part of Canada's retirement income system, which also includes:</p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Old Age Security (OAS):</strong> A basic pension available to most Canadians aged 65 and
                    over.
                  </li>
                  <li>
                    <strong>Guaranteed Income Supplement (GIS):</strong> Additional support for low-income OAS
                    recipients.
                  </li>
                  <li>
                    <strong>Workplace Pensions:</strong> Defined benefit or defined contribution plans provided by
                    employers.
                  </li>
                  <li>
                    <strong>Personal Savings:</strong> RRSPs, TFSAs, and other personal investments.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">CPP Tips</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Check Your CPP Statement:</strong> Review your CPP Statement of Contributions regularly to
                    ensure your earnings record is accurate.
                  </li>
                  <li>
                    <strong>Consider Your Health and Longevity:</strong> If you expect to live well into your 80s or
                    beyond, delaying CPP can result in higher lifetime benefits.
                  </li>
                  <li>
                    <strong>Coordinate with Other Income Sources:</strong> Consider how CPP fits with your other
                    retirement income sources and tax situation.
                  </li>
                  <li>
                    <strong>Post-Retirement Benefits:</strong> If you continue working while receiving CPP, you'll
                    continue to contribute to the CPP and earn Post-Retirement Benefits (PRBs).
                  </li>
                  <li>
                    <strong>Pension Sharing:</strong> Spouses or common-law partners can share their CPP retirement
                    pensions, which may result in tax savings.
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

