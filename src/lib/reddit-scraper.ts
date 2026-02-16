// Reddit Insights Engine - Data Collection Service
import ZAI from 'z-ai-web-dev-sdk';
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
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;

  async initialize(): Promise<void> {
    this.zai = await ZAI.create();
  }

  /**
   * Search Reddit for posts matching topics and keywords
   */
  async searchReddit(
    subreddit: string,
    topic: string,
    keywords: string[],
    maxResults: number = 25
  ): Promise<SearchResult[]> {
    if (!this.zai) {
      await this.initialize();
    }

    // Build search query targeting Reddit
    const keywordQuery = keywords.slice(0, 3).join(' OR ');
    const query = `site:reddit.com/${subreddit} ${topic} (${keywordQuery})`;

    try {
      const results = await this.zai!.functions.invoke('web_search', {
        query: query,
        num: maxResults
      });

      // Filter to only include Reddit URLs
      const redditResults = results.filter((r: SearchResult) => 
        r.url.includes('reddit.com') && 
        !r.url.includes('reddit.com/user/') &&
        !r.url.includes('reddit.com/search')
      );

      return redditResults;
    } catch (error) {
      console.error(`Search failed for ${subreddit} - ${topic}:`, error);
      return [];
    }
  }

  /**
   * Read and extract content from a Reddit post URL
   */
  async readRedditPost(url: string): Promise<{ title: string; content: string; publishedTime: string } | null> {
    if (!this.zai) {
      await this.initialize();
    }

    try {
      const result = await this.zai!.functions.invoke('page_reader', {
        url: url
      });

      if (result.code !== 200 || !result.data) {
        return null;
      }

      return {
        title: result.data.title || '',
        content: result.data.html || '',
        publishedTime: result.data.publishedTime || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Failed to read ${url}:`, error);
      return null;
    }
  }

  /**
   * Parse search results into structured Reddit posts
   */
  parseSearchResult(result: SearchResult, subreddit: string): Partial<RedditPost> {
    // Extract post ID from Reddit URL
    const postIdMatch = result.url.match(/comments\/([a-zA-Z0-9]+)/);
    const postId = postIdMatch ? postIdMatch[1] : `unknown-${Date.now()}`;

    // Extract title from search result name
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
   * Run full scraping workflow for configured subreddits and topics
   */
  async scrape(config: ScrapingConfig = DEFAULT_CONFIG): Promise<ScrapingResult> {
    const allPosts: RedditPost[] = [];
    const errors: string[] = [];
    const processedUrls = new Set<string>();

    console.log('Starting Reddit scrape with config:', JSON.stringify(config, null, 2));

    for (const subreddit of config.subreddits) {
      console.log(`\n--- Scraping ${subreddit} ---`);

      for (const topic of config.topics) {
        console.log(`Searching for topic: ${topic}`);
        
        try {
          const searchResults = await this.searchReddit(
            subreddit,
            topic,
            config.keywords,
            config.maxPostsPerSubreddit
          );

          for (const result of searchResults) {
            // Skip duplicates
            if (processedUrls.has(result.url)) {
              continue;
            }
            processedUrls.add(result.url);

            // Parse basic info from search result
            const partialPost = this.parseSearchResult(result, subreddit);

            // Read full content for top results
            if (partialPost.id && partialPost.title) {
              const fullContent = await this.readRedditPost(result.url);

              const post: RedditPost = {
                id: partialPost.id || `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: partialPost.title || 'Untitled',
                url: result.url,
                subreddit: subreddit,
                author: '[Unknown]',
                score: 0,
                numComments: 0,
                createdUtc: fullContent?.publishedTime || partialPost.createdUtc || new Date().toISOString(),
                selftext: fullContent?.content || partialPost.selftext || result.snippet,
                permalink: partialPost.permalink || result.url,
                linkFlairText: null,
                upvoteRatio: 0
              };

              allPosts.push(post);
              console.log(`  ✓ Collected: "${post.title.substring(0, 50)}..."`);
            }

            // Rate limiting
            await this.delay(500);
          }

          // Delay between topic searches
          await this.delay(1000);
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

    if (!this.zai) {
      await this.initialize();
    }

    for (const subreddit of config.subreddits) {
      try {
        const searchResults = await this.searchReddit(
          subreddit,
          topic,
          config.keywords,
          10
        );

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

        await this.delay(500);
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
