'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Download, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  MessageSquare, 
  Target,
  DollarSign,
  AlertTriangle,
  Clock,
  HelpCircle,
  Zap,
  Repeat,
  Heart,
  FileText,
  RefreshCw,
  Lightbulb,
  ShoppingCart,
  XCircle,
  Filter,
  BarChart3,
  Building2
} from 'lucide-react';

// Types
interface InsightPattern {
  category: string;
  label: string;
  description: string;
  icon: string;
  triggerPhrases: string[];
}

interface IndustryPreset {
  id: string;
  name: string;
  subreddits: string[];
  topics: string[];
  description: string;
}

interface AnalyzedPost {
  id: string;
  title: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  createdUtc: string;
  selftext: string;
  categories: string[];
  painPoints: string[];
  questions: string[];
  buyingTriggers: string[];
  objections: string[];
  desiredOutcomes: string[];
  exactPhrases: string[];
  sentiment: string;
  emotionIntensity: string;
  emotionType?: string;
  contentOpportunity: string;
  summary: string;
  targetAudience: string[];
  purchaseIntent: string;
}

interface SearchSummary {
  topCategories: { category: string; count: number }[];
  topPhrases: string[];
  sentimentBreakdown: Record<string, number>;
}

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  complaints: <AlertCircle className="h-4 w-4" />,
  frustrations: <AlertTriangle className="h-4 w-4" />,
  desired_outcomes: <Target className="h-4 w-4" />,
  failed_solutions: <XCircle className="h-4 w-4" />,
  comparisons: <BarChart3 className="h-4 w-4" />,
  objections: <DollarSign className="h-4 w-4" />,
  fears: <AlertTriangle className="h-4 w-4" />,
  urgent_problems: <Clock className="h-4 w-4" />,
  repeated_questions: <HelpCircle className="h-4 w-4" />,
  strong_emotions: <Zap className="h-4 w-4" />,
  exact_phrases: <FileText className="h-4 w-4" />,
  before_after: <RefreshCw className="h-4 w-4" />,
  misconceptions: <Lightbulb className="h-4 w-4" />,
  buying_triggers: <ShoppingCart className="h-4 w-4" />,
  non_buying_reasons: <XCircle className="h-4 w-4" />
};

const categoryColors: Record<string, string> = {
  complaints: 'bg-red-100 text-red-800 border-red-200',
  frustrations: 'bg-orange-100 text-orange-800 border-orange-200',
  desired_outcomes: 'bg-green-100 text-green-800 border-green-200',
  failed_solutions: 'bg-gray-100 text-gray-800 border-gray-200',
  comparisons: 'bg-blue-100 text-blue-800 border-blue-200',
  objections: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  fears: 'bg-purple-100 text-purple-800 border-purple-200',
  urgent_problems: 'bg-red-100 text-red-800 border-red-200',
  repeated_questions: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  strong_emotions: 'bg-pink-100 text-pink-800 border-pink-200',
  exact_phrases: 'bg-teal-100 text-teal-800 border-teal-200',
  before_after: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  misconceptions: 'bg-amber-100 text-amber-800 border-amber-200',
  buying_triggers: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  non_buying_reasons: 'bg-rose-100 text-rose-800 border-rose-200'
};

const sentimentColors: Record<string, string> = {
  positive: 'bg-green-500',
  negative: 'bg-red-500',
  neutral: 'bg-gray-500',
  mixed: 'bg-yellow-500'
};

export default function AudienceResearchAgent() {
  // State
  const [patterns, setPatterns] = useState<InsightPattern[]>([]);
  const [industries, setIndustries] = useState<IndustryPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);
  const [buyingSignalsOnly, setBuyingSignalsOnly] = useState(false);
  const [results, setResults] = useState<AnalyzedPost[]>([]);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  // Fetch patterns and industries on mount
  useEffect(() => {
    fetchPatterns();
    fetchIndustries();
  }, []);

  const fetchPatterns = async () => {
    try {
      const res = await fetch('/api/reddit?action=patterns');
      const data = await res.json();
      if (data.success) {
        setPatterns(data.patterns);
      }
    } catch (err) {
      console.error('Failed to fetch patterns:', err);
    }
  };

  const fetchIndustries = async () => {
    try {
      const res = await fetch('/api/reddit?action=industries');
      const data = await res.json();
      if (data.success) {
        setIndustries(data.industries);
      }
    } catch (err) {
      console.error('Failed to fetch industries:', err);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSentimentToggle = (sentiment: string) => {
    setSelectedSentiments(prev => 
      prev.includes(sentiment) 
        ? prev.filter(s => s !== sentiment)
        : [...prev, sentiment]
    );
  };

  const handleIndustryChange = (industryId: string) => {
    setSelectedIndustry(industryId);
    const industry = industries.find(i => i.id === industryId);
    if (industry) {
      setQuery(industry.topics.join(' '));
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSummary(null);

    try {
      const res = await fetch('/api/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          query,
          categories: selectedCategories,
          sentiments: selectedSentiments,
          buyingSignalsOnly,
          industry: selectedIndustry
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (results.length === 0) return;

    try {
      const res = await fetch('/api/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export-results',
          results
        })
      });

      const data = await res.json();
      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const formatCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="h-7 w-7 text-blue-600" />
                AI Audience Research Agent
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Where people complain + where they pay + where data confirms
              </p>
            </div>
            <div className="flex items-center gap-3">
              {results.length > 0 && (
                <Button onClick={handleExport} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Results
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Insights Search
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Filter className="h-4 w-4" />
              15 Insight Patterns
            </TabsTrigger>
            <TabsTrigger value="industries" className="gap-2">
              <Building2 className="h-4 w-4" />
              Industry Presets
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Search Card */}
            <Card>
              <CardHeader>
                <CardTitle>Search Audience Insights</CardTitle>
                <CardDescription>
                  Find complaints, frustrations, buying triggers, and more from real conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for pain points, questions, buying triggers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={loading} className="gap-2">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </Button>
                </div>

                {/* Industry Preset */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Industry Preset</label>
                    <Select value={selectedIndustry} onValueChange={handleIndustryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry..." />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.id} value={industry.id}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category Filters */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Insight Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {patterns.map((pattern) => (
                      <Badge
                        key={pattern.category}
                        variant={selectedCategories.includes(pattern.category) ? 'default' : 'outline'}
                        className={`cursor-pointer ${selectedCategories.includes(pattern.category) ? 'bg-blue-600' : ''}`}
                        onClick={() => handleCategoryToggle(pattern.category)}
                      >
                        {pattern.icon} {pattern.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Sentiment:</span>
                    {['positive', 'negative', 'neutral', 'mixed'].map((sentiment) => (
                      <Badge
                        key={sentiment}
                        variant={selectedSentiments.includes(sentiment) ? 'default' : 'outline'}
                        className={`cursor-pointer ${selectedSentiments.includes(sentiment) ? 'bg-blue-600' : ''}`}
                        onClick={() => handleSentimentToggle(sentiment)}
                      >
                        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <Checkbox
                      id="buyingSignals"
                      checked={buyingSignalsOnly}
                      onCheckedChange={(checked) => setBuyingSignalsOnly(checked as boolean)}
                    />
                    <label htmlFor="buyingSignals" className="text-sm text-slate-600 cursor-pointer">
                      Buying signals only
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Summary Stats */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Top Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {summary.topCategories.slice(0, 5).map(({ category, count }) => (
                        <div key={category} className="flex items-center justify-between">
                          <Badge variant="outline" className={categoryColors[category] || ''}>
                            {formatCategoryLabel(category)}
                          </Badge>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Sentiment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(summary.sentimentBreakdown).map(([sentiment, count]) => (
                        <div key={sentiment} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${sentimentColors[sentiment]}`} />
                          <span className="text-sm capitalize">{sentiment}</span>
                          <span className="text-sm font-medium ml-auto">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Exact Phrases Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {summary.topPhrases.slice(0, 10).map((phrase, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          "{phrase}"
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {results.length} Insights Found
                  </h2>
                </div>

                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {results.map((post) => (
                      <Card key={post.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  r/{post.subreddit}
                                </Badge>
                                <div className={`w-2 h-2 rounded-full ${sentimentColors[post.sentiment]}`} />
                                <span className="text-xs text-slate-500 capitalize">{post.sentiment}</span>
                                {post.purchaseIntent === 'high' && (
                                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                                    <ShoppingCart className="h-3 w-3 mr-1" /> High Purchase Intent
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="font-medium text-slate-900 mb-2 line-clamp-2">
                                {post.title}
                              </h3>
                              
                              <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                                {post.selftext}
                              </p>

                              {/* Categories */}
                              {post.categories && post.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {post.categories.map((cat) => (
                                    <Badge key={cat} variant="outline" className={`text-xs ${categoryColors[cat] || ''}`}>
                                      {categoryIcons[cat]} {formatCategoryLabel(cat)}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Key Insights */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {post.painPoints && post.painPoints.length > 0 && (
                                  <div>
                                    <span className="font-medium text-slate-700">Pain Points:</span>
                                    <ul className="text-slate-600">
                                      {post.painPoints.slice(0, 2).map((pp, i) => (
                                        <li key={i}>• {pp}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {post.buyingTriggers && post.buyingTriggers.length > 0 && (
                                  <div>
                                    <span className="font-medium text-emerald-700">Buying Triggers:</span>
                                    <ul className="text-slate-600">
                                      {post.buyingTriggers.slice(0, 2).map((bt, i) => (
                                        <li key={i}>• {bt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {post.objections && post.objections.length > 0 && (
                                  <div>
                                    <span className="font-medium text-red-700">Objections:</span>
                                    <ul className="text-slate-600">
                                      {post.objections.slice(0, 2).map((ob, i) => (
                                        <li key={i}>• {ob}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {post.exactPhrases && post.exactPhrases.length > 0 && (
                                  <div>
                                    <span className="font-medium text-blue-700">Exact Phrases:</span>
                                    <ul className="text-slate-600">
                                      {post.exactPhrases.slice(0, 2).map((ep, i) => (
                                        <li key={i}>• "{ep}"</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View Post →
                              </a>
                              <div className="text-xs text-slate-400">
                                {post.score} pts • {post.numComments} comments
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>15 Insight Patterns for Audience Research</CardTitle>
                <CardDescription>
                  Use these search patterns to find specific types of insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patterns.map((pattern) => (
                    <Card key={pattern.category} className="bg-slate-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{pattern.icon}</span>
                          <div>
                            <h3 className="font-semibold text-slate-900">{pattern.label}</h3>
                            <p className="text-sm text-slate-600 mt-1">{pattern.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {pattern.triggerPhrases.slice(0, 3).map((phrase, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  "{phrase}"
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Industries Tab */}
          <TabsContent value="industries">
            <Card>
              <CardHeader>
                <CardTitle>Industry Presets</CardTitle>
                <CardDescription>
                  Pre-configured subreddit and topic combinations for different industries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {industries.map((industry) => (
                    <Card 
                      key={industry.id} 
                      className={`cursor-pointer transition-colors ${selectedIndustry === industry.id ? 'ring-2 ring-blue-500' : 'hover:bg-slate-50'}`}
                      onClick={() => {
                        setSelectedIndustry(industry.id);
                        setQuery(industry.topics.join(' '));
                        setActiveTab('search');
                      }}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900">{industry.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{industry.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {industry.subreddits.slice(0, 4).map((sub, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              r/{sub}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
