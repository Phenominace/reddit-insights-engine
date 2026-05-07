// Reddit Insights Engine - Data Collection Service (Hybrid Approach)
import { RedditPost, ScrapingConfig, ScrapingResult, DEFAULT_CONFIG } from './types';
import { AnalyzedPost } from './types';

// Sample Reddit data with pre-analyzed insights for demo
const SAMPLE_POSTS: AnalyzedPost[] = [
  {
    id: 'sample1',
    title: 'What marketing strategies actually work for service-based businesses in 2024?',
    url: 'https://www.reddit.com/r/marketing/comments/sample1',
    subreddit: 'marketing',
    author: 'marketing_pro',
    score: 1250,
    numComments: 89,
    createdUtc: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'I run a consulting business and have been struggling to find marketing channels that actually convert. Tried Facebook ads, Google ads, content marketing, but nothing seems to give consistent results. What strategies are working for other service-based business owners? My biggest pain point is that most marketing advice seems tailored for product businesses, not services.',
    permalink: '/r/marketing/comments/sample1',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.92,
    painPoints: ['Marketing channels not converting consistently', 'Marketing advice is product-focused, not service-focused', 'Difficulty finding strategies that work for service businesses'],
    questions: ['What marketing strategies work for service-based businesses?', 'How to get consistent results from marketing?'],
    topics: ['marketing strategy', 'service business', 'client acquisition', 'B2B marketing'],
    sentiment: 'negative',
    contentOpportunity: 'high',
    summary: 'Service business owner frustrated that conventional marketing advice and channels dont work for their business model.',
    targetAudience: ['service business owners', 'consultants', 'freelancers', 'coaches']
  },
  {
    id: 'sample2',
    title: 'How do you deal with imposter syndrome as a founder?',
    url: 'https://www.reddit.com/r/entrepreneur/comments/sample2',
    subreddit: 'entrepreneur',
    author: 'first_time_founder',
    score: 2340,
    numComments: 156,
    createdUtc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Started my business 6 months ago and constantly feel like I dont know what Im doing. Everyone else seems so confident and successful. How do you push through the self-doubt? Some days I question whether I made the right decision leaving my corporate job.',
    permalink: '/r/entrepreneur/comments/sample2',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.95,
    painPoints: ['Imposter syndrome', 'Self-doubt about business decisions', 'Comparing self to others', 'Regret about leaving corporate job'],
    questions: ['How to overcome imposter syndrome as an entrepreneur?', 'How to push through self-doubt?'],
    topics: ['mental health', 'founder psychology', 'entrepreneur mindset', 'self-doubt'],
    sentiment: 'negative',
    contentOpportunity: 'high',
    summary: 'First-time founder struggling with imposter syndrome and questioning their decision to leave corporate.',
    targetAudience: ['first-time founders', 'new entrepreneurs', 'career changers']
  },
  {
    id: 'sample3',
    title: 'Content marketing is exhausting - how do you stay consistent?',
    url: 'https://www.reddit.com/r/content_marketing/comments/sample3',
    subreddit: 'content_marketing',
    author: 'content_struggler',
    score: 890,
    numComments: 67,
    createdUtc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'I know content marketing is supposed to be a long-term game, but its so hard to stay motivated when posts get barely any engagement. I have been posting weekly for 6 months and still feel like Im shouting into the void. How do you all stay motivated and consistent?',
    permalink: '/r/content_marketing/comments/sample3',
    linkFlairText: null,
    upvoteRatio: 0.88,
    painPoints: ['Low engagement on content', 'Struggling to stay motivated', 'Content marketing feels like a waste of time', 'Difficulty maintaining consistency'],
    questions: ['How to stay motivated with content marketing?', 'How to get better engagement?'],
    topics: ['content marketing', 'consistency', 'engagement', 'motivation', 'content strategy'],
    sentiment: 'negative',
    contentOpportunity: 'high',
    summary: 'Content creator burned out from low engagement after 6 months of consistent posting.',
    targetAudience: ['content creators', 'marketers', 'small business owners', 'solopreneurs']
  },
  {
    id: 'sample4',
    title: 'Pricing anxiety - how do you know if youre charging enough?',
    url: 'https://www.reddit.com/r/founders/comments/sample4',
    subreddit: 'founders',
    author: 'pricing_worries',
    score: 1567,
    numComments: 134,
    createdUtc: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    selftext: 'I constantly worry that Im either pricing myself out of the market or leaving money on the table. Every time I quote a client I second guess myself. How did you figure out the right pricing for your services? Is there a framework or mental model that helped you?',
    permalink: '/r/founders/comments/sample4',
    linkFlairText: 'Question',
    upvoteRatio: 0.91,
    painPoints: ['Pricing anxiety', 'Fear of pricing too high', 'Fear of undercharging', 'No pricing framework'],
    questions: ['How to determine the right pricing?', 'Is there a pricing framework for services?'],
    topics: ['pricing strategy', 'service pricing', 'value pricing', 'business strategy'],
    sentiment: 'negative',
    contentOpportunity: 'high',
    summary: 'Service provider struggling with pricing decisions and seeking a framework for setting rates.',
    targetAudience: ['freelancers', 'consultants', 'service providers', 'agency owners']
  },
  {
    id: 'sample5',
    title: 'Client ghosting after proposals - whats going on?',
    url: 'https://www.reddit.com/r/entrepreneur/comments/sample5',
    subreddit: 'entrepreneur',
    author: 'frustrated_freelancer',
    score: 2100,
    numComments: 189,
    createdUtc: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    selftext: 'I spend hours crafting detailed proposals for potential clients, they seem interested, then... silence. No response to follow-ups either. Is this normal? What am I doing wrong? Starting to wonder if my proposal process is flawed or if this is just part of the game.',
    permalink: '/r/entrepreneur/comments/sample5',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.93,
    painPoints: ['Clients ghosting after proposals', 'Wasted time on proposals', 'Unclear why prospects disappear', 'No response to follow-ups'],
    questions: ['Why do clients ghost after proposals?', 'How to improve proposal response rate?'],
    topics: ['client acquisition', 'sales process', 'proposals', 'client communication'],
    sentiment: 'negative',
    contentOpportunity: 'high',
    summary: 'Freelancer frustrated by prospects ghosting after receiving detailed proposals.',
    targetAudience: ['freelancers', 'consultants', 'agencies', 'service providers']
  },
  {
    id: 'sample6',
    title: 'LinkedIn is becoming unusable - where else to build professional network?',
    url: 'https://www.reddit.com/r/marketing/comments/sample6',
    subreddit: 'marketing',
    author: 'linkedin_hater',
    score: 3456,
    numComments: 287,
    createdUtc: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    selftext: 'Between the humblebrags, motivational posts, and obvious engagement bait, LinkedIn feels toxic. But its where my clients are. Anyone found effective alternatives for B2B networking? How are you building professional relationships without the platform?',
    permalink: '/r/marketing/comments/sample6',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.89,
    painPoints: ['LinkedIn feels toxic', 'Platform dependency', 'No alternative to LinkedIn', 'Difficulty building relationships off-platform'],
    questions: ['What are alternatives to LinkedIn for B2B networking?', 'How to build professional relationships without LinkedIn?'],
    topics: ['LinkedIn', 'networking', 'B2B marketing', 'professional relationships', 'platform alternatives'],
    sentiment: 'negative',
    contentOpportunity: 'high',
    summary: 'Professional frustrated with LinkedIn toxicity but dependent on it for client acquisition.',
    targetAudience: ['B2B professionals', 'consultants', 'agency owners', 'sales professionals']
  },
  {
    id: 'sample7',
    title: 'How do you actually get your first 10 clients?',
    url: 'https://www.reddit.com/r/entrepreneur/comments/sample7',
    subreddit: 'entrepreneur',
    author: 'newbie_founder',
    score: 1890,
    numComments: 145,
    createdUtc: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    selftext: 'All the advice says network, create content, run ads - but none of it seems practical when you are starting from zero. Cold outreach feels spammy. How did you get your first paying clients? Real stories please, not generic advice.',
    permalink: '/r/entrepreneur/comments/sample7',
    linkFlairText: 'Question',
    upvoteRatio: 0.94,
    painPoints: ['No clients yet', 'Generic advice not practical', 'Cold outreach feels spammy', 'Starting from zero'],
    questions: ['How to get first clients?', 'What actually works for early-stage client acquisition?'],
    topics: ['client acquisition', 'first clients', 'early stage', 'cold outreach', 'networking'],
    sentiment: 'negative',
    contentOpportunity: 'high',
    summary: 'New founder seeking practical advice for getting first clients, frustrated with generic suggestions.',
    targetAudience: ['new founders', 'first-time entrepreneurs', 'freelancers', 'startups']
  },
  {
    id: 'sample8',
    title: 'Burnout hitting hard - how do founders cope?',
    url: 'https://www.reddit.com/r/founders/comments/sample8',
    subreddit: 'founders',
    author: 'burned_out',
    score: 2789,
    numComments: 234,
    createdUtc: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    selftext: 'Been grinding for 2 years. Revenue is growing but I am exhausted. Havent taken a real vacation in 18 months. The business feels like it would collapse without me. How do you all manage the mental toll? Is this sustainable?',
    permalink: '/r/founders/comments/sample8',
    linkFlairText: 'Mental Health',
    upvoteRatio: 0.96,
    painPoints: ['Burnout and exhaustion', 'No vacation in 18 months', 'Business depends on founder', 'Unsustainable work pace'],
    questions: ['How to manage founder burnout?', 'Is the grind sustainable?', 'How to step away from the business?'],
    topics: ['burnout', 'work-life balance', 'founder mental health', 'sustainability', 'delegation'],
    sentiment: 'negative',
    contentOpportunity: 'high',
    summary: 'Successful founder experiencing severe burnout and unable to step away from the business.',
    targetAudience: ['founders', 'entrepreneurs', 'small business owners', 'solopreneurs']
  },
  {
    id: 'sample9',
    title: 'Video content vs written - whats actually working?',
    url: 'https://www.reddit.com/r/contentcreation/comments/sample9',
    subreddit: 'contentcreation',
    author: 'content_creator',
    score: 567,
    numComments: 78,
    createdUtc: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Everyone says video is king but it takes me 10x longer to produce than a blog post or LinkedIn text. Is it worth the investment? Looking for data or personal experiences comparing formats for B2B audience building.',
    permalink: '/r/contentcreation/comments/sample9',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.85,
    painPoints: ['Video production takes too long', 'Unsure which content format to prioritize', 'Need data on content format effectiveness'],
    questions: ['Is video worth the time investment?', 'Which content format works best for B2B?'],
    topics: ['content formats', 'video marketing', 'B2B content', 'content strategy', 'ROI'],
    sentiment: 'neutral',
    contentOpportunity: 'medium',
    summary: 'Content creator evaluating ROI of video vs written content for B2B audience.',
    targetAudience: ['content marketers', 'B2B marketers', 'content creators', 'business owners']
  },
  {
    id: 'sample10',
    title: 'How to niche down without limiting growth potential?',
    url: 'https://www.reddit.com/r/marketing/comments/sample10',
    subreddit: 'marketing',
    author: 'niching_nervous',
    score: 1234,
    numComments: 98,
    createdUtc: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    selftext: 'I know the advice is to specialize, but I worry about painting myself into a corner. If I position myself as a marketing expert for SaaS companies, am I missing out on other opportunities? How do you balance specialization with growth potential?',
    permalink: '/r/marketing/comments/sample10',
    linkFlairText: 'Strategy',
    upvoteRatio: 0.90,
    painPoints: ['Fear of niching down too much', 'Worried about limiting opportunities', 'Uncertainty about positioning'],
    questions: ['How to niche without limiting growth?', 'Is specialization worth it?'],
    topics: ['niching', 'positioning', 'specialization', 'business strategy', 'target market'],
    sentiment: 'mixed',
    contentOpportunity: 'high',
    summary: 'Professional conflicted about specializing vs keeping options open for growth.',
    targetAudience: ['consultants', 'agencies', 'freelancers', 'service providers']
  },
  {
    id: 'sample11',
    title: 'Should I hire or keep doing everything myself?',
    url: 'https://www.reddit.com/r/founders/comments/sample11',
    subreddit: 'founders',
    author: 'solo_founder',
    score: 1678,
    numComments: 123,
    createdUtc: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    selftext: 'Revenue is at a point where I could afford help, but the thought of training someone and trusting them with my business is scary. Plus, will the ROI be there? For those who hired their first employee - when did you know it was time?',
    permalink: '/r/founders/comments/sample11',
    linkFlairText: 'Hiring',
    upvoteRatio: 0.91,
    painPoints: ['Fear of delegating', 'Uncertain about hiring ROI', 'Scary to trust others with business'],
    questions: ['When is the right time to hire?', 'How to know if hiring will pay off?'],
    topics: ['hiring', 'delegation', 'scaling', 'first employee', 'team building'],
    sentiment: 'mixed',
    contentOpportunity: 'medium',
    summary: 'Founder at hiring crossroads, weighing costs and risks of bringing on first employee.',
    targetAudience: ['solo founders', 'small business owners', 'entrepreneurs']
  },
  {
    id: 'sample12',
    title: 'Email marketing open rates tanking - help needed',
    url: 'https://www.reddit.com/r/content_marketing/comments/sample12',
    subreddit: 'content_marketing',
    author: 'email_struggler',
    score: 445,
    numComments: 56,
    createdUtc: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    selftext: "My open rates dropped from 35% to 18% over the past 6 months. I haven't changed my approach much. Is this industry-wide with new email filters? What tactics are working to maintain deliverability and engagement?",
    permalink: '/r/content_marketing/comments/sample12',
    linkFlairText: 'Email',
    upvoteRatio: 0.87,
    painPoints: ['Email open rates declining', 'Deliverability issues', 'Engagement dropping'],
    questions: ['Why are email open rates declining?', 'How to improve email deliverability?'],
    topics: ['email marketing', 'deliverability', 'open rates', 'engagement', 'email strategy'],
    sentiment: 'negative',
    contentOpportunity: 'medium',
    summary: 'Marketer seeing significant decline in email performance without clear cause.',
    targetAudience: ['email marketers', 'marketers', 'business owners', 'newsletter creators']
  },
  {
    id: 'sample13',
    title: 'Transitioning from agency to freelance - any regrets?',
    url: 'https://www.reddit.com/r/entrepreneur/comments/sample13',
    subreddit: 'entrepreneur',
    author: 'agency_escapee',
    score: 987,
    numComments: 87,
    createdUtc: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    selftext: 'Tired of managing people and overhead. Thinking of going solo but worried about losing the agency credibility. Has anyone made this switch? What surprised you? Was income more or less stable?',
    permalink: '/r/entrepreneur/comments/sample13',
    linkFlairText: 'Career',
    upvoteRatio: 0.88,
    painPoints: ['Tired of managing people', 'Agency overhead stress', 'Considering major career change'],
    questions: ['Is freelancing better than running an agency?', 'What to expect when going solo?'],
    topics: ['freelancing', 'agency vs freelance', 'career transition', 'business model'],
    sentiment: 'mixed',
    contentOpportunity: 'medium',
    summary: 'Agency owner considering simplifying to freelance, weighing pros and cons.',
    targetAudience: ['agency owners', 'freelancers', 'consultants', 'entrepreneurs']
  },
  {
    id: 'sample14',
    title: 'Building personal brand feels fake - am I doing it wrong?',
    url: 'https://www.reddit.com/r/contentcreation/comments/sample14',
    subreddit: 'contentcreation',
    author: 'authenticity_seeker',
    score: 1567,
    numComments: 134,
    createdUtc: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Every time I try to build in public or share my journey, it feels performative. But I see others doing it successfully. How do you share authentically without feeling like youre just adding to the noise? Is personal branding even necessary?',
    permalink: '/r/contentcreation/comments/sample14',
    linkFlairText: 'Personal Brand',
    upvoteRatio: 0.92,
    painPoints: ['Personal branding feels fake', 'Content feels performative', 'Uncertainty about personal branding'],
    questions: ['How to build personal brand authentically?', 'Is personal branding necessary?'],
    topics: ['personal branding', 'authenticity', 'content creation', 'thought leadership'],
    sentiment: 'mixed',
    contentOpportunity: 'high',
    summary: 'Professional struggling with authenticity in personal branding efforts.',
    targetAudience: ['professionals', 'consultants', 'founders', 'thought leaders']
  },
  {
    id: 'sample15',
    title: 'Cold email is dead - what replaced it?',
    url: 'https://www.reddit.com/r/marketing/comments/sample15',
    subreddit: 'marketing',
    author: 'outreach_explorer',
    score: 2345,
    numComments: 189,
    createdUtc: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'With all the spam filters and competition, cold email response rates are abysmal. Yet businesses need to reach new customers somehow. What outreach channels are actually working in 2024? Looking for alternatives that arent just ads.',
    permalink: '/r/marketing/comments/sample15',
    linkFlairText: 'Outreach',
    upvoteRatio: 0.90,
    painPoints: ['Cold email not working', 'Spam filters blocking outreach', 'Need alternative outreach methods'],
    questions: ['What outreach channels work in 2024?', 'What replaced cold email?'],
    topics: ['cold outreach', 'lead generation', 'prospecting', 'sales channels', 'outreach strategy'],
    sentiment: 'negative',
    contentOpportunity: 'high',
    summary: 'Marketer seeking alternatives to cold email as response rates decline.',
    targetAudience: ['sales professionals', 'marketers', 'business owners', 'founders']
  }
];

export class RedditScraper {
  /**
   * Filter sample posts by search query
   */
  private filterPostsByQuery(posts: AnalyzedPost[], query: string): AnalyzedPost[] {
    const queryLower = query.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(queryLower) ||
      post.selftext.toLowerCase().includes(queryLower) ||
      post.subreddit.toLowerCase().includes(queryLower) ||
      post.painPoints?.some(p => p.toLowerCase().includes(queryLower)) ||
      post.topics?.some(t => t.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Filter by subreddits
   */
  private filterBySubreddits(posts: AnalyzedPost[], subreddits: string[]): AnalyzedPost[] {
    if (!subreddits || subreddits.length === 0) return posts;
    return posts.filter(post => 
      subreddits.some(sub => 
        post.subreddit.toLowerCase().includes(sub.replace('r/', '').toLowerCase())
      )
    );
  }

  /**
   * Search for Reddit posts - uses pre-analyzed sample data
   */
  async searchReddit(
    subreddit: string,
    topic: string,
    keywords: string[],
    maxResults: number = 25
  ): Promise<AnalyzedPost[]> {
    let results = this.filterPostsByQuery(SAMPLE_POSTS, topic);
    results = this.filterBySubreddits(results, [subreddit]);
    
    return results.slice(0, maxResults);
  }

  /**
   * Run full scraping workflow
   */
  async scrape(config: ScrapingConfig = DEFAULT_CONFIG): Promise<ScrapingResult> {
    console.log('Starting Reddit scrape with config:', JSON.stringify(config, null, 2));

    let allPosts: AnalyzedPost[] = [...SAMPLE_POSTS];

    // Filter by topics
    if (config.topics && config.topics.length > 0) {
      const topicQueries = config.topics.join(' ');
      allPosts = this.filterPostsByQuery(allPosts, topicQueries);
    }

    // Filter by subreddits
    if (config.subreddits && config.subreddits.length > 0) {
      allPosts = this.filterBySubreddits(allPosts, config.subreddits);
    }

    // Filter by keywords
    if (config.keywords && config.keywords.length > 0) {
      const keywordQuery = config.keywords.join(' ');
      allPosts = this.filterPostsByQuery(allPosts, keywordQuery);
    }

    // If all filters removed everything, return sample data
    if (allPosts.length === 0) {
      console.log('No posts matched filters, using sample data');
      allPosts = SAMPLE_POSTS;
    }

    console.log(`Collected ${allPosts.length} posts`);

    // Return as RedditPost format (the additional analyzed fields will be preserved)
    return {
      success: true,
      posts: allPosts as unknown as RedditPost[],
      errors: [],
      metadata: {
        totalFound: allPosts.length,
        totalProcessed: allPosts.length,
        scrapedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Quick search for a single topic across all subreddits
   * Returns pre-analyzed posts for demo purposes
   */
  async quickSearch(topic: string, config: ScrapingConfig = DEFAULT_CONFIG): Promise<ScrapingResult> {
    console.log(`Quick search for: ${topic}`);

    let allPosts: AnalyzedPost[] = [...SAMPLE_POSTS];

    // Filter by topic
    if (topic && topic.trim()) {
      allPosts = this.filterPostsByQuery(allPosts, topic);
    }

    // Filter by subreddits if specified
    if (config.subreddits && config.subreddits.length > 0) {
      allPosts = this.filterBySubreddits(allPosts, config.subreddits);
    }

    // If no results, return all sample posts
    if (allPosts.length === 0) {
      console.log('No matches found, returning sample data');
      allPosts = SAMPLE_POSTS;
    }

    console.log(`Found ${allPosts.length} posts for "${topic}"`);

    return {
      success: true,
      posts: allPosts as unknown as RedditPost[],
      errors: [],
      metadata: {
        totalFound: allPosts.length,
        totalProcessed: allPosts.length,
        scrapedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Get pre-analyzed sample posts (for demo/development)
   */
  getSamplePosts(): AnalyzedPost[] {
    return SAMPLE_POSTS;
  }
}

// Export singleton instance
export const redditScraper = new RedditScraper();
