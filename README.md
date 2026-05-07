# Reddit Insights Engine - AI Audience Research Agent

An advanced AI-powered audience research tool that extracts deep insights from Reddit communities across ANY industry. This agent identifies where people complain, where they pay, and where data confirms patterns.

## ✨ Features

### 🔍 15 Insight Categories
The AI agent extracts these specific insight types from Reddit posts:

1. **Complaints** - Direct complaints ("I hate…", "Why is it so hard to…")
2. **Frustrations** - Ongoing struggles ("This never works…", "I'm tired of…")
3. **Desired Outcomes** - What they want ("I just want…", "How do I get…")
4. **Failed Solutions** - What didn't work ("I tried X but…")
5. **Comparisons** - Product/service comparisons ("X vs Y", "Which is better…")
6. **Objections** - Reasons against buying ("Too expensive", "Not worth it")
7. **Fears** - Concerns and worries ("What if…", "I don't want to…")
8. **Urgent Problems** - Time-sensitive needs ("ASAP", "quick fix", "fast way")
9. **Repeated Questions** - Common questions asked by many users
10. **Strong Emotions** - Expressions of anger, regret, excitement
11. **Exact Phrases** - Word-for-word patterns people repeat
12. **Before/After Stories** - Transformation stories ("I used to… now…")
13. **Misconceptions** - Wrong beliefs ("I thought… but…")
14. **Buy Triggers** - What made them purchase ("Finally bought because…")
15. **Not Buying Reasons** - Why they didn't purchase ("I didn't buy because…")

### 🎯 Key Capabilities

- **Industry-Agnostic**: Works with ANY industry (SaaS, E-commerce, Health & Fitness, Finance, Marketing, Real Estate, etc.)
- **AI-Powered Analysis**: Uses Groq's Llama 3.3 70B for fast, accurate insights
- **Advanced Filtering**: Filter by sentiment, audience, subreddit, and all 15 insight types
- **Deep Audience Insights**: See exact phrases, emotional language, and buying signals
- **Export Reports**: Generate Excel reports with comprehensive analysis
- **Real-time Search**: Search and filter insights instantly

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Add your GROQ_API_KEY to .env.local

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Environment Variables

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
API_SECRET=your_custom_secret_here
```

Get your Groq API key from [console.groq.com](https://console.groq.com)

## 🎯 How to Use

### Dashboard Tab
1. Click "Run Quick Analysis" to instantly search Reddit and get AI insights
2. View analyzed posts with pain points, questions, and sentiment
3. See target subreddits and focus topics

### Insights Search Tab
1. **Search by Topic**: Enter keywords related to your industry
2. **Filter by Sentiment**: Positive, negative, neutral, mixed
3. **Filter by Audience**: Founders, professionals, marketers, etc.
4. **Filter by Subreddit**: Choose specific communities
5. **Filter by Insight Type**: Select from 15 insight categories:
   - Complaints, Frustrations, Desired Outcomes
   - Failed Solutions, Comparisons, Objections
   - Fears, Urgent Problems, Buy Triggers
   - Before/After Stories, Misconceptions, and more
6. View detailed audience insights with exact phrases

### Settings Tab
- View current configuration
- See target subreddits and focus topics
- Review analysis parameters

## 🏗️ Architecture

### Frontend
- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** for styling
- **Lucide Icons** for iconography

### Backend
- **Groq API** for AI analysis (Llama 3.3 70B)
- **Reddit Scraper** for data collection
- **Python Script** for Excel report generation

### Data Flow
1. User initiates search or quick analysis
2. Reddit scraper collects posts from target subreddits
3. Groq AI analyzes each post for 15 insight categories
4. Results are cached and filterable
5. Users can export reports as Excel files

## 📁 Project Structure

```
src/
├── app/
│   ├── api/reddit/route.ts    # API endpoints
│   ├── page.tsx               # Main dashboard UI
│   └── layout.tsx             # App layout
├── lib/
│   ├── ai-analyzer.ts         # Groq AI analysis service
│   ├── reddit-scraper.ts      # Reddit data collector
│   ├── types.ts               # TypeScript definitions
│   └── utils.ts               # Utility functions
scripts/
├── generate_excel_report.py   # Excel report generator
```

## 🔧 Configuration

### Default Subreddits
- r/marketing
- r/entrepreneur
- r/content_marketing
- r/contentcreation
- r/founders

You can customize these in `src/lib/types.ts` under `DEFAULT_CONFIG`.

### AI Model
- **Provider**: Groq
- **Model**: llama-3.3-70b-versatile
- **Temperature**: 0.3 (focused analysis)

## 💡 Use Cases

### For Content Creators
- Find content ideas based on real audience pain points
- Discover questions your audience is asking
- Identify trending topics in your industry

### For Marketers
- Understand customer objections and fears
- Find buy triggers to use in campaigns
- Extract exact phrases for ad copy

### For Product Teams
- Identify failed solutions customers have tried
- Discover desired outcomes and use cases
- Find misconceptions to address in messaging

### For Researchers
- Gather qualitative data at scale
- Track sentiment trends over time
- Compare insights across industries

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `GROQ_API_KEY`
   - `API_SECRET`
4. Deploy

### Manual Deployment
```bash
bun run build
bun start
```

## 📊 Sample Output

Each analyzed post includes:
- **Basic Info**: Title, subreddit, URL, sentiment
- **Pain Points**: Specific challenges mentioned
- **Questions**: Explicit and implicit questions
- **Target Audience**: Who this resonates with
- **Industry**: Detected industry category
- **Deep Insights**: All 15 insight categories with exact phrases

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

---

**Built with ❤️ using Next.js, Groq AI, and shadcn/ui**

Powered by [Z.ai](https://chat.z.ai) 🚀
