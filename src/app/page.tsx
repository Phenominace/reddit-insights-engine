'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar } from '@/components/sidebar';
import { LoginPage } from '@/components/login-page';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Download, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  Target,
  DollarSign,
  AlertTriangle,
  Clock,
  HelpCircle,
  Zap,
  FileText,
  RefreshCw,
  Lightbulb,
  ShoppingCart,
  XCircle,
  BarChart3,
  MessageSquare,
  Users,
  ThumbsUp,
  ThumbsDown,
  Activity,
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
  complaints: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  frustrations: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  desired_outcomes: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300',
  failed_solutions: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
  comparisons: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  objections: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  fears: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
  urgent_problems: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  repeated_questions: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  strong_emotions: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300',
  exact_phrases: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300',
  before_after: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  misconceptions: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  buying_triggers: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  non_buying_reasons: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300'
};

const sentimentColors: Record<string, string> = {
  positive: 'bg-lime-500',
  negative: 'bg-red-500',
  neutral: 'bg-gray-500',
  mixed: 'bg-amber-500'
};

function DashboardContent() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  // Check for existing session after mount - ALL HOOKS MUST BE BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    setMounted(true);
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch patterns and industries when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchPatterns();
      fetchIndustries();
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-lime-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'search' && 'Insights Search'}
              {activeTab === 'categories' && '15 Insight Patterns'}
              {activeTab === 'industries' && 'Industry Presets'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {results.length > 0 && activeTab === 'search' && (
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Results
              </Button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-lime-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Insights</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{results.length || 124}</p>
                      </div>
                      <div className="h-12 w-12 bg-lime-100 dark:bg-lime-900/30 rounded-lg flex items-center justify-center">
                        <Activity className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Buying Signals</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{results.filter(r => r.purchaseIntent === 'high').length || 38}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pain Points</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{results.flatMap(r => r.painPoints || []).length || 67}</p>
                      </div>
                      <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Industries</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{industries.length || 12}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Start analyzing audience insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col items-center gap-2 border-lime-300 dark:border-lime-700 hover:bg-lime-50 dark:hover:bg-lime-900/20"
                      onClick={() => setActiveTab('search')}
                    >
                      <Search className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                      <span>New Search</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col items-center gap-2 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      onClick={() => setActiveTab('categories')}
                    >
                      <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <span>View Patterns</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col items-center gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => setActiveTab('industries')}
                    >
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <span>Browse Industries</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sentiment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lime-100 dark:bg-lime-900/30 rounded-lg flex items-center justify-center">
                          <ThumbsUp className="h-5 w-5 text-lime-600 dark:text-lime-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Positive</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">42%</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-lime-500 rounded-full" style={{ width: '42%' }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Negative</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">28%</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '28%' }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Neutral</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">30%</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-500 rounded-full" style={{ width: '30%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Insight Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patterns.slice(0, 5).map((pattern, index) => (
                        <div key={pattern.category} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-400 w-4">{index + 1}</span>
                          <Badge variant="outline" className="flex-1 justify-start gap-2 py-1.5 border-lime-200 dark:border-lime-800">
                            <span>{pattern.icon}</span>
                            <span className="text-lime-700 dark:text-lime-300">{pattern.label}</span>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
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
                    <Button onClick={handleSearch} disabled={loading} className="gap-2 bg-lime-500 hover:bg-lime-600 text-white">
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
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Industry Preset</label>
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
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Insight Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {patterns.map((pattern) => (
                        <Badge
                          key={pattern.category}
                          variant={selectedCategories.includes(pattern.category) ? 'default' : 'outline'}
                          className={cn(
                            "cursor-pointer",
                            selectedCategories.includes(pattern.category) 
                              ? "bg-lime-500 text-white hover:bg-lime-600" 
                              : "border-lime-300 dark:border-lime-700 text-lime-700 dark:text-lime-300"
                          )}
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
                      <span className="text-sm text-slate-600 dark:text-slate-400">Sentiment:</span>
                      {['positive', 'negative', 'neutral', 'mixed'].map((sentiment) => (
                        <Badge
                          key={sentiment}
                          variant={selectedSentiments.includes(sentiment) ? 'default' : 'outline'}
                          className={cn(
                            "cursor-pointer",
                            selectedSentiments.includes(sentiment) 
                              ? "bg-lime-500 text-white hover:bg-lime-600" 
                              : "border-lime-300 dark:border-lime-700 text-lime-700 dark:text-lime-300"
                          )}
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
                      <label htmlFor="buyingSignals" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
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
                      <CardTitle className="text-sm font-medium text-lime-700 dark:text-lime-300">Top Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {summary.topCategories.slice(0, 5).map(({ category, count }) => (
                          <div key={category} className="flex items-center justify-between">
                            <Badge variant="outline" className={categoryColors[category] || ''}>
                              {formatCategoryLabel(category)}
                            </Badge>
                            <span className="text-sm font-medium text-lime-700 dark:text-lime-300">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-lime-700 dark:text-lime-300">Sentiment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(summary.sentimentBreakdown).map(([sentiment, count]) => (
                          <div key={sentiment} className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", sentimentColors[sentiment])} />
                            <span className="text-sm capitalize text-slate-600 dark:text-slate-400">{sentiment}</span>
                            <span className="text-sm font-medium ml-auto text-lime-700 dark:text-lime-300">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-lime-700 dark:text-lime-300">Exact Phrases Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {summary.topPhrases.slice(0, 10).map((phrase, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-200">
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
                    <h2 className="text-lg font-semibold text-lime-800 dark:text-lime-200">
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
                                  <div className={cn("w-2 h-2 rounded-full", sentimentColors[post.sentiment])} />
                                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{post.sentiment}</span>
                                  {post.purchaseIntent === 'high' && (
                                    <Badge className="bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-200 text-xs border border-lime-300 dark:border-lime-700">
                                      <ShoppingCart className="h-3 w-3 mr-1" /> High Purchase Intent
                                    </Badge>
                                  )}
                                </div>
                                
                                <h3 className="font-medium text-slate-900 dark:text-white mb-2 line-clamp-2">
                                  {post.title}
                                </h3>
                                
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
                                  {post.selftext}
                                </p>

                                {/* Categories */}
                                {post.categories && post.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {post.categories.map((cat) => (
                                      <Badge key={cat} variant="outline" className={cn("text-xs", categoryColors[cat] || '')}>
                                        {categoryIcons[cat]} {formatCategoryLabel(cat)}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Key Insights */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {post.painPoints && post.painPoints.length > 0 && (
                                    <div>
                                      <span className="font-medium text-lime-700 dark:text-lime-300">Pain Points:</span>
                                      <ul className="text-slate-600 dark:text-slate-400">
                                        {post.painPoints.slice(0, 2).map((pp, i) => (
                                          <li key={i}>• {pp}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {post.buyingTriggers && post.buyingTriggers.length > 0 && (
                                    <div>
                                      <span className="font-medium text-green-700 dark:text-green-300">Buying Triggers:</span>
                                      <ul className="text-slate-600 dark:text-slate-400">
                                        {post.buyingTriggers.slice(0, 2).map((bt, i) => (
                                          <li key={i}>• {bt}</li>
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
                                  className="text-lime-600 dark:text-lime-400 hover:text-lime-800 dark:hover:text-lime-300 text-sm font-medium"
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
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
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
                    <Card key={pattern.category} className="bg-slate-50 dark:bg-slate-800/50 border-lime-200 dark:border-lime-800">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{pattern.icon}</span>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{pattern.label}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{pattern.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {pattern.triggerPhrases.slice(0, 3).map((phrase, i) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-200">
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
          )}

          {/* Industries Tab */}
          {activeTab === 'industries' && (
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
                      className={cn(
                        "cursor-pointer transition-colors border",
                        selectedIndustry === industry.id 
                          ? "ring-2 ring-lime-500 bg-lime-50 dark:bg-lime-900/20 border-lime-300 dark:border-lime-700" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                      )}
                      onClick={() => {
                        setSelectedIndustry(industry.id);
                        setQuery(industry.topics.join(' '));
                        setActiveTab('search');
                      }}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{industry.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{industry.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {industry.subreddits.slice(0, 4).map((sub, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-lime-300 dark:border-lime-700 text-lime-700 dark:text-lime-300">
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
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure your AI Audience Research Agent preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">Appearance</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use the theme toggle in the sidebar to switch between light and dark mode.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">API Configuration</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Configure your Groq API key in the environment variables for AI-powered analysis.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">Data Export</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Export your insights in JSON format for further analysis or integration.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AudienceResearchAgent() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
