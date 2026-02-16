// Reddit Insights Engine - Data Collection Service (Groq Compatible)
import { RedditPost, ScrapingConfig, ScrapingResult, DEFAULT_CONFIG } from './types';

interface SearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date: string;
}

export class RedditScraper {
  /**
   * Search using DuckDuckGo Instant Answer API (free, no API key needed)
   */
  async searchReddit(
    subreddit: string,
    topic: string,
    keywords: string[],
    maxResults: number = 25
  ): Promise<SearchResult[]> {
    const query = `site:reddit.com/${subreddit} ${topic}`;
    
    try {
      // Use DuckDuckGo HTML search (free, no API key required)
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const html = await response.text();
      
      // Parse results from HTML
      const results: SearchResult[] = [];
      const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g;
      const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([^<]*)<\/a>/g;
      
      let match;
      let index = 0;
      
      while ((match = linkRegex.exec(html)) !== null && results.length < maxResults) {
        let url = match[1];
        const title = match[2].trim();
        
        // DuckDuckGo uses redirect URLs, extract the actual URL
        const urlMatch = url.match(/uddg=([^&]+)/);
        if (urlMatch) {
          url = decodeURIComponent(urlMatch[1]);
        }
        
        // Only include Reddit URLs
        if (url.includes('reddit.com') && !url.includes('reddit.com/user/')) {
          results.push({
            url,
            name: title,
            snippet: '',
            host_name: 'reddit.com',
            rank: index + 1,
            date: new Date().toISOString()
          });
          index++;
        }
      }
      
      return results;
    } catch (error) {
      console.error(`Search failed for ${subreddit} - ${topic}:`, error);
      return [];
    }
  }

  /**
   * Parse search results into structured Reddit posts
   */
  parseSearchResult(result: SearchResult, subreddit: string): Partial<RedditPost> {
    const postIdMatch = result.url.match(/comments\/([a-zA-Z0-9]+)/);
    const postId = postIdMatch ? postIdMatch[1] : `unknown-${Date.now()}`;

    const title = result.name
      .replace(/^r\/[^:]+:\s*/i, '')
      .replace(/\s*:\s*r\/[^:]+$/i, '')
      .trim();

    return {
      id: postId,
      title: title,
      url: result.url,
      subreddit: subreddit,
      createdUtc: result.date || new Date().toISOString(),
      selftext: result.snippet || '',
      permalink: result.url.replace('https://www.reddit.com', ''),
    };
  }

  /**
   * Run full scraping workflow
   */
  async scrape(config: ScrapingConfig = DEFAULT_CONFIG): Promise<ScrapingResult> {
    const allPosts: RedditPost[] = [];
    const errors: string[] = [];
    const processedUrls = new Set<string>();

    console.log('Starting Reddit scrape with config:', JSON.stringify(config, null, 2));

    for (const subreddit of config.subreddits) {
      console.log(`\n--- Scraping ${subreddit} ---`);

      for (const topic of config.topics.slice(0, 3)) { // Limit topics for speed
        console.log(`Searching for topic: ${topic}`);
        
        try {
          const searchResults = await this.searchReddit(
            subreddit,
            topic,
            config.keywords,
            5 // Limit results per topic
          );

          for (const result of searchResults) {
            if (processedUrls.has(result.url)) continue;
            processedUrls.add(result.url);

            const partialPost = this.parseSearchResult(result, subreddit);

            if (partialPost.id && partialPost.title) {
              const post: RedditPost = {
                id: partialPost.id || `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: partialPost.title || 'Untitled',
                url: result.url,
                subreddit: subreddit,
                author: '[Unknown]',
                score: 0,
                numComments: 0,
                createdUtc: partialPost.createdUtc || new Date().toISOString(),
                selftext: partialPost.selftext || result.snippet,
                permalink: partialPost.permalink || result.url,
                linkFlairText: null,
                upvoteRatio: 0
              };

              allPosts.push(post);
              console.log(`  ✓ Collected: "${post.title.substring(0, 50)}..."`);
            }

            await this.delay(200);
          }

          await this.delay(500);
        } catch (error) {
          const errorMsg = `Failed to scrape ${subreddit} for ${topic}: ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    }

    return {
      success: errors.length === 0,
      posts: allPosts,
      errors: errors,
      metadata: {
        totalFound: allPosts.length,
        totalProcessed: allPosts.length,
        scrapedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Quick search for a single topic across all subreddits
   */
  async quickSearch(topic: string, config: ScrapingConfig = DEFAULT_CONFIG): Promise<ScrapingResult> {
    const allPosts: RedditPost[] = [];
    const errors: string[] = [];
    const processedUrls = new Set<string>();

    for (const subreddit of config.subreddits) {
      try {
        const searchResults = await this.searchReddit(subreddit, topic, [], 5);

        for (const result of searchResults) {
          if (processedUrls.has(result.url)) continue;
          processedUrls.add(result.url);

          const partialPost = this.parseSearchResult(result, subreddit);

          const post: RedditPost = {
            id: partialPost.id || `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: partialPost.title || 'Untitled',
            url: result.url,
            subreddit: subreddit,
            author: '[Unknown]',
            score: 0,
            numComments: 0,
            createdUtc: partialPost.createdUtc || new Date().toISOString(),
            selftext: partialPost.selftext || result.snippet,
            permalink: partialPost.permalink || result.url,
            linkFlairText: null,
            upvoteRatio: 0
          };

          allPosts.push(post);
        }

        await this.delay(200);
      } catch (error) {
        errors.push(`Failed quick search for ${subreddit}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      posts: allPosts,
      errors: errors,
      metadata: {
        totalFound: allPosts.length,
        totalProcessed: allPosts.length,
        scrapedAt: new Date().toISOString()
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const redditScraper = new RedditScraper();
