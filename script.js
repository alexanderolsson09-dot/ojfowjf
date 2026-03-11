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
  'High-Pressure Race Starts',
  'Downwind Performance in Breeze',
  'Training Camp in Sweden',
  'International Venue Preparation',
  'Boat Handling & Teamwork',
  'Post-Race Analysis Sessions',
]

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

renderAchievements()
renderMilestones()
renderGallery()
setupMenu()
setYear()
