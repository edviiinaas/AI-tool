import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PRICING_TIERS } from "@/lib/constants"
import { Check } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function PricingSection() {
  return (
    <section id="pricing" className="w-full py-20 md:py-28 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
              Flexible Plans for Every Team
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
              From solo engineers to enterprise contractors, scale your AI workforce as you grow.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-md gap-8 sm:max-w-4xl md:max-w-5xl md:grid-cols-3 lg:gap-10">
          {PRICING_TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "flex flex-col shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl border",
                tier.isFeatured ? "border-2 border-blue-600 transform scale-105" : "border-gray-200",
              )}
            >
              <CardHeader className="pb-4 text-center">
                {tier.isFeatured && (
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">Most Popular</div>
                )}
                <CardTitle className="text-2xl text-gray-900">{tier.name}</CardTitle>
                <div className="flex items-baseline justify-center mt-2">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  {tier.pricePeriod && <span className="ml-1 text-gray-500">{tier.pricePeriod}</span>}
                </div>
                <CardDescription className="text-sm pt-2">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "w-full text-base py-6",
                    tier.isFeatured
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white",
                  )}
                >
                  <Link href="/auth/signup">{tier.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
