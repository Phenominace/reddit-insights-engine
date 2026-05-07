// Reddit Insights Engine - AI Analysis Service (Groq Compatible)
import { RedditPost, AnalyzedPost, ContentOpportunity, InsightReport, ScrapingConfig, DEFAULT_CONFIG, AudienceInsight } from './types';

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Fast and capable model

interface LLMAnalysisResult {
  painPoints: string[];
  questions: string[];
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  contentOpportunity: 'high' | 'medium' | 'low';
  summary: string;
  targetAudience: string[];
  audienceInsight?: AudienceInsight;
  industry?: string;
}

async function callGroqAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set. Please add it in your Vercel dashboard.');
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

export class AIAnalyzer {
  /**
   * Analyze a single Reddit post for insights
   */
  async analyzePost(post: RedditPost): Promise<LLMAnalysisResult> {
    const systemPrompt = `You are an expert AI audience research agent. Your task is to analyze Reddit posts to extract deep audience insights across ANY industry.

Your role is to identify where people complain, where they pay, and where data confirms patterns. Extract the following insight categories from each post:

**Insight Categories to Extract:**
1. **Complaints**: Direct complaints ("I hate…", "Why is it so hard to…")
2. **Frustrations**: Ongoing struggles ("This never works…", "I'm tired of…")
3. **Desired Outcomes**: What they want ("I just want…", "How do I get…")
4. **Failed Solutions**: What didn't work ("I tried X but…")
5. **Comparisons**: Product/service comparisons ("X vs Y", "Which is better…")
6. **Objections**: Reasons against buying ("Too expensive", "Not worth it")
7. **Fears**: Concerns and worries ("What if…", "I don't want to…")
8. **Urgent Problems**: Time-sensitive needs ("ASAP", "quick fix", "fast way")
9. **Repeated Questions**: Common questions asked by many users
10. **Strong Emotions**: Expressions of anger, regret, excitement
11. **Exact Phrases**: Word-for-word patterns people repeat
12. **Before/After Stories**: Transformation stories ("I used to… now…")
13. **Misconceptions**: Wrong beliefs ("I thought… but…")
14. **Buy Triggers**: What made them purchase ("Finally bought because…")
15. **Not Buying Reasons**: Why they didn't purchase ("I didn't buy because…")

Analyze the post and return ONLY a valid JSON object with the following structure (no markdown, no code blocks, just pure JSON):
{
  "painPoints": ["array of specific pain points, challenges, or struggles mentioned"],
  "questions": ["array of questions being asked or implied"],
  "topics": ["array of relevant topics/categories"],
  "sentiment": "one of: positive, negative, neutral, mixed",
  "contentOpportunity": "one of: high, medium, low (based on engagement potential)",
  "summary": "one-sentence summary of the key insight",
  "targetAudience": ["array of audience segments this resonates with"],
  "industry": "the industry/category this post belongs to (e.g., 'SaaS', 'E-commerce', 'Health & Fitness', 'Finance', 'Marketing', 'Real Estate', etc.)",
  "audienceInsight": {
    "complaints": ["direct complaints with exact phrases"],
    "frustrations": ["ongoing struggles with exact phrases"],
    "desiredOutcomes": ["what they want to achieve"],
    "failedSolutions": ["solutions they tried that failed"],
    "comparisons": ["any product/service comparisons"],
    "objections": ["reasons against purchasing"],
    "fears": ["concerns and worries"],
    "urgentProblems": ["time-sensitive needs"],
    "repeatedQuestions": ["common questions"],
    "strongEmotions": ["emotional expressions found"],
    "exactPhrases": ["word-for-word quotes that stand out"],
    "beforeAfterStories": ["transformation stories"],
    "misconceptions": ["wrong beliefs identified"],
    "buyTriggers": ["what triggered purchase decisions"],
    "notBuyingReasons": ["reasons for not buying"]
  }
}

Focus on:
- Extracting EXACT phrases and quotes from the text
- Identifying the industry context
- Finding patterns that indicate buying intent or barriers
- Capturing emotional language verbatim
- Categorizing insights according to the 15 categories above`;

    const content = `
Title: ${post.title}
Subreddit: ${post.subreddit}
Content: ${post.selftext.substring(0, 2000)}
URL: ${post.url}
    `.trim();

    try {
      const responseText = await callGroqAPI(systemPrompt, `Analyze this Reddit post and return ONLY valid JSON:\n\n${content}`);
      
      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as LLMAnalysisResult;
      }

      return this.getDefaultAnalysis();
    } catch (error) {
      console.error('Analysis failed for post:', post.id, error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Analyze multiple posts in batches
   */
  async analyzePosts(posts: RedditPost[]): Promise<AnalyzedPost[]> {
    const analyzed: AnalyzedPost[] = [];
    
    console.log(`\nAnalyzing ${posts.length} posts with Groq AI...`);

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`Analyzing post ${i + 1}/${posts.length}: "${post.title.substring(0, 40)}..."`);

      try {
        const analysis = await this.analyzePost(post);

        const analyzedPost: AnalyzedPost = {
          ...post,
          painPoints: analysis.painPoints || [],
          questions: analysis.questions || [],
          topics: analysis.topics || [],
          sentiment: analysis.sentiment || 'neutral',
          contentOpportunity: analysis.contentOpportunity || 'low',
          summary: analysis.summary || '',
          targetAudience: analysis.targetAudience || [],
          audienceInsight: analysis.audienceInsight,
          industry: analysis.industry
        };

        analyzed.push(analyzedPost);

        // Rate limiting for Groq API
        await this.delay(500);
      } catch (error) {
        console.error(`Failed to analyze post ${post.id}:`, error);
        analyzed.push({
          ...post,
          ...this.getDefaultAnalysis()
        });
      }
    }

    return analyzed;
  }

  /**
   * Generate content opportunities from analyzed posts
   */
  async generateContentOpportunities(analyzedPosts: AnalyzedPost[]): Promise<ContentOpportunity[]> {
    const allPainPoints = analyzedPosts.flatMap(p => p.painPoints);
    const allQuestions = analyzedPosts.flatMap(p => p.questions);

    const prompt = `Based on the following data from Reddit posts about marketing, entrepreneurship, and content strategy, generate 10 high-value content opportunities.

Pain Points Found:
${allPainPoints.slice(0, 30).map((p, i) => `${i + 1}. ${p}`).join('\n')}

Questions Asked:
${allQuestions.slice(0, 20).map((q, i) => `${i + 1}. ${q}`).join('\n')}

Return ONLY a valid JSON array (no markdown, no code blocks) with this structure:
[
  {
    "title": "Compelling content title",
    "description": "Brief description of what this content would cover",
    "category": "one of: pain_point, question, trend, gap",
    "priority": "one of: high, medium, low",
    "suggestedContentType": ["blog post", "video", "carousel", "email", "lead magnet"],
    "keywords": ["relevant", "keywords"]
  }
]

Focus on content that would attract professionals, service-based founders, and entrepreneurs.`;

    try {
      const responseText = await callGroqAPI(
        'You are a content strategy expert. Return only valid JSON arrays with no markdown formatting.',
        prompt
      );
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const opportunities = JSON.parse(jsonMatch[0]) as Omit<ContentOpportunity, 'id' | 'sourcePosts'>[];
        
        return opportunities.map((opp, index) => ({
          id: `opp-${Date.now()}-${index}`,
          title: opp.title,
          description: opp.description,
          sourcePosts: [],
          category: opp.category,
          priority: opp.priority,
          suggestedContentType: opp.suggestedContentType,
          keywords: opp.keywords
        }));
      }
    } catch (error) {
      console.error('Failed to generate content opportunities:', error);
    }

    return this.getDefaultOpportunities();
  }

  /**
   * Generate comprehensive insight report
   */
  async generateReport(
    posts: RedditPost[],
    config: ScrapingConfig = DEFAULT_CONFIG
  ): Promise<InsightReport> {
    console.log('\n=== Generating Insight Report with Groq AI ===\n');

    // Analyze all posts
    const analyzedPosts = await this.analyzePosts(posts);

    // Generate content opportunities
    const contentOpportunities = await this.generateContentOpportunities(analyzedPosts);

    // Calculate summary statistics
    const allPainPoints = analyzedPosts.flatMap(p => p.painPoints);
    const allQuestions = analyzedPosts.flatMap(p => p.questions);

    const subredditCounts: Record<string, number> = {};
    analyzedPosts.forEach(p => {
      subredditCounts[p.subreddit] = (subredditCounts[p.subreddit] || 0) + 1;
    });

    const topSubreddits = Object.entries(subredditCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const sentimentCounts = {
      positive: analyzedPosts.filter(p => p.sentiment === 'positive').length,
      negative: analyzedPosts.filter(p => p.sentiment === 'negative').length,
      neutral: analyzedPosts.filter(p => p.sentiment === 'neutral').length,
      mixed: analyzedPosts.filter(p => p.sentiment === 'mixed').length
    };

    // Extract trending topics
    const topicCounts: Record<string, { count: number; sentiment: string }> = {};
    analyzedPosts.forEach(p => {
      p.topics.forEach(topic => {
        if (!topicCounts[topic]) {
          topicCounts[topic] = { count: 0, sentiment: p.sentiment };
        }
        topicCounts[topic].count++;
      });
    });

    const trendingTopics = Object.entries(topicCounts)
      .map(([topic, data]) => ({ topic, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Generate audience insights
    const audienceMap: Record<string, { count: number; painPoints: Set<string> }> = {};
    analyzedPosts.forEach(p => {
      p.targetAudience.forEach(audience => {
        if (!audienceMap[audience]) {
          audienceMap[audience] = { count: 0, painPoints: new Set() };
        }
        audienceMap[audience].count++;
        p.painPoints.forEach(pp => audienceMap[audience].painPoints.add(pp));
      });
    });

    const audienceInsights = Object.entries(audienceMap)
      .map(([persona, data]) => ({
        persona,
        count: data.count,
        painPoints: Array.from(data.painPoints).slice(0, 5)
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
        totalPainPoints: allPainPoints.length,
        totalQuestions: allQuestions.length,
        topSubreddits,
        sentimentDistribution: sentimentCounts
      },
      analyzedPosts,
      contentOpportunities,
      trendingTopics,
      audienceInsights
    };

    console.log('\n=== Report Generated ===');
    console.log(`Posts analyzed: ${analyzedPosts.length}`);
    console.log(`Pain points found: ${allPainPoints.length}`);
    console.log(`Questions found: ${allQuestions.length}`);
    console.log(`Content opportunities: ${contentOpportunities.length}`);

    return report;
  }

  private getDefaultAnalysis(): LLMAnalysisResult {
    return {
      painPoints: [],
      questions: [],
      topics: [],
      sentiment: 'neutral',
      contentOpportunity: 'low',
      summary: 'Unable to analyze post content.',
      targetAudience: [],
      audienceInsight: {
        complaints: [],
        frustrations: [],
        desiredOutcomes: [],
        failedSolutions: [],
        comparisons: [],
        objections: [],
        fears: [],
        urgentProblems: [],
        repeatedQuestions: [],
        strongEmotions: [],
        exactPhrases: [],
        beforeAfterStories: [],
        misconceptions: [],
        buyTriggers: [],
        notBuyingReasons: []
      },
      industry: 'Unknown'
    };
  }

  private getDefaultOpportunities(): ContentOpportunity[] {
    return [
      {
        id: `opp-default-1`,
        title: 'Client Acquisition Strategies for Service Businesses',
        description: 'Comprehensive guide on acquiring clients for service-based businesses',
        sourcePosts: [],
        category: 'pain_point',
        priority: 'high',
        suggestedContentType: ['blog post', 'lead magnet'],
        keywords: ['client acquisition', 'service business', 'lead generation']
      }
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const aiAnalyzer = new AIAnalyzer();
