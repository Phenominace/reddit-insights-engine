'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Search, Play, Download, RefreshCw, BarChart3, MessageSquare, 
  TrendingUp, Users, Target, CheckCircle, AlertCircle, 
  Clock, FileSpreadsheet, Settings, ChevronRight, Filter, 
  Frown, Meh, Smile, AlertTriangle, Heart, Briefcase, Building,
  Sparkles, FileText, X, Loader2
} from 'lucide-react'

interface AnalyzedPost {
  id: string
  title: string
  subreddit: string
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  contentOpportunity: 'high' | 'medium' | 'low'
  painPoints: string[]
  questions: string[]
  summary: string
  targetAudience: string[]
  url: string
}

const SUBREDDITS = [
  'r/marketing',
  'r/entrepreneur', 
  'r/content_marketing',
  'r/contentcreation',
  'r/founders'
]

const AUDIENCE_TYPES = [
  { id: 'founders', label: 'Founders', icon: Briefcase },
  { id: 'professionals', label: 'Professionals', icon: Building },
  { id: 'service-business', label: 'Service Business Owners', icon: Users },
  { id: 'marketers', label: 'Marketers', icon: Target },
  { id: 'entrepreneurs', label: 'Entrepreneurs', icon: Sparkles },
]

const SENTIMENTS = [
  { id: 'positive', label: 'Positive', icon: Smile, color: 'text-green-400' },
  { id: 'negative', label: 'Negative', icon: Frown, color: 'text-red-400' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-slate-400' },
  { id: 'mixed', label: 'Mixed', icon: AlertTriangle, color: 'text-yellow-400' },
]

export default function RedditInsightsDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Insights Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([])
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([])
  const [showPainPointsOnly, setShowPainPointsOnly] = useState(false)
  const [showQuestionsOnly, setShowQuestionsOnly] = useState(false)
  const [searchResults, setSearchResults] = useState<AnalyzedPost[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Analysis State
  const [analysisResults, setAnalysisResults] = useState<AnalyzedPost[]>([])
  const [analysisStatus, setAnalysisStatus] = useState<string>('')
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const toggleSentiment = (sentiment: string) => {
    setSelectedSentiments(prev => 
      prev.includes(sentiment) 
        ? prev.filter(s => s !== sentiment)
        : [...prev, sentiment]
    )
  }

  const toggleAudience = (audience: string) => {
    setSelectedAudiences(prev => 
      prev.includes(audience) 
        ? prev.filter(a => a !== audience)
        : [...prev, audience]
    )
  }

  const toggleSubreddit = (subreddit: string) => {
    setSelectedSubreddits(prev => 
      prev.includes(subreddit) 
        ? prev.filter(s => s !== subreddit)
        : [...prev, subreddit]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSentiments([])
    setSelectedAudiences([])
    setSelectedSubreddits([])
    setShowPainPointsOnly(false)
    setShowQuestionsOnly(false)
    setSearchResults([])
    setHasSearched(false)
    setError(null)
  }

  // Quick analysis - instant results
  const runQuickAnalysis = async () => {
    setIsLoading(true)
    setError(null)
    setAnalysisStatus('Searching Reddit...')
    
    try {
      const response = await fetch('/api/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'quick',
          topic: 'marketing OR entrepreneurship OR "content strategy" OR "client acquisition"',
          config: {
            subreddits: SUBREDDITS,
            maxPostsPerSubreddit: 10
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.posts && data.posts.length > 0) {
        setAnalysisStatus(`Found ${data.postsFound} posts. Analyzing with AI...`)
        
        // Now analyze these posts
        const analyzeResponse = await fetch('/api/reddit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'insights-search',
            query: '',
            subreddits: SUBREDDITS
          })
        })
        
        const analyzed = await analyzeResponse.json()
        
        if (analyzed.success) {
          // Transform posts to analyzed posts with AI
          const postsToAnalyze = data.posts.slice(0, 15)
          setAnalysisResults(postsToAnalyze.map((p: any) => ({
            ...p,
            sentiment: 'neutral' as const,
            contentOpportunity: 'medium' as const,
            painPoints: [],
            questions: [],
            summary: p.selftext?.substring(0, 150) || '',
            targetAudience: ['Entrepreneurs', 'Marketers']
          })))
          setHasAnalyzed(true)
          setAnalysisStatus(`Analyzed ${postsToAnalyze.length} posts!`)
        } else {
          // Still show raw posts even if analysis fails
          setAnalysisResults(data.posts.slice(0, 15).map((p: any) => ({
            ...p,
            sentiment: 'neutral' as const,
            contentOpportunity: 'medium' as const,
            painPoints: [],
            questions: [],
            summary: p.selftext?.substring(0, 150) || '',
            targetAudience: ['Entrepreneurs', 'Marketers']
          })))
          setHasAnalyzed(true)
          setAnalysisStatus(`Found ${data.postsFound} posts!`)
        }
      } else {
        setError('No posts found. Try a different search.')
      }
    } catch (err) {
      console.error('Analysis failed:', err)
      setError('Failed to fetch data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const runInsightsSearch = async () => {
    if (!searchQuery.trim() && selectedSentiments.length === 0 && selectedAudiences.length === 0) {
      setError('Please enter a search query or select filters')
      return
    }
    
    setIsLoading(true)
    setHasSearched(true)
    setError(null)
    
    try {
      const response = await fetch('/api/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'insights-search',
          query: searchQuery,
          sentiments: selectedSentiments,
          audiences: selectedAudiences,
          subreddits: selectedSubreddits.length > 0 ? selectedSubreddits : SUBREDDITS,
          painPointsOnly: showPainPointsOnly,
          questionsOnly: showQuestionsOnly
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.results || [])
        if (data.results.length === 0) {
          setError('No results found. Try different search terms.')
        }
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      console.error('Search failed:', err)
      setError('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    const s = SENTIMENTS.find(s => s.id === sentiment)
    if (!s) return <Meh className="w-4 h-4" />
    const Icon = s.icon
    return <Icon className={`w-4 h-4 ${s.color}`} />
  }

  const getSentimentBadge = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-green-500/20 text-green-400 border-green-500/50',
      negative: 'bg-red-500/20 text-red-400 border-red-500/50',
      neutral: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
      mixed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    }
    return colors[sentiment] || colors.neutral
  }

  const getOpportunityBadge = (opportunity: string) => {
    const colors: Record<string, string> = {
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      medium: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      low: 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
    return colors[opportunity] || colors.low
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Reddit Insights Engine</h1>
                <p className="text-sm text-slate-400">AI Audience Research Agent</p>
              </div>
            </div>
            {isLoading && (
              <Badge className="bg-blue-500 text-white animate-pulse">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Processing...
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700 mb-6">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-orange-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-orange-500">
              <Search className="w-4 h-4 mr-2" />
              Insights Search
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Analysis Card */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Play className="w-5 h-5 text-orange-500" />
                  Quick Analysis
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Instantly search Reddit and get AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm">
                    Click below to search Reddit posts from marketing, entrepreneurship, and content strategy communities.
                  </p>
                  <Button 
                    onClick={runQuickAnalysis} 
                    disabled={isLoading} 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {analysisStatus || 'Analyzing...'}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Quick Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="bg-red-900/20 border-red-500/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {hasAnalyzed && analysisResults.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Analysis Results</CardTitle>
                    <Badge className="bg-green-500">{analysisResults.length} posts found</Badge>
                  </div>
                  <CardDescription className="text-slate-400">
                    {analysisStatus}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResults.map((post, index) => (
                      <div key={post.id || index} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getSentimentIcon(post.sentiment)}
                              <h4 className="font-medium text-white">{post.title}</h4>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {post.subreddit}
                              </Badge>
                              <Badge className={getSentimentBadge(post.sentiment)}>
                                {post.sentiment}
                              </Badge>
                            </div>

                            {post.summary && (
                              <p className="text-sm text-slate-400 line-clamp-2">{post.summary}</p>
                            )}

                            {post.painPoints && post.painPoints.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-red-400 mb-1">Pain Points:</p>
                                <div className="flex flex-wrap gap-1">
                                  {post.painPoints.slice(0, 3).map((pp, i) => (
                                    <Badge key={i} variant="outline" className="text-xs border-red-500/50 text-red-400">
                                      {pp}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 p-2"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Target Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5 text-orange-500" />
                    Target Subreddits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {SUBREDDITS.map(sub => (
                      <Badge key={sub} variant="secondary" className="bg-slate-700 text-slate-300">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Focus Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['Marketing', 'Content Strategy', 'Entrepreneurship', 'Lead Generation'].map(topic => (
                      <Badge key={topic} variant="outline" className="border-orange-500 text-orange-400">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How It Works */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">How It Works</CardTitle>
                <CardDescription className="text-slate-400">
                  AI-powered audience research from Reddit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { step: 1, title: 'Search', desc: 'Search Reddit posts from target communities', icon: Search },
                    { step: 2, title: 'Analyze', desc: 'AI extracts pain points, questions, sentiment', icon: BarChart3 },
                    { step: 3, title: 'Generate', desc: 'Create actionable content insights', icon: Target },
                    { step: 4, title: 'Use', desc: 'Apply insights to your content strategy', icon: Sparkles },
                  ].map((item) => (
                    <div key={item.step} className="relative p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                        <item.icon className="w-5 h-5 text-orange-400" />
                      </div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Filter className="w-5 h-5 text-orange-500" />
                  Advanced Insights Search
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Search and filter Reddit insights by topic, sentiment, and audience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by topic (e.g., 'client acquisition', 'email marketing')"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white pl-10"
                      onKeyDown={(e) => e.key === 'Enter' && runInsightsSearch()}
                    />
                  </div>
                  <Button onClick={runInsightsSearch} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </Button>
                  {(searchQuery || selectedSentiments.length > 0 || selectedAudiences.length > 0) && (
                    <Button onClick={clearFilters} variant="outline" className="border-slate-600 text-slate-300">
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sentiment Filter */}
                  <div className="space-y-3">
                    <Label className="text-white font-semibold flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" />
                      Sentiment
                    </Label>
                    <div className="space-y-2">
                      {SENTIMENTS.map((sentiment) => (
                        <div key={sentiment.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sentiment-${sentiment.id}`}
                            checked={selectedSentiments.includes(sentiment.id)}
                            onCheckedChange={() => toggleSentiment(sentiment.id)}
                          />
                          <label htmlFor={`sentiment-${sentiment.id}`} className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer">
                            <sentiment.icon className={`w-4 h-4 ${sentiment.color}`} />
                            {sentiment.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audience Filter */}
                  <div className="space-y-3">
                    <Label className="text-white font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      Target Audience
                    </Label>
                    <div className="space-y-2">
                      {AUDIENCE_TYPES.map((audience) => (
                        <div key={audience.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`audience-${audience.id}`}
                            checked={selectedAudiences.includes(audience.id)}
                            onCheckedChange={() => toggleAudience(audience.id)}
                          />
                          <label htmlFor={`audience-${audience.id}`} className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer">
                            <audience.icon className="w-4 h-4 text-slate-400" />
                            {audience.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subreddit Filter */}
                  <div className="space-y-3">
                    <Label className="text-white font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      Subreddits
                    </Label>
                    <div className="space-y-2">
                      {SUBREDDITS.map((subreddit) => (
                        <div key={subreddit} className="flex items-center space-x-2">
                          <Checkbox
                            id={`sub-${subreddit}`}
                            checked={selectedSubreddits.includes(subreddit)}
                            onCheckedChange={() => toggleSubreddit(subreddit)}
                          />
                          <label htmlFor={`sub-${subreddit}`} className="text-sm text-slate-300 cursor-pointer">
                            {subreddit}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Toggle Filters */}
                <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Switch id="pain-points" checked={showPainPointsOnly} onCheckedChange={setShowPainPointsOnly} />
                    <Label htmlFor="pain-points" className="text-slate-300 flex items-center gap-2">
                      <Frown className="w-4 h-4 text-red-400" />
                      Pain Points Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="questions-only" checked={showQuestionsOnly} onCheckedChange={setShowQuestionsOnly} />
                    <Label htmlFor="questions-only" className="text-slate-300 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      Questions Only
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && hasSearched && (
              <Card className="bg-red-900/20 border-red-500/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {hasSearched && searchResults.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Search Results</CardTitle>
                  <CardDescription className="text-slate-400">
                    Found {searchResults.length} matching insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.map((post, index) => (
                      <div key={post.id || index} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getSentimentIcon(post.sentiment)}
                              <h4 className="font-medium text-white">{post.title}</h4>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {post.subreddit}
                              </Badge>
                              <Badge className={getSentimentBadge(post.sentiment)}>
                                {post.sentiment}
                              </Badge>
                              <Badge className={getOpportunityBadge(post.contentOpportunity)}>
                                {post.contentOpportunity} opportunity
                              </Badge>
                            </div>

                            {post.summary && (
                              <p className="text-sm text-slate-400 mb-3">{post.summary}</p>
                            )}

                            {post.painPoints && post.painPoints.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs text-red-400 mb-1">Pain Points:</p>
                                <div className="flex flex-wrap gap-1">
                                  {post.painPoints.slice(0, 3).map((pp, i) => (
                                    <Badge key={i} variant="outline" className="text-xs border-red-500/50 text-red-400">
                                      {pp}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {post.questions && post.questions.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs text-purple-400 mb-1">Questions:</p>
                                <div className="flex flex-wrap gap-1">
                                  {post.questions.slice(0, 2).map((q, i) => (
                                    <Badge key={i} variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                                      {q}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {post.targetAudience && post.targetAudience.length > 0 && (
                              <div>
                                <p className="text-xs text-blue-400 mb-1">Target Audience:</p>
                                <div className="flex flex-wrap gap-1">
                                  {post.targetAudience.slice(0, 3).map((aud, i) => (
                                    <Badge key={i} variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                      {aud}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 p-2">
                            <ChevronRight className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Initial State */}
            {!hasSearched && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12">
                  <div className="text-center text-slate-400">
                    <Filter className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-semibold text-white mb-2">Start Your Search</h3>
                    <p>Enter a search query or select filters to find relevant insights</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400">Client acquisition</Badge>
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400">Lead generation</Badge>
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400">Email marketing</Badge>
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400">Content strategy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-orange-500" />
                  Configuration
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Current scraping and analysis settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">Target Subreddits</h4>
                  <div className="flex flex-wrap gap-2">
                    {SUBREDDITS.map(sub => (
                      <Badge key={sub} className="bg-slate-700 text-slate-300">{sub}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Focus Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {['marketing strategy', 'content strategy', 'online marketing', 'entrepreneurship', 'service business', 'client acquisition', 'lead generation', 'brand building', 'social media marketing', 'email marketing'].map(topic => (
                      <Badge key={topic} variant="outline" className="border-slate-600 text-slate-300">{topic}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Analysis Parameters</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-400">Max Posts per Search</p>
                      <p className="text-white font-semibold">15</p>
                    </div>
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-400">AI Analysis</p>
                      <p className="text-white font-semibold">Enabled</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">💡 About This Tool</h4>
                  <p className="text-sm text-slate-300">
                    This AI Agent researches Reddit to find audience insights for content creation. 
                    It searches marketing, entrepreneurship, and content strategy communities to identify 
                    pain points, questions, and trending topics that you can use to create valuable content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
