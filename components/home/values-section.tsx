import Link from "next/link"

export function ValuesSection() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide">
              A Life of Purpose
            </h2>
            <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Ashton Carter understood that life&apos;s true measure isn&apos;t found in 
                personal achievements alone, but in how we lift others along the way. 
                As a scholar, he pursued knowledge with passion. As a leader, he 
                served with humility. As a friend and family member, he loved without 
                reservation.
              </p>
              <p>
                His faith guided his steps, and his commitment to excellence inspired 
                everyone who knew him. The number 7 held special significance in his 
                life—representing completeness, spiritual wholeness, and the pursuit 
                of perfection in all things.
              </p>
              <p>
                Through this foundation, we carry forward his vision: that every young 
                person deserves the chance to discover their purpose and the support 
                to pursue it.
              </p>
            </div>
            <div className="mt-10">
              <Link
                href="/his-story"
                className="inline-flex items-center gap-2 text-sm tracking-wide text-accent hover:text-accent/80 transition-colors group"
              >
                Read his full story 
                <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
          
          <div className="flex justify-center">
            <blockquote className="bg-card p-10 rounded-sm max-w-md">
              <p className="font-serif text-xl md:text-2xl italic text-foreground leading-relaxed">
                &ldquo;Purpose, excellence, and heart&mdash;these aren&apos;t just words. 
                They&apos;re a way of living.&rdquo;
              </p>
              <footer className="mt-6">
                <cite className="not-italic text-sm text-muted-foreground">
                  &mdash; Ashton Carter
                </cite>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}
