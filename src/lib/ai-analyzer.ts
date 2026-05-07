// AI Audience Research Agent - AI Analysis Service
import { 
  RedditPost, 
  AnalyzedPost, 
  ContentOpportunity, 
  InsightReport, 
  ScrapingConfig, 
  DEFAULT_CONFIG,
  InsightCategory,
  INSIGHT_PATTERNS
} from './types';

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

interface LLMAnalysisResult {
  categories: InsightCategory[];
  painPoints: string[];
  questions: string[];
  buyingTriggers: string[];
  objections: string[];
  desiredOutcomes: string[];
  exactPhrases: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotionIntensity: 'low' | 'medium' | 'high';
  emotionType?: string;
  contentOpportunity: 'high' | 'medium' | 'low';
  summary: string;
  targetAudience: string[];
  purchaseIntent: 'high' | 'medium' | 'low' | 'none';
}

async function callGroqAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set.');
  }
  
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Detect insight categories from text
 */
function detectCategoriesFromText(text: string): InsightCategory[] {
  const textLower = text.toLowerCase();
  const categories: InsightCategory[] = [];

  for (const pattern of INSIGHT_PATTERNS) {
    for (const phrase of pattern.triggerPhrases) {
      if (textLower.includes(phrase.toLowerCase())) {
        if (!categories.includes(pattern.category)) {
          categories.push(pattern.category);
        }
        break;
      }
    }
  }

  return categories.length > 0 ? categories : ['repeated_questions'];
}

/**
 * Detect emotion intensity
 */
function detectEmotionIntensity(text: string): 'low' | 'medium' | 'high' {
  const upperCount = (text.match(/[A-Z]{2,}/g) || []).length;
  const exclamationCount = (text.match(/!/g) || []).length;
  const intensityScore = upperCount * 2 + exclamationCount * 1.5;
  
  if (intensityScore >= 5) return 'high';
  if (intensityScore >= 2) return 'medium';
  return 'low';
}

/**
 * Detect purchase intent
 */
function detectPurchaseIntent(text: string): 'high' | 'medium' | 'low' | 'none' {
  const textLower = text.toLowerCase();
  
  const highIntentPhrases = ['finally bought', 'just purchased', 'ordered', 'about to buy', 'definitely getting', 'sign me up'];
  const mediumIntentPhrases = ['considering', 'thinking about', 'might get', 'looking into'];
  
  if (highIntentPhrases.some(p => textLower.includes(p))) return 'high';
  if (mediumIntentPhrases.some(p => textLower.includes(p))) return 'medium';
  return 'none';
}

export class AIAnalyzer {
  /**
   * Analyze a single Reddit post for audience insights
   */
  async analyzePost(post: RedditPost): Promise<LLMAnalysisResult> {
    const systemPrompt = `You are an expert audience research analyst. Analyze Reddit posts to extract insights for content creation and marketing.

Analyze the post and return ONLY a valid JSON object (no markdown, no code blocks):
{
  "categories": ["array of insight categories from: complaints, frustrations, desired_outcomes, failed_solutions, comparisons, objections, fears, urgent_problems, repeated_questions, strong_emotions, exact_phrases, before_after, misconceptions, buying_triggers, non_buying_reasons"],
  "painPoints": ["specific problems or struggles mentioned"],
  "questions": ["questions being asked"],
  "buyingTriggers": ["reasons people decided to buy"],
  "objections": ["reasons against buying"],
  "desiredOutcomes": ["goals people want to achieve"],
  "exactPhrases": ["word-for-word phrases people use - these are copywriting gold"],
  "sentiment": "positive/negative/neutral/mixed",
  "emotionIntensity": "low/medium/high",
  "emotionType": "type of emotion if strong",
  "contentOpportunity": "high/medium/low",
  "summary": "one-sentence key insight",
  "targetAudience": ["who this resonates with"],
  "purchaseIntent": "high/medium/low/none"
}

Focus on:
- Exact phrases in the person's own words
- Buying triggers and objections
- Emotional undertones
- Content creation opportunities`;

    const content = `
Title: ${post.title}
Subreddit: ${post.subreddit}
Content: ${post.selftext.substring(0, 1500)}
    `.trim();

    try {
      const responseText = await callGroqAPI(systemPrompt, `Analyze this Reddit post and return ONLY valid JSON:\n\n${content}`);
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as LLMAnalysisResult;
      }

      return this.getDefaultAnalysis(post);
    } catch (error) {
      console.error('Analysis failed for post:', post.id, error);
      return this.getDefaultAnalysis(post);
    }
  }

  /**
   * Get default analysis when AI fails
   */
  private getDefaultAnalysis(post: RedditPost): LLMAnalysisResult {
    const categories = detectCategoriesFromText(`${post.title} ${post.selftext}`);
    const emotionIntensity = detectEmotionIntensity(`${post.title} ${post.selftext}`);
    const purchaseIntent = detectPurchaseIntent(`${post.title} ${post.selftext}`);
    
    return {
      categories,
      painPoints: [],
      questions: [],
      buyingTriggers: [],
      objections: [],
      desiredOutcomes: [],
      exactPhrases: [],
      sentiment: 'neutral',
      emotionIntensity,
      contentOpportunity: 'low',
      summary: 'Analysis unavailable.',
      targetAudience: [],
      purchaseIntent
    };
  }

  /**
   * Analyze multiple posts
   */
  async analyzePosts(posts: RedditPost[]): Promise<AnalyzedPost[]> {
    const analyzed: AnalyzedPost[] = [];
    
    console.log(`\nAnalyzing ${posts.length} posts...`);

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`Analyzing post ${i + 1}/${posts.length}: "${post.title.substring(0, 40)}..."`);

      try {
        // Check if already analyzed (from sample data)
        const alreadyAnalyzed = post as unknown as AnalyzedPost;
        if (alreadyAnalyzed.categories && alreadyAnalyzed.categories.length > 0) {
          analyzed.push(alreadyAnalyzed);
          continue;
        }

        const analysis = await this.analyzePost(post);

        const analyzedPost: AnalyzedPost = {
          ...post,
          categories: analysis.categories || [],
          painPoints: analysis.painPoints || [],
          questions: analysis.questions || [],
          buyingTriggers: analysis.buyingTriggers || [],
          objections: analysis.objections || [],
          desiredOutcomes: analysis.desiredOutcomes || [],
          exactPhrases: analysis.exactPhrases || [],
          sentiment: analysis.sentiment || 'neutral',
          emotionIntensity: analysis.emotionIntensity || 'low',
          emotionType: analysis.emotionType,
          contentOpportunity: analysis.contentOpportunity || 'low',
          summary: analysis.summary || '',
          targetAudience: analysis.targetAudience || [],
          purchaseIntent: analysis.purchaseIntent || 'none'
        };

        analyzed.push(analyzedPost);
        await this.delay(500);
      } catch (error) {
        console.error(`Failed to analyze post ${post.id}:`, error);
        analyzed.push({
          ...post,
          ...this.getDefaultAnalysis(post)
        } as AnalyzedPost);
      }
    }

    return analyzed;
  }

  /**
   * Generate content opportunities from insights
   */
  async generateContentOpportunities(analyzedPosts: AnalyzedPost[]): Promise<ContentOpportunity[]> {
    const allPainPoints = analyzedPosts.flatMap(p => p.painPoints);
    const allBuyingTriggers = analyzedPosts.flatMap(p => p.buyingTriggers);
    const allObjections = analyzedPosts.flatMap(p => p.objections);
    const allExactPhrases = analyzedPosts.flatMap(p => p.exactPhrases);

    // Group by category
    const categoryGroups: Record<InsightCategory, AnalyzedPost[]> = {} as Record<InsightCategory, AnalyzedPost[]>;
    analyzedPosts.forEach(post => {
      post.categories?.forEach(cat => {
        if (!categoryGroups[cat]) categoryGroups[cat] = [];
        categoryGroups[cat].push(post);
      });
    });

    const opportunities: ContentOpportunity[] = [];

    // Generate opportunities based on category insights
    const topCategories = Object.entries(categoryGroups)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);

    for (const [category, posts] of topCategories) {
      const pattern = INSIGHT_PATTERNS.find(p => p.category === category);
      const phrases = posts.flatMap(p => p.exactPhrases || []).slice(0, 5);
      
      opportunities.push({
        id: `opp-${category}-${Date.now()}`,
        title: `Address "${pattern?.label || category}" concerns`,
        description: `Create content addressing the ${posts.length} posts about ${pattern?.description || category}`,
        category: category as InsightCategory,
        priority: posts.length > 5 ? 'high' : posts.length > 2 ? 'medium' : 'low',
        suggestedContentType: this.suggestContentTypes(category as InsightCategory),
        keywords: phrases,
        sourcePosts: posts.map(p => p.id),
        exactPhrases: phrases
      });
    }

    // Add high-value opportunities from buying triggers
    if (allBuyingTriggers.length > 0) {
      opportunities.push({
        id: `opp-triggers-${Date.now()}`,
        title: 'Leverage Buying Triggers in Marketing',
        description: `Use these proven triggers in your messaging: ${allBuyingTriggers.slice(0, 5).join(', ')}`,
        category: 'buying_triggers',
        priority: 'high',
        suggestedContentType: ['sales page', 'email sequence', 'ad copy'],
        keywords: allBuyingTriggers.slice(0, 10),
        sourcePosts: analyzedPosts.filter(p => p.buyingTriggers?.length).map(p => p.id),
        exactPhrases: allBuyingTriggers.slice(0, 5)
      });
    }

    // Add objection handlers
    if (allObjections.length > 0) {
      opportunities.push({
        id: `opp-objections-${Date.now()}`,
        title: 'Create Objection Handlers',
        description: `Address these common objections: ${allObjections.slice(0, 5).join(', ')}`,
        category: 'objections',
        priority: 'high',
        suggestedContentType: ['FAQ page', 'sales script', 'landing page'],
        keywords: allObjections.slice(0, 10),
        sourcePosts: analyzedPosts.filter(p => p.objections?.length).map(p => p.id),
        exactPhrases: allObjections.slice(0, 5)
      });
    }

    return opportunities;
  }

  /**
   * Suggest content types based on insight category
   */
  private suggestContentTypes(category: InsightCategory): string[] {
    const typeMap: Partial<Record<InsightCategory, string[]>> = {
      complaints: ['blog post', 'video', 'social media'],
      frustrations: ['case study', 'webinar', 'guide'],
      desired_outcomes: ['landing page', 'sales page', 'ad copy'],
      failed_solutions: ['comparison guide', 'review', 'case study'],
      comparisons: ['comparison chart', 'blog post', 'video'],
      objections: ['FAQ', 'sales script', 'landing page'],
      fears: ['webinar', 'guide', 'email sequence'],
      urgent_problems: ['quick guide', 'checklist', 'video tutorial'],
      repeated_questions: ['FAQ page', 'blog post', 'video'],
      buying_triggers: ['sales page', 'ad copy', 'email sequence'],
      non_buying_reasons: ['FAQ', 'objection handler', 'landing page']
    };
    
    return typeMap[category] || ['blog post', 'video', 'social media'];
  }

  /**
   * Generate comprehensive insight report
   */
  async generateReport(
    posts: RedditPost[],
    config: ScrapingConfig = DEFAULT_CONFIG
  ): Promise<InsightReport> {
    console.log('\n=== Generating Audience Insight Report ===\n');

    const analyzedPosts = await this.analyzePosts(posts);
    const contentOpportunities = await this.generateContentOpportunities(analyzedPosts);

    // Calculate category breakdown
    const categoriesBreakdown: Record<InsightCategory, number> = {} as Record<InsightCategory, number>;
    analyzedPosts.forEach(post => {
      post.categories?.forEach(cat => {
        categoriesBreakdown[cat] = (categoriesBreakdown[cat] || 0) + 1;
      });
    });

    // Aggregate insights
    const allPainPoints = analyzedPosts.flatMap(p => p.painPoints);
    const allQuestions = analyzedPosts.flatMap(p => p.questions);
    const allBuyingTriggers = analyzedPosts.flatMap(p => p.buyingTriggers);
    const allObjections = analyzedPosts.flatMap(p => p.objections);
    const allDesiredOutcomes = analyzedPosts.flatMap(p => p.desiredOutcomes);
    const allExactPhrases = analyzedPosts.flatMap(p => p.exactPhrases);

    // Count phrase frequency
    const phraseCounts: Record<string, number> = {};
    allExactPhrases.forEach(phrase => {
      phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
    });

    const trendingPhrases = Object.entries(phraseCounts)
      .map(([phrase, count]) => {
        const matchingPost = analyzedPosts.find(p => p.exactPhrases?.includes(phrase));
        return {
          phrase,
          count,
          category: matchingPost?.categories?.[0] || 'exact_phrases' as InsightCategory
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Sentiment distribution
    const sentimentDistribution = {
      positive: analyzedPosts.filter(p => p.sentiment === 'positive').length,
      negative: analyzedPosts.filter(p => p.sentiment === 'negative').length,
      neutral: analyzedPosts.filter(p => p.sentiment === 'neutral').length,
      mixed: analyzedPosts.filter(p => p.sentiment === 'mixed').length
    };

    // Purchase intent distribution
    const purchaseIntentDistribution = {
      high: analyzedPosts.filter(p => p.purchaseIntent === 'high').length,
      medium: analyzedPosts.filter(p => p.purchaseIntent === 'medium').length,
      low: analyzedPosts.filter(p => p.purchaseIntent === 'low').length,
      none: analyzedPosts.filter(p => p.purchaseIntent === 'none').length
    };

    // Audience insights
    const audienceMap: Record<string, { count: number; painPoints: Set<string>; buyingTriggers: Set<string>; objections: Set<string> }> = {};
    analyzedPosts.forEach(post => {
      post.targetAudience?.forEach(audience => {
        if (!audienceMap[audience]) {
          audienceMap[audience] = { count: 0, painPoints: new Set(), buyingTriggers: new Set(), objections: new Set() };
        }
        audienceMap[audience].count++;
        post.painPoints?.forEach(pp => audienceMap[audience].painPoints.add(pp));
        post.buyingTriggers?.forEach(bt => audienceMap[audience].buyingTriggers.add(bt));
        post.objections?.forEach(ob => audienceMap[audience].objections.add(ob));
      });
    });

    const audienceInsights = Object.entries(audienceMap)
      .map(([persona, data]) => ({
        persona,
        count: data.count,
        painPoints: Array.from(data.painPoints).slice(0, 5),
        buyingTriggers: Array.from(data.buyingTriggers).slice(0, 5),
        objections: Array.from(data.objections).slice(0, 5)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const report: InsightReport = {
      id: `report-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      dateRange: {
        start: new Date(Date.now() - config.dateRange.days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      configuration: config,
      summary: {
        totalPostsAnalyzed: analyzedPosts.length,
        categoriesBreakdown,
        topPainPoints: this.getTopItems(allPainPoints, 10),
        topQuestions: this.getTopItems(allQuestions, 10),
        topBuyingTriggers: this.getTopItems(allBuyingTriggers, 10),
        topObjections: this.getTopItems(allObjections, 10),
        topDesiredOutcomes: this.getTopItems(allDesiredOutcomes, 10),
        sentimentDistribution,
        purchaseIntentDistribution
      },
      analyzedPosts,
      contentOpportunities,
      trendingPhrases,
      audienceInsights
    };

    console.log('\n=== Report Generated ===');
    console.log(`Posts analyzed: ${analyzedPosts.length}`);
    console.log(`Categories found: ${Object.keys(categoriesBreakdown).length}`);
    console.log(`Content opportunities: ${contentOpportunities.length}`);

    return report;
  }

  private getTopItems(items: string[], limit: number): string[] {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const aiAnalyzer = new AIAnalyzer();
