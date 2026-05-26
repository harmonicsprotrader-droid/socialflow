const express = require('express');
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const cron = require('node-cron');h
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const parser = new Parser();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));// ── TikTok URL Verification ──────────────────────────────────────────────────app.get('/tiktokCoomGPT6F4t3hoH6fbCOiI4I8GwSYRVU.txt', (req, res) => {  res.type('text/plain').send('tiktok-developers-site-verification=CoomGPT6F4t3hoH6fbCOiI4I8GwSYRVU');// ── TikTok URL Verification 

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

// ── Generate Post with AI ─────────────────────────────────────────────────────
app.post('/api/generate-post', async (req, res) => {
  const { topic, tone } = req.body;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return res.status(400).json({ error: 'No OpenAI API key set' });
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are a social media expert. Write a ${tone} social media post under 280 characters. No hashtags unless relevant. Just the post text, nothing else.` },
          { role: 'user', content: `Write a post about: ${topic}` }
        ],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    const post = data.choices?.[0]?.message?.content?.trim();
    res.json({ post });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Instagram OAuth ───────────────────────────────────────────────────────────
app.get('/auth/instagram', (req, res) => {
  const appId = process.env.META_APP_ID;
  const redirectUri = encodeURIComponent('https://socialflow-production.up.railway.app/auth/instagram/callback');
  const scope = 'instagram_business_basic,instagram_content_publish';
  res.redirect(`https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`);
});

app.get('/auth/instagram/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('Error: no code received');
  try {
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: 'https://socialflow-production.up.railway.app/auth/instagram/callback',
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.send('Error getting token: ' + JSON.stringify(tokenData));
    const userRes = await fetch(`https://graph.instagram.com/v21.0/me?fields=id,username&access_token=${tokenData.access_token}`);
    const user = await userRes.json();
    await pool.query('INSERT INTO platforms (name, type, config) VALUES ($1, $2, $3)', [
      user.username || 'Instagram',
      'instagram',
      JSON.stringify({ accessToken: tokenData.access_token, userId: tokenData.user_id }),
    ]);
    res.redirect('https://socialflow-production.up.railway.app/?connected=instagram');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
});

// ── Threads OAuth ─────────────────────────────────────────────────────────────
app.get('/auth/threads', (req, res) => {
  const appId = process.env.META_APP_ID;
  const redirectUri = encodeURIComponent('https://socialflow-production.up.railway.app/auth/threads/callback');
  const scope = 'threads_basic,threads_content_publish';
  res.redirect(`https://threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`);
});

app.get('/auth/threads/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('Error: no code received');
  try {
    const tokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: 'https://socialflow-production.up.railway.app/auth/threads/callback',
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.send('Error getting token: ' + JSON.stringify(tokenData));
    const userRes = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username&access_token=${tokenData.access_token}`);
    const user = await userRes.json();
    await pool.query('INSERT INTO platforms (name, type, config) VALUES ($1, $2, $3)', [
      user.username || 'Threads',
      'threads',
      JSON.stringify({ accessToken: tokenData.access_token, userId: tokenData.id }),
    ]);
    res.redirect('https://socialflow-production.up.railway.app/?connected=threads');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
});

// ── TikTok OAuth ──────────────────────────────────────────────────────────────
app.get('/auth/tiktok', (req, res) => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = encodeURIComponent('https://socialflow-production.up.railway.app/auth/tiktok/callback');
  const scope = 'user.info.basic,video.upload,video.publish';
  const csrfState = Math.random().toString(36).substring(7);
  res.redirect(`https://www.tiktok.com/v2/auth/authorize?client_key=${clientKey}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${csrfState}`);
});

app.get('/auth/tiktok/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('Error: no code received');
  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://socialflow-production.up.railway.app/auth/tiktok/callback',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.send('Error: ' + JSON.stringify(tokenData));

    // Get user display name
    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,open_id', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    const displayName = userData.data?.user?.display_name || 'TikTok';

    await pool.query('INSERT INTO platforms (name, type, config) VALUES ($1, $2, $3)', [
      displayName,
      'tiktok',
      JSON.stringify({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        openId: tokenData.open_id,
      }),
    ]);
    res.redirect('https://socialflow-production.up.railway.app/?connected=tiktok');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
});

// ── YouTube OAuth ─────────────────────────────────────────────────────────────
app.get('/auth/youtube', (req, res) => {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const redirectUri = encodeURIComponent('https://socialflow-production.up.railway.app/auth/youtube/callback');
  const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl');
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`);
});

app.get('/auth/youtube/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send('Error: no code received');
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.YOUTUBE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://socialflow-production.up.railway.app/auth/youtube/callback',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.send('Error: ' + JSON.stringify(tokenData));

    const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });
    const channelData = await channelRes.json();
    const channelName = channelData.items?.[0]?.snippet?.title || 'YouTube';

    await pool.query('INSERT INTO platforms (name, type, config) VALUES ($1, $2, $3)', [
      channelName,
      'youtube',
      JSON.stringify({ accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token }),
    ]);
    res.redirect('https://socialflow-production.up.railway.app/?connected=youtube');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
});

// ── Unsplash Image Search ─────────────────────────────────────────────────────
app.get('/api/unsplash', async (req, res) => {
  const { query } = req.query;
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return res.status(400).json({ error: 'No Unsplash key' });
  try {
    const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&client_id=${key}`);
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Find RSS from URL or Topic ────────────────────────────────────────────────
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
  const candidates = [];
  try {
    try { await parser.parseURL(url); candidates.push(url); } catch(e) {}
    if (candidates.length === 0) {
      const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await pageRes.text();
      const feedRegex = /<link[^>]+type=["'](application\/rss\+xml|application\/atom\+xml)["'][^>]*href=["']([^"']+)["']/gi;
      let match;
      while ((match = feedRegex.exec(html)) !== null) candidates.push(match[2]);
      const base = new URL(url);
      const commonPaths = ['/feed', '/rss', '/feed.xml', '/rss.xml', '/atom.xml', '/feed/rss'];
      for (const p of commonPaths) {
        try { const testUrl = base.origin + p; await parser.parseURL(testUrl); candidates.push(testUrl); break; } catch(e) {}
      }
    }
    if (candidates.length === 0) return res.json({ feeds: [] });
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
    const ok = await postToPlatform(p.type, p.config, content, p.id);
    results.push({ platform: p.type, status: ok ? 'posted' : 'failed' });
  }
  res.json({ results });
});

// ── Twitter Auth ──────────────────────────────────────────────────────────────
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

// ── YouTube helpers ───────────────────────────────────────────────────────────
async function refreshYouTubeToken(config) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  return data.access_token || null;
}

async function postToYouTube(config, text, platformId) {
  const accessToken = await refreshYouTubeToken(config);
  if (!accessToken) { console.error('[YouTube] Token refresh failed'); return false; }

  // Persist refreshed token back to DB
  if (platformId) {
    const updatedConfig = { ...config, accessToken };
    await pool.query('UPDATE platforms SET config=$1 WHERE id=$2', [JSON.stringify(updatedConfig), platformId]);
  }

  // Post as YouTube Community Post via activities bulletin
  const res = await fetch('https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      snippet: { description: text },
      contentDetails: { bulletin: { resourceId: {} } },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('[YouTube]', JSON.stringify(err.error || err));
    return false;
  }
  return true;
}

// ── TikTok helpers ────────────────────────────────────────────────────────────
async function refreshTikTokToken(config) {
  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
    }),
  });
  const data = await res.json();
  return data.access_token ? { accessToken: data.access_token, refreshToken: data.refresh_token || config.refreshToken } : null;
}

async function postToTikTok(config, text, platformId) {
  let accessToken = config.accessToken;

  // Try to refresh token proactively
  const refreshed = await refreshTikTokToken(config);
  if (refreshed) {
    accessToken = refreshed.accessToken;
    if (platformId) {
      const updatedConfig = { ...config, accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken };
      await pool.query('UPDATE platforms SET config=$1 WHERE id=$2', [JSON.stringify(updatedConfig), platformId]);
    }
  }

  // TikTok requires video — post as an INBOX draft so the user can
  // attach a video in the TikTok app and publish from there.
  // We use the Direct Post API with SELF_ONLY privacy as a draft placeholder.
  const caption = text.slice(0, 2200); // TikTok caption limit

  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title: caption,
        privacy_level: 'SELF_ONLY',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 0,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: 0,
        chunk_size: 0,
        total_chunk_count: 0,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[TikTok]', err);
    return false;
  }
  const data = await res.json();
  console.log('[TikTok] Draft created:', data.data?.publish_id || 'unknown');
  return true;
}

// ── RSS Feed Checker ──────────────────────────────────────────────────────────
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
        const ok = await postToPlatform(p.type, config, text, p.id);
        await pool.query('INSERT INTO history (feed_id,feed_name,platform,item_title,item_url,status,posted_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [feed.id, feed.name, p.type, title, link, ok?'posted':'failed', Math.floor(Date.now()/1000)]);
      }
      newItems++;
    }
    await pool.query('UPDATE feeds SET last_checked=$1 WHERE id=$2', [Math.floor(Date.now()/1000), feed.id]);
    console.log(`[${feed.name}] ${newItems} new item(s)`);
  } catch(e) { console.error(`[${feed.name}]`, e.message); }
}

// ── Platform Router ───────────────────────────────────────────────────────────
async function postToPlatform(type, config, text, platformId) {
  try {
    if (type === 'discord') {
      const res = await fetch(config.webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text }) });
      return res.ok;
    }
    if (type === 'twitter') return await postToTwitter(text);
    if (type === 'instagram') {
      const { accessToken, userId } = config;
      const container = await fetch(`https://graph.instagram.com/v21.0/${userId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: text, media_type: 'TEXT', access_token: accessToken }),
      }).then(r => r.json());
      if (!container.id) return false;
      const publish = await fetch(`https://graph.instagram.com/v21.0/${userId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: container.id, access_token: accessToken }),
      }).then(r => r.json());
      return !!publish.id;
    }
    if (type === 'threads') {
      const { accessToken, userId } = config;
      const container = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, media_type: 'TEXT', access_token: accessToken }),
      }).then(r => r.json());
      if (!container.id) return false;
      const publish = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: container.id, access_token: accessToken }),
      }).then(r => r.json());
      return !!publish.id;
    }
    if (type === 'bluesky') {
      const s = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: config.handle, password: config.password }) }).then(r => r.json());
      if (!s.accessJwt) return false;
      const r = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s.accessJwt}` }, body: JSON.stringify({ repo: s.did, collection: 'app.bsky.feed.post', record: { text, createdAt: new Date().toISOString(), '$type': 'app.bsky.feed.post' } }) });
      return r.ok;
    }
    if (type === 'youtube') return await postToYouTube(config, text, platformId);
    if (type === 'tiktok') return await postToTikTok(config, text, platformId);
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
