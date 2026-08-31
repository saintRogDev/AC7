export function MissionSection() {
  const pillars = [
    {
      title: "Education",
      description:
        "Supporting scholarships and educational opportunities for young people pursuing their dreams with determination and integrity.",
    },
    {
      title: "Leadership",
      description:
        "Developing the next generation of servant leaders through mentorship, programs, and community engagement.",
    },
    {
      title: "Community",
      description:
        "Building stronger communities through service, connection, and the spirit of giving back that Ashton embodied.",
    },
  ]

  return (
    <section className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-wide">
            Our Mission
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            The AC7 Foundation exists to honor Ashton Carter&apos;s memory by creating 
            lasting opportunities for education, leadership development, and community 
            impact. We believe in empowering young people to reach their full potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="text-center p-8 bg-background rounded-sm"
            >
              <h3 className="font-serif text-xl text-foreground tracking-wide">
                {pillar.title}
              </h3>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
