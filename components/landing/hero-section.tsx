import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { CheckCircle } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full py-20 md:py-28 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900">
                AI Employees for Construction Companies
              </h1>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Automate tender analysis, pricing, and project management with specialized AI agents. Make smarter
                decisions, faster.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-base">
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-base">
                <Link href="#how-it-works">View Demo</Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:gap-x-6 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Free 14-day trial, no credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Trusted by over 100 construction firms
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Instant insights and reports
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl blur-lg opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <Image
              src="/placeholder.svg?width=650&height=406"
              width={650}
              height={406}
              alt="AI Construction Platform Interface"
              className="relative object-cover w-full h-full rounded-xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
