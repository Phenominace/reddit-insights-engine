// Reddit Insights Engine - Type Definitions

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  createdUtc: string;
  selftext: string;
  permalink: string;
  linkFlairText: string | null;
  upvoteRatio: number;
}

export interface AudienceInsight {
  complaints: string[];           // "I hate…", "Why is it so hard to…"
  frustrations: string[];          // "This never works…", "I'm tired of…"
  desiredOutcomes: string[];       // "I just want…", "How do I get…"
  failedSolutions: string[];       // "I tried X but…"
  comparisons: string[];           // "X vs Y", "Which is better…"
  objections: string[];            // "Too expensive", "Not worth it"
  fears: string[];                 // "What if…", "I don't want to…"
  urgentProblems: string[];        // "ASAP", "quick fix", "fast way"
  repeatedQuestions: string[];     // same question asked many times
  strongEmotions: string[];        // anger, regret, excitement
  exactPhrases: string[];          // word-for-word patterns people repeat
  beforeAfterStories: string[];    // "I used to… now…"
  misconceptions: string[];        // "I thought… but…"
  buyTriggers: string[];           // "Finally bought because…"
  notBuyingReasons: string[];      // "I didn't buy because…"
}

export interface AnalyzedPost extends RedditPost {
  painPoints: string[];
  questions: string[];
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  contentOpportunity: 'high' | 'medium' | 'low';
  summary: string;
  targetAudience: string[];
  audienceInsight?: AudienceInsight;  // Detailed insight categorization
  industry?: string;                   // Industry/category this post belongs to
}

export interface ContentOpportunity {
  id: string;
  title: string;
  description: string;
  sourcePosts: string[];
  category: 'pain_point' | 'question' | 'trend' | 'gap';
  priority: 'high' | 'medium' | 'low';
  suggestedContentType: string[];
  keywords: string[];
}

export interface InsightReport {
  id: string;
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  configuration: ScrapingConfig;
  summary: {
    totalPostsAnalyzed: number;
    totalPainPoints: number;
    totalQuestions: number;
    topSubreddits: { name: string; count: number }[];
    sentimentDistribution: { positive: number; negative: number; neutral: number; mixed: number };
  };
  analyzedPosts: AnalyzedPost[];
  contentOpportunities: ContentOpportunity[];
  trendingTopics: { topic: string; count: number; sentiment: string }[];
  audienceInsights: {
    persona: string;
    count: number;
    painPoints: string[];
  }[];
}

export interface ScrapingConfig {
  subreddits: string[];
  topics: string[];
  keywords: string[];
  maxPostsPerSubreddit: number;
  dateRange: {
    days: number;
  };
}

export interface ScrapingResult {
  success: boolean;
  posts: RedditPost[];
  errors: string[];
  metadata: {
    totalFound: number;
    totalProcessed: number;
    scrapedAt: string;
  };
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  startedAt: string;
  completedAt?: string;
  result?: InsightReport;
  error?: string;
}

// Default Configuration
export const DEFAULT_CONFIG: ScrapingConfig = {
  subreddits: [
    'r/marketing',
    'r/entrepreneur',
    'r/content_marketing',
    'r/contentcreation',
    'r/founders'
  ],
  topics: [
    'marketing strategy',
    'content strategy',
    'online marketing',
    'entrepreneurship',
    'service business',
    'client acquisition',
    'lead generation',
    'brand building',
    'social media marketing',
    'email marketing'
  ],
  keywords: [
    'how to',
    'struggling with',
    'need help',
    'advice',
    'tips',
    'best way',
    'what works',
    'challenge',
    'problem',
    'question'
  ],
  maxPostsPerSubreddit: 25,
  dateRange: {
    days: 7
  }
};
