// ── SocialFlow Frontend ───────────────────────────────────────────────────────

function platformLogo(type, size) {
  size = size || 28;
  var logos = {
    twitter: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="black"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    discord: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>',
    bluesky: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="#0085ff"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.447.953 3.334 2.372 9.479 7.632 4.644 4.16-3.915.012-6.492-3.9-7.071a8.556 8.556 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>',
    facebook: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    instagram: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24"><defs><linearGradient id="ig' + size + '" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#f09433"/><stop offset="25%" style="stop-color:#e6683c"/><stop offset="50%" style="stop-color:#dc2743"/><stop offset="75%" style="stop-color:#cc2366"/><stop offset="100%" style="stop-color:#bc1888"/></linearGradient></defs><path fill="url(#ig' + size + ')" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>',
    threads: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="black"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.852 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.583-1.313-.88-2.379-.89h-.036c-.874 0-2.002.274-2.74 1.163l-1.5-1.36C7.718 4.257 9.311 3.73 11.11 3.73h.049c3.032.025 4.851 1.785 5.143 4.913.792.36 1.496.86 2.092 1.493 1.158 1.245 1.822 2.945 1.822 4.667 0 1.87-.596 3.694-1.907 5.075C16.705 21.524 14.808 23.98 12.19 24z"/></svg>',
    tiktok: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="black"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
    youtube: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    tumblr: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="#35465C"><path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.304 1.406z"/></svg>',
  };
  return logos[type] || '<span style="font-size:' + size + 'px">🌐</span>';
}

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
  var el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  document.querySelectorAll('.sidebar-btn').forEach(function(b) {
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
  var platforms = await fetch('/api/platforms').then(function(r) { return r.json(); });
  var el = document.getElementById('compose-accounts');
  if (!el) return;

  if (platforms.length === 0) {
    el.innerHTML = '<div style="color:var(--muted);font-size:13px;">No platforms connected. <a href="#" onclick="showPage(\'platforms\')" style="color:var(--accent);">Add platforms</a></div>';
    return;
  }

  selectedPlatformIds = new Set(platforms.map(function(p) { return p.id; }));

  el.innerHTML = platforms.map(function(p) {
    return '<div class="compose-account" id="compose-acct-' + p.id + '" onclick="toggleComposeAccount(' + p.id + ')" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:8px;border-radius:8px;border:2px solid var(--accent);background:#e8f0fd;min-width:70px;">' +
      '<div style="width:44px;height:44px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);">' +
      platformLogo(p.type, 28) +
      '</div>' +
      '<div style="font-size:11px;font-weight:500;color:var(--text);text-align:center;max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escHtml(p.name) + '</div>' +
      '</div>';
  }).join('');

  var composeText = document.getElementById('compose-text');
  if (composeText) composeText.addEventListener('input', updateCharCount);
}

function toggleComposeAccount(id) {
  var el = document.getElementById('compose-acct-' + id);
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
  var text = document.getElementById('compose-text').value;
  var el = document.getElementById('char-count');
  if (!el) return;
  el.textContent = text.length + ' / 280';
  el.style.color = text.length > 280 ? 'var(--red)' : 'var(--muted)';
}

async function generateAIPost() {
  var topic = document.getElementById('ai-topic').value.trim();
  var tone = document.getElementById('ai-tone').value;
  if (!topic) { alert('Enter a topic first.'); return; }

  var btn = event.target;
  btn.textContent = 'Generating…';
  btn.disabled = true;

  try {
    var res = await fetch('/api/generate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic, tone: tone }),
    });
    var data = await res.json();
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

async function generateHashtags() {
  var content = document.getElementById('compose-text').value.trim()
              || document.getElementById('ai-topic').value.trim();
  if (!content) { alert('Write a post or enter a topic first.'); return; }

  var btn = event.target;
  var originalText = btn.textContent;
  btn.textContent = 'Thinking…';
  btn.disabled = true;

  try {
    var res = await fetch('/api/generate-hashtags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content }),
    });
    var data = await res.json();
    if (data.hashtags) {
      var box = document.getElementById('compose-text');
      box.value = (box.value.trim() + '\n\n' + data.hashtags).trim();
      updateCharCount();
    } else {
      alert(data.error || 'Failed to generate hashtags.');
    }
  } catch(e) {
    alert('Error: ' + e.message);
  }

  btn.textContent = originalText;
  btn.disabled = false;
}

// ── Image Functions ───────────────────────────────────────────────────────────
function toggleImageMenu() {
  var menu = document.getElementById('image-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function triggerImageUpload() {
  document.getElementById('image-menu').style.display = 'none';
  document.getElementById('image-upload').click();
}

function handleImageUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
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
  var panel = document.getElementById('unsplash-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

var unsplashPage = 1;
var unsplashQuery = '';

async function searchUnsplash(append) {
  if (!append) {
    unsplashQuery = document.getElementById('unsplash-query').value.trim();
    unsplashPage = 1;
  } else {
    unsplashPage++;
  }
  if (!unsplashQuery) return;
  var resultsEl = document.getElementById('unsplash-results');
  var loadMoreEl = document.getElementById('unsplash-load-more');
  if (!append) resultsEl.innerHTML = '<div style="color:var(--muted);font-size:12px;grid-column:1/-1;">Searching…</div>';

  try {
    var res = await fetch('/api/unsplash?query=' + encodeURIComponent(unsplashQuery) + '&per_page=30&page=' + unsplashPage);
    var data = await res.json();
    if (!data.results || !data.results.length) {
      if (!append) resultsEl.innerHTML = '<div style="color:var(--muted);font-size:12px;grid-column:1/-1;">No images found.</div>';
      if (loadMoreEl) loadMoreEl.style.display = 'none';
      return;
    }
    var html = data.results.map(function(img) {
      return '<img src="' + img.urls.small + '" onclick="selectUnsplashImage(\'' + img.urls.regular + '\')" style="width:100%;height:80px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'transparent\'" />';
    }).join('');
    if (append) resultsEl.insertAdjacentHTML('beforeend', html);
    else resultsEl.innerHTML = html;
    if (loadMoreEl) {
      var hasMore = data.total_pages ? unsplashPage < data.total_pages : data.results.length >= 30;
      loadMoreEl.style.display = hasMore ? 'block' : 'none';
    }
  } catch(e) {
    if (!append) resultsEl.innerHTML = '<div style="color:var(--red);font-size:12px;grid-column:1/-1;">Error searching.</div>';
  }
}
function selectUnsplashImage(url) {
  selectedImage = url;
  document.getElementById('image-preview-img').src = url;
  document.getElementById('image-preview').style.display = 'block';
  document.getElementById('unsplash-panel').style.display = 'none';
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('#image-menu') && !e.target.closest('[onclick="toggleImageMenu()"]')) {
    var menu = document.getElementById('image-menu');
    if (menu) menu.style.display = 'none';
  }
});

async function publishPost() {
  var content = document.getElementById('compose-text').value.trim();
  if (!content) { alert('Write something first.'); return; }
  if (selectedPlatformIds.size === 0) { alert('Select at least one platform.'); return; }

  var btn = event.target;
  btn.textContent = '⏳ Posting…';
  btn.disabled = true;

  var res = await fetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content, platformIds: Array.from(selectedPlatformIds) }),
  });
  var data = await res.json();

  var resultsEl = document.getElementById('publish-results');
  resultsEl.innerHTML = data.results.map(function(r) {
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;">' +
      platformLogo(r.platform, 20) +
      '<span>' + r.platform + '</span>' +
      '<span class="' + (r.status === 'posted' ? 'badge-posted' : 'badge-failed') + '">' + r.status + '</span>' +
      '</div>';
  }).join('');

  btn.textContent = '➤ Post Now';
  btn.disabled = false;
}

// ── Discover ──────────────────────────────────────────────────────────────────
function filterCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.category-tab').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
  renderDiscoverGrid();
}

function renderDiscoverGrid() {
  var grid = document.getElementById('discover-grid');
  if (!grid) return;
  var topicEl = document.getElementById('topic-search');
  var searchTerm = topicEl ? topicEl.value.toLowerCase() : '';
  var filtered = currentCategory === 'all' ? FEED_DIRECTORY : FEED_DIRECTORY.filter(function(f) { return f.category === currentCategory; });

  if (searchTerm) {
    filtered = filtered.filter(function(f) {
      return f.name.toLowerCase().includes(searchTerm) || f.desc.toLowerCase().includes(searchTerm) || f.category.toLowerCase().includes(searchTerm);
    });
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:20px 0;">No feeds found. Try the URL finder above!</div>';
    return;
  }

  grid.innerHTML = filtered.map(function(feed, i) {
    return '<div class="discover-card">' +
      '<div class="discover-card-top">' +
      '<div class="discover-card-icon">' + feed.icon + '</div>' +
      '<div><div class="discover-card-name">' + feed.name + '</div>' +
      '<div class="discover-tag">' + feed.category + '</div></div>' +
      '</div>' +
      '<div class="discover-card-desc">' + feed.desc + '</div>' +
      '<div class="discover-card-url">' + feed.url + '</div>' +
      '<div class="discover-card-footer">' +
      '<button class="btn btn-primary" id="add-btn-' + i + '" onclick="addDiscoverFeed(' + i + ')">+ Add Feed</button>' +
      '</div></div>';
  }).join('');
}

async function addDiscoverFeed(index) {
  var topicEl = document.getElementById('topic-search');
  var searchTerm = topicEl ? topicEl.value.toLowerCase() : '';
  var filtered = currentCategory === 'all' ? FEED_DIRECTORY : FEED_DIRECTORY.filter(function(f) { return f.category === currentCategory; });
  if (searchTerm) {
    filtered = filtered.filter(function(f) {
      return f.name.toLowerCase().includes(searchTerm) || f.desc.toLowerCase().includes(searchTerm) || f.category.toLowerCase().includes(searchTerm);
    });
  }
  var feed = filtered[index];
  var btn = document.getElementById('add-btn-' + index);
  btn.textContent = 'Adding…';
  btn.disabled = true;

  var platforms = await fetch('/api/platforms').then(function(r) { return r.json(); });
  var res = await fetch('/api/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: feed.name, url: feed.url, check_interval: 30, max_items: 3, post_immediately: 1, active: 1 }),
  });
  var data = await res.json();

  if (!res.ok) {
    btn.textContent = data.error && data.error.includes('already') ? '✓ Already added' : 'Failed';
    btn.className = 'btn btn-ghost';
    return;
  }

  for (var i = 0; i < platforms.length; i++) {
    await fetch('/api/feeds/' + data.id + '/platforms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform_id: platforms[i].id }),
    });
  }

  btn.textContent = '✓ Added!';
  btn.className = 'btn btn-success';
}

async function findFeedFromUrl() {
  var url = document.getElementById('find-feed-url').value.trim();
  if (!url) { alert('Enter a website URL or topic first.'); return; }

  var btn = event.target;
  btn.textContent = 'Searching…';
  btn.disabled = true;

  var resultsEl = document.getElementById('find-feed-results');
  resultsEl.innerHTML = '<div style="color:var(--muted);font-size:12px;">Searching…</div>';

  try {
    var res = await fetch('/api/find-feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url }),
    });
    var data = await res.json();

    if (!data.feeds || data.feeds.length === 0) {
      resultsEl.innerHTML = '<div style="color:var(--red);font-size:12px;">No RSS feeds found. Try a different topic or URL.</div>';
    } else {
      resultsEl.innerHTML = data.feeds.map(function(feed, i) {
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);margin-top:8px;">' +
          '<div><div style="font-size:13px;font-weight:500;color:var(--text);">' + escHtml(feed.title) + '</div>' +
          '<div style="font-size:11px;color:var(--muted);margin-top:2px;">' + escHtml(feed.url) + '</div></div>' +
          '<button class="btn btn-primary" id="url-add-btn-' + i + '" onclick="addFoundFeed(' + i + ', \'' + escHtml(feed.title) + '\', \'' + escHtml(feed.url) + '\')">+ Add</button>' +
          '</div>';
      }).join('');
    }
  } catch(e) {
    resultsEl.innerHTML = '<div style="color:var(--red);font-size:12px;">Error. Try again.</div>';
  }

  btn.textContent = 'Find RSS';
  btn.disabled = false;
}

async function addFoundFeed(index, title, url) {
  var btn = document.getElementById('url-add-btn-' + index);
  btn.textContent = 'Adding…';
  btn.disabled = true;

  var platforms = await fetch('/api/platforms').then(function(r) { return r.json(); });
  var res = await fetch('/api/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: title, url: url, check_interval: 30, max_items: 3, post_immediately: 1, active: 1 }),
  });
  var data = await res.json();

  if (!res.ok) {
    btn.textContent = data.error && data.error.includes('already') ? '✓ Already added' : 'Failed';
    btn.className = 'btn btn-ghost';
    return;
  }

  for (var i = 0; i < platforms.length; i++) {
    await fetch('/api/feeds/' + data.id + '/platforms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform_id: platforms[i].id }),
    });
  }

  btn.textContent = '✓ Added!';
  btn.className = 'btn btn-success';
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    var stats = await fetch('/api/stats').then(function(r) { return r.json(); });
    document.getElementById('stats-row').innerHTML =
      '<div class="stat-card"><div class="stat-value">' + stats.activeFeeds + '</div><div class="stat-label">Active Feeds</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + stats.platforms + '</div><div class="stat-label">Platforms</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + stats.todayPosts + '</div><div class="stat-label">Posted Today</div></div>' +
      '<div class="stat-card"><div class="stat-value">' + stats.totalPosts + '</div><div class="stat-label">Total Posts</div></div>';

    var history = await fetch('/api/history').then(function(r) { return r.json(); });
    var el = document.getElementById('dashboard-history');
    if (history.length === 0) {
      el.innerHTML = '<div class="empty-state">No posts yet.</div>';
    } else {
      el.innerHTML = history.slice(0, 10).map(function(item) {
        return '<div class="history-item">' +
          '<div style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;">' + platformLogo(item.platform, 18) + '</div>' +
          '<span class="history-title">' + escHtml(item.item_title || 'Untitled') + '</span>' +
          '<span class="history-meta">' + (item.platform || '') + ' · ' + timeAgo(item.posted_at) + '</span>' +
          '<span class="' + (item.status === 'posted' ? 'badge-posted' : 'badge-failed') + '">' + item.status + '</span>' +
          '</div>';
      }).join('');
    }
  } catch(e) { console.error(e); }
}

// ── Feeds ─────────────────────────────────────────────────────────────────────
async function loadFeeds() {
  try {
    var feeds = await fetch('/api/feeds').then(function(r) { return r.json(); });
    var el = document.getElementById('feeds-list');
    if (feeds.length === 0) {
      el.innerHTML = '<div class="empty-state">No feeds yet.<br>Click "Discover Feeds" to get started!</div>';
      return;
    }
    el.innerHTML = feeds.map(function(f) {
      return '<div class="feed-item">' +
        '<span class="feed-icon">🟠</span>' +
        '<div class="feed-info">' +
        '<div class="feed-name">' + escHtml(f.name) + '</div>' +
        '<div class="feed-url">' + escHtml(f.url) + '</div>' +
        '</div>' +
        '<span class="feed-badge ' + (f.active ? 'badge-active' : 'badge-inactive') + '">' + (f.active ? 'active' : 'paused') + '</span>' +
        '<div class="feed-actions">' +
        '<button class="btn btn-ghost" onclick="checkFeedNow(' + f.id + ', event)">↻</button>' +
        '<button class="btn btn-ghost" onclick="toggleFeedActive(' + f.id + ', ' + (f.active ? 0 : 1) + ')">' + (f.active ? '⏸' : '▶') + '</button>' +
        '<button class="btn btn-ghost" onclick="openEditFeed(' + f.id + ')">✎</button>' +
        '<button class="btn btn-danger" onclick="deleteFeed(' + f.id + ')">✕</button>' +
        '</div></div>';
    }).join('');
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
  var feeds = await fetch('/api/feeds').then(function(r) { return r.json(); });
  var feed = feeds.find(function(f) { return f.id === id; });
  if (!feed) return;
  var connected = await fetch('/api/feeds/' + id + '/platforms').then(function(r) { return r.json(); });
  document.getElementById('modal-feed-title').textContent = 'Edit Feed';
  document.getElementById('feed-id').value = id;
  document.getElementById('feed-name').value = feed.name;
  document.getElementById('feed-url').value = feed.url;
  document.getElementById('feed-interval').value = [30,60,120,180,240,1440].includes(feed.check_interval) ? feed.check_interval : 30;
  document.getElementById('feed-max').value = feed.max_items;
  document.getElementById('feed-prefix').value = feed.prefix || '';
  document.getElementById('feed-suffix').value = feed.suffix || '';
  await loadPlatformCheckboxes(connected.map(function(p) { return p.id; }));
  document.getElementById('modal-feed').classList.add('open');
}

async function loadPlatformCheckboxes(selectedIds) {
  var platforms = await fetch('/api/platforms').then(function(r) { return r.json(); });
  var el = document.getElementById('platform-checkboxes');
  if (platforms.length === 0) {
    el.innerHTML = '<span style="font-size:12px;color:var(--muted)">No platforms added yet.</span>';
    return;
  }
  el.innerHTML = platforms.map(function(p) {
    return '<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 10px;">' +
      '<input type="checkbox" value="' + p.id + '" ' + (selectedIds.includes(p.id) ? 'checked' : '') + ' />' +
      '<span style="display:flex;align-items:center;">' + platformLogo(p.type, 16) + '</span> ' + escHtml(p.name) +
      '</label>';
  }).join('');
}

async function saveFeed() {
  var id = document.getElementById('feed-id').value;
  var body = {
    name: document.getElementById('feed-name').value.trim(),
    url: document.getElementById('feed-url').value.trim(),
    check_interval: parseInt(document.getElementById('feed-interval').value) || 30,
    max_items: parseInt(document.getElementById('feed-max').value) || 3,
    prefix: document.getElementById('feed-prefix').value.trim(),
    suffix: document.getElementById('feed-suffix').value.trim(),
    post_immediately: 1, active: 1,
  };
  if (!body.name || !body.url) { alert('Name and URL are required.'); return; }
  var selectedPids = Array.from(document.querySelectorAll('#platform-checkboxes input:checked')).map(function(i) { return parseInt(i.value); });
  if (id) {
    await fetch('/api/feeds/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    var current = await fetch('/api/feeds/' + id + '/platforms').then(function(r) { return r.json(); });
    var currentIds = current.map(function(p) { return p.id; });
    for (var i = 0; i < selectedPids.length; i++) if (!currentIds.includes(selectedPids[i])) await fetch('/api/feeds/' + id + '/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform_id: selectedPids[i] }) });
    for (var j = 0; j < currentIds.length; j++) if (!selectedPids.includes(currentIds[j])) await fetch('/api/feeds/' + id + '/platforms/' + currentIds[j], { method: 'DELETE' });
  } else {
    var res = await fetch('/api/feeds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    var data = await res.json();
    if (!res.ok) { alert(data.error || 'Failed'); return; }
    for (var k = 0; k < selectedPids.length; k++) await fetch('/api/feeds/' + data.id + '/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform_id: selectedPids[k] }) });
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
  var feeds = await fetch('/api/feeds').then(function(r) { return r.json(); });
  var feed = feeds.find(function(f) { return f.id === id; });
  if (!feed) return;
  await fetch('/api/feeds/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({}, feed, { active: active })) });
  loadFeeds();
}

async function checkFeedNow(id, e) {
  var btn = e.target;
  btn.textContent = '…';
  btn.disabled = true;
  await fetch('/api/feeds/' + id + '/check', { method: 'POST' });
  btn.textContent = '✓';
  setTimeout(function() { btn.textContent = '↻'; btn.disabled = false; }, 2000);
}

// ── Platforms ─────────────────────────────────────────────────────────────────
async function loadPlatforms() {
  try {
    var platforms = await fetch('/api/platforms').then(function(r) { return r.json(); });
    var el = document.getElementById('platforms-grid');
    if (platforms.length === 0) {
      el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">No platforms yet.</div>';
      return;
    }
    el.innerHTML = platforms.map(function(p) {
      return '<div class="platform-card">' +
        '<div style="width:40px;height:40px;border-radius:8px;background:white;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);">' +
        platformLogo(p.type, 28) +
        '</div>' +
        '<div><div class="platform-name">' + escHtml(p.name) + '</div><div class="platform-type">' + p.type + '</div></div>' +
        '<button class="btn btn-danger" onclick="deletePlatform(' + p.id + ')">✕</button>' +
        '</div>';
    }).join('');
  } catch(e) { console.error(e); }
}

function openAddPlatform() {
  document.getElementById('platform-type').value = '';
  document.getElementById('platform-name').value = '';
  document.getElementById('platform-extra-fields').innerHTML = '';
  document.getElementById('save-platform-btn').disabled = false;
  document.getElementById('save-platform-btn').onclick = savePlatform;
  document.getElementById('modal-platform').classList.add('open');
}

function updatePlatformFields() {
  var type = document.getElementById('platform-type').value;
  var extra = document.getElementById('platform-extra-fields');
  var saveBtn = document.getElementById('save-platform-btn');
  saveBtn.disabled = false;
  saveBtn.textContent = 'Connect';
  saveBtn.onclick = savePlatform;
  extra.innerHTML = '';

  if (type === 'discord') {
    extra.innerHTML = '<div class="field"><label>Webhook URL</label><input type="url" id="discord-webhook" placeholder="https://discord.com/api/webhooks/..." /><div class="field-hint">Discord Server → Settings → Integrations → Webhooks → New Webhook → Copy URL</div></div>';
  } else if (type === 'bluesky') {
    extra.innerHTML = '<div class="field"><label>Handle</label><input type="text" id="bsky-handle" placeholder="you.bsky.social" /></div><div class="field"><label>App Password</label><input type="password" id="bsky-password" placeholder="xxxx-xxxx-xxxx-xxxx" /></div>';
  } else if (type === 'twitter') {
    extra.innerHTML = '<div class="info-box">Twitter/X uses the API keys from your Railway environment variables.</div>';
  } else if (type === 'instagram') {
    extra.innerHTML = '<div class="info-box">You will be redirected to Instagram to log in and grant access.</div>';
    saveBtn.textContent = 'Connect with Instagram';
    saveBtn.onclick = function() { window.location.href = '/auth/instagram'; };
  } else if (type === 'threads') {
    extra.innerHTML = '<div class="info-box">You will be redirected to Threads to log in and grant access.</div>';
    saveBtn.textContent = 'Connect with Threads';
    saveBtn.onclick = function() { window.location.href = '/auth/threads'; };
  } else if (type === 'facebook') {
    extra.innerHTML = '<div class="info-box">You will be redirected to Facebook to log in and grant access.</div>';
    saveBtn.textContent = 'Connect with Facebook';
    saveBtn.onclick = function() { window.location.href = '/auth/facebook'; };
  } else if (type === 'tiktok') {
    extra.innerHTML = '<div class="info-box">You will be redirected to TikTok to log in and grant access. RSS posts will be saved as drafts in your TikTok inbox — TikTok requires a video to fully publish.</div>';
    saveBtn.textContent = 'Connect with TikTok';
    saveBtn.onclick = function() { window.location.href = '/auth/tiktok'; };
  } else if (type === 'youtube') {
    extra.innerHTML = '<div class="info-box">You will be redirected to Google to log in and grant access. RSS headlines will be posted to your YouTube Community tab.</div>';
    saveBtn.textContent = 'Connect with YouTube';
    saveBtn.onclick = function() { window.location.href = '/auth/youtube'; };
  } else if (type === 'tumblr') {
    extra.innerHTML = '<div class="info-box" style="background:#fff0f0;border-color:#ffcccc;color:#cc0000;">Tumblr integration coming soon!</div>';
    saveBtn.disabled = true;
  }
}

async function savePlatform() {
  var type = document.getElementById('platform-type').value;
  var name = document.getElementById('platform-name').value.trim();
  if (!type) { alert('Select a platform type.'); return; }
  if (!name) { alert('Enter a display name.'); return; }
  var config = {};
  if (type === 'discord') {
    var webhook = document.getElementById('discord-webhook') ? document.getElementById('discord-webhook').value.trim() : '';
    if (!webhook) { alert('Enter the Discord webhook URL.'); return; }
    config = { webhookUrl: webhook };
  } else if (type === 'bluesky') {
    var handle = document.getElementById('bsky-handle') ? document.getElementById('bsky-handle').value.trim() : '';
    var password = document.getElementById('bsky-password') ? document.getElementById('bsky-password').value.trim() : '';
    if (!handle || !password) { alert('Enter your Bluesky handle and app password.'); return; }
    config = { handle: handle, password: password };
  }
  await fetch('/api/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, type: type, config: config }) });
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
    var history = await fetch('/api/history').then(function(r) { return r.json(); });
    var el = document.getElementById('history-list');
    if (history.length === 0) {
      el.innerHTML = '<div class="empty-state">No posts yet.</div>';
      return;
    }
    el.innerHTML = history.map(function(item) {
      return '<div class="history-item">' +
        '<div style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;">' + platformLogo(item.platform, 18) + '</div>' +
        '<span class="history-title">' + escHtml(item.item_title || 'Untitled') + '</span>' +
        '<span class="history-meta">' + escHtml(item.feed_name || '') + ' · ' + (item.platform || '') + ' · ' + timeAgo(item.posted_at) + '</span>' +
        '<span class="' + (item.status === 'posted' ? 'badge-posted' : 'badge-failed') + '">' + item.status + '</span>' +
        '</div>';
    }).join('');
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
  var diff = Math.floor(Date.now()/1000 - ts);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return new Date(ts * 1000).toLocaleDateString();
}

// ── Check for successful OAuth connection ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  loadDashboard();
  var params = new URLSearchParams(window.location.search);
  if (params.get('connected')) {
    alert('✅ ' + params.get('connected') + ' connected successfully!');
    window.history.replaceState({}, '', '/');
    showPage('platforms');
  }
});
