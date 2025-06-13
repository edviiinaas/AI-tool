import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LANDING_FEATURES } from "@/lib/constants"
import type { Feature } from "@/lib/types"

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-20 md:py-28 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Meet Your AI Team</h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
              AIConstruct gives your team a boost with task-specific AI agents trained for construction workflows.
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {LANDING_FEATURES.map((feature: Feature) => (
            <Card
              key={feature.title}
              className="shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 flex flex-col border-gray-200"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 rounded-full bg-blue-100">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <p className="text-sm font-medium text-orange-600 mb-2">{feature.subtitle}</p>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
