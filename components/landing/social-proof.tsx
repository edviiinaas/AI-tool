import Image from "next/image"

const logos = [
  { name: "ConstructX", src: "/placeholder.svg?width=140&height=40&text=ConstructX" },
  { name: "BuildWell", src: "/placeholder.svg?width=140&height=40&text=BuildWell" },
  { name: "InfraPro", src: "/placeholder.svg?width=140&height=40&text=InfraPro" },
  { name: "MegaStruct", src: "/placeholder.svg?width=140&height=40&text=MegaStruct" },
  { name: "QuantumBuild", src: "/placeholder.svg?width=140&height=40&text=QuantumBuild" },
]

export function SocialProof() {
  return (
    <section className="w-full py-12 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-center text-sm font-semibold text-gray-600 tracking-wider uppercase">
          Trusted by leading construction and engineering firms
        </h2>
        <div className="mt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-6 md:gap-x-12 lg:gap-x-16">
          {logos.map((logo) => (
            <Image
              key={logo.name}
              src={logo.src || "/placeholder.svg"}
              alt={logo.name}
              width={140}
              height={40}
              className="opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
