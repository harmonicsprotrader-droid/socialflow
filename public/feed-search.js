// ── Feed Search ───────────────────────────────────────────────────────────────
// Searches for RSS feeds from a URL or keyword using multiple strategies.

async function searchFeeds(query) {
  const results = [];

  // Strategy 1: If it looks like a URL, try to find feeds directly
  if (query.includes('.') && !query.includes(' ')) {
    const url = query.startsWith('http') ? query : `https://${query}`;
    const directFeeds = await tryDirectFeedDiscovery(url);
    results.push(...directFeeds);
  }

  // Strategy 2: Use RSS search API
  const apiResults = await searchRssApi(query);
  results.push(...apiResults);

  // Deduplicate by URL
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

// Try to discover RSS feeds from a website URL
async function tryDirectFeedDiscovery(url) {
  try {
    const res = await fetch(`/api/discover-feed?url=${encodeURIComponent(url)}`);
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// Search using feedly's public search (no auth required for basic search)
async function searchRssApi(query) {
  try {
    const res = await fetch(`/api/search-feeds?q=${encodeURIComponent(query)}`);
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

window.searchFeeds = searchFeeds;
