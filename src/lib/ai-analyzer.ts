// Reddit Insights Engine - AI Analysis Service
import ZAI from 'z-ai-web-dev-sdk';
import { RedditPost, AnalyzedPost, ContentOpportunity, InsightReport, ScrapingConfig, DEFAULT_CONFIG } from './types';

interface LLMAnalysisResult {
  painPoints: string[];
  questions: string[];
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  contentOpportunity: 'high' | 'medium' | 'low';
  summary: string;
  targetAudience: string[];
}

export class AIAnalyzer {
  private zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;

  async initialize(): Promise<void> {
    this.zai = await ZAI.create();
  }

  /**
   * Analyze a single Reddit post for insights
   */
  async analyzePost(post: RedditPost): Promise<LLMAnalysisResult> {
    if (!this.zai) {
      await this.initialize();
    }

    const systemPrompt = `You are an expert content strategist and marketing analyst. Your task is to analyze Reddit posts to extract actionable insights for content creation targeting professionals, service-based founders, and entrepreneurs.

Analyze the post and return a JSON object with the following structure:
{
  "painPoints": ["array of specific pain points, challenges, or struggles mentioned"],
  "questions": ["array of questions being asked or implied"],
  "topics": ["array of relevant topics/categories"],
  "sentiment": "one of: positive, negative, neutral, mixed",
  "contentOpportunity": "one of: high, medium, low (based on engagement potential)",
  "summary": "one-sentence summary of the key insight",
  "targetAudience": ["array of audience segments this resonates with"]
}

Focus on:
- Identifying specific problems that content could address
- Finding questions that indicate knowledge gaps
- Understanding emotional undertones
- Assessing content creation potential`;

    const content = `
Title: ${post.title}
Subreddit: ${post.subreddit}
Content: ${post.selftext.substring(0, 2000)}
URL: ${post.url}
    `.trim();

    try {
      const completion = await this.zai!.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this Reddit post and return ONLY a valid JSON object:\n\n${content}` }
        ],
        temperature: 0.3
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      
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
    
    console.log(`\nAnalyzing ${posts.length} posts...`);

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
          targetAudience: analysis.targetAudience || []
        };

        analyzed.push(analyzedPost);

        // Rate limiting
        await this.delay(300);
      } catch (error) {
        console.error(`Failed to analyze post ${post.id}:`, error);
        // Add with default values
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
    if (!this.zai) {
      await this.initialize();
    }

    // Aggregate pain points and questions
    const allPainPoints = analyzedPosts.flatMap(p => p.painPoints);
    const allQuestions = analyzedPosts.flatMap(p => p.questions);

    const prompt = `Based on the following data from Reddit posts about marketing, entrepreneurship, and content strategy, generate 10 high-value content opportunities.

Pain Points Found:
${allPainPoints.slice(0, 30).map((p, i) => `${i + 1}. ${p}`).join('\n')}

Questions Asked:
${allQuestions.slice(0, 20).map((q, i) => `${i + 1}. ${q}`).join('\n')}

Return a JSON array of content opportunities with this structure:
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
      const completion = await this.zai!.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: 'You are a content strategy expert. Return only valid JSON arrays.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      const responseText = completion.choices[0]?.message?.content || '[]';
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const opportunities = JSON.parse(jsonMatch[0]) as Omit<ContentOpportunity, 'id' | 'sourcePosts'>[];
        
        return opportunities.map((opp, index) => ({
          id: `opp-${Date.now()}-${index}`,
          title: opp.title,
          description: opp.description,
          sourcePosts: analyzedPosts
            .filter(p => 
              p.painPoints.some(pp => opp.title.toLowerCase().includes(pp.toLowerCase().substring(0, 20))) ||
              p.questions.some(q => opp.title.toLowerCase().includes(q.toLowerCase().substring(0, 20)))
            )
            .map(p => p.id)
            .slice(0, 5),
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
    console.log('\n=== Generating Insight Report ===\n');

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
      targetAudience: []
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
