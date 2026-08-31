import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "His Story | AC7 Foundation",
  description: "Learn about the life, values, and lasting impact of Ashton Carter - a scholar, leader, and beloved member of his community.",
}

export default function HisStoryPage() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wide">
              His Story
            </h1>
            <p className="mt-6 font-serif text-xl md:text-2xl italic text-muted-foreground">
              A life lived with purpose, excellence, and heart
            </p>
          </div>
        </section>

        {/* Life Story */}
        <section className="pb-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="prose prose-lg max-w-none">
              <article className="space-y-8 text-foreground/80 leading-relaxed">
                <div className="bg-card p-8 md:p-12 rounded-sm mb-12">
                  <p className="font-serif text-xl md:text-2xl italic text-foreground leading-relaxed text-center">
                    Ashton Carter was more than the sum of his accomplishments. 
                    He was a son, a brother, a friend, and a light to everyone 
                    who knew him.
                  </p>
                </div>

                <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide mt-12">
                  Early Life
                </h2>
                <p>
                  From his earliest days, Ashton demonstrated an uncommon combination 
                  of intellectual curiosity and genuine care for others. Growing up, 
                  he was known for his infectious smile, his thoughtful questions, 
                  and his willingness to help anyone in need.
                </p>
                <p>
                  His family instilled in him the values that would guide his entire 
                  life: faith, integrity, hard work, and service to others. These 
                  weren&apos;t abstract concepts to Ashton—they were lived principles 
                  that shaped every decision he made.
                </p>

                <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide mt-12">
                  Education and Achievement
                </h2>
                <p>
                  Ashton approached his education with the same dedication he brought 
                  to everything. He understood that learning wasn&apos;t just about 
                  grades or accolades—it was about growth, understanding, and preparing 
                  to make a meaningful contribution to the world.
                </p>
                <p>
                  As a scholar, he excelled not just academically but in building 
                  relationships with peers and mentors alike. He was the kind of 
                  student who made everyone around him better—quick to share notes, 
                  always willing to explain difficult concepts, and genuinely invested 
                  in the success of his classmates.
                </p>

                <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide mt-12">
                  Leadership and Service
                </h2>
                <p>
                  Ashton&apos;s leadership wasn&apos;t about titles or recognition. 
                  It was about showing up, doing the work, and lifting others along 
                  the way. He led by example, demonstrating that true leadership is 
                  inseparable from service.
                </p>
                <p>
                  Whether mentoring younger students, organizing community events, 
                  or simply being a dependable presence for those who needed support, 
                  Ashton understood that leadership is measured not by what we achieve 
                  for ourselves, but by what we enable others to become.
                </p>

                <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide mt-12">
                  Faith and Values
                </h2>
                <p>
                  At the center of Ashton&apos;s life was his faith. It wasn&apos;t 
                  something he wore on his sleeve or used to judge others—it was the 
                  quiet foundation that gave him strength, purpose, and peace. His 
                  faith informed how he treated people, how he handled challenges, 
                  and how he viewed his place in the world.
                </p>
                <p>
                  The number 7 held special significance for Ashton, representing 
                  spiritual completeness and the pursuit of wholeness in all areas 
                  of life. It reminded him that we are called to give our best in 
                  everything we do.
                </p>

                <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide mt-12">
                  His Impact
                </h2>
                <p>
                  The measure of a life well-lived isn&apos;t found in its length 
                  but in its depth—in the hearts touched, the lives changed, and 
                  the seeds planted that continue to grow long after we&apos;re gone.
                </p>
                <p>
                  Ashton touched countless lives. Teachers remember a student who 
                  genuinely wanted to learn. Friends remember someone who was always 
                  there when it mattered. Family remembers a son and brother whose 
                  love was unconditional and whose presence made every gathering 
                  warmer.
                </p>

                <blockquote className="bg-card p-8 md:p-10 rounded-sm my-12 border-l-4 border-accent">
                  <p className="font-serif text-xl italic text-foreground leading-relaxed">
                    &ldquo;Ashton didn&apos;t just dream about making a difference—he 
                    made one every single day, in ways both big and small. That&apos;s 
                    the legacy we carry forward.&rdquo;
                  </p>
                </blockquote>

                <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide mt-12">
                  A Living Legacy
                </h2>
                <p>
                  Though Ashton is no longer with us physically, his spirit lives on 
                  through the people he inspired, the values he embodied, and the 
                  foundation that bears his name. The AC7 Foundation exists to ensure 
                  that Ashton&apos;s commitment to education, leadership, and community 
                  continues to create opportunities for young people who share his drive 
                  and determination.
                </p>
                <p>
                  Every scholarship awarded, every young person mentored, every 
                  community strengthened—these are extensions of Ashton&apos;s legacy. 
                  They are proof that a life lived with purpose creates ripples that 
                  extend far beyond what we can see.
                </p>
              </article>
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-6">
                Help us continue Ashton&apos;s legacy of service and impact.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/donate"
                  className="inline-block bg-accent text-accent-foreground px-8 py-3 text-sm tracking-widest uppercase font-medium hover:bg-accent/90 transition-colors"
                >
                  Support the Foundation
                </Link>
                <Link
                  href="/foundation"
                  className="inline-flex items-center gap-2 text-sm tracking-wide text-foreground hover:text-accent transition-colors group"
                >
                  Learn About Our Work 
                  <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
