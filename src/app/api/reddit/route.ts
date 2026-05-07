// AI Audience Research Agent - API Routes
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { redditScraper } from '@/lib/reddit-scraper';
import { aiAnalyzer } from '@/lib/ai-analyzer';
import { 
  ScrapingConfig, 
  DEFAULT_CONFIG, 
  JobStatus, 
  AnalyzedPost, 
  InsightCategory,
  INSIGHT_PATTERNS,
  INDUSTRY_PRESETS
} from '@/lib/types';

const execAsync = promisify(exec);

// In-memory job storage
const jobs = new Map<string, JobStatus>();

// In-memory cache for analyzed posts
let cachedAnalyzedPosts: AnalyzedPost[] = [];

// API Secret for authentication
const API_SECRET = process.env.API_SECRET || 'audience-research-2024';

// Ensure download directory exists
async function ensureDownloadDir() {
  const downloadDir = path.join(process.cwd(), 'download');
  try {
    await fs.mkdir(downloadDir, { recursive: true });
  } catch {
    // Directory exists
  }
  return downloadDir;
}

// Validate API request
function validateRequest(request: NextRequest, body?: Record<string, unknown>): boolean {
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${API_SECRET}`) return true;
  if (body && body.secret === API_SECRET) return true;
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') === API_SECRET) return true;
  return true; // Allow for demo
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || 'search';

  if (!validateRequest(request, body)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    switch (action) {
      case 'start':
        return await startScrapingJob(body.config);
      case 'status':
        return await getJobStatus(body.jobId);
      case 'quick':
        return await quickSearch(body.query || body.topic, body.config);
      case 'search':
        return await insightsSearch(body);
      case 'search-by-category':
        return await searchByCategory(body.categories, body.subreddits);
      case 'get-patterns':
        return getPatterns();
      case 'get-industries':
        return getIndustries();
      case 'export-results':
        return await exportResults(body.results);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'patterns';

  if (!validateRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    switch (action) {
      case 'patterns':
        return getPatterns();
      case 'industries':
        return getIndustries();
      case 'download':
        return await downloadReport(searchParams.get('file') || '');
      case 'list':
        return await listReports();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get available insight patterns/categories
function getPatterns() {
  return NextResponse.json({
    success: true,
    patterns: INSIGHT_PATTERNS.map(p => ({
      category: p.category,
      label: p.label,
      description: p.description,
      icon: p.icon,
      triggerPhrases: p.triggerPhrases.slice(0, 5),
      examples: p.examples
    }))
  });
}

// Get industry presets
function getIndustries() {
  return NextResponse.json({
    success: true,
    industries: INDUSTRY_PRESETS
  });
}

async function startScrapingJob(config: Partial<ScrapingConfig> = {}) {
  const jobId = `job-${Date.now()}`;
  const mergedConfig: ScrapingConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    subreddits: config.subreddits || DEFAULT_CONFIG.subreddits,
    topics: config.topics || DEFAULT_CONFIG.topics,
    categories: config.categories || [],
  };

  const job: JobStatus = {
    id: jobId,
    status: 'pending',
    progress: 0,
    message: 'Job initialized',
    startedAt: new Date().toISOString(),
  };
  jobs.set(jobId, job);

  processJob(jobId, mergedConfig).catch(console.error);

  return NextResponse.json({
    success: true,
    jobId,
    message: 'Research job started',
    config: mergedConfig
  });
}

async function processJob(jobId: string, config: ScrapingConfig) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    job.status = 'running';
    job.message = 'Gathering audience insights...';
    job.progress = 10;
    jobs.set(jobId, job);

    const scrapingResult = await redditScraper.scrape(config);

    if (!scrapingResult.success || scrapingResult.posts.length === 0) {
      throw new Error('No posts found');
    }

    job.progress = 40;
    job.message = `Found ${scrapingResult.posts.length} posts. Analyzing insights...`;
    jobs.set(jobId, job);

    const report = await aiAnalyzer.generateReport(scrapingResult.posts, config);
    cachedAnalyzedPosts = report.analyzedPosts;

    job.progress = 80;
    job.message = 'Generating report...';
    jobs.set(jobId, job);

    await ensureDownloadDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const jsonPath = path.join(process.cwd(), 'download', `audience_insights_${timestamp}.json`);

    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

    job.status = 'completed';
    job.progress = 100;
    job.message = 'Report generated!';
    job.completedAt = new Date().toISOString();
    job.result = report;
    jobs.set(jobId, job);

  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';
    job.message = `Failed: ${job.error}`;
    jobs.set(jobId, job);
  }
}

async function getJobStatus(jobId: string) {
  const job = jobs.get(jobId);
  
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    job: {
      id: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      summary: job.result?.summary
    }
  });
}

async function quickSearch(query: string, config: Partial<ScrapingConfig> = {}) {
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  const mergedConfig: ScrapingConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    subreddits: config.subreddits || DEFAULT_CONFIG.subreddits,
  };

  const result = await redditScraper.quickSearch(query, mergedConfig);

  return NextResponse.json({
    success: true,
    query,
    postsFound: result.posts.length,
    posts: result.posts.slice(0, 10),
    categoriesFound: result.metadata.categoriesFound,
    errors: result.errors
  });
}

async function searchByCategory(
  categories: InsightCategory[],
  subreddits: string[] = []
) {
  if (!categories || categories.length === 0) {
    return NextResponse.json({ error: 'Categories required' }, { status: 400 });
  }

  const result = await redditScraper.searchByCategories(categories, subreddits, 50);

  return NextResponse.json({
    success: true,
    categories,
    totalResults: result.posts.length,
    results: result.posts,
    metadata: result.metadata
  });
}

async function insightsSearch(params: {
  query?: string;
  categories?: InsightCategory[];
  sentiments?: string[];
  audiences?: string[];
  subreddits?: string[];
  industry?: string;
  painPointsOnly?: boolean;
  buyingSignalsOnly?: boolean;
  purchaseIntent?: string[];
  emotionIntensity?: string[];
}) {
  const {
    query = '',
    categories = [],
    sentiments = [],
    audiences = [],
    subreddits = [],
    painPointsOnly = false,
    buyingSignalsOnly = false,
    purchaseIntent = [],
    emotionIntensity = []
  } = params;

  let results: AnalyzedPost[] = [];

  // Get posts from scraper
  const scrapingResult = await redditScraper.quickSearch(query || 'business', {
    ...DEFAULT_CONFIG,
    subreddits: subreddits.length > 0 ? subreddits : DEFAULT_CONFIG.subreddits,
    categories
  });

  if (scrapingResult.posts.length > 0) {
    // Check if posts are already analyzed
    const firstPost = scrapingResult.posts[0] as unknown as AnalyzedPost;
    if (firstPost.categories && firstPost.categories.length > 0) {
      results = scrapingResult.posts as unknown as AnalyzedPost[];
    } else {
      // Need to analyze
      try {
        results = await aiAnalyzer.analyzePosts(scrapingResult.posts.slice(0, 20));
      } catch (error) {
        console.error('AI analysis failed:', error);
        results = scrapingResult.posts.map(p => ({
          ...p,
          categories: [],
          painPoints: [],
          questions: [],
          buyingTriggers: [],
          objections: [],
          desiredOutcomes: [],
          exactPhrases: [],
          sentiment: 'neutral' as const,
          emotionIntensity: 'low' as const,
          contentOpportunity: 'low' as const,
          summary: '',
          targetAudience: [],
          purchaseIntent: 'none' as const
        }));
      }
    }
    cachedAnalyzedPosts = results;
  }

  // Apply filters
  if (categories.length > 0) {
    results = results.filter(post => 
      post.categories?.some(cat => categories.includes(cat))
    );
  }

  if (sentiments.length > 0) {
    results = results.filter(post => sentiments.includes(post.sentiment));
  }

  if (audiences.length > 0) {
    results = results.filter(post => 
      post.targetAudience?.some(aud => 
        audiences.some(selected => 
          aud.toLowerCase().includes(selected.toLowerCase()) ||
          selected.toLowerCase().includes(aud.toLowerCase())
        )
      )
    );
  }

  if (subreddits.length > 0) {
    results = results.filter(post => 
      subreddits.some(sub => post.subreddit.includes(sub.replace('r/', '')))
    );
  }

  if (painPointsOnly) {
    results = results.filter(post => post.painPoints && post.painPoints.length > 0);
  }

  if (buyingSignalsOnly) {
    results = results.filter(post => 
      (post.buyingTriggers && post.buyingTriggers.length > 0) ||
      post.purchaseIntent === 'high' ||
      post.purchaseIntent === 'medium'
    );
  }

  if (purchaseIntent.length > 0) {
    results = results.filter(post => purchaseIntent.includes(post.purchaseIntent));
  }

  if (emotionIntensity.length > 0) {
    results = results.filter(post => emotionIntensity.includes(post.emotionIntensity));
  }

  // Calculate summary
  const categoryCounts: Record<string, number> = {};
  results.forEach(post => {
    post.categories?.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });

  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category: category as InsightCategory, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const allPhrases = results.flatMap(p => p.exactPhrases || []);
  const topPhrases = [...new Set(allPhrases)].slice(0, 20);

  const sentimentBreakdown = {
    positive: results.filter(p => p.sentiment === 'positive').length,
    negative: results.filter(p => p.sentiment === 'negative').length,
    neutral: results.filter(p => p.sentiment === 'neutral').length,
    mixed: results.filter(p => p.sentiment === 'mixed').length
  };

  return NextResponse.json({
    success: true,
    query,
    filters: { categories, sentiments, audiences, subreddits, painPointsOnly, buyingSignalsOnly },
    totalResults: results.length,
    results: results.slice(0, 50),
    summary: {
      topCategories,
      topPhrases,
      sentimentBreakdown
    }
  });
}

async function exportResults(results: AnalyzedPost[]) {
  if (!results || results.length === 0) {
    return NextResponse.json({ error: 'No results to export' }, { status: 400 });
  }

  await ensureDownloadDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const filename = `Audience_Insights_${timestamp}.json`;
  const filePath = path.join(process.cwd(), 'download', filename);

  // Build comprehensive export
  const allPainPoints = results.flatMap(p => p.painPoints || []);
  const allBuyingTriggers = results.flatMap(p => p.buyingTriggers || []);
  const allObjections = results.flatMap(p => p.objections || []);
  const allExactPhrases = results.flatMap(p => p.exactPhrases || []);

  // Count frequency
  const countItems = (items: string[]) => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([item, count]) => ({ item, count }));
  };

  const exportData = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPosts: results.length,
      sentimentBreakdown: {
        positive: results.filter(p => p.sentiment === 'positive').length,
        negative: results.filter(p => p.sentiment === 'negative').length,
        neutral: results.filter(p => p.sentiment === 'neutral').length,
        mixed: results.filter(p => p.sentiment === 'mixed').length
      },
      purchaseIntentBreakdown: {
        high: results.filter(p => p.purchaseIntent === 'high').length,
        medium: results.filter(p => p.purchaseIntent === 'medium').length,
        low: results.filter(p => p.purchaseIntent === 'low').length,
        none: results.filter(p => p.purchaseIntent === 'none').length
      }
    },
    insights: {
      topPainPoints: countItems(allPainPoints).slice(0, 20),
      topBuyingTriggers: countItems(allBuyingTriggers).slice(0, 20),
      topObjections: countItems(allObjections).slice(0, 20),
      exactPhrases: countItems(allExactPhrases).slice(0, 50)
    },
    posts: results
  };

  await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));

  return NextResponse.json({ 
    success: true, 
    filename,
    downloadUrl: `/api/reddit?action=download&file=${filename}`
  });
}

async function downloadReport(filename: string) {
  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 });
  }

  const downloadDir = await ensureDownloadDir();
  const filePath = path.join(downloadDir, filename);

  try {
    const fileBuffer = await fs.readFile(filePath);
    const isJson = filename.endsWith('.json');
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': isJson ? 'application/json' : 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

async function listReports() {
  const downloadDir = await ensureDownloadDir();
  
  try {
    const files = await fs.readdir(downloadDir);
    const reports = files
      .filter(f => f.endsWith('.json') || f.endsWith('.xlsx'))
      .map(f => ({
        filename: f,
        type: f.endsWith('.xlsx') ? 'excel' : 'json',
      }))
      .sort((a, b) => b.filename.localeCompare(a.filename));

    return NextResponse.json({ success: true, reports });
  } catch {
    return NextResponse.json({ reports: [] });
  }
}
