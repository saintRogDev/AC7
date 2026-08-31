import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Metadata } from "next"
import Image from "next/image"

// Gallery categories
const galleryCategories = [
  {
    title: "Leadership",
    description: "Photos from Ashton's leadership roles and achievements.",
  },
  {
    title: "Family",
    description: "Memories of Ashton with his family and loved ones.",
  },
  {
    title: "Community",
    description: "Images showcasing Ashton's impact on the community.",
  },
]

export const metadata: Metadata = {
  title: "Gallery | AC7 Foundation",
  description: "Memories and moments from Ashton Carter's life - celebrating the joy, love, and impact he brought to everyone around him.",
}

// Gallery photos - aspect determines the container shape to ensure all faces are visible
const galleryPhotos = [
  {
    src: "/images/gallery/formal-portrait.jpg",
    alt: "Ashton in a black suit with gold and black striped tie, a formal fraternity portrait",
    objectPosition: "center 20%",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/images/gallery/family-friends.jpg",
    alt: "Ashton smiling with family and friends outside, wearing a Howard sweatshirt",
    objectPosition: "center 15%",
    aspect: "aspect-[4/3]",
    span: true,
  },
  {
    src: "/images/gallery/fraternity-brothers.jpg",
    alt: "Ashton smiling in the city with fraternity brothers, wearing a North Face jacket",
    objectPosition: "center 15%",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/images/gallery/award-ceremony.jpg",
    alt: "Ashton holding a framed award certificate in a black blazer with fraternity crest",
    objectPosition: "center 20%",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/images/gallery/family-group.jpg",
    alt: "Ashton with family members, arms around each other, smiling together in a church hall",
    objectPosition: "center 30%",
    aspect: "aspect-auto",
    rowSpan: true,
  },
  {
    src: "/images/gallery/tuxedo-portrait.jpg",
    alt: "Ashton in a tuxedo with bow tie, smiling in front of a fraternity crest",
    objectPosition: "center 20%",
    aspect: "aspect-[3/4]",
  },
]

export default function GalleryPage() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wide">
              Gallery
            </h1>
            <p className="mt-6 font-serif text-xl md:text-2xl italic text-muted-foreground">
              Moments that capture his spirit
            </p>
          </div>
        </section>

        {/* Gallery Introduction */}
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-muted-foreground leading-relaxed">
              Every photograph tells a story. These images capture the joy, love, 
              and warmth that Ashton brought to every moment. They remind us not 
              just of who he was, but of the happiness he created for everyone 
              around him.
            </p>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryPhotos.map((photo) => (
                <div
                  key={photo.src}
                  className={`group relative overflow-hidden rounded-sm ${photo.aspect} ${photo.span ? "md:col-span-2 lg:col-span-2" : ""} ${photo.rowSpan ? "lg:row-span-2" : ""}`}
                >
                  <Image
                    src={photo.src || "/placeholder.svg"}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: photo.objectPosition }}
                    sizes={photo.span ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Share Memories CTA */}
        <section className="py-20 bg-card">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground tracking-wide">
              Share Your Memories
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              If you have photos or memories of Ashton that you&apos;d like to 
              contribute to this gallery, we&apos;d be honored to include them. 
              Each memory helps paint a fuller picture of the life he lived and 
              the impact he made.
            </p>
            <div className="mt-8">
              <a
                href="mailto:Management@Ac7foundation.com"
                className="inline-block border border-foreground/20 text-foreground px-8 py-3 text-sm tracking-widest uppercase font-medium hover:bg-foreground/5 transition-colors"
              >
                Submit Your Photos
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Please email your photos to Management@Ac7foundation.com
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
