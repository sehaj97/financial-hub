"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Info, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { RESPChart } from "@/components/resp-chart"

export default function RESPCalculatorPage() {
  const [children, setChildren] = useState([{ id: 1, name: "Child 1", age: 5, targetAmount: 80000 }])
  const [newChild, setNewChild] = useState({ name: "", age: "", targetAmount: "" })
  const [currentRESP, setCurrentRESP] = useState(5000)
  const [annualContribution, setAnnualContribution] = useState(2500)
  const [expectedReturn, setExpectedReturn] = useState(5)
  const [inflationRate, setInflationRate] = useState(2)
  const [includeGrants, setIncludeGrants] = useState(true)
  const [respResults, setRespResults] = useState({})
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

  // Add new child
  const handleAddChild = () => {
    if (newChild.name && newChild.age && newChild.targetAmount) {
      const newId = children.length > 0 ? Math.max(...children.map((child) => child.id)) + 1 : 1
      setChildren([
        ...children,
        {
          id: newId,
          name: newChild.name,
          age: Number.parseInt(newChild.age),
          targetAmount: Number.parseFloat(newChild.targetAmount),
        },
      ])
      setNewChild({ name: "", age: "", targetAmount: "" })
    }
  }

  // Remove child
  const handleRemoveChild = (id) => {
    setChildren(children.filter((child) => child.id !== id))
  }

  // Calculate CESG (Canada Education Savings Grant)
  const calculateCESG = (contribution, totalContributions) => {
    // Basic CESG: 20% on the first $2,500 of annual contributions
    // Lifetime maximum CESG per beneficiary: $7,200
    const basicCESGRate = 0.2
    const annualCESGLimit = 500 // 20% of $2,500
    const lifetimeCESGLimit = 7200

    // Calculate CESG for this contribution
    const eligibleContribution = Math.min(contribution, 2500)
    const cesgAmount = eligibleContribution * basicCESGRate

    // Ensure we don't exceed the annual or lifetime limits
    return Math.min(cesgAmount, annualCESGLimit, lifetimeCESGLimit - totalContributions * basicCESGRate)
  }

  // Calculate RESP growth and benefits
  useEffect(() => {
    if (children.length === 0) {
      setRespResults({})
      return
    }

    // Calculate per-child contribution
    const contributionPerChild = annualContribution / children.length

    // Calculate RESP growth for each child
    const childResults = children
      .map((child) => {
        const yearsToEducation = 18 - child.age
        if (yearsToEducation <= 0) return null

        // Calculate initial allocation for this child
        const initialAllocation = currentRESP / children.length

        let balance = initialAllocation
        let totalContributions = initialAllocation
        let totalGrants = 0
        const yearlyData = []

        for (let year = 1; year <= yearsToEducation; year++) {
          // Add annual contribution
          balance += contributionPerChild
          totalContributions += contributionPerChild

          // Add CESG if applicable
          if (includeGrants && child.age + year <= 17) {
            const cesgAmount = calculateCESG(contributionPerChild, totalContributions)
            balance += cesgAmount
            totalGrants += cesgAmount
          }

          // Apply investment return
          const investmentReturn = balance * (expectedReturn / 100)
          balance += investmentReturn

          // Record yearly data
          yearlyData.push({
            year,
            age: child.age + year,
            balance,
            totalContributions,
            totalGrants,
            investmentReturn,
          })
        }

        // Calculate inflation-adjusted values
        const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToEducation)
        const inflationAdjustedBalance = balance / inflationFactor
        const inflationAdjustedTarget = child.targetAmount * inflationFactor

        // Calculate percentage of target achieved
        const targetPercentAchieved = Math.min(100, (balance / inflationAdjustedTarget) * 100)

        // Calculate additional savings needed
        const additionalSavingsNeeded = Math.max(0, inflationAdjustedTarget - balance)

        return {
          ...child,
          yearsToEducation,
          finalBalance: balance,
          totalContributions,
          totalGrants,
          inflationAdjustedBalance,
          inflationAdjustedTarget,
          targetPercentAchieved,
          additionalSavingsNeeded,
          yearlyData,
        }
      })
      .filter(Boolean) // Remove null results (for children already 18+)

    // Calculate total RESP values
    const totalFinalBalance = childResults.reduce((sum, child) => sum + child.finalBalance, 0)
    const totalContributions = childResults.reduce((sum, child) => sum + child.totalContributions, 0)
    const totalGrants = childResults.reduce((sum, child) => sum + child.totalGrants, 0)
    const totalAdditionalNeeded = childResults.reduce((sum, child) => sum + child.additionalSavingsNeeded, 0)

    setRespResults({
      childResults,
      totalFinalBalance,
      totalContributions,
      totalGrants,
      totalAdditionalNeeded,
    })
  }, [children, currentRESP, annualContribution, expectedReturn, inflationRate, includeGrants])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">RESP Calculator</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>RESP Details</CardTitle>
                <CardDescription>Enter your RESP information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="current-resp">Current RESP Balance</Label>
                    <div className="font-medium">{formatCurrency(currentRESP)}</div>
                  </div>
                  <Input
                    id="current-resp"
                    type="number"
                    min="0"
                    step="1000"
                    value={currentRESP}
                    onChange={(e) => setCurrentRESP(Number(e.target.value))}
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
                              The maximum CESG is 20% on the first $2,500 contributed annually per beneficiary, or $500
                              per year. The lifetime CESG limit is $7,200 per beneficiary.
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
                    step="500"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(Number(e.target.value))}
                  />
                  <Slider
                    value={[annualContribution]}
                    min={0}
                    max={10000}
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

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-grants"
                    checked={includeGrants}
                    onChange={(e) => setIncludeGrants(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="include-grants">Include CESG (Canada Education Savings Grant)</Label>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Children / Beneficiaries</h3>
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Age: {child.age} | Target: {formatCurrency(child.targetAmount)}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveChild(child.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="child-name">Name</Label>
                      <Input
                        id="child-name"
                        value={newChild.name}
                        onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                        placeholder="Child's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="child-age">Current Age</Label>
                      <Input
                        id="child-age"
                        type="number"
                        min="0"
                        max="17"
                        value={newChild.age}
                        onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                        placeholder="0-17"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="child-target">Target Amount</Label>
                      <Input
                        id="child-target"
                        type="number"
                        min="0"
                        step="5000"
                        value={newChild.targetAmount}
                        onChange={(e) => setNewChild({ ...newChild, targetAmount: e.target.value })}
                        placeholder="e.g., 80000"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddChild} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Child
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>RESP Summary</CardTitle>
                  <CardDescription>Your projected RESP growth and benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {respResults.totalFinalBalance ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Projected RESP Value</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(respResults.totalFinalBalance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Contributions</p>
                        <p className="text-xl font-bold">{formatCurrency(respResults.totalContributions)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total CESG Grants</p>
                        <p className="text-xl font-bold">{formatCurrency(respResults.totalGrants)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Investment Growth</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(
                            respResults.totalFinalBalance - respResults.totalContributions - respResults.totalGrants,
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p>Enter your information to see your RESP projections.</p>
                  )}
                </CardContent>
              </Card>

              {respResults.childResults && respResults.childResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Per-Child Projections</CardTitle>
                    <CardDescription>Individual RESP projections for each child</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {respResults.childResults.map((child) => (
                      <div key={child.id} className="space-y-2 border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{child.name}</h3>
                          <span className="text-sm text-muted-foreground">
                            Age: {child.age} | {child.yearsToEducation} years to education
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Projected Value at 18</p>
                            <p className="font-medium">{formatCurrency(child.finalBalance)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Inflation-Adjusted Target</p>
                            <p className="font-medium">{formatCurrency(child.inflationAdjustedTarget)}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">Target Progress: {child.targetPercentAchieved.toFixed(1)}%</p>
                            {child.additionalSavingsNeeded > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Additional needed: {formatCurrency(child.additionalSavingsNeeded)}
                              </p>
                            )}
                          </div>
                          <Progress value={child.targetPercentAchieved} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {respResults.childResults && respResults.childResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>RESP Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <RESPChart childResults={respResults.childResults} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="projections">
          <Card>
            <CardHeader>
              <CardTitle>Detailed RESP Projections</CardTitle>
              <CardDescription>Year-by-year breakdown of your RESP growth</CardDescription>
            </CardHeader>
            <CardContent>
              {respResults.childResults && respResults.childResults.length > 0 ? (
                <Tabs defaultValue={respResults.childResults[0].id.toString()} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    {respResults.childResults.map((child) => (
                      <TabsTrigger key={child.id} value={child.id.toString()}>
                        {child.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {respResults.childResults.map((child) => (
                    <TabsContent key={child.id} value={child.id.toString()}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Annual Contribution</TableHead>
                            <TableHead>CESG Grant</TableHead>
                            <TableHead>Investment Return</TableHead>
                            <TableHead>Year-End Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {child.yearlyData.map((year, index) => (
                            <TableRow key={index}>
                              <TableCell>{year.year}</TableCell>
                              <TableCell>{year.age}</TableCell>
                              <TableCell>{formatCurrency(annualContribution / children.length)}</TableCell>
                              <TableCell>
                                {formatCurrency(
                                  index === 0
                                    ? year.totalGrants
                                    : year.totalGrants - child.yearlyData[index - 1].totalGrants,
                                )}
                              </TableCell>
                              <TableCell>{formatCurrency(year.investmentReturn)}</TableCell>
                              <TableCell>{formatCurrency(year.balance)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-medium">Education Funding Analysis</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <p className="font-medium">Projected RESP Value at Age 18</p>
                            <p className="text-2xl">{formatCurrency(child.finalBalance)}</p>
                            <p className="text-sm text-muted-foreground">
                              This is the estimated value of the RESP when {child.name} turns 18, based on your current
                              contributions and investment returns.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="font-medium">Estimated Education Costs</p>
                            <p className="text-2xl">{formatCurrency(child.inflationAdjustedTarget)}</p>
                            <p className="text-sm text-muted-foreground">
                              This is the estimated cost of education adjusted for inflation over{" "}
                              {child.yearsToEducation} years.
                            </p>
                          </div>
                        </div>

                        {child.additionalSavingsNeeded > 0 ? (
                          <div className="rounded-lg border bg-muted p-4 mt-4">
                            <p className="font-medium">Funding Gap</p>
                            <p className="text-xl font-bold text-primary mt-1">
                              {formatCurrency(child.additionalSavingsNeeded)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              To fully fund {child.name}'s education, consider increasing your annual contributions or
                              exploring additional savings options.
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-lg border bg-green-50 p-4 mt-4">
                            <p className="font-medium text-green-800">Fully Funded</p>
                            <p className="text-sm text-green-700 mt-1">
                              Based on your current contributions, {child.name}'s education appears to be fully funded.
                              You're on track to meet or exceed your education savings goal.
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <p>Add at least one child to see detailed projections.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>RESP Guide</CardTitle>
              <CardDescription>Understanding Registered Education Savings Plans in Canada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">What is an RESP?</h3>
                <p className="mt-2">
                  A Registered Education Savings Plan (RESP) is a tax-advantaged account designed to help Canadians save
                  for a child's post-secondary education. Contributions to an RESP are not tax-deductible, but the
                  investment growth is tax-deferred until withdrawal, at which point it's taxed in the hands of the
                  student (who typically has little or no income, resulting in minimal tax).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Government Grants and Incentives</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Canada Education Savings Grant (CESG):</strong> The federal government matches 20% of annual
                    contributions up to $2,500 per beneficiary, for a maximum grant of $500 per year. The lifetime CESG
                    limit is $7,200 per beneficiary.
                  </li>
                  <li>
                    <strong>Additional CESG:</strong> Lower and middle-income families may qualify for an additional
                    10-20% grant on the first $500 contributed each year.
                  </li>
                  <li>
                    <strong>Canada Learning Bond (CLB):</strong> Available to low-income families, providing up to
                    $2,000 per eligible child without requiring any contributions.
                  </li>
                  <li>
                    <strong>Provincial Incentives:</strong> Some provinces offer additional grants or incentives (e.g.,
                    Quebec Education Savings Incentive).
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">RESP Contribution Limits</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>No Annual Limit:</strong> There is no annual contribution limit for RESPs.
                  </li>
                  <li>
                    <strong>Lifetime Limit:</strong> The lifetime contribution limit is $50,000 per beneficiary.
                  </li>
                  <li>
                    <strong>Grant Eligibility:</strong> To maximize CESG, contribute $2,500 annually per beneficiary.
                  </li>
                  <li>
                    <strong>Contribution Period:</strong> Contributions can be made for up to 31 years after the plan is
                    opened, and the plan can remain open for up to 35 years.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Types of RESPs</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Individual RESP:</strong> For a single beneficiary, who doesn't need to be related to the
                    subscriber.
                  </li>
                  <li>
                    <strong>Family RESP:</strong> For multiple beneficiaries, who must be related to the subscriber by
                    blood or adoption.
                  </li>
                  <li>
                    <strong>Group RESP:</strong> Pooled plans administered by a foundation where your contributions are
                    combined with those of other subscribers.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">RESP Withdrawals</h3>
                <p className="mt-2">RESP withdrawals fall into two categories:</p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Post-Secondary Education Payments (PSE):</strong> Return of your contributions, which are
                    not taxable.
                  </li>
                  <li>
                    <strong>Educational Assistance Payments (EAP):</strong> Consist of investment earnings and
                    government grants, which are taxable in the hands of the student.
                  </li>
                </ul>
                <p className="mt-2">
                  To qualify for withdrawals, the beneficiary must be enrolled in a qualifying educational program at a
                  post-secondary institution.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">RESP Investment Options</h3>
                <p className="mt-2">RESPs can hold various investments, including:</p>
                <ul className="list-disc pl-6 pt-1 space-y-1">
                  <li>Guaranteed Investment Certificates (GICs)</li>
                  <li>Mutual funds</li>
                  <li>Exchange-Traded Funds (ETFs)</li>
                  <li>Stocks and bonds</li>
                  <li>Savings accounts</li>
                </ul>
                <p className="mt-2">
                  Your investment strategy should be based on your risk tolerance and time horizon. Generally, a more
                  conservative approach is recommended as the beneficiary approaches post-secondary education.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">What If My Child Doesn't Pursue Post-Secondary Education?</h3>
                <p className="mt-2">
                  If your child decides not to pursue post-secondary education, you have several options:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Transfer the RESP to another eligible beneficiary</li>
                  <li>Transfer up to $50,000 of the earnings to your RRSP (if you have contribution room)</li>
                  <li>
                    Withdraw the earnings as an Accumulated Income Payment (AIP), subject to regular income tax plus an
                    additional 20% tax
                  </li>
                  <li>Donate the earnings to a qualifying educational institution in Canada</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">RESP Tips</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>Start early to maximize the power of compound growth</li>
                  <li>Contribute at least $2,500 per beneficiary annually to maximize the CESG</li>
                  <li>Consider a family RESP if you have multiple children to provide more flexibility</li>
                  <li>Adjust your investment strategy as your child approaches post-secondary education</li>
                  <li>Keep track of contribution limits to avoid over-contribution penalties</li>
                  <li>Understand the withdrawal rules and tax implications before making withdrawals</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

