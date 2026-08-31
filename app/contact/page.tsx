import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact | AC7 Foundation",
  description: "Get in touch with the AC7 Foundation. We welcome your questions, stories, and interest in partnering with us.",
}

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wide">
              Get in Touch
            </h1>
            <p className="mt-6 font-serif text-xl md:text-2xl italic text-muted-foreground">
              We&apos;d love to hear from you
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="font-serif text-2xl text-foreground tracking-wide mb-6">
                  Send Us a Message
                </h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="donation">Donation Questions</option>
                      <option value="scholarship">Scholarship Information</option>
                      <option value="volunteer">Volunteer Opportunities</option>
                      <option value="partnership">Partnership Interest</option>
                      <option value="memory">Share a Memory</option>
                      <option value="media">Media Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground py-3 text-sm tracking-widest uppercase font-medium hover:bg-accent/90 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="lg:pl-8">
                <h2 className="font-serif text-2xl text-foreground tracking-wide mb-6">
                  Contact Information
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-2">
                      Email
                    </h3>
                    <p className="text-muted-foreground">
                      <a href="mailto:Management@Ac7foundation.com" className="hover:text-accent transition-colors">
                        Management@Ac7foundation.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-foreground uppercase tracking-wide mb-2">
                      Mailing Address
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      AC7 Foundation<br />
                      2102 Windsor Place STE 1<br />
                      Champaign, IL 61820
                    </p>
                  </div>

                  <div className="bg-card p-6 rounded-sm">
                    <h3 className="font-serif text-lg text-foreground mb-3">
                      Response Time
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We read every message and strive to respond within 2-3 business 
                      days. For urgent matters, please indicate so in your subject line.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Get Involved CTA */}
        <section className="py-20 bg-card">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide mb-6">
              Other Ways to Connect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Beyond reaching out directly, there are many ways to be part of the 
              AC7 Foundation community and help continue Ashton&apos;s legacy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-background p-6 rounded-sm">
                <h3 className="font-medium text-foreground mb-2">Volunteer</h3>
                <p className="text-sm text-muted-foreground">
                  Share your time and talents with our programs.
                </p>
              </div>
              <div className="bg-background p-6 rounded-sm">
                <h3 className="font-medium text-foreground mb-2">Partner</h3>
                <p className="text-sm text-muted-foreground">
                  Explore organizational partnerships and collaborations.
                </p>
              </div>
              <div className="bg-background p-6 rounded-sm">
                <h3 className="font-medium text-foreground mb-2">Spread the Word</h3>
                <p className="text-sm text-muted-foreground">
                  Share our mission with others who might be moved to help.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
