// ── SocialFlow Frontend ───────────────────────────────────────────────────────

const PLATFORM_ICONS = {
  twitter: '🐦',
  discord: '💬',
  bluesky: '🦋',
  facebook: '📘',
  instagram: '📸',
  tiktok: '🎵',
  youtube: '▶️',
  tumblr: '📝'
};

const FEED_DIRECTORY = [
  { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', category: 'crypto', icon: '🪙', desc: 'Leading crypto news and analysis' },
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'crypto', icon: '🪙', desc: 'Bitcoin, Ethereum and crypto markets' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed', category: 'crypto', icon: '🪙', desc: 'Crypto news, guides and analysis' },
  { name: 'Bitcoin Magazine', url: 'https://bitcoinmagazine.com/.rss/full/', category: 'crypto', icon: '₿', desc: 'The original Bitcoin publication' },
  { name: 'The Block', url: 'https://www.theblock.co/rss.xml', category: 'crypto', icon: '🪙', desc: 'Crypto research and news' },
  { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/', category: 'crypto', icon: '🪙', desc: 'Crypto news and blockchain insights' },
  { name: 'ForexLive', url: 'https://www.forexlive.com/feed/news', category: 'forex', icon: '💱', desc: 'Real-time forex news and analysis' },
  { name: 'FXStreet', url: 'https://www.fxstreet.com/rss/news', category: 'forex', icon: '💱', desc: 'Forex news, rates and analysis' },
  { name: 'DailyFX', url: 'https://www.dailyfx.com/feeds/all', category: 'forex', icon: '💱', desc: 'Forex trading news and education' },
  { name: 'Investing.com Forex', url: 'https://www.investing.com/rss/news_285.rss', category: 'forex', icon: '💱', desc: 'Forex news from Investing.com' },
  { name: 'Nasdaq Forex', url: 'https://www.nasdaq.com/feed/rssoutbound?category=Currencies', category: 'forex', icon: '💱', desc: 'Currency news from Nasdaq' },
  { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', category: 'stocks', icon: '📈', desc: 'Stock market news and analysis' },
  { name: 'Seeking Alpha', url: 'https://seekingalpha.com/feed.xml', category: 'stocks', icon: '📈', desc: 'Stock analysis and investing ideas' },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'stocks', icon: '📈', desc: 'Financial news and stock data' },
  { name: 'Motley Fool', url: 'https://www.fool.com/feeds/index.aspx', category: 'stocks', icon: '📈', desc: 'Stock picks and investing advice' },
  { name: 'Benzinga', url: 'https://www.benzinga.com/feed', category: 'stocks', icon: '📈', desc: 'Stock market news and trading ideas' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech', icon: '💻', desc: 'Startup and technology news' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech', icon: '💻', desc: 'Technology, science and culture' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'tech', icon: '💻', desc: 'Technology and its impact on culture' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech', icon: '💻', desc: 'In-depth tech news and analysis' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'tech', icon: '💻', desc: 'Tech community top stories' },
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'news', icon: '📰', desc: 'Breaking news from the BBC' },
  { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews', category: 'news', icon: '📰', desc: 'World news from Reuters' },
  { name: 'Associated Press', url: 'https://rsshub.app/apnews/topics/apf-topnews', category: 'news', icon: '📰', desc: 'Breaking news from AP' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'news', icon: '📰', desc: 'World news from The Guardian' },
];

let currentCategory = 'all';
let selectedPlatformIds = new Set();
let selectedImage = null;

// ── Page Navigation ───────────────────────────────────────────────────────────
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  document.querySelectorAll('.sidebar-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });
  if (page === 'compose')   loadCompose();
  if (page === 'dashboard') loadDashboard();
  if (page === 'feeds')     loadFeeds();
  if (page === 'platforms') loadPlatforms();
  if (page === 'history')   loadHistory();
  if (page === 'discover')  renderDiscoverGrid();
}

// ── Compose ───────────────────────────────────────────────────────────────────
async function loadCompose() {
  const platforms = await fetch('/api/platforms').then(r => r.json());
  const el = document.getElementById('compose-accounts');
  if (!el) return;

  if (platforms.length === 0) {
    el.innerHTML = '<div style="color:var(--muted);font-size:13px;">No platforms connected. <a href="#" onclick="showPage(\'platforms\')" style="color:var(--accent);">Add platforms</a></div>';
    return;
  }

  selectedPlatformIds = new Set(platforms.map(p => p.id));

  el.innerHTML = platforms.map(p => `
    <div class="compose-account" id="compose-acct-${p.id}" onclick="toggleComposeAccount(${p.id})"
      style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:8px;border-radius:8px;border:2px solid var(--accent);background:#e8f0fd;min-width:70px;">
      <div style="width:44px;height:44px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">
        ${<img src="https://cdn.simpleicons.org/${p.type === 'twitter' ? 'x' : p.type}" width="24" height="24" onerror="this.style.display='none'" />'}
      </div>
      <div style="font-size:11px;font-weight:500;color:var(--text);text-align:center;max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(p.name)}</div>
    </div>
  `).join('');

  document.getElementById('compose-text').addEventListener('input', updateCharCount);
}

function toggleComposeAccount(id) {
  const el = document.getElementById('compose-acct-' + id);
  if (selectedPlatformIds.has(id)) {
    selectedPlatformIds.delete(id);
    el.style.borderColor = 'var(--border)';
    el.style.background = 'var(--white)';
  } else {
    selectedPlatformIds.add(id);
    el.style.borderColor = 'var(--accent)';
    el.style.background = '#e8f0fd';
  }
}

function updateCharCount() {
  const text = document.getElementById('compose-text').value;
  const el = document.getElementById('char-count');
  if (!el) return;
  el.textContent = text.length + ' / 280';
  el.style.color = text.length > 280 ? 'var(--red)' : 'var(--muted)';
}

async function generateAIPost() {
  const topic = document.getElementById('ai-topic').value.trim();
  const tone = document.getElementById('ai-tone').value;
  if (!topic) { alert('Enter a topic first.'); return; }

  const btn = event.target;
  btn.textContent = 'Generating…';
  btn.disabled = true;

  try {
    const res = await fetch('/api/generate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, tone }),
    });
    const data = await res.json();
    if (data.post) {
      document.getElementById('compose-text').value = data.post;
      updateCharCount();
    } else {
      alert('Failed to generate. Check your OpenAI API key in Railway.');
    }
  } catch(e) {
    alert('Error: ' + e.message);
  }

  btn.textContent = '✨ Generate';
  btn.disabled = false;
}

// ── Image Functions ───────────────────────────────────────────────────────────
function toggleImageMenu() {
  const menu = document.getElementById('image-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function triggerImageUpload() {
  document.getElementById('image-menu').style.display = 'none';
  document.getElementById('image-upload').click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    selectedImage = e.target.result;
    document.getElementById('image-preview-img').src = selectedImage;
    document.getElementById('image-preview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  selectedImage = null;
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('image-preview-img').src = '';
  document.getElementById('image-upload').value = '';
}

function openUnsplash() {
  document.getElementById('image-menu').style.display = 'none';
  const panel = document.getElementById('unsplash-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

async function searchUnsplash() {
  const query = document.getElementById('unsplash-query').value.trim();
  if (!query) return;
  const resultsEl = document.getElementById('unsplash-results');
  resultsEl.innerHTML = '<div style="color:var(--muted);font-size:12px;">Searching…</div>';

  try {
    const res = await fetch('/api/unsplash?query=' + encodeURIComponent(query));
    const data = await res.json();
    if (!data.results || !data.results.length) {
      resultsEl.innerHTML = '<div style="color:var(--muted);font-size:12px;">No images found.</div>';
      return;
    }
    resultsEl.innerHTML = data.results.map((img, i) => `
      <img src="${img.urls.small}" onclick="selectUnsplashImage('${img.urls.regular}')"
        style="width:100%;height:80px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid transparent;"
        onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='transparent'" />
    `).join('');
  } catch(e) {
    resultsEl.innerHTML = '<div style="color:var(--red);font-size:12px;">Error searching.</div>';
  }
}

function selectUnsplashImage(url) {
  selectedImage = url;
  document.getElementById('image-preview-img').src = url;
  document.getElementById('image-preview').style.display = 'block';
  document.getElementById('unsplash-panel').style.display = 'none';
}

document.addEventListener('click', e => {
  if (!e.target.closest('#image-menu') && !e.target.closest('[onclick="toggleImageMenu()"]')) {
    const menu = document.getElementById('image-menu');
    if (menu) menu.style.display = 'none';
  }
});

async function publishPost() {
  const content = document.getElementById('compose-text').value.trim();
  if (!content) { alert('Write something first.'); return; }
  if (selectedPlatformIds.size === 0) { alert('Select at least one platform.'); return; }

  const btn = event.target;
  btn.textContent = '⏳ Posting…';
  btn.disabled = true;

  const res = await fetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, platformIds: Array.from(selectedPlatformIds) }),
  });
  const data = await res.json();

  const resultsEl = document.getElementById('publish-results');
  resultsEl.innerHTML = data.results.map(r => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;">
      <span>${PLATFORM_ICONS[r.platform] || '🌐'}</span>
      <span>${r.platform}</span>
      <span class="${r.status === 'posted' ? 'badge-posted' : 'badge-failed'}">${r.status}</span>
    </div>
  `).join('');

  btn.textContent = '➤ Post Now';
  btn.disabled = false;
}

// ── Discover ──────────────────────────────────────────────────────────────────
function filterCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderDiscoverGrid();
}

function renderDiscoverGrid() {
  const grid = document.getElementById('discover-grid');
  if (!grid) return;
  const searchTerm = (document.getElementById('topic-search') ? document.getElementById('topic-search').value : '').toLowerCase();
  let filtered = currentCategory === 'all' ? FEED_DIRECTORY : FEED_DIRECTORY.filter(f => f.category === currentCategory);

  if (searchTerm) {
    filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(searchTerm) ||
      f.desc.toLowerCase().includes(searchTerm) ||
      f.category.toLowerCase().includes(searchTerm)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:20px 0;">No feeds found. Try the URL finder above!</div>';
    return;
  }

  grid.innerHTML = filtered.map((feed, i) => `
    <div class="discover-card">
      <div class="discover-card-top">
        <div class="discover-card-icon">${feed.icon}</div>
        <div>
          <div class="discover-card-name">${feed.name}</div>
          <div class="discover-tag">${feed.category}</div>
        </div>
      </div>
      <div class="discover-card-desc">${feed.desc}</div>
      <div class="discover-card-url">${feed.url}</div>
      <div class="discover-card-footer">
        <button class="btn btn-primary" id="add-btn-${i}" onclick="addDiscoverFeed(${i})">+ Add Feed</button>
      </div>
    </div>
  `).join('');
}

async function addDiscoverFeed(index) {
  const searchTerm = (document.getElementById('topic-search') ? document.getElementById('topic-search').value : '').toLowerCase();
  let filtered = currentCategory === 'all' ? FEED_DIRECTORY : FEED_DIRECTORY.filter(f => f.category === currentCategory);
  if (searchTerm) {
    filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(searchTerm) ||
      f.desc.toLowerCase().includes(searchTerm) ||
      f.category.toLowerCase().includes(searchTerm)
    );
  }
  const feed = filtered[index];
  const btn = document.getElementById('add-btn-' + index);
  btn.textContent = 'Adding…';
  btn.disabled = true;

  const platforms = await fetch('/api/platforms').then(r => r.json());
  const res = await fetch('/api/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: feed.name, url: feed.url, check_interval: 30, max_items: 3, post_immediately: 1, active: 1 }),
  });
  const data = await res.json();

  if (!res.ok) {
    btn.textContent = data.error && data.error.includes('already') ? '✓ Already added' : 'Failed';
    btn.className = 'btn btn-ghost';
    return;
  }

  for (const p of platforms) {
    await fetch('/api/feeds/' + data.id + '/platforms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform_id: p.id }),
    });
  }

  btn.textContent = '✓ Added!';
  btn.className = 'btn btn-success';
}

async function findFeedFromUrl() {
  const url = document.getElementById('find-feed-url').value.trim();
  if (!url) { alert('Enter a website URL or topic first.'); return; }

  const btn = event.target;
  btn.textContent = 'Searching…';
  btn.disabled = true;

  const resultsEl = document.getElementById('find-feed-results');
  resultsEl.innerHTML = '<div style="color:var(--muted);font-size:12px;">Searching…</div>';

  try {
    const res = await fetch('/api/find-feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();

    if (!data.feeds || data.feeds.length === 0) {
      resultsEl.innerHTML = '<div style="color:var(--red);font-size:12px;">No RSS feeds found. Try a different topic or URL.</div>';
    } else {
      resultsEl.innerHTML = data.feeds.map((feed, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);margin-top:8px;">
          <div>
            <div style="font-size:13px;font-weight:500;color:var(--text);">${escHtml(feed.title)}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">${escHtml(feed.url)}</div>
          </div>
          <button class="btn btn-primary" id="url-add-btn-${i}" onclick="addFoundFeed(${i}, '${escHtml(feed.title)}', '${escHtml(feed.url)}')">+ Add</button>
        </div>
      `).join('');
    }
  } catch(e) {
    resultsEl.innerHTML = '<div style="color:var(--red);font-size:12px;">Error. Try again.</div>';
  }

  btn.textContent = 'Find RSS';
  btn.disabled = false;
}

async function addFoundFeed(index, title, url) {
  const btn = document.getElementById('url-add-btn-' + index);
  btn.textContent = 'Adding…';
  btn.disabled = true;

  const platforms = await fetch('/api/platforms').then(r => r.json());
  const res = await fetch('/api/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: title, url, check_interval: 30, max_items: 3, post_immediately: 1, active: 1 }),
  });
  const data = await res.json();

  if (!res.ok) {
    btn.textContent = data.error && data.error.includes('already') ? '✓ Already added' : 'Failed';
    btn.className = 'btn btn-ghost';
    return;
  }

  for (const p of platforms) {
    await fetch('/api/feeds/' + data.id + '/platforms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform_id: p.id }),
    });
  }

  btn.textContent = '✓ Added!';
  btn.className = 'btn btn-success';
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const stats = await fetch('/api/stats').then(r => r.json());
    document.getElementById('stats-row').innerHTML = `
      <div class="stat-card"><div class="stat-value">${stats.activeFeeds}</div><div class="stat-label">Active Feeds</div></div>
      <div class="stat-card"><div class="stat-value">${stats.platforms}</div><div class="stat-label">Platforms</div></div>
      <div class="stat-card"><div class="stat-value">${stats.todayPosts}</div><div class="stat-label">Posted Today</div></div>
      <div class="stat-card"><div class="stat-value">${stats.totalPosts}</div><div class="stat-label">Total Posts</div></div>
    `;
    const history = await fetch('/api/history').then(r => r.json());
    const el = document.getElementById('dashboard-history');
    if (history.length === 0) {
      el.innerHTML = '<div class="empty-state">No posts yet.</div>';
    } else {
      el.innerHTML = history.slice(0, 10).map(item => `
        <div class="history-item">
          <span>${PLATFORM_ICONS[item.platform] || '🌐'}</span>
          <span class="history-title">${escHtml(item.item_title || 'Untitled')}</span>
          <span class="history-meta">${item.platform} · ${timeAgo(item.posted_at)}</span>
          <span class="${item.status === 'posted' ? 'badge-posted' : 'badge-failed'}">${item.status}</span>
        </div>
      `).join('');
    }
  } catch(e) { console.error(e); }
}

// ── Feeds ─────────────────────────────────────────────────────────────────────
async function loadFeeds() {
  try {
    const feeds = await fetch('/api/feeds').then(r => r.json());
    const el = document.getElementById('feeds-list');
    if (feeds.length === 0) {
      el.innerHTML = '<div class="empty-state">No feeds yet.<br>Click "Discover Feeds" to get started!</div>';
      return;
    }
    el.innerHTML = feeds.map(f => `
      <div class="feed-item">
        <span class="feed-icon">🟠</span>
        <div class="feed-info">
          <div class="feed-name">${escHtml(f.name)}</div>
          <div class="feed-url">${escHtml(f.url)}</div>
        </div>
        <span class="feed-badge ${f.active ? 'badge-active' : 'badge-inactive'}">${f.active ? 'active' : 'paused'}</span>
        <div class="feed-actions">
          <button class="btn btn-ghost" onclick="checkFeedNow(${f.id}, event)">↻</button>
          <button class="btn btn-ghost" onclick="toggleFeedActive(${f.id}, ${f.active ? 0 : 1})">${f.active ? '⏸' : '▶'}</button>
          <button class="btn btn-ghost" onclick="openEditFeed(${f.id})">✎</button>
          <button class="btn btn-danger" onclick="deleteFeed(${f.id})">✕</button>
        </div>
      </div>
    `).join('');
  } catch(e) { console.error(e); }
}

async function openAddFeed() {
  document.getElementById('modal-feed-title').textContent = 'Add RSS Feed';
  document.getElementById('feed-id').value = '';
  document.getElementById('feed-name').value = '';
  document.getElementById('feed-url').value = '';
  document.getElementById('feed-interval').value = 30;
  document.getElementById('feed-max').value = 3;
  document.getElementById('feed-prefix').value = '';
  document.getElementById('feed-suffix').value = '';
  await loadPlatformCheckboxes([]);
  document.getElementById('modal-feed').classList.add('open');
}

async function openEditFeed(id) {
  const feeds = await fetch('/api/feeds').then(r => r.json());
  const feed = feeds.find(f => f.id === id);
  if (!feed) return;
  const connected = await fetch('/api/feeds/' + id + '/platforms').then(r => r.json());
  document.getElementById('modal-feed-title').textContent = 'Edit Feed';
  document.getElementById('feed-id').value = id;
  document.getElementById('feed-name').value = feed.name;
  document.getElementById('feed-url').value = feed.url;
  document.getElementById('feed-interval').value = feed.check_interval;
  document.getElementById('feed-max').value = feed.max_items;
  document.getElementById('feed-prefix').value = feed.prefix || '';
  document.getElementById('feed-suffix').value = feed.suffix || '';
  await loadPlatformCheckboxes(connected.map(p => p.id));
  document.getElementById('modal-feed').classList.add('open');
}

async function loadPlatformCheckboxes(selectedIds) {
  const platforms = await fetch('/api/platforms').then(r => r.json());
  const el = document.getElementById('platform-checkboxes');
  if (platforms.length === 0) {
    el.innerHTML = '<span style="font-size:12px;color:var(--muted)">No platforms added yet.</span>';
    return;
  }
  el.innerHTML = platforms.map(p => `
    <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 10px;">
      <input type="checkbox" value="${p.id}" ${selectedIds.includes(p.id) ? 'checked' : ''} />
      ${PLATFORM_ICONS[p.type] || '🌐'} ${escHtml(p.name)}
    </label>
  `).join('');
}

async function saveFeed() {
  const id = document.getElementById('feed-id').value;
  const body = {
    name: document.getElementById('feed-name').value.trim(),
    url: document.getElementById('feed-url').value.trim(),
    check_interval: parseInt(document.getElementById('feed-interval').value) || 30,
    max_items: parseInt(document.getElementById('feed-max').value) || 3,
    prefix: document.getElementById('feed-prefix').value.trim(),
    suffix: document.getElementById('feed-suffix').value.trim(),
    post_immediately: 1, active: 1,
  };
  if (!body.name || !body.url) { alert('Name and URL are required.'); return; }
  const selectedPids = Array.from(document.querySelectorAll('#platform-checkboxes input:checked')).map(i => parseInt(i.value));
  if (id) {
    await fetch('/api/feeds/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const current = await fetch('/api/feeds/' + id + '/platforms').then(r => r.json());
    const currentIds = current.map(p => p.id);
    for (const pid of selectedPids) if (!currentIds.includes(pid)) await fetch('/api/feeds/' + id + '/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform_id: pid }) });
    for (const pid of currentIds) if (!selectedPids.includes(pid)) await fetch('/api/feeds/' + id + '/platforms/' + pid, { method: 'DELETE' });
  } else {
    const res = await fetch('/api/feeds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Failed'); return; }
    for (const pid of selectedPids) await fetch('/api/feeds/' + data.id + '/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform_id: pid }) });
  }
  closeModal('modal-feed');
  loadFeeds();
}

async function deleteFeed(id) {
  if (!confirm('Delete this feed?')) return;
  await fetch('/api/feeds/' + id, { method: 'DELETE' });
  loadFeeds();
}

async function toggleFeedActive(id, active) {
  const feeds = await fetch('/api/feeds').then(r => r.json());
  const feed = feeds.find(f => f.id === id);
  if (!feed) return;
  await fetch('/api/feeds/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({}, feed, { active })) });
  loadFeeds();
}

async function checkFeedNow(id, e) {
  const btn = e.target;
  btn.textContent = '…';
  btn.disabled = true;
  await fetch('/api/feeds/' + id + '/check', { method: 'POST' });
  btn.textContent = '✓';
  setTimeout(function() { btn.textContent = '↻'; btn.disabled = false; }, 2000);
}

// ── Platforms ─────────────────────────────────────────────────────────────────
async function loadPlatforms() {
  try {
    const platforms = await fetch('/api/platforms').then(r => r.json());
    const el = document.getElementById('platforms-grid');
    if (platforms.length === 0) {
      el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No platforms yet.</div>';
      return;
    }
    el.innerHTML = platforms.map(p => `
      <div class="platform-card">
       <img src="https://cdn.simpleicons.org/${p.type === 'twitter' ? 'x' : p.type}" width="32" height="32" style="border-radius:6px;" onerror="this.style.display='none'" />
        <div><div class="platform-name">${escHtml(p.name)}</div><div class="platform-type">${p.type}</div></div>
        <button class="btn btn-danger" onclick="deletePlatform(${p.id})">✕</button>
      </div>
    `).join('');
  } catch(e) { console.error(e); }
}

function openAddPlatform() {
  document.getElementById('platform-type').value = '';
  document.getElementById('platform-name').value = '';
  document.getElementById('platform-extra-fields').innerHTML = '';
  document.getElementById('save-platform-btn').disabled = false;
  document.getElementById('modal-platform').classList.add('open');
}

function updatePlatformFields() {
  const type = document.getElementById('platform-type').value;
  const extra = document.getElementById('platform-extra-fields');
  const saveBtn = document.getElementById('save-platform-btn');
  saveBtn.disabled = false;
  extra.innerHTML = '';
  if (type === 'discord') {
    extra.innerHTML = '<div class="field"><label>Webhook URL</label><input type="url" id="discord-webhook" placeholder="https://discord.com/api/webhooks/..." /><div class="field-hint">Discord Server → Settings → Integrations → Webhooks → New Webhook → Copy URL</div></div>';
  } else if (type === 'bluesky') {
    extra.innerHTML = '<div class="field"><label>Handle</label><input type="text" id="bsky-handle" placeholder="you.bsky.social" /></div><div class="field"><label>App Password</label><input type="password" id="bsky-password" placeholder="xxxx-xxxx-xxxx-xxxx" /></div>';
  } else if (type === 'twitter') {
    extra.innerHTML = '<div class="info-box">Twitter/X uses the API keys from your Railway environment variables.</div>';
  }
}

async function savePlatform() {
  const type = document.getElementById('platform-type').value;
  const name = document.getElementById('platform-name').value.trim();
  if (!type) { alert('Select a platform type.'); return; }
  if (!name) { alert('Enter a display name.'); return; }
  var config = {};
  if (type === 'discord') {
    const webhook = document.getElementById('discord-webhook') ? document.getElementById('discord-webhook').value.trim() : '';
    if (!webhook) { alert('Enter the Discord webhook URL.'); return; }
    config = { webhookUrl: webhook };
  } else if (type === 'bluesky') {
    const handle = document.getElementById('bsky-handle') ? document.getElementById('bsky-handle').value.trim() : '';
    const password = document.getElementById('bsky-password') ? document.getElementById('bsky-password').value.trim() : '';
    if (!handle || !password) { alert('Enter your Bluesky handle and app password.'); return; }
    config = { handle, password };
  }
  await fetch('/api/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type, config }) });
  closeModal('modal-platform');
  loadPlatforms();
}

async function deletePlatform(id) {
  if (!confirm('Disconnect this platform?')) return;
  await fetch('/api/platforms/' + id, { method: 'DELETE' });
  loadPlatforms();
}

// ── History ───────────────────────────────────────────────────────────────────
async function loadHistory() {
  try {
    const history = await fetch('/api/history').then(r => r.json());
    const el = document.getElementById('history-list');
    if (history.length === 0) {
      el.innerHTML = '<div class="empty-state">No posts yet.</div>';
      return;
    }
    el.innerHTML = history.map(item => `
      <div class="history-item">
        <span>${PLATFORM_ICONS[item.platform] || '🌐'}</span>
        <span class="history-title">${escHtml(item.item_title || 'Untitled')}</span>
        <span class="history-meta">${escHtml(item.feed_name || '')} · ${item.platform} · ${timeAgo(item.posted_at)}</span>
        <span class="${item.status === 'posted' ? 'badge-posted' : 'badge-failed'}">${item.status}</span>
      </div>
    `).join('');
  } catch(e) { console.error(e); }
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(function(o) {
  o.addEventListener('click', function(e) { if (e.target === o) o.classList.remove('open'); });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Math.floor(Date.now()/1000 - ts);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return new Date(ts * 1000).toLocaleDateString();
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  loadDashboard();
});
