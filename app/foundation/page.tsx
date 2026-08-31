import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About the Foundation | AC7 Foundation",
  description: "Learn about the AC7 Foundation's mission, programs, leadership, and commitment to continuing Ashton Carter's legacy.",
}

const programs = [
  {
    title: "AC7 Scholarship Program",
    description: "Annual scholarships for graduating high school seniors who demonstrate academic excellence, leadership, and community service. Recipients embody the values Ashton lived by.",
    status: "Applications opening soon",
  },
  {
    title: "Leadership Development",
    description: "Workshops, mentorship, and conferences that help young people develop the skills and character to become servant leaders in their communities.",
    status: "Program in development",
  },
  {
    title: "Community Service Grants",
    description: "Small grants to support local initiatives and organizations doing meaningful work in education, youth development, and community building.",
    status: "Coming soon",
  },
]

const values = [
  {
    title: "Purpose",
    description: "We believe everyone has a unique calling. Our work helps young people discover and pursue their purpose with intention and clarity.",
  },
  {
    title: "Excellence",
    description: "We honor Ashton's commitment to giving his best in everything. We encourage and support the pursuit of excellence in all areas of life.",
  },
  {
    title: "Heart",
    description: "Achievement means little without compassion. We cultivate leaders who lead with empathy, serve with humility, and love without reservation.",
  },
  {
    title: "Faith",
    description: "Ashton's faith was the foundation of his life. While we serve people of all backgrounds, we honor the spiritual values that guided him.",
  },
  {
    title: "Community",
    description: "We are stronger together. Our work builds connections, strengthens relationships, and creates networks of support and encouragement.",
  },
  {
    title: "Legacy",
    description: "We think beyond the moment. Every program, every scholarship, every initiative is designed to create lasting, generational impact.",
  },
]

export default function FoundationPage() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wide">
              The Foundation
            </h1>
            <p className="mt-6 font-serif text-xl md:text-2xl italic text-muted-foreground">
              Building on a legacy of service
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="pb-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-card p-8 md:p-12 rounded-sm">
              <h2 className="font-serif text-2xl text-foreground tracking-wide text-center mb-6">
                Our Mission
              </h2>
              <p className="text-foreground/80 leading-relaxed text-center text-lg">
                The AC7 Foundation exists to honor the life and legacy of Ashton 
                Carter by creating opportunities for education, developing servant 
                leaders, and strengthening communities. We believe in empowering 
                young people to discover their purpose and pursue it with excellence 
                and heart.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-card">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide text-center mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value) => (
                <article key={value.title} className="bg-background p-8 rounded-sm">
                  <h3 className="font-serif text-lg text-foreground tracking-wide mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Programs */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide text-center mb-4">
              Our Programs
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              We are building programs that create meaningful, lasting impact in the 
              lives of young people and communities.
            </p>
            <div className="space-y-6">
              {programs.map((program) => (
                <article key={program.title} className="bg-card p-8 rounded-sm">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl text-foreground tracking-wide mb-3">
                        {program.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {program.description}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <span className="inline-block text-xs tracking-wide uppercase bg-accent/10 text-accent px-3 py-1 rounded-sm">
                        {program.status}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-20 bg-card">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide text-center mb-4">
              Leadership
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              The AC7 Foundation is led by those who knew Ashton best and are 
              committed to honoring his memory through meaningful action.
            </p>
            <div className="bg-background p-8 md:p-12 rounded-sm text-center">
              <p className="text-muted-foreground leading-relaxed">
                Board member profiles coming soon. The foundation is led by family 
                members, close friends, and community leaders dedicated to continuing 
                Ashton&apos;s legacy of service and impact.
              </p>
            </div>
          </div>
        </section>

        {/* Transparency */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide text-center mb-12">
              Transparency & Accountability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-8 rounded-sm">
                <h3 className="font-serif text-lg text-foreground tracking-wide mb-3">
                  Our Commitment
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We believe in complete transparency with our donors and community. 
                  Every dollar donated goes toward our mission of creating opportunities 
                  and building leaders. We publish regular updates on our programs 
                  and their impact.
                </p>
              </div>
              <div className="bg-card p-8 rounded-sm">
                <h3 className="font-serif text-lg text-foreground tracking-wide mb-3">
                  Legal Status
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The AC7 Foundation is a registered 501(c)(3) nonprofit organization. 
                  All donations are tax-deductible to the extent allowed by law. 
                  Our EIN and annual reports will be available here once finalized.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-card">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide mb-6">
              Join Us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Whether through giving, volunteering, or simply spreading the word, 
              you can be part of continuing Ashton&apos;s legacy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/donate"
                className="inline-block bg-accent text-accent-foreground px-8 py-3 text-sm tracking-widest uppercase font-medium hover:bg-accent/90 transition-colors"
              >
                Support Our Mission
              </Link>
              <Link
                href="/contact"
                className="inline-block border border-foreground/20 text-foreground px-8 py-3 text-sm tracking-widest uppercase font-medium hover:bg-foreground/5 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
