import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="min-h-[85vh] flex items-center">
      <div className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight tracking-wide uppercase text-foreground">
              <span className="block">Ashton Carter</span>
              <span className="block mt-2">Memorial Foundation</span>
            </h1>
            
            <p className="font-serif text-xl md:text-2xl italic text-muted-foreground mt-6 tracking-wide">
              Continuing His Legacy
            </p>
            
            <div className="mt-8 space-y-4 text-foreground/80 leading-relaxed max-w-lg">
              <p>
                Ashton Carter lived with purpose, excellence, and heart. A scholar, 
                leader, and light to those around him.
              </p>
              <p>
                His impact continues through the young people he inspired and the 
                opportunities this foundation creates in his name.
              </p>
            </div>
            
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/donate"
                className="inline-block bg-accent text-accent-foreground px-8 py-3 text-sm tracking-widest uppercase font-medium hover:bg-accent/90 transition-colors"
              >
                Give in His Honor
              </Link>
              <Link
                href="/his-story"
                className="inline-flex items-center gap-2 text-sm tracking-wide text-foreground hover:text-accent transition-colors group"
              >
                Continue His Story 
                <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
          
          {/* Portrait */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-80 md:w-96 lg:w-[520px] overflow-hidden rounded-sm">
              <Image
                src="/images/ashton-home.jpg"
                alt="Ashton Carter wearing a black tuxedo with bow tie"
                width={1040}
                height={1300}
                quality={100}
                unoptimized
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
