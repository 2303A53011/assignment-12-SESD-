// NewsNow — script.js

// === CONFIG ===
const API_KEY = 'YOUR_NEWSAPI_KEY_HERE'; // <-- replace with your key
const PAGE_SIZE = 8; // articles per page
const AUTO_REFRESH_INTERVAL_MS = 60000; // 60s

// === State ===
let state = {
  country: 'in',
  category: '',
  q: '',
  page: 1,
  totalResults: 0,
  autoRefresh: false,
  autoRefreshTimer: null
};

// === DOM ===
const countrySelect = document.getElementById('countrySelect');
const categorySelect = document.getElementById('categorySelect');
const qInput = document.getElementById('qInput');
const refreshBtn = document.getElementById('refreshBtn');
const autoRefreshToggle = document.getElementById('autoRefreshToggle');
const articlesDiv = document.getElementById('articles');
const paginationUl = document.getElementById('pagination');
const lastUpdatedDiv = document.getElementById('last-updated');
const alertsDiv = document.getElementById('alerts');

// Country list (NewsAPI supports these country codes)
const COUNTRIES = [
  { code: 'in', name: 'India' },
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'au', name: 'Australia' },
  { code: 'ca', name: 'Canada' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'sg', name: 'Singapore' }
];

function init() {
  populateCountries();
  attachListeners();
  loadFromUI();
  fetchAndRender();
}

function populateCountries() {
  COUNTRIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.name;
    countrySelect.appendChild(opt);
  });
  countrySelect.value = state.country;
}

function attachListeners() {
  countrySelect.addEventListener('change', () => { state.country = countrySelect.value; state.page = 1; fetchAndRender(); });
  categorySelect.addEventListener('change', () => { state.category = categorySelect.value; state.page = 1; fetchAndRender(); });
  qInput.addEventListener('keyup', debounce(() => { state.q = qInput.value.trim(); state.page = 1; fetchAndRender(); }, 600));
  refreshBtn.addEventListener('click', () => { fetchAndRender(true); });
  autoRefreshToggle.addEventListener('change', (e) => { state.autoRefresh = e.target.checked; setupAutoRefresh(); });
}

function loadFromUI() {
  countrySelect.value = state.country;
}

function setupAutoRefresh() {
  if (state.autoRefresh) {
    if (state.autoRefreshTimer) clearInterval(state.autoRefreshTimer);
    state.autoRefreshTimer = setInterval(() => fetchAndRender(true), AUTO_REFRESH_INTERVAL_MS);
  } else {
    if (state.autoRefreshTimer) clearInterval(state.autoRefreshTimer);
    state.autoRefreshTimer = null;
  }
}

function showAlert(message, type='danger', timeout=4000) {
  alertsDiv.innerHTML = `<div class="alert alert-${type} alert-sm" role="alert">${escapeHtml(message)}</div>`;
  if (timeout) setTimeout(() => { alertsDiv.innerHTML = ''; }, timeout);
}

function buildTopHeadlinesUrl() {
  // Use top-headlines endpoint when possible (country/category), otherwise fallback to everything
  const base = 'https://newsapi.org/v2/top-headlines';
  const params = new URLSearchParams();
  params.set('apiKey', API_KEY);
  params.set('pageSize', PAGE_SIZE);
  params.set('page', state.page);
  if (state.country) params.set('country', state.country);
  if (state.category) params.set('category', state.category);
  if (state.q) params.set('q', state.q);
  return `${base}?${params.toString()}`;
}

async function fetchAndRender(isAuto=false) {
  if (!API_KEY || API_KEY === 'YOUR_NEWSAPI_KEY_HERE') {
    showAlert('You must set your NewsAPI API key in script.js before fetching.', 'warning', 8000);
    return;
  }

  articlesDiv.innerHTML = loadingMarkup();
  paginationUl.innerHTML = '';

  try {
    const url = buildTopHeadlinesUrl();
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Network error: ${resp.status}`);
    const data = await resp.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'API returned an error');
    }

    state.totalResults = data.totalResults || 0;

    renderArticles(data.articles || []);
    renderPagination();
    updateLastUpdated(isAuto);

    if (state.totalResults === 0) showAlert('No articles found for the selected filters.', 'info', 4000);
  } catch (err) {
    console.error(err);
    showAlert('Failed to fetch news: ' + err.message, 'danger', 8000);
    articlesDiv.innerHTML = '<div class="col-12">\n  <div class="alert alert-warning">Could not load articles. Check your API key and network.</div>\n</div>';
  }
}

function loadingMarkup() {
  return Array.from({length: PAGE_SIZE}).map(() => (
    `<div class="col-md-6 col-lg-3">
      <div class="card p-2 article-card">
        <div class="placeholder-glow">
          <div class="placeholder w-100" style="height:140px"></div>
          <div class="mt-2 placeholder w-75"></div>
          <div class="mt-1 placeholder w-50"></div>
        </div>
      </div>
    </div>`
  )).join('');
}

function renderArticles(articles) {
  if (!articles || articles.length === 0) {
    articlesDiv.innerHTML = '<div class="col-12"><div class="alert alert-secondary">No articles to show.</div></div>';
    return;
  }

  articlesDiv.innerHTML = articles.map(a => {
    const img = a.urlToImage || '';
    const title = a.title || 'No title';
    const desc = a.description || '';
    const source = (a.source && a.source.name) ? a.source.name : '';
    const publishedAt = a.publishedAt ? new Date(a.publishedAt).toLocaleString() : '';

    return `
      <div class="col-md-6 col-lg-3">
        <div class="card h-100">
          ${img ? `<img src="${escapeAttr(img)}" class="card-img-top article-image" alt="article image">` : ''}
          <div class="card-body d-flex flex-column">
            <h6 class="card-title">${escapeHtml(title)}</h6>
            <p class="card-text small text-muted mb-2">${escapeHtml(source)} · ${escapeHtml(publishedAt)}</p>
            <p class="card-text" style="flex:1">${escapeHtml(desc)}</p>
            <div class="mt-2 text-end">
              <a href="${escapeAttr(a.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary">Read</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPagination() {
  const totalPages = Math.ceil((state.totalResults || 0) / PAGE_SIZE) || 1;
  const current = state.page;

  // clamp page
  if (current > totalPages) state.page = 1;

  const items = [];

  // Prev
  items.push(`<li class="page-item ${current === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${current-1}">Prev</a></li>`);

  // show up to 5 page buttons (smart window)
  cons
