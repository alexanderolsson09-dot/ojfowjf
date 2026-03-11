const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Results', href: '#results' },
  { label: 'Journey', href: '#journey' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

const achievements = [
  {
    year: '2024',
    title: 'International 29er Regatta Circuit',
    detail:
      'Consistent top fleet placements across multiple events with measurable progression in starts and downwind speed.',
  },
  {
    year: '2023',
    title: 'National Youth Championship Campaign',
    detail:
      'Delivered a full-season performance plan focused on tactical discipline, boat handling, and race consistency.',
  },
  {
    year: '2022',
    title: 'Scandinavian Regatta Series',
    detail:
      'Built competitive international experience through high-level fleet racing and structured post-race analysis.',
  },
]

const milestones = [
  { label: 'Years Competing', value: '8+' },
  { label: 'International Regattas', value: '20+' },
  { label: 'Annual Training Days', value: '200+' },
  { label: 'Long-Term Objective', value: 'Top Tier Elite' },
]

const galleryItems = [
  'Race Start Sequence',
  'High-Speed Downwind',
  'Training Block in Sweden',
  'International Regatta Venue',
  'Team Preparation',
  'Podium Focus',
]

function SectionHeader({ title, subtitle }) {
  return (
    <header>
      <h2 className="section-title">{title}</h2>
      <p className="section-subtitle">{subtitle}</p>
    </header>
  )
}

function App() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <a href="#top" className="text-sm font-semibold tracking-[0.18em] text-navy-900">
            ALEXANDER OLSSON
          </a>
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  className="text-sm text-slate-600 transition hover:text-navy-800"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="top">
        <section className="section-shell grid min-h-[calc(100vh-80px)] items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sea-500">
              Swedish Elite Sailing Profile
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-navy-900 md:text-6xl">
              Alexander Olsson
            </h1>
            <p className="mt-3 text-lg font-medium text-slate-700 md:text-xl">
              Elite Sailor · Competitive 29er Sailor
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600">
              A performance-driven sailor focused on disciplined preparation, international
              competition, and long-term development toward the highest level of the sport.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#about"
                className="rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-navy-800"
              >
                About
              </a>
              <a
                href="#results"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-navy-700 hover:text-navy-800"
              >
                Results
              </a>
              <a
                href="#contact"
                className="rounded-full border border-sea-400/50 bg-sea-400/10 px-6 py-3 text-sm font-medium text-sea-500 transition hover:bg-sea-400/20"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="relative animate-fade-up">
            <div className="absolute inset-0 -translate-x-4 translate-y-4 rounded-3xl bg-sea-400/15" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="mb-4 aspect-[4/5] rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100" />
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile image</p>
              <p className="mt-2 text-sm text-slate-600">
                Placeholder for athlete portrait or action image from racing events.
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="section-shell border-t border-slate-200/80">
          <SectionHeader
            title="About"
            subtitle="Alexander Olsson is a Swedish sailor with a competitive 29er background, shaped by consistent training, tactical growth, and clear high-performance goals."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
              <h3 className="text-lg font-semibold text-navy-900">Athlete Profile</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Alexander combines structure and intensity in daily training, balancing
                technical sailing work, physical preparation, and race analysis. His approach
                is centered on long-term progression and execution under pressure.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
              <h3 className="text-lg font-semibold text-navy-900">Biography Placeholder</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Add a concise biography here, including hometown, team setup, coaching
                environment, and key moments that shaped his competitive path.
              </p>
            </article>
          </div>
        </section>

        <section id="results" className="section-shell border-t border-slate-200/80">
          <SectionHeader
            title="Results & Achievements"
            subtitle="A clean, editable overview of competitive milestones from national and international regatta campaigns."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {achievements.map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-sm font-semibold tracking-wide text-sea-500">{item.year}</p>
                <h3 className="mt-3 text-lg font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="journey" className="section-shell border-t border-slate-200/80">
          <SectionHeader
            title="Sailing Journey"
            subtitle="From early development to international competition, each season is built around measurable progression and race-ready consistency."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-soft">
                <p className="text-2xl font-semibold text-navy-900">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="gallery" className="section-shell border-t border-slate-200/80">
          <SectionHeader
            title="Gallery"
            subtitle="Image placeholders for regatta moments, training sessions, and behind-the-scenes performance work."
          />
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {galleryItems.map((item) => (
              <figure key={item} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 transition duration-300 group-hover:scale-[1.03]" />
                <figcaption className="border-t border-slate-100 px-4 py-3 text-xs tracking-wide text-slate-500">
                  {item}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="contact" className="section-shell border-t border-slate-200/80">
          <SectionHeader
            title="Contact"
            subtitle="For collaborations, sponsorship opportunities, or media requests, connect through the channels below."
          />
          <div className="mt-8 flex flex-col gap-3 text-sm text-slate-700">
            <a className="w-fit hover:text-navy-900" href="mailto:alexander@example.com">
              Email: alexander@example.com
            </a>
            <a className="w-fit hover:text-navy-900" href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram: @alexanderolsson
            </a>
            <a className="w-fit hover:text-navy-900" href="#">
              Sponsor inquiries
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} Alexander Olsson. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#about" className="hover:text-slate-700">About</a>
            <a href="#results" className="hover:text-slate-700">Results</a>
            <a href="#contact" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
