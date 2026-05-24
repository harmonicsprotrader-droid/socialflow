const express = require('express');
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const cron = require('node-cron');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const parser = new Parser();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS platforms (id SERIAL PRIMARY KEY, name TEXT, type TEXT, config TEXT DEFAULT '{}');
    CREATE TABLE IF NOT EXISTS feeds (id SERIAL PRIMARY KEY, name TEXT, url TEXT, check_interval INTEGER DEFAULT 30, max_items INTEGER DEFAULT 3, prefix TEXT DEFAULT '', suffix TEXT DEFAULT '', post_immediately INTEGER DEFAULT 1, active INTEGER DEFAULT 1, last_checked INTEGER);
    CREATE TABLE IF NOT EXISTS feed_platforms (feed_id INTEGER, platform_id INTEGER, PRIMARY KEY (feed_id, platform_id));
    CREATE TABLE IF NOT EXISTS history (id SERIAL PRIMARY KEY, feed_id INTEGER, feed_name TEXT, platform TEXT, item_title TEXT, item_url TEXT, status TEXT, posted_at INTEGER);
    CREATE TABLE IF NOT EXISTS seen_items (feed_id INTEGER, item_guid TEXT, PRIMARY KEY (feed_id, item_guid));
  `);
  console.log('DB ready');
}
// ── Explore: Search RSS feeds by topic ───────────────────────────────────────
app.post('/api/find-feed', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  const isTopic = !url.startsWith('http');
if (isTopic) {
    try {
      const query = encodeURIComponent(url);
      const searchRes = await fetch(`https://cloud.feedly.com/v3/search/feeds?query=${query}&count=10`);
      const data = await searchRes.json();
      const feeds = (data.results || []).slice(0, 5).map(r => ({
        title: r.title || r.feedId,
        url: r.feedId.replace('feed/', ''),
        description: r.description || '',
      }));
      return res.json({ feeds });
    } catch(e) {
      return res.json({ feeds: [] });
    }
  }
      }
      return res.json({ feeds });
    } catch(e) {
      return res.json({ feeds: [] });
    }
  }

  try {
    // Search Google for RSS feeds on this topic
    const query = encodeURIComponent(`${topic} RSS feed site:feedburner.com OR inurl:rss OR inurl:feed`);
    const searchRes = await fetch(`https://www.google.com/search?q=${query}&num=10`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await searchRes.text();

    // Extract URLs from search results
    const urlRegex = /https?:\/\/[^\s"<>]+(?:rss|feed|atom)[^\s"<>]*/gi;
    const urls = [...new Set(html.match(urlRegex) || [])].slice(0, 10);

    // Validate each URL as a real RSS feed
    const feeds = [];
    for (const url of urls) {
      try {
        const parsed = await parser.parseURL(url);
        feeds.push({
          title: parsed.title || url,
          url,
          description: parsed.description || '',
        });
        if (feeds.length >= 5) break;
      } catch(e) {}
    }

    res.json({ feeds });
  } catch(e) {
    console.error('[explore]', e.message);
    res.json({ feeds: [] });
  }
});
// ── Find RSS from URL ─────────────────────────────────────────────────────────
app.post('/api/find-feed', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  // If it's not a URL, treat it as a topic search
  const isTopic = !url.startsWith('http');
  if (isTopic) {
    try {
      const query = encodeURIComponent(url);
      const searchRes = await fetch(`https://cloud.feedly.com/v3/search/feeds?query=${query}&count=10`);
      const data = await searchRes.json();
      const feeds = (data.results || []).slice(0, 5).map(r => ({
        title: r.title || r.feedId,
        url: r.feedId.replace('feed/', ''),
        description: r.description || '',
      }));
      return res.json({ feeds });
    } catch(e) {
      return res.json({ feeds: [] });
    }
  }

  const candidates = [];

  try {
    // First try the URL directly as a feed
    try {
      await parser.parseURL(url);
      candidates.push(url);
    } catch(e) {}

    if (candidates.length === 0) {
      // Fetch the page HTML and look for RSS links
      const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await pageRes.text();

      // Find feed links in HTML
      const feedRegex = /<link[^>]+type=["'](application\/rss\+xml|application\/atom\+xml)["'][^>]*href=["']([^"']+)["']/gi;
      let match;
      while ((match = feedRegex.exec(html)) !== null) {
        candidates.push(match[2]);
      }

      // Also try common feed paths
      const base = new URL(url);
      const commonPaths = ['/feed', '/rss', '/feed.xml', '/rss.xml', '/atom.xml', '/feed/rss', '/feeds/posts/default'];
      for (const p of commonPaths) {
        try {
          const testUrl = base.origin + p;
          await parser.parseURL(testUrl);
          candidates.push(testUrl);
          break;
        } catch(e) {}
      }
    }

    if (candidates.length === 0) return res.json({ feeds: [] });

    // Validate and get feed info
    const feeds = [];
    for (const feedUrl of candidates.slice(0, 5)) {
      try {
        const fullUrl = feedUrl.startsWith('http') ? feedUrl : new URL(feedUrl, url).href;
        const parsed = await parser.parseURL(fullUrl);
        feeds.push({ title: parsed.title || feedUrl, url: fullUrl, description: parsed.description || '' });
      } catch(e) {}
    }

    res.json({ feeds });
  } catch(e) {
    console.error('[find-feed]', e.message);
    res.json({ feeds: [] });
  }
});

// ── Platforms API ─────────────────────────────────────────────────────────────
app.get('/api/platforms', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM platforms');
  res.json(rows.map(r => ({ ...r, config: JSON.parse(r.config) })));
});

app.post('/api/platforms', async (req, res) => {
  const { name, type, config } = req.body;
  const { rows } = await pool.query('INSERT INTO platforms (name,type,config) VALUES ($1,$2,$3) RETURNING id', [name, type, JSON.stringify(config||{})]);
  res.json({ id: rows[0].id });
});

app.delete('/api/platforms/:id', async (req, res) => {
  await pool.query('DELETE FROM platforms WHERE id=$1', [req.params.id]);
  await pool.query('DELETE FROM feed_platforms WHERE platform_id=$1', [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/feeds', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM feeds');
  res.json(rows);
});

app.post('/api/feeds', async (req, res) => {
  const { name, url, check_interval, max_items, prefix, suffix, post_immediately, active } = req.body;
  const ex = await pool.query('SELECT id FROM feeds WHERE url=$1', [url]);
  if (ex.rows.length) return res.status(400).json({ error: 'Feed already exists' });
  const { rows } = await pool.query('INSERT INTO feeds (name,url,check_interval,max_items,prefix,suffix,post_immediately,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id', [name, url, check_interval||30, max_items||3, prefix||'', suffix||'', post_immediately?1:0, active?1:0]);
  res.json({ id: rows[0].id });
});

app.put('/api/feeds/:id', async (req, res) => {
  const { name, url, check_interval, max_items, prefix, suffix, post_immediately, active } = req.body;
  await pool.query('UPDATE feeds SET name=$1,url=$2,check_interval=$3,max_items=$4,prefix=$5,suffix=$6,post_immediately=$7,active=$8 WHERE id=$9', [name, url, check_interval, max_items, prefix||'', suffix||'', post_immediately?1:0, active?1:0, req.params.id]);
  res.json({ ok: true });
});

app.delete('/api/feeds/:id', async (req, res) => {
  await pool.query('DELETE FROM feeds WHERE id=$1', [req.params.id]);
  await pool.query('DELETE FROM feed_platforms WHERE feed_id=$1', [req.params.id]);
  await pool.query('DELETE FROM seen_items WHERE feed_id=$1', [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/feeds/:id/platforms', async (req, res) => {
  const { rows } = await pool.query('SELECT p.* FROM platforms p JOIN feed_platforms fp ON p.id=fp.platform_id WHERE fp.feed_id=$1', [req.params.id]);
  res.json(rows.map(r => ({ ...r, config: JSON.parse(r.config) })));
});

app.post('/api/feeds/:id/platforms', async (req, res) => {
  await pool.query('INSERT INTO feed_platforms (feed_id,platform_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, req.body.platform_id]);
  res.json({ ok: true });
});

app.delete('/api/feeds/:id/platforms/:pid', async (req, res) => {
  await pool.query('DELETE FROM feed_platforms WHERE feed_id=$1 AND platform_id=$2', [req.params.id, req.params.pid]);
  res.json({ ok: true });
});

app.post('/api/feeds/:id/check', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM feeds WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  await checkFeed(rows[0]);
  res.json({ ok: true });
});

app.get('/api/history', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM history ORDER BY posted_at DESC LIMIT 200');
  res.json(rows);
});

app.get('/api/stats', async (req, res) => {
  const todayStart = Math.floor(new Date().setHours(0,0,0,0) / 1000);
  const [a, b, c, d] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM feeds WHERE active=1'),
    pool.query('SELECT COUNT(*) FROM platforms'),
    pool.query('SELECT COUNT(*) FROM history WHERE posted_at>=$1', [todayStart]),
    pool.query('SELECT COUNT(*) FROM history'),
  ]);
  res.json({ activeFeeds: parseInt(a.rows[0].count), platforms: parseInt(b.rows[0].count), todayPosts: parseInt(c.rows[0].count), totalPosts: parseInt(d.rows[0].count) });
});

app.post('/api/publish', async (req, res) => {
  const { content, platformIds } = req.body;
  const results = [];
  for (const pid of platformIds) {
    const { rows } = await pool.query('SELECT * FROM platforms WHERE id=$1', [pid]);
    if (!rows.length) continue;
    const p = { ...rows[0], config: JSON.parse(rows[0].config) };
    const ok = await postToPlatform(p.type, p.config, content);
    results.push({ platform: p.type, status: ok ? 'posted' : 'failed' });
  }
  res.json({ results });
});

function twitterAuth(method, url, params, keys) {
  const op = { oauth_consumer_key: keys.apiKey, oauth_nonce: crypto.randomBytes(16).toString('hex'), oauth_signature_method: 'HMAC-SHA1', oauth_timestamp: Math.floor(Date.now()/1000).toString(), oauth_token: keys.accessToken, oauth_version: '1.0' };
  const all = { ...params, ...op };
  const base = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(Object.keys(all).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(all[k])}`).join('&'))}`;
  const sig = crypto.createHmac('sha1', `${encodeURIComponent(keys.apiSecret)}&${encodeURIComponent(keys.accessTokenSecret)}`).update(base).digest('base64');
  op.oauth_signature = sig;
  return 'OAuth ' + Object.keys(op).sort().map(k => `${encodeURIComponent(k)}="${encodeURIComponent(op[k])}"`).join(', ');
}

async function postToTwitter(text) {
  const keys = { apiKey: process.env.TWITTER_API_KEY, apiSecret: process.env.TWITTER_API_SECRET, accessToken: process.env.TWITTER_ACCESS_TOKEN, accessTokenSecret: process.env.TWITTER_ACCESS_SECRET };
  if (!keys.apiKey) return false;
  const url = 'https://api.twitter.com/2/tweets';
  const res = await fetch(url, { method: 'POST', headers: { 'Authorization': twitterAuth('POST', url, {}, keys), 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
  if (!res.ok) console.error('[Twitter]', await res.text());
  return res.ok;
}

async function checkFeed(feed) {
  try {
    const parsed = await parser.parseURL(feed.url);
    const { rows: platforms } = await pool.query('SELECT p.* FROM platforms p JOIN feed_platforms fp ON p.id=fp.platform_id WHERE fp.feed_id=$1', [feed.id]);
    let newItems = 0;
    for (const item of parsed.items.slice(0, feed.max_items)) {
      const guid = item.guid || item.link || item.title;
      const seen = await pool.query('SELECT 1 FROM seen_items WHERE feed_id=$1 AND item_guid=$2', [feed.id, guid]);
      if (seen.rows.length) continue;
      await pool.query('INSERT INTO seen_items (feed_id,item_guid) VALUES ($1,$2) ON CONFLICT DO NOTHING', [feed.id, guid]);
      if (!feed.post_immediately || !platforms.length) continue;
      const title = item.title || 'New post';
      const link = item.link || '';
      let text = [feed.prefix, title, link, feed.suffix].filter(Boolean).join('\n');
      if (text.length > 280) text = text.slice(0, 277) + '...';
      for (const p of platforms) {
        const config = JSON.parse(p.config);
        const ok = await postToPlatform(p.type, config, text);
        await pool.query('INSERT INTO history (feed_id,feed_name,platform,item_title,item_url,status,posted_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [feed.id, feed.name, p.type, title, link, ok?'posted':'failed', Math.floor(Date.now()/1000)]);
      }
      newItems++;
    }
    await pool.query('UPDATE feeds SET last_checked=$1 WHERE id=$2', [Math.floor(Date.now()/1000), feed.id]);
    console.log(`[${feed.name}] ${newItems} new item(s)`);
  } catch(e) { console.error(`[${feed.name}]`, e.message); }
}

async function postToPlatform(type, config, text) {
  try {
    if (type === 'discord') {
      const res = await fetch(config.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text }) });
      return res.ok;
    }
    if (type === 'twitter') return await postToTwitter(text);
    if (type === 'bluesky') {
      const s = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: config.handle, password: config.password }) }).then(r => r.json());
      if (!s.accessJwt) return false;
      const r = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.accessJwt}` }, body: JSON.stringify({ repo: s.did, collection: 'app.bsky.feed.post', record: { text, createdAt: new Date().toISOString(), '$type': 'app.bsky.feed.post' } }) });
      return r.ok;
    }
    return false;
  } catch(e) { console.error(`[${type}]`, e.message); return false; }
}

cron.schedule('* * * * *', async () => {
  const { rows } = await pool.query('SELECT * FROM feeds WHERE active=1');
  const now = Math.floor(Date.now()/1000);
  for (const feed of rows) {
    if (now - (feed.last_checked||0) >= (feed.check_interval||30)*60) await checkFeed(feed);
  }
});

const PORT = process.env.PORT || 3000;
initDB().then(() => app.listen(PORT, () => console.log(`✅ Running on port ${PORT}`)));
