import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TESTIMONIALS } from "@/lib/constants"

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="w-full py-20 md:py-28 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
              Trusted by Industry Leaders
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
              Construction teams save hours weekly using AIConstruct.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Card
              key={index}
              className="shadow-lg flex flex-col bg-white hover:shadow-xl transition-shadow duration-300 border-gray-200"
            >
              <CardContent className="p-6 flex-grow flex flex-col">
                <blockquote className="text-gray-600 italic mb-6 flex-grow text-base leading-relaxed">
                  “{testimonial.quote}”
                </blockquote>
                <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
