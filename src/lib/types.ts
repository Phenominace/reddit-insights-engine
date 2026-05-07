// AI Audience Research Agent - Type Definitions

/**
 * Insight Categories - The 15 patterns for audience research
 */
export type InsightCategory = 
  | 'complaints'           // "I hate...", "Why is it so hard to..."
  | 'frustrations'         // "This never works...", "I'm tired of..."
  | 'desired_outcomes'     // "I just want...", "How do I get..."
  | 'failed_solutions'     // "I tried X but..."
  | 'comparisons'          // "X vs Y", "Which is better..."
  | 'objections'           // "Too expensive", "Not worth it"
  | 'fears'                // "What if...", "I don't want to..."
  | 'urgent_problems'      // "ASAP", "quick fix", "fast way"
  | 'repeated_questions'   // Same question asked many times
  | 'strong_emotions'      // Anger, regret, excitement
  | 'exact_phrases'        // Word-for-word patterns people repeat
  | 'before_after'         // "I used to... now..."
  | 'misconceptions'       // "I thought... but..."
  | 'buying_triggers'      // "Finally bought because..."
  | 'non_buying_reasons';  // "I didn't buy because..."

/**
 * Search Pattern definitions for each category
 */
export interface SearchPattern {
  category: InsightCategory;
  label: string;
  description: string;
  triggerPhrases: string[];
  examples: string[];
  icon: string;
}

/**
 * Pre-defined search patterns for audience research
 */
export const INSIGHT_PATTERNS: SearchPattern[] = [
  {
    category: 'complaints',
    label: 'Complaints',
    description: 'Direct complaints and grievances about products, services, or experiences',
    triggerPhrases: ['I hate', 'Why is it so hard to', 'This is terrible', 'Worst experience', 'Such a pain', 'This sucks', 'I regret'],
    examples: ['I hate how complicated this is', 'Why is it so hard to find a good solution?'],
    icon: '😠'
  },
  {
    category: 'frustrations',
    label: 'Frustrations',
    description: 'Ongoing struggles and pain points that people are tired of dealing with',
    triggerPhrases: ['This never works', 'I\'m tired of', 'Sick and tired', 'Fed up with', 'At my wits end', 'Done with this', 'Can\'t stand'],
    examples: ['This never works the way it should', 'I\'m tired of wasting money on solutions that don\'t work'],
    icon: '😤'
  },
  {
    category: 'desired_outcomes',
    label: 'Desired Outcomes',
    description: 'What people actually want to achieve - their goals and aspirations',
    triggerPhrases: ['I just want', 'How do I get', 'I wish there was', 'Looking for a way to', 'Need help to', 'Want to achieve', 'Goal is to'],
    examples: ['I just want a simple solution', 'How do I get more clients without spending all day on marketing?'],
    icon: '🎯'
  },
  {
    category: 'failed_solutions',
    label: 'Failed Solutions',
    description: 'Things people have already tried that didn\'t work - competitors and alternatives',
    triggerPhrases: ['I tried', 'Didn\'t work', 'Was a waste of', 'Failed miserably', 'Complete disaster', 'Money down the drain', 'Should have known better'],
    examples: ['I tried X but it was too complicated', 'Spent thousands on courses that didn\'t help'],
    icon: '❌'
  },
  {
    category: 'comparisons',
    label: 'Comparisons',
    description: 'Head-to-head comparisons between products, services, or approaches',
    triggerPhrases: ['vs', 'versus', 'which is better', 'compared to', 'or', 'difference between', 'better alternative to'],
    examples: ['X vs Y - which one should I choose?', 'Is platform A better than platform B?'],
    icon: '⚖️'
  },
  {
    category: 'objections',
    label: 'Objections',
    description: 'Reasons why people hesitate or refuse to buy - price, value, trust concerns',
    triggerPhrases: ['Too expensive', 'Not worth it', 'Can\'t afford', 'Overpriced', 'Rip-off', 'Not enough value', 'Waste of money', 'Not ready to pay'],
    examples: ['Too expensive for what you get', 'Not worth the monthly fee'],
    icon: '💰'
  },
  {
    category: 'fears',
    label: 'Fears & Worries',
    description: 'Anxieties, concerns, and fears about making decisions or taking action',
    triggerPhrases: ['What if', 'I\'m afraid', 'Scared that', 'Worried about', 'Terrified of', 'Anxious about', 'Concerned that'],
    examples: ['What if I make the wrong choice?', 'I\'m afraid of wasting more time and money'],
    icon: '😨'
  },
  {
    category: 'urgent_problems',
    label: 'Urgent Problems',
    description: 'Time-sensitive issues that need immediate solutions',
    triggerPhrases: ['ASAP', 'as soon as possible', 'quick fix', 'fast way', 'need help now', 'urgent', 'emergency', 'right away', 'immediately'],
    examples: ['Need a quick fix ASAP', 'Looking for the fastest way to solve this'],
    icon: '🚨'
  },
  {
    category: 'repeated_questions',
    label: 'Repeated Questions',
    description: 'Questions that get asked over and over - indicates a gap in the market',
    triggerPhrases: ['Does anyone know', 'Has anyone tried', 'Can someone explain', 'How do you', 'What\'s the best way to', 'Is there a way to'],
    examples: ['Does anyone know how to fix this?', 'What\'s the best way to get started?'],
    icon: '❓'
  },
  {
    category: 'strong_emotions',
    label: 'Strong Emotions',
    description: 'Posts with intense emotional language - anger, regret, excitement, joy',
    triggerPhrases: ['FURIOUS', 'so angry', 'absolutely love', 'hate this so much', 'BEST thing ever', 'WORST decision', 'so happy', 'devastated'],
    examples: ['I am FURIOUS with this company', 'This is the BEST decision I ever made!'],
    icon: '💥'
  },
  {
    category: 'exact_phrases',
    label: 'Exact Phrases',
    description: 'Word-for-word patterns and phrases people repeat - copywriting gold',
    triggerPhrases: ['exact phrase patterns detected through frequency analysis'],
    examples: ['Game changer', 'Worth every penny', 'Steal at this price'],
    icon: '📝'
  },
  {
    category: 'before_after',
    label: 'Before/After Stories',
    description: 'Transformation stories and journeys from before to after',
    triggerPhrases: ['I used to', 'before I', 'now I', 'finally able to', 'transformed my', 'changed everything', 'used to struggle with'],
    examples: ['I used to spend hours on this, now it takes 5 minutes', 'Before I found this, I was lost'],
    icon: '🔄'
  },
  {
    category: 'misconceptions',
    label: 'Misconceptions',
    description: 'Things people believed that turned out to be wrong - educational opportunities',
    triggerPhrases: ['I thought', 'believed that', 'assumed', 'had no idea', 'was wrong about', 'didn\'t realize', 'misunderstood'],
    examples: ['I thought this would be easy, but it\'s not', 'Had no idea this was so important'],
    icon: '💡'
  },
  {
    category: 'buying_triggers',
    label: 'Buying Triggers',
    description: 'Specific reasons and moments that motivated people to finally purchase',
    triggerPhrases: ['Finally bought', 'decided to purchase', 'pulled the trigger', 'took the plunge', 'glad I bought', 'best purchase I\'ve made', 'why I bought'],
    examples: ['Finally bought because I was tired of struggling', 'Took the plunge after seeing the results'],
    icon: '🛒'
  },
  {
    category: 'non_buying_reasons',
    label: 'Non-Buying Reasons',
    description: 'Why people chose NOT to buy - crucial for overcoming objections',
    triggerPhrases: ['I didn\'t buy', 'decided against', 'chose not to', 'returned it', 'cancelled my', 'asked for a refund', 'why I won\'t buy'],
    examples: ['I didn\'t buy because the reviews were mixed', 'Decided against it after the demo'],
    icon: '🚫'
  }
];

/**
 * Industry preset configurations
 */
export interface IndustryPreset {
  id: string;
  name: string;
  subreddits: string[];
  topics: string[];
  keywords: string[];
  description: string;
}

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: 'marketing',
    name: 'Marketing & Agency',
    subreddits: ['marketing', 'digital_marketing', 'advertising', 'SEO', 'content_marketing'],
    topics: ['client acquisition', 'lead generation', 'marketing strategy', 'advertising'],
    keywords: ['agency', 'clients', 'leads', 'campaigns', 'ROI'],
    description: 'Marketing professionals, agencies, and consultants'
  },
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship & Startups',
    subreddits: ['entrepreneur', 'startups', 'smallbusiness', 'founders', 'solopreneur'],
    topics: ['starting business', 'funding', 'scaling', 'product launch'],
    keywords: ['startup', 'founder', 'business', 'revenue', 'growth'],
    description: 'Founders, entrepreneurs, and small business owners'
  },
  {
    id: 'fitness',
    name: 'Fitness & Health',
    subreddits: ['fitness', 'bodybuilding', 'weightloss', 'nutrition', 'personaltraining'],
    topics: ['weight loss', 'muscle building', 'diet', 'workout routine'],
    keywords: ['gym', 'workout', 'diet', 'supplements', 'coaching'],
    description: 'Fitness enthusiasts, personal trainers, and health-conscious consumers'
  },
  {
    id: 'finance',
    name: 'Finance & Investing',
    subreddits: ['personalfinance', 'investing', 'stocks', 'cryptocurrency', 'financialindependence'],
    topics: ['investing', 'savings', 'debt', 'retirement planning'],
    keywords: ['invest', 'portfolio', 'stocks', 'crypto', 'savings'],
    description: 'Investors, financial advisors, and personal finance enthusiasts'
  },
  {
    id: 'tech',
    name: 'Technology & SaaS',
    subreddits: ['programming', 'webdev', 'SaaS', 'software', 'tech'],
    topics: ['software development', 'coding', 'tools', 'productivity'],
    keywords: ['software', 'app', 'code', 'API', 'developer'],
    description: 'Developers, tech professionals, and SaaS users'
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    subreddits: ['realestate', 'realestateinvesting', 'landlord', 'homeowners', 'firsttimehomebuyer'],
    topics: ['buying home', 'investing', 'rental property', 'mortgage'],
    keywords: ['property', 'house', 'rental', 'mortgage', 'investment'],
    description: 'Real estate investors, agents, and home buyers'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    subreddits: ['ecommerce', 'shopify', 'FulfillmentByAmazon', 'dropship', 'onlinestore'],
    topics: ['online store', 'dropshipping', 'Amazon FBA', 'shopify'],
    keywords: ['store', 'products', 'shipping', 'customers', 'sales'],
    description: 'E-commerce store owners and online sellers'
  },
  {
    id: 'coaching',
    name: 'Coaching & Consulting',
    subreddits: ['consulting', 'lifehacks', 'getdisciplined', 'productivity', 'coaching'],
    topics: ['coaching business', 'clients', 'productivity', 'habits'],
    keywords: ['coach', 'consultant', 'clients', 'sessions', 'program'],
    description: 'Coaches, consultants, and personal development enthusiasts'
  },
  {
    id: 'custom',
    name: 'Custom (Your Own)',
    subreddits: [],
    topics: [],
    keywords: [],
    description: 'Enter your own subreddits and topics'
  }
];

/**
 * Scraping configuration
 */
export interface ScrapingConfig {
  subreddits: string[];
  topics: string[];
  keywords: string[];
  categories: InsightCategory[];
  dateRange: {
    start?: string;
    end?: string;
    days: number;
  };
  maxPosts: number;
}

export const DEFAULT_CONFIG: ScrapingConfig = {
  subreddits: ['entrepreneur', 'marketing', 'smallbusiness'],
  topics: ['problems', 'challenges', 'solutions'],
  keywords: [],
  categories: [],
  dateRange: {
    days: 30
  },
  maxPosts: 50
};

/**
 * Reddit post structure
 */
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

/**
 * Analyzed post with insights
 */
export interface AnalyzedPost extends RedditPost {
  // Detected categories
  categories: InsightCategory[];
  
  // Extracted insights
  painPoints: string[];
  questions: string[];
  buyingTriggers: string[];
  objections: string[];
  desiredOutcomes: string[];
  
  // Detected phrases (exact words people use)
  exactPhrases: string[];
  
  // Emotion analysis
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotionIntensity: 'low' | 'medium' | 'high';
  emotionType?: string;
  
  // Content opportunity
  contentOpportunity: 'high' | 'medium' | 'low';
  summary: string;
  
  // Target audience
  targetAudience: string[];
  
  // Buying signals
  purchaseIntent: 'high' | 'medium' | 'low' | 'none';
  budgetMentioned?: boolean;
  timelineMentioned?: string;
}

/**
 * Content opportunity derived from insights
 */
export interface ContentOpportunity {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  priority: 'high' | 'medium' | 'low';
  suggestedContentType: string[];
  keywords: string[];
  sourcePosts: string[];
  exactPhrases: string[];
}

/**
 * Scraping result
 */
export interface ScrapingResult {
  success: boolean;
  posts: RedditPost[];
  errors: string[];
  metadata: {
    totalFound: number;
    totalProcessed: number;
    scrapedAt: string;
    categoriesFound: InsightCategory[];
  };
}

/**
 * Complete insight report
 */
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
    categoriesBreakdown: Record<InsightCategory, number>;
    topPainPoints: string[];
    topQuestions: string[];
    topBuyingTriggers: string[];
    topObjections: string[];
    topDesiredOutcomes: string[];
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
      mixed: number;
    };
    purchaseIntentDistribution: {
      high: number;
      medium: number;
      low: number;
      none: number;
    };
  };
  analyzedPosts: AnalyzedPost[];
  contentOpportunities: ContentOpportunity[];
  trendingPhrases: { phrase: string; count: number; category: InsightCategory }[];
  audienceInsights: {
    persona: string;
    count: number;
    painPoints: string[];
    buyingTriggers: string[];
    objections: string[];
  }[];
}

/**
 * Job status for async operations
 */
export interface JobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  result?: InsightReport;
}

/**
 * API request types
 */
export interface InsightsSearchRequest {
  query: string;
  categories?: InsightCategory[];
  sentiments?: string[];
  audiences?: string[];
  subreddits?: string[];
  industry?: string;
  painPointsOnly?: boolean;
  buyingSignalsOnly?: boolean;
}

export interface InsightsSearchResponse {
  success: boolean;
  query: string;
  filters: {
    categories: InsightCategory[];
    sentiments: string[];
    audiences: string[];
    subreddits: string[];
  };
  totalResults: number;
  results: AnalyzedPost[];
  summary?: {
    topCategories: { category: InsightCategory; count: number }[];
    topPhrases: string[];
    sentimentBreakdown: Record<string, number>;
  };
}
