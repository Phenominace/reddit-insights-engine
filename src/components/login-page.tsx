'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Target, 
  TrendingUp, 
  Users, 
  Sparkles,
  ArrowRight,
  Zap,
  BarChart3,
  MessageSquare
} from 'lucide-react';

const animatedWords = [
  "Discover audience pain points",
  "Find buying triggers instantly",
  "Analyze competitor mentions",
  "Track sentiment in real-time",
  "Uncover hidden opportunities",
  "Research any industry",
  "Extract exact phrases",
  "Identify urgent problems"
];

const features = [
  {
    icon: <Target className="h-5 w-5" />,
    text: "15 Insight Patterns"
  },
  {
    icon: <Search className="h-5 w-5" />,
    text: "Reddit Data Mining"
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    text: "Sentiment Analysis"
  },
  {
    icon: <Zap className="h-5 w-5" />,
    text: "AI-Powered Insights"
  }
];

function LoginContent({ onLogin }: { onLogin: () => void }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % animatedWords.length);
        setFadeState('in');
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-lime-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-lime-200/30 dark:bg-lime-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/30 dark:bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-100/20 dark:bg-lime-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl shadow-lg shadow-lime-500/25 mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            AI Audience Research
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Transform Reddit conversations into actionable insights
          </p>
        </div>

        {/* Animated Text */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-lime-100 dark:bg-lime-900/30 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-lime-600 dark:text-lime-400" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">What you can do</span>
          </div>
          
          <div className="h-8 flex items-center">
            <p 
              className={cn(
                "text-xl font-semibold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent transition-all duration-500",
                fadeState === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              )}
            >
              {animatedWords[currentWordIndex]}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="text-lime-600 dark:text-lime-400">
                {feature.icon}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onLogin}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white shadow-lg shadow-lime-500/25 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-lime-500/30 group"
        >
          Get Started Free
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>1,200+ users</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            <span>50k+ insights</span>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          No credit card required • Start researching in seconds
        </p>
      </div>
    </div>
  );
}

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  return (
    <ThemeProvider>
      <LoginContent onLogin={onLogin} />
    </ThemeProvider>
  );
}
