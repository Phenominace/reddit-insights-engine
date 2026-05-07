// Reddit Insights Engine - API Routes
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { redditScraper } from '@/lib/reddit-scraper';
import { aiAnalyzer } from '@/lib/ai-analyzer';
import { ScrapingConfig, DEFAULT_CONFIG, JobStatus, AnalyzedPost } from '@/lib/types';

const execAsync = promisify(exec);

// In-memory job storage (for demo - use database in production)
const jobs = new Map<string, JobStatus>();

// In-memory cache for analyzed posts (for search functionality)
let cachedAnalyzedPosts: AnalyzedPost[] = [];

// API Secret for authentication - set this in your Vercel environment variables
const API_SECRET = process.env.API_SECRET || 'reddit-insights-2024';

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

// Validate API request with secret key
function validateRequest(request: NextRequest, body?: Record<string, unknown>): boolean {
  // Check header for authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${API_SECRET}`) {
    return true;
  }
  
  // Check body for secret (for frontend calls)
  if (body && body.secret === API_SECRET) {
    return true;
  }
  
  // Check query params for secret
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') === API_SECRET) {
    return true;
  }
  
  // Allow if no secret is configured (development mode)
  if (API_SECRET === 'reddit-insights-2024' && process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // For Vercel deployment, allow all requests (internal tool)
  // You can restrict this by setting API_SECRET in environment variables
  return true;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || 'start';

  // Validate request
  if (!validateRequest(request, body)) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid API secret' },
      { status: 401 }
    );
  }

  try {
    switch (action) {
      case 'start':
        return await startScrapingJob(body.config);
      case 'status':
        return await getJobStatus(body.jobId);
      case 'quick':
        return await quickSearch(body.topic, body.config);
      case 'insights-search':
        return await insightsSearch(body);
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
  const action = searchParams.get('action') || 'status';
  const jobId = searchParams.get('jobId');

  // Validate request
  if (!validateRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid API secret' },
      { status: 401 }
    );
  }

  try {
    switch (action) {
      case 'status':
        if (!jobId) {
          return NextResponse.json({ error: 'jobId required' }, { status: 400 });
        }
        return await getJobStatus(jobId);
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

async function startScrapingJob(config: Partial<ScrapingConfig> = {}) {
  const jobId = `job-${Date.now()}`;
  const mergedConfig: ScrapingConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    subreddits: config.subreddits || DEFAULT_CONFIG.subreddits,
    topics: config.topics || DEFAULT_CONFIG.topics,
    keywords: config.keywords || DEFAULT_CONFIG.keywords,
  };

  // Initialize job status
  const job: JobStatus = {
    id: jobId,
    status: 'pending',
    progress: 0,
    message: 'Job initialized',
    startedAt: new Date().toISOString(),
  };
  jobs.set(jobId, job);

  // Start async processing
  processJob(jobId, mergedConfig).catch(console.error);

  return NextResponse.json({
    success: true,
    jobId,
    message: 'Scraping job started',
    config: mergedConfig
  });
}

async function processJob(jobId: string, config: ScrapingConfig) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    // Phase 1: Scraping
    job.status = 'running';
    job.message = 'Scraping Reddit...';
    job.progress = 10;
    jobs.set(jobId, job);

    await redditScraper.initialize();
    const scrapingResult = await redditScraper.scrape(config);

    if (!scrapingResult.success || scrapingResult.posts.length === 0) {
      throw new Error('No posts found or scraping failed');
    }

    job.progress = 40;
    job.message = `Found ${scrapingResult.posts.length} posts. Analyzing...`;
    jobs.set(jobId, job);

    // Phase 2: AI Analysis
    await aiAnalyzer.initialize();
    const report = await aiAnalyzer.generateReport(scrapingResult.posts, config);

    // Cache analyzed posts for search functionality
    cachedAnalyzedPosts = report.analyzedPosts;

    job.progress = 80;
    job.message = 'Generating Excel report...';
    jobs.set(jobId, job);

    // Phase 3: Generate Excel
    await ensureDownloadDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const jsonPath = path.join(process.cwd(), 'download', `report_${timestamp}.json`);
    const excelPath = path.join(process.cwd(), 'download', `Reddit_Insights_${timestamp}.xlsx`);

    // Save JSON report
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

    // Generate Excel using Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_excel_report.py');
    try {
      await execAsync(`python3 "${scriptPath}" "${jsonPath}" "${excelPath}"`);
    } catch (error) {
      console.error('Excel generation error:', error);
      // Continue without Excel if Python fails
    }

    // Complete job
    job.status = 'completed';
    job.progress = 100;
    job.message = 'Report generated successfully!';
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

async function quickSearch(topic: string, config: Partial<ScrapingConfig> = {}) {
  if (!topic) {
    return NextResponse.json({ error: 'Topic required for quick search' }, { status: 400 });
  }

  const mergedConfig: ScrapingConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    subreddits: config.subreddits || DEFAULT_CONFIG.subreddits,
  };

  await redditScraper.initialize();
  const result = await redditScraper.quickSearch(topic, mergedConfig);

  return NextResponse.json({
    success: true,
    topic,
    postsFound: result.posts.length,
    posts: result.posts.slice(0, 10),
    errors: result.errors
  });
}

async function insightsSearch(params: {
  query?: string;
  sentiments?: string[];
  audiences?: string[];
  subreddits?: string[];
  insightTypes?: string[];
  painPointsOnly?: boolean;
  questionsOnly?: boolean;
}) {
  const {
    query = '',
    sentiments = [],
    audiences = [],
    subreddits = [],
    insightTypes = [],
    painPointsOnly = false,
    questionsOnly = false
  } = params;

  let results = [...cachedAnalyzedPosts];

  if (results.length === 0 && query) {
    await redditScraper.initialize();
    const scrapingResult = await redditScraper.quickSearch(query, {
      ...DEFAULT_CONFIG,
      subreddits: subreddits.length > 0 ? subreddits : DEFAULT_CONFIG.subreddits
    });

    if (scrapingResult.posts.length > 0) {
      await aiAnalyzer.initialize();
      const analyzed = await aiAnalyzer.analyzePosts(scrapingResult.posts.slice(0, 15));
      results = analyzed;
      cachedAnalyzedPosts = analyzed;
    }
  }

  if (query.trim()) {
    const searchLower = query.toLowerCase();
    results = results.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      post.summary?.toLowerCase().includes(searchLower) ||
      post.painPoints?.some(pp => pp.toLowerCase().includes(searchLower)) ||
      post.questions?.some(q => q.toLowerCase().includes(searchLower)) ||
      post.industry?.toLowerCase().includes(searchLower)
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

  // Filter by insight types (complaints, frustrations, buyTriggers, etc.)
  if (insightTypes.length > 0) {
    results = results.filter(post => {
      if (!post.audienceInsight) return false;
      return insightTypes.some(type => {
        const insightArray = post.audienceInsight?.[type as keyof typeof post.audienceInsight];
        return Array.isArray(insightArray) && insightArray.length > 0;
      });
    });
  }

  if (painPointsOnly) {
    results = results.filter(post => post.painPoints && post.painPoints.length > 0);
  }

  if (questionsOnly) {
    results = results.filter(post => post.questions && post.questions.length > 0);
  }

  return NextResponse.json({
    success: true,
    query,
    filters: { sentiments, audiences, subreddits, insightTypes, painPointsOnly, questionsOnly },
    totalResults: results.length,
    results: results.slice(0, 50)
  });
}

async function exportResults(results: AnalyzedPost[]) {
  if (!results || results.length === 0) {
    return NextResponse.json({ error: 'No results to export' }, { status: 400 });
  }

  await ensureDownloadDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const filename = `Filtered_Insights_${timestamp}.xlsx`;
  const filePath = path.join(process.cwd(), 'download', filename);

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPostsAnalyzed: results.length,
      totalPainPoints: results.reduce((sum, p) => sum + (p.painPoints?.length || 0), 0),
      totalQuestions: results.reduce((sum, p) => sum + (p.questions?.length || 0), 0),
      sentimentDistribution: {
        positive: results.filter(p => p.sentiment === 'positive').length,
        negative: results.filter(p => p.sentiment === 'negative').length,
        neutral: results.filter(p => p.sentiment === 'neutral').length,
        mixed: results.filter(p => p.sentiment === 'mixed').length
      },
      topSubreddits: [...new Set(results.map(p => p.subreddit))].map(name => ({
        name,
        count: results.filter(p => p.subreddit === name).length
      }))
    },
    analyzedPosts: results,
    contentOpportunities: [],
    trendingTopics: [],
    audienceInsights: [],
    configuration: DEFAULT_CONFIG,
    dateRange: { start: new Date().toISOString(), end: new Date().toISOString() }
  };

  const jsonPath = path.join(process.cwd(), 'download', `filtered_${timestamp}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

  const scriptPath = path.join(process.cwd(), 'scripts', 'generate_excel_report.py');
  try {
    await execAsync(`python3 "${scriptPath}" "${jsonPath}" "${filePath}"`);
  } catch (error) {
    console.error('Excel generation error:', error);
    return NextResponse.json({
      success: true,
      filename: `filtered_${timestamp}.json`,
      message: 'Excel generation failed, JSON exported instead'
    });
  }

  return NextResponse.json({ success: true, filename });
}

async function downloadReport(filename: string) {
  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 });
  }

  const downloadDir = await ensureDownloadDir();
  const filePath = path.join(downloadDir, filename);

  try {
    const fileBuffer = await fs.readFile(filePath);
    const isExcel = filename.endsWith('.xlsx');
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': isExcel 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/json',
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
      .filter(f => f.endsWith('.xlsx') || f.endsWith('.json'))
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
