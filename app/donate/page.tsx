import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DonateForm } from "@/components/donate-form"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Donate | AC7 Foundation",
  description: "Support the AC7 Foundation's mission to continue Ashton Carter's legacy through scholarships, leadership programs, and community initiatives.",
}

const impactAreas = [
  {
    title: "Scholarships",
    description: "Help deserving students pursue their educational dreams with the same dedication Ashton showed.",
    impact: "Your gift provides direct financial support for tuition, books, and educational resources.",
  },
  {
    title: "Leadership Programs",
    description: "Invest in developing the next generation of servant leaders through mentorship and training.",
    impact: "Your gift funds workshops, conferences, and leadership development opportunities.",
  },
  {
    title: "Community Initiatives",
    description: "Support local community projects that embody Ashton's commitment to service and connection.",
    impact: "Your gift enables us to partner with organizations making a difference in our community.",
  },
]

export default function DonatePage() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wide">
              Give in His Honor
            </h1>
            <p className="mt-6 font-serif text-xl md:text-2xl italic text-muted-foreground">
              Continue his legacy of purpose, excellence, and heart
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="bg-card p-8 md:p-12 rounded-sm text-center">
              <p className="text-foreground/80 leading-relaxed">
                Every gift to the AC7 Foundation honors Ashton&apos;s memory and 
                creates opportunities for young people to achieve their potential. 
                Your generosity helps us provide scholarships, support leadership 
                development, and strengthen our community.
              </p>
            </div>
          </div>
        </section>

        {/* Donation Form */}
        <section className="pb-20">
          <div className="max-w-2xl mx-auto px-6">
            <DonateForm />

            {/* Other Ways to Give */}
            <div className="mt-12 bg-card p-8 rounded-sm">
              <h3 className="font-serif text-xl text-foreground tracking-wide mb-4">
                Other Ways to Support
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Memorial Gifts
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Honor a loved one with a gift in their memory. We&apos;ll notify 
                    the family of your thoughtful tribute.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Corporate Matching
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Many employers match charitable donations. Check with your HR 
                    department to potentially double your impact.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Planned Giving
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Include the AC7 Foundation in your estate plans to create a 
                    lasting legacy for future generations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Areas */}
        <section className="py-20 bg-card">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide text-center mb-12">
              Your Impact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {impactAreas.map((area) => (
                <article key={area.title} className="bg-background p-8 rounded-sm">
                  <h3 className="font-serif text-lg text-foreground tracking-wide mb-3">
                    {area.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {area.description}
                  </p>
                  <p className="text-xs text-foreground/70 leading-relaxed border-t border-border pt-4">
                    {area.impact}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Transparency */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide mb-6">
              Our Commitment to You
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              The AC7 Foundation is committed to transparency and accountability. 
              We believe you deserve to know exactly how your generosity is being 
              used to continue Ashton&apos;s legacy.
            </p>
            <div className="bg-card p-8 rounded-sm text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    501(c)(3) Status
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    The AC7 Foundation is a registered 501(c)(3) nonprofit 
                    organization. All donations are tax-deductible to the extent 
                    allowed by law.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Financial Transparency
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    We publish annual reports detailing our programs, impact, 
                    and financial stewardship. 
                    <Link href="/foundation" className="text-accent hover:underline ml-1">
                      View our reports
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact for Questions */}
        <section className="py-16 bg-card">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-muted-foreground">
              Questions about donating?{" "}
              <Link href="/contact" className="text-accent hover:underline">
                Contact us
              </Link>{" "}
              or email{" "}
              <a href="mailto:Management@Ac7foundation.com" className="text-accent hover:underline">
                Management@Ac7foundation.com
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
