import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 bg-card">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide">
          Continue His Legacy
        </h2>
        <p className="mt-6 text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Your support helps us provide scholarships, leadership programs, and 
          community initiatives that honor Ashton&apos;s memory and empower the next 
          generation.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/donate"
            className="inline-block bg-accent text-accent-foreground px-8 py-3 text-sm tracking-widest uppercase font-medium hover:bg-accent/90 transition-colors"
          >
            Make a Donation
          </Link>
          <Link
            href="/contact"
            className="inline-block border border-foreground/20 text-foreground px-8 py-3 text-sm tracking-widest uppercase font-medium hover:bg-foreground/5 transition-colors"
          >
            Get Involved
          </Link>
        </div>
      </div>
    </section>
  )
}
