const Parser = require('rss-parser');
const db = require('./db');
const { postItem } = require('./poster');
const parser = new Parser({ customFields: { item: ['media:content', 'enclosure'] } });

function extractImage(item) {
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) return item['media:content'].$.url;
    if (item.enclosure && item.enclosure.url) return item.enclosure.url;
    const imgMatch = (item.content || item.summary || '').match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) return imgMatch[1];
    return null;
}

async function checkFeed(feed) {
    console.log('[RSS] Checking feed: ' + feed.name);
    let parsed;
    try { parsed = await parser.parseURL(feed.url); }
    catch (err) { console.error('[RSS] Failed:', err.message); return; }
    const now = Math.floor(Date.now() / 1000);
    db.get('feeds').find({ id: feed.id }).assign({ last_checked: now }).write();
    const feedPlatforms = db.get('feed_platforms').filter({ feed_id: feed.id }).value();
    if (!feedPlatforms.length) { console.log('[RSS] No platforms for feed: ' + feed.id); return; }
    const platforms = feedPlatforms.map(fp => db.get('platforms').find({ id: fp.platform_id }).value()).filter(Boolean);
    if (!platforms.length) return;
    const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    const todayPosts = db.get('posted_items').filter(i => i.posted_at >= startOfDay).size().value();
    if (todayPosts >= (feed.max_per_day || 10)) { console.log('[RSS] Daily limit reached'); return; }
    const items = parsed.items.slice(0, feed.max_items || 5);
    for (const item of items) {
          const guid = item.guid || item.link || item.title;
          const title = item.title || 'Untitled';
          const url = item.link || '';
          const imageUrl = extractImage(item);
          for (const platform of platforms) {
                  const alreadyPosted = db.get('posted_items').find({ feed_id: feed.id, item_guid: guid, platform: platform.type }).value();
                  if (alreadyPosted) continue;
                  try {
                            await postItem(platform, { title, url, imageUrl }, { prefix: feed.prefix || '', suffix: feed.suffix || '' });
                            const newId = db.get('_nextId.posted_items').value();
                            db.set('_nextId.posted_items', newId + 1).write();
                            db.get('posted_items').push({ id: newId, feed_id: feed.id, item_guid: guid, item_title: title, item_url: url, platform: platform.type, status: 'posted', posted_at: Math.floor(Date.now() / 1000) }).write();
                            console.log('[RSS] Posted to ' + platform.type + ': ' + title);
                  } catch (err) { console.error('[RSS] Post failed:', err.message); }
          }
    }
}

async function checkAllFeeds() {
    const feeds = db.get('feeds').filter({ active: 1 }).value();
    const now = Math.floor(Date.now() / 1000);
    for (const feed of feeds) {
          const nextCheck = (feed.last_checked || 0) + ((feed.check_interval || 60) * 60);
          if (now >= nextCheck) await checkFeed(feed);
    }
}

async function processQueue() {}

module.exports = { checkAllFeeds, checkFeed, processQueue };
