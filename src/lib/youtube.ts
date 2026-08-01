/**
 * YouTube Search Utility
 * Integrates official YouTube Data API with a keyless scraper search fallback.
 */
export async function searchYouTube(query: string): Promise<{ id: string; title: string } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GEMINI_API_KEY;
  const encodedQuery = encodeURIComponent(query);

  // 1. Official YouTube API Search
  if (apiKey) {
    try {
      console.log(`[YouTube API] Searching for: "${query}"`);
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&key=${apiKey}&type=video&maxResults=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          return {
            id: item.id.videoId,
            title: item.snippet.title
          };
        }
      } else {
        console.warn(`YouTube API returned status ${res.status}`);
      }
    } catch (err) {
      console.error("YouTube API search failed, falling back to keyless scraper:", err);
    }
  }

  // 2. Keyless Search Scraper Fallback
  try {
    console.log(`[YouTube Scraper] Searching for: "${query}"`);
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodedQuery}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    if (res.ok) {
      const html = await res.text();
      // Matches the first videoId pattern
      const videoMatch = html.match(/"videoId"\s*:\s*"([^"]+)"/);
      // Matches the first title text block
      const titleMatch = html.match(/"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/);
      
      if (videoMatch) {
        return {
          id: videoMatch[1],
          title: titleMatch ? titleMatch[1] : `Recommended Study: ${query}`
        };
      }
    }
  } catch (err) {
    console.error("YouTube keyless search scraper failed:", err);
  }

  return null;
}
