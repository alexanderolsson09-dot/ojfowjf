// Anpassa innehåll här: byt texter, länkar och bildsökvägar utan att ändra HTML/CSS.
const siteContent = {
  brand: 'ALEXANDER OLSSON',
  heroEyebrow: 'Swedish Elite Sailing Portfolio',
  heroName: 'Alexander Olsson',
  heroTitle: 'Competitive 29er Sailor · International Regatta Campaign',
  heroCopy:
    'Focused on disciplined execution, measurable progression, and long-term development toward top-tier international competition.',
  aboutIntro:
    'Alexander Olsson is a Swedish sailor with a competitive 29er background, built through structured training, international fleet racing, and a high-performance mindset.',
  aboutCardTitle: 'Performance Profile',
  aboutCardBody:
    'Alexander combines technical sailing sessions, physical conditioning, and detailed race debriefs to improve consistency in starts, speed, and tactical decisions under pressure.',
  profileLabel: 'Athlete portrait / campaign image',
  resultsIntro: 'A polished competitive record designed for easy updates as campaigns progress.',
  journeyIntro:
    'Every season is planned around incremental gains, disciplined routines, and long-term elite performance goals.',
  galleryIntro: 'A visual overview of racing, training, and campaign moments.',
  sponsorIntro:
    'Open to partnerships with premium brands, performance-driven campaigns, and selected media opportunities aligned with elite sailing.',
  sponsorEmail: 'partners@alexanderolsson.com',
  sponsorEmailLink: 'mailto:partners@alexanderolsson.com',
  mediaEmail: 'media@alexanderolsson.com',
  mediaEmailLink: 'mailto:media@alexanderolsson.com',
  contactIntro: 'Direct channels for team communication and social updates.',
  contactEmail: 'Email: alexander@example.com',
  contactEmailLink: 'mailto:alexander@example.com',
  contactInstagram: 'Instagram: @alexanderolsson',
  instagramLink: 'https://instagram.com',
  footerName: 'Alexander Olsson',
  heroImage: './images/hero-sailing.svg',
  profileImage: './images/profile.svg',
}

const achievements = [
  {
    year: '2025',
    title: 'Top Fleet International Regatta Finish',
    tag: 'International',
    detail:
      'Delivered a season-best result in a high-level 29er fleet through disciplined race management and improved consistency across all series days.',
  },
  {
    year: '2024',
    title: 'Swedish Youth Championship Medal Position',
    tag: 'National',
    detail:
      'Secured a medal-place campaign with strong starts, tactical composure, and reliable closing races under pressure.',
  },
  {
    year: '2023',
    title: 'Scandinavian Circuit Performance Progression',
    tag: 'Circuit',
    detail:
      'Built international racing depth with measurable gains in speed profile, mark-rounding efficiency, and fleet positioning.',
  },
]

const milestones = [
  { label: 'Years in Competition', value: '8+' },
  { label: 'International Regattas', value: '20+' },
  { label: 'Training Days / Year', value: '200+' },
  { label: 'Long-Term Goal', value: 'World-Class Level' },
]

const galleryItems = [
  { caption: 'High-Pressure Race Starts', image: './images/gallery-1.svg' },
  { caption: 'Downwind Performance in Breeze', image: './images/gallery-2.svg' },
  { caption: 'Training Camp in Sweden', image: './images/gallery-3.svg' },
  { caption: 'International Venue Preparation', image: './images/gallery-4.svg' },
  { caption: 'Boat Handling & Teamwork', image: './images/gallery-5.svg' },
  { caption: 'Post-Race Analysis Sessions', image: './images/gallery-6.svg' },
]

function applyTextContent() {
  document.querySelectorAll('[data-text]').forEach((node) => {
    const key = node.getAttribute('data-text')
    if (siteContent[key]) node.textContent = siteContent[key]
  })

  document.querySelectorAll('[data-href]').forEach((node) => {
    const key = node.getAttribute('data-href')
    if (siteContent[key]) node.setAttribute('href', siteContent[key])
  })
}

function applyImages() {
  const heroImage = document.getElementById('hero-image')
  const profileImage = document.getElementById('profile-image')

  if (heroImage && siteContent.heroImage) heroImage.src = siteContent.heroImage
  if (profileImage && siteContent.profileImage) profileImage.src = siteContent.profileImage
}

function renderAchievements() {
  const grid = document.getElementById('achievements-grid')
  grid.innerHTML = achievements
    .map(
      (item) => `
      <article class="achievement-card">
        <div class="result-topline">
          <span class="result-year">${item.year}</span>
          <span class="result-tag">${item.tag}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      </article>
    `,
    )
    .join('')
}

function renderMilestones() {
  const grid = document.getElementById('milestones-grid')
  grid.innerHTML = milestones
    .map(
      (item) => `
      <article class="card stat">
        <p class="stat-value">${item.value}</p>
        <p class="stat-label">${item.label}</p>
      </article>
    `,
    )
    .join('')
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid')
  grid.innerHTML = galleryItems
    .map(
      (item) => `
      <figure class="card gallery-item">
        <img class="gallery-img" src="${item.image}" alt="${item.caption}" loading="lazy" />
        <figcaption>${item.caption}</figcaption>
      </figure>
    `,
    )
    .join('')
}

function setupMenu() {
  const toggle = document.querySelector('.menu-toggle')
  const nav = document.querySelector('.nav-links')
  if (!toggle || !nav) return

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open')
    toggle.setAttribute('aria-expanded', String(isOpen))
  })

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open')
      toggle.setAttribute('aria-expanded', 'false')
    })
  })
}

function setYear() {
  const yearEl = document.getElementById('year')
  if (yearEl) yearEl.textContent = new Date().getFullYear()
}

applyTextContent()
applyImages()
renderAchievements()
renderMilestones()
renderGallery()
setupMenu()
setYear()
