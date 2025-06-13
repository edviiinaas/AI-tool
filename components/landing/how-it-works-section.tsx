import { HOW_IT_WORKS_STEPS } from "@/lib/constants"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-20 md:py-28 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">How It Works</h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
              Get started in three simple steps and transform your construction workflow.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 hidden md:block" aria-hidden="true"></div>
          <div className="relative mx-auto grid max-w-5xl items-start gap-12 sm:grid-cols-1 md:grid-cols-3 lg:gap-16">
            {HOW_IT_WORKS_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="grid gap-4 text-center bg-gray-50 p-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
