import Link from "next/link";
import {
  Calculator,
  Home,
  PiggyBank,
  CreditCard,
  CalendarClock,
  TrendingUp,
  BarChart4,
  Percent,
  Building,
  GraduationCap,
  DollarSign,
  Scale,
  Landmark,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col mx-auto">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 px-5">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">
              Canadian Financial Tools Hub
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Open-Source Financial Planning Tools
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Access powerful financial calculators designed specifically
                    for Canadians. Plan your future with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Financial Tools
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our comprehensive suite of calculators and tools to help you
                  make informed financial decisions.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Home className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Mortgage Calculator</CardTitle>
                    <CardDescription>
                      Calculate mortgage payments and amortization schedules
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Plan your home purchase with our comprehensive mortgage
                    calculator that includes Canadian tax considerations.
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
                    <CardDescription>
                      First Home Savings Account planner
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Maximize your tax-free savings for your first home purchase
                    with Canada's FHSA program offering up to $40,000 in
                    tax-deductible contributions.
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
                    <CardDescription>
                      Project your savings growth over time
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    See how your savings can grow with regular contributions and
                    compound interest.
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
                    <CardDescription>
                      Create a plan to become debt-free
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Develop a strategy to pay off credit cards, loans, and other
                    debts efficiently.
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
                    <CardDescription>
                      Optimize your retirement savings
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Calculate RRSP contributions, tax benefits, and projected
                    retirement income.
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
                    <CardDescription>
                      Plan for your retirement years
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Comprehensive retirement planning tool considering CPP, OAS,
                    and personal savings.
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
                    <CardDescription>
                      Education savings with government grants
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Plan for your children's education with RESP contributions
                    and calculate CESG government grants.
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
                    <CardDescription>
                      Estimate your Canada Pension Plan benefits
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Calculate your expected CPP benefits based on your
                    contributions and retirement age.
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
                    <CardDescription>
                      How much house can you afford?
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Calculate how much house you can afford based on your
                    income, expenses, and Canadian mortgage rules.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/tools/mortgage-affordability">
                      Calculate Now
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Landmark className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Inflation Calculator</CardTitle>
                    <CardDescription>
                      Track the impact of inflation over time
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    See how inflation affects your purchasing power and
                    calculate the future value of money.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/tools/inflation-calculator">
                      Calculate Now
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                  <BarChart4 className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Investment Returns</CardTitle>
                    <CardDescription>
                      Calculate potential investment growth
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Project returns on various investment types with adjustable
                    risk profiles and time horizons.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/tools/investment-calculator">
                      Calculate Now
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Percent className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Tax Calculator</CardTitle>
                    <CardDescription>
                      Estimate your Canadian tax obligations
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Calculate income tax, capital gains, and other tax
                    implications based on your province and situation.
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
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">
                  About This Platform
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Open-Source Financial Tools
                    </h3>
                    <p className="text-muted-foreground">
                      This platform is an open-source initiative designed to
                      provide Canadians with accurate, reliable financial
                      planning tools. All calculators are freely available
                      without requiring registration or user accounts.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Data Privacy & Security
                    </h3>
                    <p className="text-muted-foreground">
                      All calculations are performed locally in your browser. No
                      personal or financial data is stored or transmitted to any
                      server, ensuring complete privacy and security of your
                      information.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Consistent Data Architecture
                    </h3>
                    <p className="text-muted-foreground">
                      Our calculators are built on a unified data architecture
                      that ensures consistency across all tools. This allows for
                      seamless integration between different calculators and
                      reliable results.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">
                  How To Use
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Detailed Guides
                    </h3>
                    <p className="text-muted-foreground">
                      Each calculator includes comprehensive guides explaining
                      the underlying financial concepts, how to use the tool
                      effectively, and how to interpret the results.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Canadian-Specific
                    </h3>
                    <p className="text-muted-foreground">
                      All calculators are tailored to the Canadian financial
                      system, including considerations for Canadian tax laws,
                      government benefits like CPP and OAS, and RRSP/TFSA
                      contribution limits.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Continuous Improvement
                    </h3>
                    <p className="text-muted-foreground">
                      This platform is continuously updated based on user
                      feedback and changes to Canadian financial regulations.
                      Anonymous usage analytics help us identify areas for
                      improvement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-5">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Canadian Financial Tools Hub. Open-source and freely
            available.
          </p>
        </div>
      </footer>
    </div>
  );
}
