// ── SocialFlow Dashboard – app.js ─────────────────────────────────────────────

const API = '';
const PLATFORM_ICONS = {
  bluesky: '🦋', twitter: '🐦', discord: '💬',
  facebook: '📘', instagram: '📸', tiktok: '🎵',
  youtube: '▶️', tumblr: '📝'
};
const COMING_SOON = ['facebook', 'instagram', 'tiktok', 'youtube', 'tumblr'];

// Platform gradient colors for avatars
const PLATFORM_COLORS = {
  bluesky:   'linear-gradient(135deg,#0085ff,#00c4ff)',
  twitter:   'linear-gradient(135deg,#000,#333)',
  discord:   'linear-gradient(135deg,#5865f2,#8891f2)',
  facebook:  'linear-gradient(135deg,#1877f2,#42a5f5)',
  instagram: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
  tiktok:    'linear-gradient(135deg,#010101,#69c9d0)',
  youtube:   'linear-gradient(135deg,#ff0000,#ff4444)',
  tumblr:    'linear-gradient(135deg,#35465c,#526272)',
  discord:   'linear-gradient(135deg,#5865f2,#7289da)',
};

let selectedPlatformIds = new Set();
let generatedHashtags = '';
let settings = {};

// ── Navigation ────────────────────────────────────────────────────────────────

document.querySelectorAll('.sidebar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    showPage(page);
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    // Map tabs to pages
    const map = { publish: 'compose', automate: 'feeds', schedule: 'history', stats: 'stats', outputs: 'platforms' };
    if (map[tab]) showPage(map[tab]);
  });
});

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.sidebar-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });

  if (page === 'compose')   loadAccountGrid();
  if (page === 'feeds')     loadFeeds();
  if (page === 'platforms') loadPlatforms();
  if (page === 'history')   loadHistory();
  if (page === 'stats')     loadStats();
  if (page === 'discover')  { /* ready */ }
  if (page === 'settings')  loadSettingsPage();
}

// ── Settings ──────────────────────────────────────────────────────────────────

function loadSettings() {
  const s = JSON.parse(localStorage.getItem('sf-settings') || '{}');
  settings = s;
  return s;
}

function loadSettingsPage() {
  const s = loadSettings();
  if (s.openaiKey) document.getElementById('settings-openai').value = s.openaiKey;
  if (s.bskyHandle) document.getElementById('settings-bsky-handle').value = s.bskyHandle;
  if (s.bskyPassword) document.getElementById('settings-bsky-password').value = s.bskyPassword;
}

function saveSettings() {
  const s = {
    openaiKey: document.getElementById('settings-openai').value.trim(),
    bskyHandle: document.getElementById('settings-bsky-handle').value.trim(),
    bskyPassword: document.getElementById('settings-bsky-password').value.trim(),
  };
  localStorage.setItem('sf-settings', JSON.stringify(s));
  settings = s;
  document.getElementById('settings-status').textContent = '✓ Settings saved';
  setTimeout(() => document.getElementById('settings-status').textContent = '', 2000);
}

// ── Compose ───────────────────────────────────────────────────────────────────

async function loadAccountGrid() {
  const platforms = await fetch(`${API}/api/platforms`).then(r => r.json());
  const grid = document.getElementById('account-grid');

  if (platforms.length === 0) {
    grid.innerHTML = '<div class="account-empty">No platforms connected. <a href="#" onclick="showPage(\'platforms\')">Add platforms →</a></div>';
    return;
  }

  grid.innerHTML = platforms.map(p => {
    const initials = p.name.slice(0, 2).toUpperCase();
    const color = PLATFORM_COLORS[p.type] || 'linear-gradient(135deg,#667eea,#764ba2)';
    return `
      <div class="account-item selected" id="acct-${p.id}" onclick="toggleAccount(${p.id})" data-pid="${p.id}">
        <div class="account-avatar-wrap">
          <div class="account-avatar" style="background:${color};">${initials}</div>
          <div class="account-platform-badge">${PLATFORM_ICONS[p.type] || '🌐'}</div>
        </div>
        <div class="account-name">${escHtml(p.name)}</div>
      </div>
    `;
  }).join('');

  // Select all by default
  selectedPlatformIds = new Set(platforms.map(p => p.id));
}

function toggleAccount(id) {
  const el = document.getElementById(`acct-${id}`);
  if (selectedPlatformIds.has(id)) {
    selectedPlatformIds.delete(id);
    el.classList.remove('selected');
  } else {
    selectedPlatformIds.add(id);
    el.classList.add('selected');
  }
  updateSelectedCount();
}

function updateSelectedCount() {
  const el = document.getElementById('selected-count');
  if (!el) return;
  const count = selectedPlatformIds.size;
  el.textContent = count > 0 ? `(${count}) social${count !== 1 ? 's' : ''}` : '';
}
function updateSelectedCount(){var el=document.getElementById("selected-count");if(!el)return;var c=selectedPlatformIds.size;el.textContent=c>0?"("+c+") socials":"";} function selectAllPlatforms() {
  document.querySelectorAll('.account-item[data-pid]').forEach(el => {
    el.classList.add('selected');
    selectedPlatformIds.add(parseInt(el.dataset.pid));
  });
  updateSelectedCount();
}

function toggleAiHelper() {
  const panel = document.getElementById('ai-helper-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function updateCharCount() {
  const text = document.getElementById('compose-text').value;
  const hashtags = document.getElementById('hashtag-preview').textContent;
  const total = text.length + (hashtags ? hashtags.length + 2 : 0);
  const el = document.getElementById('char-count');
  el.textContent = `${total} / 280`;
  el.style.color = total > 280 ? 'var(--red)' : 'var(--muted)';
}

async function generatePost() {
  const topic = document.getElementById('ai-topic').value.trim();
  const tone = document.getElementById('ai-tone').value;
  loadSettings();
  const openaiKey = settings.openaiKey;

  if (!topic) { alert('Enter a topic first.'); return; }
  if (!openaiKey) { alert('Add your OpenAI API key in Settings.'); return; }

const btn = document.querySelector('.btn-post-now') || event.target;
  btn.textContent = 'Posting...';
  btn.disabled = true;
  try {
    const res = await fetch(`${API}/api/generate-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, tone, openaiApiKey: openaiKey }),
    });
    const data = await res.json();
    if (data.post) {
      // Extract hashtags from end of post
      const lines = data.post.split('\n');
      const hashLines = lines.filter(l => l.trim().match(/^#\w+/));
      const contentLines = lines.filter(l => !l.trim().match(/^#\w+/) || l.length > 40);

      document.getElementById('compose-text').value = contentLines.join('\n').trim();

      if (hashLines.length > 0) {
        generatedHashtags = hashLines.join(' ');
        const hEl = document.getElementById('hashtag-preview');
        hEl.textContent = generatedHashtags;
        hEl.style.display = 'block';
      }
      updateCharCount();
    }
  } catch (e) { alert('Failed: ' + e.message); }

  btn.textContent = '✨ Generate Post';
  btn.disabled = false;
}

async function generateHashtags() {
  const content = document.getElementById('compose-text').value.trim();
  loadSettings();
  const openaiKey = settings.openaiKey;

  if (!content) { alert('Write some content first.'); return; }
  if (!openaiKey) { alert('Add your OpenAI API key in Settings.'); return; }

  const btn = event.target;
  btn.textContent = '🏷 Generating…';
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/api/generate-hashtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: content.slice(0, 100), content, openaiApiKey: openaiKey }),
    });
    const data = await res.json();
    if (data.hashtags) {
      generatedHashtags = data.hashtags;
      showHashtagPills(data.hashtags);
      updateCharCount();
    }
  } catch (e) { alert('Failed: ' + e.message); }

  btn.textContent = '🏷 Hashtags';
  btn.disabled = false;
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const el = document.getElementById('image-preview');
    el.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
    el.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// Schedule time toggle
document.getElementById('publish-mode').addEventListener('change', function() {
  document.getElementById('schedule-time').style.display = this.value === 'schedule' ? 'block' : 'none';
});

async function publishPost() {
  const content = document.getElementById('compose-text').value.trim();
  const hashtags = generatedHashtags;
  const full = [content, hashtags].filter(Boolean).join('\n\n');

  if (!full) { alert('Write something first.'); return; }
  if (selectedPlatformIds.size === 0) { alert('Select at least one platform.'); return; }

  const btn = event.target;
  btn.textContent = '🚀 Publishing…';
  btn.disabled = true;

  const res = await fetch(`${API}/api/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: full, platformIds: Array.from(selectedPlatformIds) }),
  });
  const data = await res.json();

  const resultsEl = document.getElementById('publish-results2') || document.getElementById('publish-results');
  resultsEl.innerHTML = data.results.map(r => `
    <div class="publish-result-item">
      <span>${PLATFORM_ICONS[r.platform] || '🌐'} ${escHtml(r.platform)}</span>
      <span class="history-badge ${r.status === 'posted' ? 'badge-posted' : 'badge-failed'}">${r.status}</span>
    </div>
  `).join('');

  btn.textContent = 'Post Now';
  btn.disabled = false;
}

// ── Discover ──────────────────────────────────────────────────────────────────

async function doFeedSearch() {
  const query = document.getElementById('discover-query').value.trim();
  if (!query) return;

  const resultsEl = document.getElementById('discover-results');
  resultsEl.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center;">Searching…</div>';

  const results = await searchFeeds(query);

  if (results.length === 0) {
    resultsEl.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center;">No feeds found. Try a different URL or keyword.</div>';
    return;
  }

  resultsEl.innerHTML = results.map((r, i) => `
    <div class="discover-result-card">
      <div class="discover-result-info">
        <div class="discover-result-title">${escHtml(r.title)}</div>
        <div class="discover-result-url">${escHtml(r.url)}</div>
        ${r.description ? `<div class="discover-result-desc">${escHtml(r.description.slice(0, 120))}</div>` : ''}
        ${r.subscribers ? `<div class="discover-result-meta">👥 ${r.subscribers.toLocaleString()} subscribers</div>` : ''}
      </div>
      <button class="btn btn-primary btn-sm" id="add-btn-${i}" onclick="addFeedFromSearch(${i}, ${JSON.stringify(r.title).replace(/"/g,'&quot;')}, ${JSON.stringify(r.url).replace(/"/g,'&quot;')})">+ Add</button>
    </div>
  `).join('');
}

async function addFeedFromSearch(index, title, url) {
  const btn = document.getElementById(`add-btn-${index}`);
  btn.textContent = 'Adding…';
  btn.disabled = true;

  const res = await fetch(`${API}/api/feeds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: title, url, check_interval: 30, max_items: 3, post_immediately: 1 }),
  });

  if (res.ok) {
    btn.textContent = '✓ Added';
    btn.className = 'btn btn-success btn-sm';
  } else {
    const d = await res.json();
    btn.textContent = d.error?.includes('already') ? 'Already added' : 'Failed';
    btn.disabled = false;
  }
}

// ── Feed source icon based on URL ────────────────────────────────────────────

function getFeedSourceIcon(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return '▶️';
  if (url.includes('twitter.com') || url.includes('x.com')) return '🐦';
  if (url.includes('reddit.com')) return '🟠';
  if (url.includes('bloomberg')) return '📊';
  if (url.includes('cnbc')) return '📺';
  if (url.includes('tradingview')) return '📈';
  return '🟠'; // default RSS
}

function getRelativeTime(ts) {
  if (!ts) return null;
  const diff = Math.floor((Date.now() / 1000) - ts);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
  if (diff < 172800) return 'yesterday';
  return new Date(ts * 1000).toLocaleDateString();
}

let allFeeds = [];
let currentFilter = 'all';

async function loadFeeds() {
  const [feeds, platforms] = await Promise.all([
    fetch(`${API}/api/feeds`).then(r => r.json()),
    fetch(`${API}/api/platforms`).then(r => r.json()),
  ]);

  allFeeds = feeds;

  // Update inputs count
  const countEl = document.getElementById('inputs-count');
  if (countEl) countEl.textContent = feeds.length;

  renderFeedRows(feeds, platforms);
}

async function renderFeedRows(feeds, platforms) {
  const el = document.getElementById('feeds-list');

  const filtered = currentFilter === 'active' ? feeds.filter(f => f.active)
    : currentFilter === 'inactive' ? feeds.filter(f => !f.active)
    : feeds;

  if (filtered.length === 0) {
    el.innerHTML = '<div class="empty-state">No automations yet.<br>Click + New Automation to get started.</div>';
    return;
  }

  // Load platform connections for all feeds
  const feedPlatforms = {};
  await Promise.all(filtered.map(async feed => {
    const fp = await fetch(`${API}/api/feeds/${feed.id}/platforms`).then(r => r.json());
    feedPlatforms[feed.id] = fp;
  }));

  el.innerHTML = filtered.map(feed => {
    const fp = feedPlatforms[feed.id] || [];
    const shown = fp.slice(0, 3);
    const extra = fp.length > 3 ? fp.length - 3 : 0;
    const relTime = getRelativeTime(feed.last_checked);
    const sourceIcon = getFeedSourceIcon(feed.url);

    const avatars = shown.map((p, i) => {
      const color = PLATFORM_COLORS[p.type] || 'linear-gradient(135deg,#667eea,#764ba2)';
      const initials = p.name.slice(0, 2).toUpperCase();
      return `<div class="social-avatar" style="background:${color};z-index:${10-i};">${initials}</div>`;
    }).join('');

    return `
      <div class="feed-row ${feed.active ? '' : 'inactive'}" id="feed-row-${feed.id}">
        <div class="feed-row-expand" id="expand-${feed.id}" onclick="toggleFeedDetail(${feed.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="feed-row-source-icon">
          <span class="feed-source-icon-inner">${sourceIcon}</span>
        </div>
        <div class="feed-row-name">${escHtml(feed.name)}</div>
        <div class="feed-row-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
        <div class="feed-row-socials">
          <div class="social-avatar-stack">${avatars}</div>
          ${extra > 0 ? `<span class="social-count-badge">+ ${extra} Socials</span>` : ''}
          ${fp.length === 0 ? '<span style="font-size:12px;color:var(--muted);">No socials</span>' : ''}
        </div>
        <div class="feed-row-status">
          ${feed.active && relTime
            ? `<div class="feed-status-time"><span>${relTime}</span><span class="check">✓</span></div>`
            : feed.active
            ? `<div class="feed-status-time"><span>No recent posts</span><span style="color:var(--muted);">⊙</span></div>`
            : `<div class="feed-status-inactive"><span>Inactive</span><span>⏸</span></div>`
          }
        </div>
      </div>
      <div class="feed-detail-row" id="detail-${feed.id}">
        <!-- Action bar -->
        <div class="feed-detail-actions-bar">
          <div class="feed-detail-btns">
            <button class="feed-detail-action-btn" onclick="openFeedSettings(${feed.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Settings
            </button>
            <button class="feed-detail-action-btn" onclick="checkFeedNow(${feed.id}, event)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Refresh
            </button>
            <button class="feed-detail-action-btn" onclick="window.open('${feed.url}','_blank')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Preview
            </button>
            <button class="feed-detail-action-btn" onclick="showPage('history')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              History
            </button>
            <button class="feed-detail-action-btn danger" onclick="deleteFeed(${feed.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              Delete
            </button>
          </div>
          <div class="feed-detail-active-toggle">
            <span class="feed-detail-active-label">Active</span>
            <label class="toggle">
              <input type="checkbox" ${feed.active ? 'checked' : ''} onchange="toggleFeedActive(${feed.id}, this.checked ? 1 : 0)" />
              <div class="toggle-track"></div>
            </label>
          </div>
        </div>

        <!-- Last checked info bar -->
        <div class="feed-detail-checked-bar">
          ${feed.last_checked
            ? `Checked ${getRelativeTime(feed.last_checked)}.`
            : 'Never checked yet. Click Refresh to check now.'
          }
        </div>

        <!-- Posting to outputs -->
        <div class="feed-detail-outputs-section">
          <div class="feed-detail-outputs-title">Posting to <span id="output-count-${feed.id}">0</span> Outputs</div>
          <div class="feed-detail-outputs-list" id="outputs-list-${feed.id}">
            <div style="color:var(--muted);font-size:12px;padding:8px 0;">Loading...</div>
          </div>
          <button class="feed-detail-add-output" onclick="openAddOutputModal(${feed.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Output
          </button>
        </div>

        <!-- Last item posted -->
        <div class="feed-detail-last-post" id="last-post-${feed.id}">
          <div class="feed-detail-last-post-title">Last Item Posted</div>
          <div class="feed-detail-last-post-content" id="last-post-content-${feed.id}">
            <span style="color:var(--muted);font-size:13px;">No posts yet.</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleFeedDetail(id) {
  const detail = document.getElementById(`detail-${id}`);
  const expand = document.getElementById(`expand-${id}`);
  const isOpen = detail.classList.contains('open');
  // Close all others
  document.querySelectorAll('.feed-detail-row').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.feed-row-expand').forEach(e => e.classList.remove('open'));
  if (!isOpen) {
    detail.classList.add('open');
    expand.classList.add('open');
    loadFeedOutputs(id);
  }
}

function filterFeeds(filter) {
  currentFilter = filter;
  document.querySelectorAll('.inputs-dropdown-item').forEach(el => el.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('inputs-dropdown').style.display = 'none';
  fetch(`${API}/api/platforms`).then(r => r.json()).then(p => renderFeedRows(allFeeds, p));
}

function toggleInputsDropdown() {
  const dd = document.getElementById('inputs-dropdown');
  dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

async function toggleFeedActive(id, active) {
  const feeds = await fetch(`${API}/api/feeds`).then(r => r.json());
  const feed = feeds.find(f => f.id === id);
  await fetch(`${API}/api/feeds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...feed, active }),
  });
  loadFeeds();
}

async function toggleFeed(id, active) {
  await toggleFeedActive(id, active ? 1 : 0);
}

async function checkFeedNow(id, e) {
  const btn = e.target;
  btn.textContent = 'Checking…';
  btn.disabled = true;
  await fetch(`${API}/api/feeds/${id}/check`, { method: 'POST' });
  btn.textContent = '✓ Done';
  setTimeout(() => { btn.textContent = 'Check Now'; btn.disabled = false; loadFeeds(); }, 2000);
}

async function deleteFeed(id) {
  if (!confirm('Delete this feed?')) return;
  await fetch(`${API}/api/feeds/${id}`, { method: 'DELETE' });
  loadFeeds();
}

// ── Add/Edit Feed Modal ───────────────────────────────────────────────────────

async function openAddFeed() {
  document.getElementById('modal-feed-title').textContent = 'Add RSS Feed';
  document.getElementById('feed-id').value = '';
  ['feed-name', 'feed-url', 'feed-prefix', 'feed-suffix'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('feed-interval').value = 30;
  document.getElementById('feed-max').value = 3;
  document.getElementById('feed-mode').value = '1';
  document.getElementById('feed-hashtags').value = 'none';
  await loadPlatformCheckboxes([]);
  document.getElementById('modal-feed').classList.add('open');
}

async function editFeed(id) {
  const feeds = await fetch(`${API}/api/feeds`).then(r => r.json());
  const feed = feeds.find(f => f.id === id);
  const connectedPlatforms = await fetch(`${API}/api/feeds/${id}/platforms`).then(r => r.json());

  document.getElementById('modal-feed-title').textContent = 'Edit Feed';
  document.getElementById('feed-id').value = id;
  document.getElementById('feed-name').value = feed.name;
  document.getElementById('feed-url').value = feed.url;
  document.getElementById('feed-interval').value = feed.check_interval;
  document.getElementById('feed-max').value = feed.max_items;
  document.getElementById('feed-prefix').value = feed.prefix || '';
  document.getElementById('feed-suffix').value = feed.suffix || '';
  document.getElementById('feed-mode').value = feed.post_immediately ? '1' : '0';

  await loadPlatformCheckboxes(connectedPlatforms.map(p => p.id));
  document.getElementById('modal-feed').classList.add('open');
}

async function loadPlatformCheckboxes(selectedIds = []) {
  const platforms = await fetch(`${API}/api/platforms`).then(r => r.json());
  const el = document.getElementById('platform-checkboxes');
  if (platforms.length === 0) {
    el.innerHTML = '<div style="color:var(--muted);font-size:12px;">No platforms added yet.</div>';
    return;
  }
  el.innerHTML = platforms.map(p => `
    <label class="checkbox-item">
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
    check_interval: parseInt(document.getElementById('feed-interval').value),
    max_items: parseInt(document.getElementById('feed-max').value),
    prefix: document.getElementById('feed-prefix').value.trim(),
    suffix: document.getElementById('feed-suffix').value.trim(),
    post_immediately: document.getElementById('feed-mode').value === '1',
    active: 1,
  };

  if (!body.name || !body.url) { alert('Name and URL required.'); return; }

  const selectedPids = Array.from(document.querySelectorAll('#platform-checkboxes input:checked')).map(i => parseInt(i.value));

  if (id) {
    await fetch(`${API}/api/feeds/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const current = await fetch(`${API}/api/feeds/${id}/platforms`).then(r => r.json());
    const currentIds = current.map(p => p.id);
    for (const pid of selectedPids) if (!currentIds.includes(pid)) await fetch(`${API}/api/feeds/${id}/platforms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform_id: pid }) });
    for (const pid of currentIds) if (!selectedPids.includes(pid)) await fetch(`${API}/api/feeds/${id}/platforms/${pid}`, { method: 'DELETE' });
  } else {
    const res = await fetch(`${API}/api/feeds`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Failed to add feed'); return; }
    for (const pid of selectedPids) await fetch(`${API}/api/feeds/${data.id}/platforms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform_id: pid }) });
  }

  closeModal('modal-feed');
  loadFeeds();
}

// ── Platforms ─────────────────────────────────────────────────────────────────

async function loadPlatforms() {
  const platforms = await fetch(`${API}/api/platforms`).then(r => r.json());
  const el = document.getElementById('platforms-grid');

  if (platforms.length === 0) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No platforms connected yet. Click "+ Connect Platform" to add one.</div>';
    return;
  }

  el.innerHTML = platforms.map(p => `
    <div class="platform-card">
      <div class="platform-card-top">
        <div class="platform-card-icon">${PLATFORM_ICONS[p.type] || '🌐'}</div>
        <div>
          <div class="platform-card-name">${escHtml(p.name)}</div>
          <div class="platform-card-type">${p.type}</div>
        </div>
      </div>
      <button class="btn btn-sm btn-danger" onclick="deletePlatform(${p.id})">Disconnect</button>
    </div>
  `).join('');
}

function openAddPlatform() {
  document.getElementById('platform-type').value = '';
  document.getElementById('platform-name').value = '';
  document.getElementById('platform-extra-fields').innerHTML = '';
  document.getElementById('platform-coming-soon').style.display = 'none';
  document.getElementById('save-platform-btn').disabled = false;
  document.getElementById('modal-platform').classList.add('open');
}

function updatePlatformFields() {
  const type = document.getElementById('platform-type').value;
  const extra = document.getElementById('platform-extra-fields');
  const coming = document.getElementById('platform-coming-soon');
  const saveBtn = document.getElementById('save-platform-btn');

  coming.style.display = 'none';
  saveBtn.disabled = false;
  extra.innerHTML = '';

  if (COMING_SOON.includes(type)) {
    coming.style.display = 'block';
    saveBtn.disabled = true;
  } else if (type === 'discord') {
    extra.innerHTML = `<div class="field"><label>Webhook URL</label><input type="url" id="discord-webhook" placeholder="https://discord.com/api/webhooks/..." /><div style="font-size:11px;color:var(--muted);margin-top:3px;">Server Settings → Integrations → Webhooks → New Webhook → Copy URL</div></div>`;
  } else if (type === 'bluesky') {
    extra.innerHTML = `<div class="field"><label>Handle</label><input type="text" id="bsky-handle" placeholder="you.bsky.social" /></div><div class="field"><label>App Password</label><input type="password" id="bsky-password" placeholder="xxxx-xxxx-xxxx-xxxx" /></div>`;
  } else if (type === 'twitter') {
    extra.innerHTML = `<div style="background:var(--blue-lt);border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px;font-size:12px;color:var(--blue);">Twitter/X uses credentials from your server's .env file. Make sure all 4 Twitter keys are filled in.</div>`;
  }
}

async function savePlatform() {
  const type = document.getElementById('platform-type').value;
  const name = document.getElementById('platform-name').value.trim();
  if (!type) { alert('Select a platform type.'); return; }
  if (!name) { alert('Enter a display name.'); return; }

  let config = {};
  if (type === 'discord') {
    const webhook = document.getElementById('discord-webhook')?.value.trim();
    if (!webhook) { alert('Enter a Discord webhook URL.'); return; }
    config = { webhookUrl: webhook };
  } else if (type === 'bluesky') {
    const handle = document.getElementById('bsky-handle')?.value.trim();
    const password = document.getElementById('bsky-password')?.value.trim();
    if (!handle || !password) { alert('Enter handle and app password.'); return; }
    config = { handle, password };
  }

  await fetch(`${API}/api/platforms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, config }),
  });
  closeModal('modal-platform');
  loadPlatforms();
  loadAccountGrid();
}

async function deletePlatform(id) {
  if (!confirm('Disconnect this platform?')) return;
  await fetch(`${API}/api/platforms/${id}`, { method: 'DELETE' });
  loadPlatforms();
}

// ── History ───────────────────────────────────────────────────────────────────

async function loadHistory() {
  const history = await fetch(`${API}/api/history`).then(r => r.json());
  const el = document.getElementById('history-list');
  if (history.length === 0) {
    el.innerHTML = '<div class="empty-state">No posts yet.</div>';
    return;
  }
  el.innerHTML = history.map(item => `
    <div class="history-item">
      <span class="history-icon">${PLATFORM_ICONS[item.platform] || '🌐'}</span>
      <div class="history-info">
        <div class="history-title">${escHtml(item.item_title || 'Untitled')}</div>
        <div class="history-meta">${escHtml(item.feed_name)} · ${item.platform} · ${new Date(item.posted_at * 1000).toLocaleString()}</div>
      </div>
      <span class="history-badge ${item.status === 'posted' ? 'badge-posted' : 'badge-failed'}">${item.status}</span>
    </div>
  `).join('');
}

// ── Stats ─────────────────────────────────────────────────────────────────────

async function loadStats() {
  const stats = await fetch(`${API}/api/stats`).then(r => r.json());
  document.getElementById('top-posts-today').textContent = stats.todayPosts;
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="stat-value">${stats.activeFeeds}</div><div class="stat-label">Active Feeds</div></div>
    <div class="stat-card"><div class="stat-value">${stats.platforms}</div><div class="stat-label">Platforms</div></div>
    <div class="stat-card"><div class="stat-value">${stats.todayPosts}</div><div class="stat-label">Posted Today</div></div>
    <div class="stat-card"><div class="stat-value">${stats.totalPosts}</div><div class="stat-label">Total Posts</div></div>
  `;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ──────────────────────────────────────────────────────────────────────

loadSettings();
showPage('compose');
loadStats();


// ── Load outputs for expanded feed ────────────────────────────────────────────

async function loadFeedOutputs(feedId) {
  const [fp, history] = await Promise.all([
    fetch(`${API}/api/feeds/${feedId}/platforms`).then(r => r.json()),
    fetch(`${API}/api/history`).then(r => r.json()),
  ]);

  // Update count
  const countEl = document.getElementById(`output-count-${feedId}`);
  if (countEl) countEl.textContent = fp.length;

  // Render outputs list
  const listEl = document.getElementById(`outputs-list-${feedId}`);
  if (listEl) {
    if (fp.length === 0) {
      listEl.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:8px 0;">No outputs connected. Click Add Output below.</div>';
    } else {
      listEl.innerHTML = fp.map(p => {
        const color = PLATFORM_COLORS[p.type] || 'linear-gradient(135deg,#667eea,#764ba2)';
        const initials = p.name.slice(0, 2).toUpperCase();
        return `
          <div class="output-item">
            <div class="output-item-left">
              <div class="output-avatar" style="background:${color};">${initials}</div>
              <span class="output-platform-icon">${PLATFORM_ICONS[p.type] || '🌐'}</span>
              <span class="output-name">${escHtml(p.name)}</span>
            </div>
            <div class="output-item-right">
              <span class="output-type-badge">${PLATFORM_ICONS[p.type] || '🌐'}</span>
              <label class="toggle" style="transform:scale(0.85);">
                <input type="checkbox" checked />
                <div class="toggle-track"></div>
              </label>
              <button class="output-icon-btn" title="Open" onclick="window.open('#','_blank')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </button>
              <button class="output-icon-btn" title="Settings" onclick="editFeed(${feedId})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              </button>
              <button class="output-icon-btn danger" title="Remove" onclick="removeOutput(${feedId}, ${p.id})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Last item posted
  const feedHistory = history.filter(h => h.feed_id === feedId);
  const lastPostEl = document.getElementById(`last-post-content-${feedId}`);
  if (lastPostEl && feedHistory.length > 0) {
    const last = feedHistory[0];
    lastPostEl.innerHTML = `
      <div class="last-post-item">
        <div class="last-post-title">${escHtml(last.item_title || 'Untitled')}</div>
        <div class="last-post-meta">${PLATFORM_ICONS[last.platform] || '🌐'} ${last.platform} · ${new Date(last.posted_at * 1000).toLocaleString()}</div>
        ${last.item_url ? `<a href="${escHtml(last.item_url)}" target="_blank" class="last-post-link">View post →</a>` : ''}
      </div>
    `;
  }
}

async function removeOutput(feedId, platformId) {
  await fetch(`${API}/api/feeds/${feedId}/platforms/${platformId}`, { method: 'DELETE' });
  loadFeedOutputs(feedId);
  loadFeeds();
}

function openAddOutputModal(feedId) {
  // Store feedId and open platform connection modal
  window._addOutputFeedId = feedId;
  document.getElementById('platform-type').value = '';
  document.getElementById('platform-name').value = '';
  document.getElementById('platform-extra-fields').innerHTML = '';
  document.getElementById('platform-coming-soon').style.display = 'none';
  document.getElementById('save-platform-btn').disabled = false;
  document.getElementById('modal-platform').classList.add('open');

  // Override save to connect to this feed
  window._addOutputMode = true;
}

// Override savePlatform to also connect to feed if in add-output mode
const _origSavePlatform = window.savePlatform;


// ── Feed Settings Page ────────────────────────────────────────────────────────

let currentSettingsFeedId = null;

async function openFeedSettings(feedId) {
  currentSettingsFeedId = feedId;
  const feeds = await fetch(`${API}/api/feeds`).then(r => r.json());
  const feed = feeds.find(f => f.id === feedId);
  if (!feed) return;

  // Set breadcrumb name
  document.getElementById('feed-settings-name').textContent = feed.name;

  // Detail tab
  document.getElementById('fs-url-display').textContent = feed.url;
  document.getElementById('fs-name').value = feed.name;
  document.getElementById('fs-mode').value = feed.post_immediately ? '1' : '0';
  document.getElementById('fs-active').checked = !!feed.active;

  // Updates tab
  document.getElementById('fs-interval').value = feed.check_interval;
  document.getElementById('fs-max').value = feed.max_items;
  document.getElementById('fs-max-day').value = feed.max_per_day || 10;
  document.getElementById('fs-trickle').value = feed.trickle || 'off';

  // Item Text tab
  document.getElementById('fs-prefix').value = feed.prefix || '';
  document.getElementById('fs-suffix').value = feed.suffix || '';

  // Filters tab
  document.getElementById('fs-filter-all').value = feed.filter_all || '';
  document.getElementById('fs-filter-any').value = feed.filter_any || '';
  document.getElementById('fs-filter-ignore').value = feed.filter_ignore || '';

  // Reset find/replace rules
  findReplaceRules = [];
  renderFindReplaceRules();

  // Hashtags tab defaults
  document.getElementById('fs-hashtag-style').value = 'ai';
  updateHashtagPanel();

  // Switch to settings view, start on Detail tab
  switchSettingsView('settings');
  switchFeedTab('detail');
  showPage('feed-settings');
}

function switchSettingsView(view) {
  document.querySelectorAll('.feed-settings-header-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-settings-view="${view}"]`)?.classList.add('active');
  document.getElementById('feed-settings-view').style.display = view === 'settings' ? 'block' : 'none';
  document.getElementById('feed-history-view').style.display = view === 'history' ? 'block' : 'none';

  if (view === 'history') loadFeedSettingsHistory();
}

function switchFeedTab(tab) {
  document.querySelectorAll('.feed-settings-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
  document.querySelectorAll('.feed-tab-panel').forEach(p => p.style.display = 'none');
  document.getElementById(`ftab-${tab}`)?.style && (document.getElementById(`ftab-${tab}`).style.display = 'block');
}

function updateHashtagPanel() {
  const style = document.getElementById('fs-hashtag-style').value;
  document.getElementById('smart-hashtags-panel').style.display = style === 'ai' ? 'block' : 'none';
  document.getElementById('manual-hashtags-panel').style.display = style === 'manual' ? 'block' : 'none';
}

// Toggle label
document.addEventListener('change', e => {
  if (e.target.id === 'fs-hashtag-on') {
    document.getElementById('hashtag-on-label').textContent = e.target.checked ? 'On' : 'Off';
  }
});

async function saveFeedSettings() {
  if (!currentSettingsFeedId) return;

  const feeds = await fetch(`${API}/api/feeds`).then(r => r.json());
  const feed = feeds.find(f => f.id === currentSettingsFeedId);

  const updated = {
    ...feed,
    name: document.getElementById('fs-name').value.trim() || feed.name,
    check_interval: parseInt(document.getElementById('fs-interval').value),
    max_items: parseInt(document.getElementById('fs-max').value),
    post_immediately: document.getElementById('fs-mode').value === '1' ? 1 : 0,
    max_per_day: parseInt(document.getElementById('fs-max-day').value) || 10,
    trickle: document.getElementById('fs-trickle').value,
    prefix: document.getElementById('fs-prefix').value.trim(),
    suffix: document.getElementById('fs-suffix').value.trim(),
    active: document.getElementById('fs-active').checked ? 1 : 0,
    filter_all: document.getElementById('fs-filter-all').value.trim(),
    filter_any: document.getElementById('fs-filter-any').value.trim(),
    filter_ignore: document.getElementById('fs-filter-ignore').value.trim(),
  };

  await fetch(`${API}/api/feeds/${currentSettingsFeedId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });

  // Reset Save button
  const saveBtn = document.querySelector('.feed-settings-footer .btn-primary');
  if (saveBtn) saveBtn.classList.remove('dirty');
  showPage('feeds');
  loadFeeds();
}

async function loadFeedSettingsHistory() {
  const history = await fetch(`${API}/api/history`).then(r => r.json());
  const feedHistory = history.filter(h => h.feed_id === currentSettingsFeedId);
  const el = document.getElementById('feed-history-items');
  if (!el) return;

  if (feedHistory.length === 0) {
    el.innerHTML = '<div class="empty-state">No posts yet for this feed.</div>';
    return;
  }

  el.innerHTML = feedHistory.map(item => `
    <div class="history-item">
      <span class="history-icon">${PLATFORM_ICONS[item.platform] || '🌐'}</span>
      <div class="history-info">
        <div class="history-title">${escHtml(item.item_title || 'Untitled')}</div>
        <div class="history-meta">${item.platform} · ${new Date(item.posted_at * 1000).toLocaleString()}</div>
      </div>
      <span class="history-badge ${item.status === 'posted' ? 'badge-posted' : 'badge-failed'}">${item.status}</span>
    </div>
  `).join('');
}


async function deleteFeedFromSettings() {
  if (!confirm('Delete this feed? This cannot be undone.')) return;
  await fetch(`${API}/api/feeds/${currentSettingsFeedId}`, { method: 'DELETE' });
  showPage('feeds');
  loadFeeds();
}


// ── Dirty state — activate Save button when changes made ──────────────────────

function markDirty() {
  const saveBtn = document.querySelector('.feed-settings-footer .btn-primary');
  if (saveBtn) saveBtn.classList.add('dirty');
}

// Watch all inputs/selects/checkboxes in the settings panel
document.addEventListener('input', e => {
  if (e.target.closest('#page-feed-settings')) markDirty();
});
document.addEventListener('change', e => {
  if (e.target.closest('#page-feed-settings')) markDirty();
});

// Reset dirty state when page loads
const _origOpenFeedSettings = window.openFeedSettings;


// ── Find and Replace rules ────────────────────────────────────────────────────

let findReplaceRules = [];

function addFindReplaceRule() {
  const id = Date.now();
  findReplaceRules.push({ id, find: '', replace: '' });
  renderFindReplaceRules();
  markDirty();
}

function removeFindReplaceRule(id) {
  findReplaceRules = findReplaceRules.filter(r => r.id !== id);
  renderFindReplaceRules();
  markDirty();
}

function renderFindReplaceRules() {
  const el = document.getElementById('find-replace-rules');
  if (!el) return;
  el.innerHTML = findReplaceRules.map(rule => `
    <div class="find-replace-rule">
      <input type="text" placeholder="Find..." value="${escHtml(rule.find)}"
        oninput="updateRule(${rule.id}, 'find', this.value)" />
      <span class="find-replace-arrow">→</span>
      <input type="text" placeholder="Replace with (leave empty to remove)..." value="${escHtml(rule.replace)}"
        oninput="updateRule(${rule.id}, 'replace', this.value)" />
      <button class="find-replace-remove" onclick="removeFindReplaceRule(${rule.id})" title="Remove rule">✕</button>
    </div>
  `).join('');
}

function updateRule(id, field, value) {
  const rule = findReplaceRules.find(r => r.id === id);
  if (rule) rule[field] = value;
  markDirty();
}


// ── Advanced tab On/Off labels ────────────────────────────────────────────────

const advancedToggles = [
  { id: 'fs-republish',      label: 'fs-republish-label' },
  { id: 'fs-feedburner',     label: 'fs-feedburner-label' },
  { id: 'fs-ignore-notitle', label: 'fs-ignore-notitle-label' },
  { id: 'fs-nosort',         label: 'fs-nosort-label' },
  { id: 'fs-echo',           label: null },
];

document.addEventListener('change', e => {
  const toggle = advancedToggles.find(t => t.id === e.target.id);
  if (toggle?.label) {
    const labelEl = document.getElementById(toggle.label);
    if (labelEl) labelEl.textContent = e.target.checked ? 'On' : 'Off';
  }
});


// ── Hashtag pills ─────────────────────────────────────────────────────────────

function showHashtagPills(hashtagStr) {
  const section = document.getElementById('smart-hashtags-compose');
  const pillsEl = document.getElementById('hashtag-pills');
  if (!section || !pillsEl) return;

  const tags = hashtagStr.split(/\s+/).filter(t => t.startsWith('#'));
  section.style.display = tags.length > 0 ? 'block' : 'none';

  pillsEl.innerHTML = tags.map(tag => `
    <span class="hashtag-pill selected" onclick="toggleHashtagPill(this, '${escHtml(tag)}')">${escHtml(tag)}</span>
  `).join('');
}

function toggleHashtagPill(el, tag) {
  el.classList.toggle('selected');
  // Rebuild generatedHashtags from selected pills
  const selected = Array.from(document.querySelectorAll('.hashtag-pill.selected')).map(p => p.textContent);
  generatedHashtags = selected.join(' ');
  updateCharCount();
}

function toggleCustomize() {
  const panel = document.getElementById('customize-panel');
  if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function toggleSchedule() {
  const panel = document.getElementById('schedule-panel');
  if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

async function publishScheduled() {
  // For now, just call publishPost (scheduling logic can be added later)
  await publishPost();
}

