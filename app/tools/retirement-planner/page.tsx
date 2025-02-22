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
import { RetirementChart } from "@/components/retirement-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RetirementPlannerPage() {
  const [currentAge, setCurrentAge] = useState(35)
  const [retirementAge, setRetirementAge] = useState(65)
  const [lifeExpectancy, setLifeExpectancy] = useState(90)
  const [currentIncome, setCurrentIncome] = useState(80000)
  const [desiredIncomePercent, setDesiredIncomePercent] = useState(70)
  const [currentSavings, setCurrentSavings] = useState({
    rrsp: 50000,
    tfsa: 25000,
    nonRegistered: 15000,
    pension: 100000,
  })
  const [annualContributions, setAnnualContributions] = useState({
    rrsp: 6000,
    tfsa: 6000,
    nonRegistered: 2000,
  })
  const [expectedReturns, setExpectedReturns] = useState({
    preRetirement: 6,
    postRetirement: 4,
  })
  const [inflationRate, setInflationRate] = useState(2)
  const [cppStartAge, setCppStartAge] = useState(65)
  const [oasStartAge, setOasStartAge] = useState(65)
  const [cppBenefit, setCppBenefit] = useState(1000)
  const [oasBenefit, setOasBenefit] = useState(700)
  const [retirementResults, setRetirementResults] = useState({})
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

  // Calculate retirement plan
  useEffect(
    () => {
      const yearsToRetirement = retirementAge - currentAge
      const yearsInRetirement = lifeExpectancy - retirementAge

      if (yearsToRetirement < 0 || yearsInRetirement < 0) return

      // Calculate desired retirement income
      const desiredMonthlyIncome = (currentIncome * desiredIncomePercent) / 100 / 12
      const desiredAnnualIncome = (currentIncome * desiredIncomePercent) / 100

      // Calculate total current savings
      const totalCurrentSavings =
        currentSavings.rrsp + currentSavings.tfsa + currentSavings.nonRegistered + currentSavings.pension

      // Calculate total annual contributions
      const totalAnnualContributions =
        annualContributions.rrsp + annualContributions.tfsa + annualContributions.nonRegistered

      // Calculate future value of savings at retirement
      const preRetirementReturn = expectedReturns.preRetirement / 100

      let rrspFutureValue = currentSavings.rrsp
      let tfsaFutureValue = currentSavings.tfsa
      let nonRegisteredFutureValue = currentSavings.nonRegistered
      let pensionFutureValue = currentSavings.pension

      for (let year = 1; year <= yearsToRetirement; year++) {
        // Add annual contributions
        rrspFutureValue += annualContributions.rrsp
        tfsaFutureValue += annualContributions.tfsa
        nonRegisteredFutureValue += annualContributions.nonRegistered

        // Apply investment returns
        rrspFutureValue *= 1 + preRetirementReturn
        tfsaFutureValue *= 1 + preRetirementReturn
        nonRegisteredFutureValue *= 1 + preRetirementReturn
        pensionFutureValue *= 1 + preRetirementReturn
      }

      // Calculate total savings at retirement
      const totalSavingsAtRetirement = rrspFutureValue + tfsaFutureValue + nonRegisteredFutureValue + pensionFutureValue

      // Calculate government benefits
      const yearsUntilCpp = Math.max(0, cppStartAge - retirementAge)
      const yearsUntilOas = Math.max(0, oasStartAge - retirementAge)

      // Calculate sustainable withdrawal
      const postRetirementReturn = expectedReturns.postRetirement / 100
      const inflationFactor = 1 + inflationRate / 100

      // Simulate retirement income year by year
      const yearlyRetirementData = []
      let remainingSavings = totalSavingsAtRetirement
      let totalRetirementIncome = 0
      let shortfallYears = 0

      for (let year = 1; year <= yearsInRetirement; year++) {
        const age = retirementAge + year - 1

        // Calculate government benefits for this year
        const cppForYear = age >= cppStartAge ? cppBenefit * 12 : 0
        const oasForYear = age >= oasStartAge ? oasBenefit * 12 : 0
        const govtBenefits = cppForYear + oasForYear

        // Calculate required withdrawal from savings
        const inflationAdjustedIncome = desiredAnnualIncome * Math.pow(inflationFactor, year - 1)
        const requiredWithdrawal = Math.max(0, inflationAdjustedIncome - govtBenefits)

        // Check if we have enough savings
        const actualWithdrawal = Math.min(requiredWithdrawal, remainingSavings)
        if (actualWithdrawal < requiredWithdrawal) {
          shortfallYears++
        }

        // Update remaining savings
        remainingSavings -= actualWithdrawal
        remainingSavings *= 1 + postRetirementReturn

        // Calculate total income for this year
        const totalIncomeForYear = actualWithdrawal + govtBenefits
        totalRetirementIncome += totalIncomeForYear

        // Record data for this year
        yearlyRetirementData.push({
          age,
          year,
          savings: remainingSavings,
          withdrawal: actualWithdrawal,
          cpp: cppForYear,
          oas: oasForYear,
          totalIncome: totalIncomeForYear,
          desiredIncome: inflationAdjustedIncome,
        })
      }

      // Calculate average annual retirement income
      const averageAnnualIncome = totalRetirementIncome / yearsInRetirement

      // Calculate retirement readiness
      const retirementReadiness =
        remainingSavings > 0 && shortfallYears === 0
          ? 100
          : shortfallYears === 0
            ? 90
            : shortfallYears < yearsInRetirement / 4
              ? 75
              : shortfallYears < yearsInRetirement / 2
                ? 50
                : shortfallYears < (yearsInRetirement * 3) / 4
                  ? 25
                  : 10

      // Calculate additional savings needed
      const additionalMonthlySavings =
        shortfallYears > 0
          ? ((desiredAnnualIncome * yearsInRetirement - totalRetirementIncome) / (yearsToRetirement * 12)) * 0.8
          : 0

      setRetirementResults({
        desiredMonthlyIncome,
        desiredAnnualIncome,
        totalCurrentSavings,
        totalAnnualContributions,
        totalSavingsAtRetirement,
        rrspFutureValue,
        tfsaFutureValue,
        nonRegisteredFutureValue,
        pensionFutureValue,
        averageAnnualIncome,
        retirementReadiness,
        additionalMonthlySavings,
        shortfallYears,
        yearlyRetirementData,
      })
    },
    [
    currentAge, retirementAge, lifeExpectancy, currentIncome, desiredIncomePercent,
    currentSavings, annualContributions, expectedReturns\
    currentIncome, desiredIncomePercent,
    currentSavings, annualContributions, expectedReturns, inflationRate,
    cppStartAge, oasStartAge, cppBenefit, oasBenefit
  ],
  )

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Retirement Planner</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="income">Income Breakdown</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Enter your retirement planning details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="life-expectancy">Life Expectancy</Label>
                      <div className="font-medium">{lifeExpectancy}</div>
                    </div>
                    <Input
                      id="life-expectancy"
                      type="number"
                      min={retirementAge + 1}
                      max="120"
                      value={lifeExpectancy}
                      onChange={(e) => setLifeExpectancy(Number(e.target.value))}
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="desired-income" className="mr-1">
                        Desired Retirement Income
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Financial experts typically recommend aiming for 70-80% of your pre-retirement income to
                              maintain your standard of living in retirement.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-medium">
                      {desiredIncomePercent}% ({formatCurrency((currentIncome * desiredIncomePercent) / 100)})
                    </div>
                  </div>
                  <Slider
                    value={[desiredIncomePercent]}
                    min={40}
                    max={100}
                    step={1}
                    onValueChange={(value) => setDesiredIncomePercent(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Current Savings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-rrsp">RRSP</Label>
                      <Input
                        id="current-rrsp"
                        type="number"
                        min="0"
                        step="1000"
                        value={currentSavings.rrsp}
                        onChange={(e) => setCurrentSavings({ ...currentSavings, rrsp: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-tfsa">TFSA</Label>
                      <Input
                        id="current-tfsa"
                        type="number"
                        min="0"
                        step="1000"
                        value={currentSavings.tfsa}
                        onChange={(e) => setCurrentSavings({ ...currentSavings, tfsa: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-non-registered">Non-Registered</Label>
                      <Input
                        id="current-non-registered"
                        type="number"
                        min="0"
                        step="1000"
                        value={currentSavings.nonRegistered}
                        onChange={(e) =>
                          setCurrentSavings({ ...currentSavings, nonRegistered: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current-pension">Pension</Label>
                      <Input
                        id="current-pension"
                        type="number"
                        min="0"
                        step="1000"
                        value={currentSavings.pension}
                        onChange={(e) => setCurrentSavings({ ...currentSavings, pension: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Annual Contributions</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annual-rrsp">RRSP</Label>
                      <Input
                        id="annual-rrsp"
                        type="number"
                        min="0"
                        step="500"
                        value={annualContributions.rrsp}
                        onChange={(e) =>
                          setAnnualContributions({ ...annualContributions, rrsp: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annual-tfsa">TFSA</Label>
                      <Input
                        id="annual-tfsa"
                        type="number"
                        min="0"
                        step="500"
                        value={annualContributions.tfsa}
                        onChange={(e) =>
                          setAnnualContributions({ ...annualContributions, tfsa: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annual-non-registered">Non-Registered</Label>
                      <Input
                        id="annual-non-registered"
                        type="number"
                        min="0"
                        step="500"
                        value={annualContributions.nonRegistered}
                        onChange={(e) =>
                          setAnnualContributions({ ...annualContributions, nonRegistered: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pre-retirement-return">Pre-Retirement Return (%)</Label>
                      <div className="font-medium">{expectedReturns.preRetirement}%</div>
                    </div>
                    <Input
                      id="pre-retirement-return"
                      type="number"
                      min="0"
                      max="15"
                      step="0.1"
                      value={expectedReturns.preRetirement}
                      onChange={(e) =>
                        setExpectedReturns({ ...expectedReturns, preRetirement: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="post-retirement-return">Post-Retirement Return (%)</Label>
                      <div className="font-medium">{expectedReturns.postRetirement}%</div>
                    </div>
                    <Input
                      id="post-retirement-return"
                      type="number"
                      min="0"
                      max="15"
                      step="0.1"
                      value={expectedReturns.postRetirement}
                      onChange={(e) =>
                        setExpectedReturns({ ...expectedReturns, postRetirement: Number(e.target.value) })
                      }
                    />
                  </div>
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

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Government Benefits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpp-start-age">CPP Start Age</Label>
                      <Select value={cppStartAge.toString()} onValueChange={(value) => setCppStartAge(Number(value))}>
                        <SelectTrigger id="cpp-start-age">
                          <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60 (reduced)</SelectItem>
                          <SelectItem value="65">65 (standard)</SelectItem>
                          <SelectItem value="70">70 (enhanced)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oas-start-age">OAS Start Age</Label>
                      <Select value={oasStartAge.toString()} onValueChange={(value) => setOasStartAge(Number(value))}>
                        <SelectTrigger id="oas-start-age">
                          <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="65">65 (standard)</SelectItem>
                          <SelectItem value="70">70 (enhanced)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpp-benefit">Monthly CPP Benefit</Label>
                      <Input
                        id="cpp-benefit"
                        type="number"
                        min="0"
                        max="5000"
                        step="10"
                        value={cppBenefit}
                        onChange={(e) => setCppBenefit(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oas-benefit">Monthly OAS Benefit</Label>
                      <Input
                        id="oas-benefit"
                        type="number"
                        min="0"
                        max="5000"
                        step="10"
                        value={oasBenefit}
                        onChange={(e) => setOasBenefit(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Retirement Summary</CardTitle>
                  <CardDescription>Your projected retirement readiness</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {retirementResults.totalSavingsAtRetirement ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Retirement Savings at Age {retirementAge}</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(retirementResults.totalSavingsAtRetirement)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Desired Monthly Income</p>
                          <p className="text-xl font-bold">{formatCurrency(retirementResults.desiredMonthlyIncome)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Years in Retirement</p>
                          <p className="text-xl font-bold">{lifeExpectancy - retirementAge}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Average Annual Income</p>
                          <p className="text-xl font-bold">{formatCurrency(retirementResults.averageAnnualIncome)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Retirement Readiness</p>
                          <p className="text-sm font-medium">{retirementResults.retirementReadiness}%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${retirementResults.retirementReadiness}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {retirementResults.shortfallYears > 0
                            ? `Your savings may run out ${retirementResults.shortfallYears} years before age ${lifeExpectancy}.`
                            : "Your retirement plan is on track to meet your goals."}
                        </p>
                      </div>

                      {retirementResults.additionalMonthlySavings > 0 && (
                        <div className="rounded-lg border bg-muted p-4">
                          <p className="font-medium">Recommended Additional Savings</p>
                          <p className="text-xl font-bold text-primary mt-1">
                            {formatCurrency(retirementResults.additionalMonthlySavings)} / month
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Consider increasing your monthly contributions by this amount to meet your retirement goals.
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-medium mb-2">Savings Breakdown at Retirement</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg border p-2">
                            <p className="text-sm text-muted-foreground">RRSP</p>
                            <p className="font-medium">{formatCurrency(retirementResults.rrspFutureValue)}</p>
                          </div>
                          <div className="rounded-lg border p-2">
                            <p className="text-sm text-muted-foreground">TFSA</p>
                            <p className="font-medium">{formatCurrency(retirementResults.tfsaFutureValue)}</p>
                          </div>
                          <div className="rounded-lg border p-2">
                            <p className="text-sm text-muted-foreground">Non-Registered</p>
                            <p className="font-medium">{formatCurrency(retirementResults.nonRegisteredFutureValue)}</p>
                          </div>
                          <div className="rounded-lg border p-2">
                            <p className="text-sm text-muted-foreground">Pension</p>
                            <p className="font-medium">{formatCurrency(retirementResults.pensionFutureValue)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>Enter your information to see your retirement projections.</p>
                  )}
                </CardContent>
              </Card>

              {retirementResults.yearlyRetirementData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Retirement Savings Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RetirementChart yearlyData={retirementResults.yearlyRetirementData} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Retirement Income Breakdown</CardTitle>
              <CardDescription>Year-by-year projection of your retirement income sources</CardDescription>
            </CardHeader>
            <CardContent>
              {retirementResults.yearlyRetirementData ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age</TableHead>
                        <TableHead>Savings Withdrawal</TableHead>
                        <TableHead>CPP</TableHead>
                        <TableHead>OAS</TableHead>
                        <TableHead>Total Income</TableHead>
                        <TableHead>Desired Income</TableHead>
                        <TableHead>Remaining Savings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {retirementResults.yearlyRetirementData
                        .filter(
                          (_, index) => index % 5 === 0 || index === retirementResults.yearlyRetirementData.length - 1,
                        )
                        .map((year) => (
                          <TableRow key={year.age}>
                            <TableCell>{year.age}</TableCell>
                            <TableCell>{formatCurrency(year.withdrawal)}</TableCell>
                            <TableCell>{formatCurrency(year.cpp)}</TableCell>
                            <TableCell>{formatCurrency(year.oas)}</TableCell>
                            <TableCell
                              className={year.totalIncome < year.desiredIncome ? "text-red-500 font-medium" : ""}
                            >
                              {formatCurrency(year.totalIncome)}
                            </TableCell>
                            <TableCell>{formatCurrency(year.desiredIncome)}</TableCell>
                            <TableCell>{formatCurrency(year.savings)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p>Enter your information to see your income breakdown.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Canadian Retirement Planning Guide</CardTitle>
              <CardDescription>Understanding retirement planning in Canada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">The Three Pillars of Retirement Income</h3>
                <p className="mt-2">Canadian retirement income typically comes from three main sources:</p>
                <ol className="list-decimal pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Government Benefits:</strong> Canada Pension Plan (CPP) and Old Age Security (OAS)
                  </li>
                  <li>
                    <strong>Employer Pensions:</strong> Defined Benefit or Defined Contribution plans
                  </li>
                  <li>
                    <strong>Personal Savings:</strong> RRSPs, TFSAs, and other investments
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium">Government Benefits</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Canada Pension Plan (CPP):</strong> A contributory, earnings-related pension you can start
                    receiving as early as age 60 (with reduction) or as late as 70 (with enhancement). The standard age
                    is 65.
                  </li>
                  <li>
                    <strong>Old Age Security (OAS):</strong> A basic pension available to most Canadians aged 65 or
                    older who meet residency requirements. High-income earners may face a clawback (OAS Recovery Tax).
                  </li>
                  <li>
                    <strong>Guaranteed Income Supplement (GIS):</strong> Additional support for low-income OAS
                    recipients.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Tax-Advantaged Accounts</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Registered Retirement Savings Plan (RRSP):</strong> Tax-deductible contributions with
                    tax-deferred growth. Withdrawals are taxed as income.
                  </li>
                  <li>
                    <strong>Tax-Free Savings Account (TFSA):</strong> After-tax contributions with tax-free growth and
                    withdrawals.
                  </li>
                  <li>
                    <strong>Registered Retirement Income Fund (RRIF):</strong> RRSPs must be converted to RRIFs by age
                    71, with minimum annual withdrawals required.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Retirement Planning Strategies</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Start Early:</strong> The power of compound growth means that starting to save in your 20s
                    or 30s can significantly reduce the amount you need to save each month.
                  </li>
                  <li>
                    <strong>Maximize Tax Efficiency:</strong> Consider which accounts (RRSP vs TFSA) make the most sense
                    based on your current and expected future tax brackets.
                  </li>
                  <li>
                    <strong>Delay CPP/OAS:</strong> If possible, consider delaying the start of CPP and OAS to increase
                    your monthly benefits.
                  </li>
                  <li>
                    <strong>Plan for Healthcare Costs:</strong> Budget for potential long-term care needs and other
                    healthcare expenses not covered by provincial health plans.
                  </li>
                  <li>
                    <strong>Consider Inflation:</strong> Remember that the purchasing power of your savings will
                    decrease over time due to inflation.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Common Retirement Planning Mistakes</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Underestimating longevity and the number of years you'll spend in retirement</li>
                  <li>Failing to account for inflation</li>
                  <li>Overestimating investment returns</li>
                  <li>Not considering the impact of taxes on retirement income</li>
                  <li>Neglecting to plan for healthcare and long-term care costs</li>
                  <li>Taking on too much risk close to retirement</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Retirement Readiness Checklist</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Create a detailed retirement budget</li>
                  <li>Estimate your CPP and OAS benefits</li>
                  <li>Review your employer pension details</li>
                  <li>Maximize RRSP and TFSA contributions</li>
                  <li>Consider working with a financial advisor</li>
                  <li>Review and update your retirement plan regularly</li>
                  <li>Ensure your estate planning is up to date</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

