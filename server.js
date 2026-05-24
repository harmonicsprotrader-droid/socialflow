// ── SocialFlow Server ─────────────────────────────────────────────────────────
const express = require('express');
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

const app = express();
const parser = new Parser();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Simple JSON Database ──────────────────────────────────────────────────────
const DB_FILE = path.join(__dirname, 'data.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const empty = { platforms: [], feeds: [], feedPlatforms: [], history: [], seenItems: [], _nextId: { platforms: 1, feeds: 1, history: 1 } };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2));
    return empty;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function nextId(db, table) {
  if (!db._nextId) db._nextId = {};
  if (!db._nextId[table]) db._nextId[table] = 1;
  return db._nextId[table]++;
}

// ── Platforms API ─────────────────────────────────────────────────────────────
app.get('/api/platforms', (req, res) => {
  const db = loadDB();
  res.json(db.platforms);
});

app.post('/api/platforms', (req, res) => {
  const db = loadDB();
  const { name, type, config } = req.body;
  const platform = { id: nextId(db, 'platforms'), name, type, config: config || {} };
  db.platforms.push(platform);
  saveDB(db);
  res.json({ id: platform.id });
});

app.delete('/api/platforms/:id', (req, res) => {
  const db = loadDB();
  const id = parseInt(req.params.id);
  db.platforms = db.platforms.filter(p => p.id !== id);
  db.feedPlatforms = db.feedPlatforms.filter(fp => fp.platform_id !== id);
  saveDB(db);
  res.json({ ok: true });
});

app.get('/api/feeds', (req, res) => {
  const db = loadDB();
  res.json(db.feeds);
});

app.post('/api/feeds', (req, res) => {
  const db = loadDB();
  const { name, url, check_interval, max_items, prefix, suffix, post_immediately, active } = req.body;
  if (db.feeds.find(f => f.url === url)) return res.status(400).json({ error: 'Feed already exists' });
  const feed = { id: nextId(db, 'feeds'), name, url, check_interval: check_interval||30, max_items: max_items||3, prefix: prefix||'', suffix: suffix||'', post_immediately: post_immediately?1:0, active: active?1:0, last_checked: null };
  db.feeds.push(feed);
  saveDB(db);
  res.json({ id: feed.id });
});

app.put('/api/feeds/:id', (req, res) => {
  const db = loadDB();
  const id = parseInt(req.params.id);
  const idx = db.feeds.findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.feeds[idx] = { ...db.feeds[idx], ...req.body, id };
  saveDB(db);
  res.json({ ok: true });
});

app.delete('/api/feeds/:id', (req, res) => {
  const db = loadDB();
  const id = parseInt(req.params.id);
  db.feeds = db.feeds.filter(f => f.id !== id);
  db.feedPlatforms = db.feedPlatforms.filter(fp => fp.feed_id !== id);
  db.seenItems = (db.seenItems || []).filter(s => s.feed_id !== id);
  saveDB(db);
  res.json({ ok: true });
});

app.get('/api/feeds/:id/platforms', (req, res) => {
  const db = loadDB();
  const feedId = parseInt(req.params.id);
  const platformIds = db.feedPlatforms.filter(fp => fp.feed_id === feedId).map(fp => fp.platform_id);
  res.json(db.platforms.filter(p => platformIds.includes(p.id)));
});

app.post('/api/feeds/:id/platforms', (req, res) => {
  const db = loadDB();
  const feedId = parseInt(req.params.id);
  const platformId = parseInt(req.body.platform_id);
  if (!db.feedPlatforms.find(fp => fp.feed_id === feedId && fp.platform_id === platformId)) {
    db.feedPlatforms.push({ feed_id: feedId, platform_id: platformId });
    saveDB(db);
  }
  res.json({ ok: true });
});

app.delete('/api/feeds/:id/platforms/:pid', (req, res) => {
  const db = loadDB();
  db.feedPlatforms = db.feedPlatforms.filter(fp => !(fp.feed_id === parseInt(req.params.id) && fp.platform_id === parseInt(req.params.pid)));
  saveDB(db);
  res.json({ ok: true });
});

app.post('/api/feeds/:id/check', async (req, res) => {
  const db = loadDB();
  const feed = db.feeds.find(f => f.id === parseInt(req.params.id));
  if (!feed) return res.status(404).json({ error: 'Not found' });
  await checkFeed(feed);
  res.json({ ok: true });
});

app.get('/api/history', (req, res) => {
  const db = loadDB();
  res.json((db.history || []).slice(-200).reverse());
});

app.get('/api/stats', (req, res) => {
  const db = loadDB();
  const todayStart = Math.floor(new Date().setHours(0,0,0,0) / 1000);
  const history = db.history || [];
  res.json({
    activeFeeds: db.feeds.filter(f => f.active).length,
    platforms: db.platforms.length,
    todayPosts: history.filter(h => h.posted_at >= todayStart).length,
    totalPosts: history.length,
  });
});

app.post('/api/publish', async (req, res) => {
  const db = loadDB();
  const { content, platformIds } = req.body;
  const results = [];
  for (const pid of platformIds) {
    const platform = db.platforms.find(p => p.id === pid);
    if (!platform) continue;
    const ok = await postToPlatform(platform.type, platform.config, content);
    results.push({ platform: platform.type, status: ok ? 'posted' : 'failed' });
  }
  res.json({ results });
});

async function checkFeed(feed) {
  try {
    const db = loadDB();
    const parsed = await parser.parseURL(feed.url);
    const platformIds = db.feedPlatforms.filter(fp => fp.feed_id === feed.id).map(fp => fp.platform_id);
    const platforms = db.platforms.filter(p => platformIds.includes(p.id));
    if (!db.seenItems) db.seenItems = [];
    let newItems = 0;
    for (const item of parsed.items.slice(0, feed.max_items)) {
      const guid = item.guid || item.link || item.title;
      const seen = db.seenItems.find(s => s.feed_id === feed.id && s.item_guid === guid);
      if (seen) continue;
      db.seenItems.push({ feed_id: feed.id, item_guid: guid });
      if (!feed.post_immediately || platforms.length === 0) continue;
      const title = item.title || 'New post';
      const link = item.link || '';
      let text = [feed.prefix, title, link, feed.suffix].filter(Boolean).join('\n');
      if (text.length > 280) text = text.slice(0, 277) + '...';
      for (const platform of platforms) {
        const ok = await postToPlatform(platform.type, platform.config, text);
        if (!db.history) db.history = [];
        db.history.push({ id: nextId(db, 'history'), feed_id: feed.id, feed_name: feed.name, platform: platform.type, item_title: title, item_url: link, status: ok ? 'posted' : 'failed', posted_at: Math.floor(Date.now()/1000) });
      }
      newItems++;
    }
    const feedIdx = db.feeds.findIndex(f => f.id === feed.id);
    if (feedIdx !== -1) db.feeds[feedIdx].last_checked = Math.floor(Date.now()/1000);
    saveDB(db);
    console.log(`[${feed.name}] Checked. ${newItems} new item(s).`);
  } catch(e) {
    console.error(`[${feed.name}] Error:`, e.message);
  }
}

async function postToPlatform(type, config, text) {
  try {
    if (type === 'discord') {
      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      return res.ok;
    }
    if (type === 'bluesky') {
      const loginRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: config.handle, password: config.password }),
      });
      const session = await loginRes.json();
      if (!session.accessJwt) return false;
      const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.accessJwt}` },
        body: JSON.stringify({
          repo: session.did,
          collection: 'app.bsky.feed.post',
          record: { text, createdAt: new Date().toISOString(), '$type': 'app.bsky.feed.post' },
        }),
      });
      return postRes.ok;
    }
    return false;
  } catch(e) {
    console.error(`[${type}] Post error:`, e.message);
    return false;
  }
}

cron.schedule('* * * * *', async () => {
  const db = loadDB();
  const now = Math.floor(Date.now() / 1000);
  for (const feed of db.feeds.filter(f => f.active)) {
    const lastChecked = feed.last_checked || 0;
    const intervalSecs = (feed.check_interval || 30) * 60;
    if (now - lastChecked >= intervalSecs) await checkFeed(feed);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ SocialFlow running at http://localhost:${PORT}\n`);
});

module.exports = app;
