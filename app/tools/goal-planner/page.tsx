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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { GoalChart } from "@/components/goal-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

export default function GoalPlannerPage() {
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Emergency Fund",
      targetAmount: 15000,
      currentAmount: 5000,
      monthlyContribution: 500,
      priority: "high",
      expectedReturn: 2,
    },
    {
      id: 2,
      name: "Down Payment",
      targetAmount: 60000,
      currentAmount: 10000,
      monthlyContribution: 1000,
      priority: "medium",
      expectedReturn: 4,
    },
    {
      id: 3,
      name: "Vacation",
      targetAmount: 5000,
      currentAmount: 1000,
      monthlyContribution: 200,
      priority: "low",
      expectedReturn: 1,
    },
  ])
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    monthlyContribution: "",
    priority: "medium",
    expectedReturn: 3,
  })
  const [monthlyIncome, setMonthlyIncome] = useState(5000)
  const [monthlyExpenses, setMonthlyExpenses] = useState(3500)
  const [inflationRate, setInflationRate] = useState(2)
  const [goalResults, setGoalResults] = useState([])
  const [activeTab, setActiveTab] = useState("planner")

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Add new goal
  const handleAddGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.currentAmount !== "" && newGoal.monthlyContribution) {
      const newId = goals.length > 0 ? Math.max(...goals.map((goal) => goal.id)) + 1 : 1
      setGoals([
        ...goals,
        {
          id: newId,
          name: newGoal.name,
          targetAmount: Number.parseFloat(newGoal.targetAmount),
          currentAmount: Number.parseFloat(newGoal.currentAmount),
          monthlyContribution: Number.parseFloat(newGoal.monthlyContribution),
          priority: newGoal.priority,
          expectedReturn: Number.parseFloat(newGoal.expectedReturn),
        },
      ])
      setNewGoal({
        name: "",
        targetAmount: "",
        currentAmount: "",
        monthlyContribution: "",
        priority: "medium",
        expectedReturn: 3,
      })
    }
  }

  // Remove goal
  const handleRemoveGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  // Update goal
  const handleUpdateGoal = (id, field, value) => {
    setGoals(goals.map((goal) => (goal.id === id ? { ...goal, [field]: value } : goal)))
  }

  // Calculate goal projections
  useEffect(() => {
    const availableMonthlySavings = monthlyIncome - monthlyExpenses
    const totalMonthlyContributions = goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0)

    const results = goals.map((goal) => {
      const { targetAmount, currentAmount, monthlyContribution, expectedReturn } = goal
      const monthlyRate = expectedReturn / 100 / 12

      // Calculate months to reach goal
      let balance = currentAmount
      let months = 0
      const projectedData = []

      while (balance < targetAmount && months < 600) {
        // 50 years max to prevent infinite loops
        months++
        balance += monthlyContribution
        balance *= 1 + monthlyRate

        // Record data points for chart (every 3 months)
        if (months % 3 === 0 || balance >= targetAmount) {
          projectedData.push({
            month: months,
            balance,
          })
        }
      }

      // Calculate years and months
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12

      // Calculate progress percentage
      const progressPercentage = Math.min(100, (currentAmount / targetAmount) * 100)

      // Calculate inflation-adjusted target
      const inflationFactor = Math.pow(1 + inflationRate / 100, years + remainingMonths / 12)
      const inflationAdjustedTarget = targetAmount * inflationFactor

      return {
        ...goal,
        months,
        years,
        remainingMonths,
        completionDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
        progressPercentage,
        projectedData,
        inflationAdjustedTarget,
      }
    })

    // Sort results by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 }
    results.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    setGoalResults(results)
  }, [goals, inflationRate, monthlyIncome, monthlyExpenses])

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Financial Goal Planner</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planner">Goal Planner</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Your monthly income and expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="monthly-income">Monthly Income</Label>
                    <div className="font-medium">{formatCurrency(monthlyIncome)}</div>
                  </div>
                  <Input
                    id="monthly-income"
                    type="number"
                    min="0"
                    step="100"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
                    <div className="font-medium">{formatCurrency(monthlyExpenses)}</div>
                  </div>
                  <Input
                    id="monthly-expenses"
                    type="number"
                    min="0"
                    step="100"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Available for Savings</Label>
                    <div className="font-medium">{formatCurrency(monthlyIncome - monthlyExpenses)}</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inflation-rate">Inflation Rate (%)</Label>
                    <div className="font-medium">{inflationRate}%</div>
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
                  <div className="flex items-center justify-between">
                    <Label>Total Monthly Goal Contributions</Label>
                    <div className="font-medium">
                      {formatCurrency(goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0))}
                    </div>
                  </div>
                  {monthlyIncome - monthlyExpenses < goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0) && (
                    <p className="text-sm text-red-500">
                      Warning: Your goal contributions exceed your available savings.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Your Financial Goals</CardTitle>
                <CardDescription>Track and manage your savings goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {goalResults.length > 0 ? (
                  <div className="space-y-6">
                    {goalResults.map((goal) => (
                      <div key={goal.id} className="space-y-2 border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <h3 className="font-medium">{goal.name}</h3>
                            <span
                              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                goal.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : goal.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveGoal(goal.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Target: {formatCurrency(goal.targetAmount)}</p>
                            <p className="text-sm text-muted-foreground">
                              Current: {formatCurrency(goal.currentAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Monthly: {formatCurrency(goal.monthlyContribution)}
                            </p>
                            <p className="text-sm text-muted-foreground">Expected Return: {goal.expectedReturn}%</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">Progress: {goal.progressPercentage.toFixed(1)}%</p>
                            <p className="text-sm">
                              {goal.years > 0 ? `${goal.years} year${goal.years !== 1 ? "s" : ""}` : ""}
                              {goal.remainingMonths > 0
                                ? ` ${goal.remainingMonths} month${goal.remainingMonths !== 1 ? "s" : ""}`
                                : ""}{" "}
                              remaining
                            </p>
                          </div>
                          <Progress value={goal.progressPercentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Add your financial goals below to get started.</p>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Add New Goal</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-name">Goal Name</Label>
                      <Input
                        id="goal-name"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        placeholder="e.g., Emergency Fund"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-priority">Priority</Label>
                      <Select
                        value={newGoal.priority}
                        onValueChange={(value) => setNewGoal({ ...newGoal, priority: value })}
                      >
                        <SelectTrigger id="goal-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-target">Target Amount</Label>
                      <Input
                        id="goal-target"
                        type="number"
                        min="0"
                        step="100"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                        placeholder="10000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-current">Current Amount</Label>
                      <Input
                        id="goal-current"
                        type="number"
                        min="0"
                        step="100"
                        value={newGoal.currentAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-monthly">Monthly Contribution</Label>
                      <Input
                        id="goal-monthly"
                        type="number"
                        min="0"
                        step="10"
                        value={newGoal.monthlyContribution}
                        onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
                        placeholder="200"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor="goal-return" className="mr-1">
                          Expected Return (%)
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Estimated annual return on your savings. For short-term goals, use 1-2%. For medium-term
                                goals, 3-5%. For long-term goals, 5-7%.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="goal-return"
                        type="number"
                        min="0"
                        max="15"
                        step="0.1"
                        value={newGoal.expectedReturn}
                        onChange={(e) => setNewGoal({ ...newGoal, expectedReturn: e.target.value })}
                        placeholder="3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddGoal} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {goalResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Goal Projections</CardTitle>
                <CardDescription>Projected timeline to reach your goals</CardDescription>
              </CardHeader>
              <CardContent>
                <GoalChart goals={goalResults} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Financial Goals Timeline</CardTitle>
              <CardDescription>Detailed breakdown of your financial goals</CardDescription>
            </CardHeader>
            <CardContent>
              {goalResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Goal</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Target Amount</TableHead>
                      <TableHead>Current Amount</TableHead>
                      <TableHead>Monthly Contribution</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Time to Completion</TableHead>
                      <TableHead>Inflation-Adjusted Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goalResults.map((goal) => (
                      <TableRow key={goal.id}>
                        <TableCell className="font-medium">{goal.name}</TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              goal.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : goal.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(goal.targetAmount)}</TableCell>
                        <TableCell>{formatCurrency(goal.currentAmount)}</TableCell>
                        <TableCell>{formatCurrency(goal.monthlyContribution)}</TableCell>
                        <TableCell>{goal.expectedReturn}%</TableCell>
                        <TableCell>
                          {goal.years > 0 ? `${goal.years} year${goal.years !== 1 ? "s" : ""}` : ""}
                          {goal.remainingMonths > 0
                            ? ` ${goal.remainingMonths} month${goal.remainingMonths !== 1 ? "s" : ""}`
                            : ""}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            (Est. {goal.completionDate.toLocaleDateString()})
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(goal.inflationAdjustedTarget)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Add your financial goals to see your timeline.</p>
              )}

              {goalResults.length > 0 && (
                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Goal Completion Timeline</h3>
                    <div className="relative border-l-2 border-muted pl-6 ml-4 space-y-8">
                      {goalResults
                        .sort((a, b) => a.months - b.months)
                        .map((goal, index) => (
                          <div key={goal.id} className="relative">
                            <div className="absolute -left-8 top-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                              {index + 1}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-medium">{goal.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(goal.targetAmount)} by {goal.completionDate.toLocaleDateString()}
                              </p>
                              <p className="text-sm">
                                {goal.years > 0 ? `${goal.years} year${goal.years !== 1 ? "s" : ""}` : ""}
                                {goal.remainingMonths > 0
                                  ? ` ${goal.remainingMonths} month${goal.remainingMonths !== 1 ? "s" : ""}`
                                  : ""}{" "}
                                from now
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                    <div className="space-y-4">
                      {monthlyIncome - monthlyExpenses <
                        goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0) && (
                        <div className="rounded-lg border bg-red-50 p-4">
                          <p className="font-medium text-red-800">
                            Your goal contributions exceed your available savings
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            Consider reducing your monthly contributions or finding ways to increase your income or
                            reduce expenses.
                          </p>
                        </div>
                      )}

                      {goalResults.some((goal) => goal.priority === "high" && goal.progressPercentage < 30) && (
                        <div className="rounded-lg border bg-yellow-50 p-4">
                          <p className="font-medium text-yellow-800">High priority goals have low progress</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Consider reallocating funds from lower priority goals to accelerate progress on high
                            priority goals.
                          </p>
                        </div>
                      )}

                      {goalResults.some((goal) => goal.years > 10 && goal.expectedReturn < 5) && (
                        <div className="rounded-lg border bg-blue-50 p-4">
                          <p className="font-medium text-blue-800">Long-term goals with conservative returns</p>
                          <p className="text-sm text-blue-700 mt-1">
                            For goals more than 10 years away, consider more growth-oriented investments to potentially
                            increase returns.
                          </p>
                        </div>
                      )}

                      {goalResults.some(
                        (goal) =>
                          goal.name.toLowerCase().includes("emergency") && goal.targetAmount < monthlyExpenses * 3,
                      ) && (
                        <div className="rounded-lg border bg-purple-50 p-4">
                          <p className="font-medium text-purple-800">Emergency fund may be insufficient</p>
                          <p className="text-sm text-purple-700 mt-1">
                            Financial experts recommend an emergency fund of 3-6 months of expenses. Consider increasing
                            your target.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Financial Goal Planning Guide</CardTitle>
              <CardDescription>How to set and achieve your financial goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Setting SMART Financial Goals</h3>
                <p className="mt-2">
                  Effective financial goals should be SMART: Specific, Measurable, Achievable, Relevant, and Time-bound.
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Specific:</strong> Clearly define what you want to achieve (e.g., "Save $15,000 for an
                    emergency fund" rather than "Save money").
                  </li>
                  <li>
                    <strong>Measurable:</strong> Include specific amounts and dates (e.g., "Save $10,000 for a down
                    payment by December 2026").
                  </li>
                  <li>
                    <strong>Achievable:</strong> Set goals that are realistic given your income and expenses.
                  </li>
                  <li>
                    <strong>Relevant:</strong> Ensure your goals align with your values and long-term aspirations.
                  </li>
                  <li>
                    <strong>Time-bound:</strong> Set a target date to create urgency and help track progress.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Prioritizing Your Financial Goals</h3>
                <p className="mt-2">Most financial experts recommend prioritizing your goals in this order:</p>
                <ol className="list-decimal pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Emergency Fund:</strong> Aim for 3-6 months of essential expenses in a readily accessible
                    account.
                  </li>
                  <li>
                    <strong>High-Interest Debt:</strong> Pay off credit cards and other high-interest debt.
                  </li>
                  <li>
                    <strong>Retirement Savings:</strong> Contribute to retirement accounts, especially if your employer
                    offers matching.
                  </li>
                  <li>
                    <strong>Short and Medium-Term Goals:</strong> Save for major purchases like a home down payment or
                    education.
                  </li>
                  <li>
                    <strong>Additional Investments:</strong> Once the above are addressed, focus on building wealth
                    through additional investments.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium">Choosing the Right Accounts for Your Goals</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Goal Timeframe</TableHead>
                      <TableHead>Recommended Accounts</TableHead>
                      <TableHead>Expected Returns</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Short-term (0-2 years)</TableCell>
                      <TableCell>High-interest savings account, GICs</TableCell>
                      <TableCell>1-3%</TableCell>
                      <TableCell>Very Low</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Medium-term (2-5 years)</TableCell>
                      <TableCell>GICs, conservative investment portfolio, TFSA</TableCell>
                      <TableCell>3-5%</TableCell>
                      <TableCell>Low to Medium</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Long-term (5+ years)</TableCell>
                      <TableCell>TFSA, RRSP, balanced or growth investment portfolio</TableCell>
                      <TableCell>5-8%</TableCell>
                      <TableCell>Medium to High</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-medium">Strategies for Achieving Your Goals</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Automate Your Savings:</strong> Set up automatic transfers to your savings accounts on
                    payday.
                  </li>
                  <li>
                    <strong>Use the 50/30/20 Budget:</strong> Allocate 50% of income to needs, 30% to wants, and 20% to
                    savings and debt repayment.
                  </li>
                  <li>
                    <strong>Pay Yourself First:</strong> Treat savings as a non-negotiable expense, not what's left over
                    after spending.
                  </li>
                  <li>
                    <strong>Review and Adjust Regularly:</strong> Life circumstances change, so review your goals
                    quarterly and adjust as needed.
                  </li>
                  <li>
                    <strong>Celebrate Milestones:</strong> Acknowledge progress to stay motivated (e.g., when you reach
                    25%, 50%, 75% of your goal).
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Common Financial Goals for Canadians</h3>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>
                    <strong>Emergency Fund:</strong> 3-6 months of essential expenses (housing, food, utilities,
                    transportation).
                  </li>
                  <li>
                    <strong>Home Down Payment:</strong> Typically 5-20% of the home's purchase price (20% avoids CMHC
                    insurance).
                  </li>
                  <li>
                    <strong>Retirement:</strong> Aim to replace 70-80% of your pre-retirement income.
                  </li>
                  <li>
                    <strong>Education:</strong> RESP contributions for children's education (eligible for 20% government
                    grant).
                  </li>
                  <li>
                    <strong>Debt Repayment:</strong> Becoming debt-free, especially high-interest consumer debt.
                  </li>
                  <li>
                    <strong>Major Purchases:</strong> Vehicles, home renovations, vacations, etc.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">The Impact of Inflation</h3>
                <p className="mt-2">
                  Inflation erodes the purchasing power of your money over time. For long-term goals, you need to
                  account for inflation:
                </p>
                <ul className="list-disc pl-6 pt-2 space-y-2">
                  <li>At 2% inflation, $10,000 today will have the purchasing power of about $8,200 in 10 years.</li>
                  <li>
                    For goals more than 5 years away, consider increasing your target amount to account for inflation.
                  </li>
                  <li>Ensure your investment returns exceed inflation to grow your purchasing power.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

