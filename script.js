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

function renderAchievements() {
  const grid = document.getElementById('achievements-grid')
  grid.innerHTML = achievements
    .map(
      (item) => `
      <article class="card panel">
        <p class="result-year">${item.year}</p>
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
        <div class="gallery-ph"></div>
        <figcaption>${item}</figcaption>
      </figure>
    `,
    )
    .join('')
}

function setupMenu() {
  const toggle = document.querySelector('.menu-toggle')
  const nav = document.querySelector('.nav-links')
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
  document.getElementById('year').textContent = new Date().getFullYear()
}

renderAchievements()
renderMilestones()
renderGallery()
setupMenu()
setYear()
