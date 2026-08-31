import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div>
            <h2 className="font-serif text-xl tracking-[0.2em] uppercase mb-2">
              AC7 Foundation
            </h2>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Continuing the legacy of Ashton Carter through education, 
              leadership, and community impact.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-medium tracking-wide uppercase mb-4">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-3" aria-label="Footer navigation">
              <Link href="/his-story" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                His Story
              </Link>
              <Link href="/foundation" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                About the Foundation
              </Link>
              <Link href="/donate" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Support Our Mission
              </Link>
              <Link href="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Get in Touch
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-medium tracking-wide uppercase mb-4">
              Connect
            </h3>
            <div className="text-sm text-primary-foreground/70 space-y-3">
              <p>
                <a 
                  href="mailto:Management@Ac7foundation.com" 
                  className="hover:text-primary-foreground transition-colors"
                >
                  Management@Ac7foundation.com
                </a>
              </p>
              <a
                href="https://www.instagram.com/ac7foundation/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mt-1"
                aria-label="Follow AC7 Foundation on Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span className="text-sm">@ac7foundation</span>
              </a>
              <p className="text-xs leading-relaxed">
                The AC7 Foundation is a 501(c)(3) nonprofit organization. 
                All donations are tax-deductible to the extent allowed by law.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/60">
            <p>&copy; {currentYear} AC7 Foundation. All rights reserved.</p>
            <p className="font-serif italic">
              &ldquo;Purpose, Excellence, and Heart&rdquo;
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
