// ── poster.js ─────────────────────────────────────────────────────────────────
require('dotenv').config();
const fetch = require('node-fetch');
// ── Twitter/X ─────────────────────────────────────────────────────────────────
// Uses OAuth 1.0a with built-in crypto — no external library needed

const crypto = require('crypto');

function oauthSign(method, url, params, consumerSecret, tokenSecret) {
  const sorted = Object.keys(params).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  const base = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sorted)}`;
  const key = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac('sha1', key).update(base).digest('base64');
}

async function postToTwitter(title, url, prefix = '', suffix = '') {
  const text = [prefix, title, url, suffix].filter(Boolean).join(' ').slice(0, 280);
  const apiUrl = 'https://api.twitter.com/2/tweets';
  const oauthParams = {
    oauth_consumer_key: process.env.TWITTER_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.TWITTER_ACCESS_TOKEN,
    oauth_version: '1.0',
  };
  oauthParams.oauth_signature = oauthSign('POST', apiUrl, oauthParams, process.env.TWITTER_API_SECRET, process.env.TWITTER_ACCESS_SECRET);
  const authHeader = 'OAuth ' + Object.keys(oauthParams).map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`).join(', ');
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Twitter post failed'); }
  return (await res.json()).data.id;
}

// ── Bluesky ───────────────────────────────────────────────────────────────────

const bskySessions = {};

async function getBskySession(handle, password) {
  const key = handle;
  if (bskySessions[key] && Date.now() - bskySessions[key].ts < 90 * 60 * 1000) {
    return bskySessions[key];
  }
  const res = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: handle, password }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(`Bluesky login failed: ${e.message}`); }
  const data = await res.json();
  bskySessions[key] = { ...data, ts: Date.now() };
  return bskySessions[key];
}

async function postToBluesky(title, url, prefix = '', suffix = '', imageUrl = null, config = {}) {
  const handle = config.handle || process.env.BSKY_HANDLE;
  const password = config.password || process.env.BSKY_APP_PASSWORD;
  const session = await getBskySession(handle, password);

  const textBody = [prefix, title, suffix].filter(Boolean).join(' ').slice(0, 280);
  const fullText = url ? `${textBody}\n${url}` : textBody;

  const record = {
    $type: 'app.bsky.feed.post',
    text: fullText.slice(0, 300),
    createdAt: new Date().toISOString(),
  };

  // Only add facet if URL exists
  if (url) {
    record.facets = [{
      index: { byteStart: Buffer.byteLength(textBody) + 1, byteEnd: Buffer.byteLength(textBody) + 1 + Buffer.byteLength(url) },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }]
    }];
  }

  if (imageUrl) {
    try {
      const imgRes = await fetch(imageUrl);
      const imgBuf = await imgRes.buffer();
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      const blobRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
        method: 'POST',
        headers: { 'Content-Type': contentType, Authorization: `Bearer ${session.accessJwt}` },
        body: imgBuf,
      });
      if (blobRes.ok) {
        const { blob } = await blobRes.json();
        record.embed = { $type: 'app.bsky.embed.images', images: [{ image: blob, alt: title }] };
      }
    } catch (e) { console.log('Image upload failed:', e.message); }
  }

  const res = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessJwt}` },
    body: JSON.stringify({ repo: session.did, collection: 'app.bsky.feed.post', record }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(`Bluesky post failed: ${e.message}`); }
  return (await res.json()).uri;
}

// ── Discord ───────────────────────────────────────────────────────────────────

async function postToDiscord(title, url, prefix = '', suffix = '', imageUrl = null, config = {}) {
  const webhookUrl = config.webhookUrl || process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('No Discord webhook URL configured.');

  const description = [prefix, suffix].filter(Boolean).join(' ') || undefined;
  const embed = { title: title.slice(0, 256), url, color: 0x5865F2, timestamp: new Date().toISOString() };
  if (description) embed.description = description;
  if (imageUrl) embed.image = { url: imageUrl };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });
  if (!res.ok) throw new Error(`Discord post failed: ${res.status}`);
  return true;
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

async function postItem(platform, item, feedSettings) {
  const { title, url, imageUrl } = item;
  const { prefix = '', suffix = '' } = feedSettings;
  const config = platform.config ? (typeof platform.config === 'string' ? JSON.parse(platform.config) : platform.config) : {};

  switch (platform.type) {
    case 'twitter':  return postToTwitter(title, url, prefix, suffix);
    case 'bluesky':  return postToBluesky(title, url, prefix, suffix, imageUrl, config);
    case 'discord':  return postToDiscord(title, url, prefix, suffix, imageUrl, config);
    case 'threads': return postToThreads(title, url, prefix, suffix, imageUrl, config);`n    case 'tiktok': return postToTikTok(title, url, prefix, suffix, config);`n    default: throw new Error(`Platform not supported yet: ${platform.type}`);
  }
}

module.exports = { postItem };

