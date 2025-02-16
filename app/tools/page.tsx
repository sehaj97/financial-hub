import Link from "next/link"
import {
  Home,
  PiggyBank,
  CreditCard,
  Calculator,
  CalendarClock,
  Percent,
  BarChart4,
  Building,
  GraduationCap,
  DollarSign,
  Scale,
  Landmark,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ToolsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Financial Tools</h1>
        <p className="text-muted-foreground mt-2">
          Our comprehensive suite of financial calculators designed for Canadians
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <Home className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Mortgage Calculator</CardTitle>
              <CardDescription>Calculate mortgage payments and amortization schedules</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Plan your home purchase with our comprehensive mortgage calculator that includes Canadian tax
              considerations.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/mortgage-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>FHSA Calculator</CardTitle>
              <CardDescription>First Home Savings Account planner</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Maximize your tax-free savings for your first home purchase with Canada's FHSA program offering up to
              $40,000 in tax-deductible contributions.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/fhsa-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <PiggyBank className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Savings Calculator</CardTitle>
              <CardDescription>Project your savings growth over time</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              See how your savings can grow with regular contributions and compound interest.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/savings-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Debt Repayment</CardTitle>
              <CardDescription>Create a plan to become debt-free</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Develop a strategy to pay off credit cards, loans, and other debts efficiently.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/debt-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>RRSP Calculator</CardTitle>
              <CardDescription>Optimize your retirement savings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Calculate RRSP contributions, tax benefits, and projected retirement income.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/rrsp-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <CalendarClock className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Retirement Planner</CardTitle>
              <CardDescription>Plan for your retirement years</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Comprehensive retirement planning tool considering CPP, OAS, and personal savings.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/retirement-planner">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>RESP Calculator</CardTitle>
              <CardDescription>Education savings with government grants</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Plan for your children's education with RESP contributions and calculate CESG government grants.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/resp-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>CPP Benefits Calculator</CardTitle>
              <CardDescription>Estimate your Canada Pension Plan benefits</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Calculate your expected CPP benefits based on your contributions and retirement age.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/cpp-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Mortgage Affordability</CardTitle>
              <CardDescription>How much house can you afford?</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Calculate how much house you can afford based on your income, expenses, and Canadian mortgage rules.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/mortgage-affordability">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <Landmark className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Inflation Calculator</CardTitle>
              <CardDescription>Track the impact of inflation over time</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              See how inflation affects your purchasing power and calculate the future value of money.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/inflation-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <BarChart4 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Investment Returns</CardTitle>
              <CardDescription>Calculate potential investment growth</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Project returns on various investment types with adjustable risk profiles and time horizons.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/investment-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4">
            <Percent className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Tax Calculator</CardTitle>
              <CardDescription>Estimate your Canadian tax obligations</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Calculate income tax, capital gains, and other tax implications based on your province and situation.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/tools/tax-calculator">Calculate Now</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

