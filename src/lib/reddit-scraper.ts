// AI Audience Research Agent - Data Collection Service
import { 
  RedditPost, 
  ScrapingConfig, 
  ScrapingResult, 
  DEFAULT_CONFIG, 
  AnalyzedPost, 
  InsightCategory,
  INSIGHT_PATTERNS
} from './types';

/**
 * Detect insight categories from text based on trigger phrases
 */
function detectCategories(text: string): InsightCategory[] {
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
 * Detect emotion intensity from text
 */
function detectEmotionIntensity(text: string): 'low' | 'medium' | 'high' {
  const upperCount = (text.match(/[A-Z]{2,}/g) || []).length;
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  
  const intensityScore = upperCount * 2 + exclamationCount * 1.5 + questionCount * 0.5;
  
  if (intensityScore >= 5) return 'high';
  if (intensityScore >= 2) return 'medium';
  return 'low';
}

/**
 * Detect purchase intent from text
 */
function detectPurchaseIntent(text: string): 'high' | 'medium' | 'low' | 'none' {
  const textLower = text.toLowerCase();
  
  const highIntentPhrases = ['finally bought', 'just purchased', 'ordered', 'about to buy', 'definitely getting', 'sign me up'];
  const mediumIntentPhrases = ['considering', 'thinking about', 'might get', 'looking into', 'researching'];
  const lowIntentPhrases = ['maybe', 'someday', 'eventually', 'when i have money'];
  
  if (highIntentPhrases.some(p => textLower.includes(p))) return 'high';
  if (mediumIntentPhrases.some(p => textLower.includes(p))) return 'medium';
  if (lowIntentPhrases.some(p => textLower.includes(p))) return 'low';
  return 'none';
}

// Sample data with comprehensive examples for ALL 15 categories
const SAMPLE_POSTS: AnalyzedPost[] = [
  // COMPLAINTS
  {
    id: 'comp1',
    title: 'I HATE how complicated this industry has become. Why is it so hard to just get started?',
    url: 'https://www.reddit.com/r/entrepreneur/comments/comp1',
    subreddit: 'entrepreneur',
    author: 'frustrated_founder',
    score: 2340,
    numComments: 189,
    createdUtc: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    selftext: 'I hate how every course, every guru, every "expert" makes this SO COMPLICATED. I just want to start a simple business but there are 47 different things I supposedly NEED to do first. Website, funnels, email sequences, social media, ads, SEO... I\'m drowning in information. Why is it so hard to just START? The barriers to entry feel artificially high. Worst experience of my life trying to navigate all this.',
    permalink: '/r/entrepreneur/comments/comp1',
    linkFlairText: 'Rant',
    upvoteRatio: 0.94,
    categories: ['complaints', 'strong_emotions', 'desired_outcomes'],
    painPoints: ['Information overload', 'Too many barriers to entry', 'Overwhelming complexity'],
    questions: [],
    buyingTriggers: [],
    objections: ['Too complicated', 'Information paralysis'],
    desiredOutcomes: ['Simple way to start a business', 'Clear path forward'],
    exactPhrases: ['I hate how complicated', 'Why is it so hard to just get started', 'drowning in information'],
    sentiment: 'negative',
    emotionIntensity: 'high',
    emotionType: 'anger',
    contentOpportunity: 'high',
    summary: 'Overwhelmed beginner frustrated by artificial complexity and information overload in the industry.',
    targetAudience: ['beginners', 'first-time entrepreneurs', 'career changers'],
    purchaseIntent: 'none'
  },
  {
    id: 'comp2',
    title: 'This is terrible - I\'ve been ripped off by 3 different service providers now',
    url: 'https://www.reddit.com/r/smallbusiness/comments/comp2',
    subreddit: 'smallbusiness',
    author: 'scammed_owner',
    score: 1567,
    numComments: 134,
    createdUtc: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    selftext: 'Such a pain dealing with unreliable service providers. First my web developer ghosted me after taking $3k. Then the marketing agency delivered nothing. Now my accountant messed up my taxes. I hate that I can\'t find trustworthy people. This is terrible for my business.',
    permalink: '/r/smallbusiness/comments/comp2',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.91,
    categories: ['complaints', 'failed_solutions', 'strong_emotions'],
    painPoints: ['Unreliable service providers', 'Lost money', 'Trust issues'],
    questions: [],
    buyingTriggers: [],
    objections: ['Fear of getting scammed', 'Trust concerns'],
    desiredOutcomes: ['Reliable service providers', 'Trustworthy professionals'],
    exactPhrases: ['This is terrible', 'Such a pain', 'I hate that I can\'t find'],
    sentiment: 'negative',
    emotionIntensity: 'high',
    emotionType: 'anger',
    contentOpportunity: 'high',
    summary: 'Business owner frustrated by unreliable service providers and wasted money.',
    targetAudience: ['small business owners', 'entrepreneurs'],
    purchaseIntent: 'low'
  },

  // FRUSTRATIONS
  {
    id: 'frust1',
    title: 'I\'m TIRED of spinning my wheels. This never works.',
    url: 'https://www.reddit.com/r/marketing/comments/frust1',
    subreddit: 'marketing',
    author: 'exhausted_marketer',
    score: 3420,
    numComments: 267,
    createdUtc: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    selftext: 'I\'m tired of trying every new marketing tactic that comes along. SEO, then Facebook ads, then TikTok, then AI content, then... what\'s next? This never works consistently. I spend months implementing something, it works for a week, then algorithm changes or market shifts. Fed up with the constant grind. Sick and tired of starting over every time. At my wits end with this industry.',
    permalink: '/r/marketing/comments/frust1',
    linkFlairText: 'Rant',
    upvoteRatio: 0.93,
    categories: ['frustrations', 'failed_solutions', 'strong_emotions'],
    painPoints: ['Inconsistent results', 'Constant algorithm changes', 'Starting over repeatedly'],
    questions: [],
    buyingTriggers: [],
    objections: ['Nothing works long-term'],
    desiredOutcomes: ['Consistent, reliable marketing'],
    exactPhrases: ['I\'m tired of', 'This never works', 'Sick and tired', 'At my wits end'],
    sentiment: 'negative',
    emotionIntensity: 'high',
    emotionType: 'exhaustion',
    contentOpportunity: 'high',
    summary: 'Marketer exhausted by inconsistent results and constantly having to start over.',
    targetAudience: ['marketers', 'business owners', 'agency owners'],
    purchaseIntent: 'low'
  },
  {
    id: 'frust2',
    title: 'Done with this. Can\'t stand the hustle culture anymore.',
    url: 'https://www.reddit.com/r/entrepreneur/comments/frust2',
    subreddit: 'entrepreneur',
    author: 'burned_out_mike',
    score: 4521,
    numComments: 389,
    createdUtc: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    selftext: 'Can\'t stand seeing another "rise and grind" post. I\'m tired of feeling guilty for taking a day off. Done with this toxic productivity culture. This never works sustainably. You know what? I built a better business when I STOPPED hustling. But everyone makes you feel like you\'re failing if you\'re not working 80 hour weeks.',
    permalink: '/r/entrepreneur/comments/frust2',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.95,
    categories: ['frustrations', 'misconceptions', 'strong_emotions'],
    painPoints: ['Hustle culture burnout', 'Guilt about rest', 'Toxic productivity'],
    questions: [],
    buyingTriggers: [],
    objections: [],
    desiredOutcomes: ['Sustainable business practices', 'Work-life balance'],
    exactPhrases: ['Can\'t stand', 'I\'m tired of', 'Done with this', 'This never works'],
    sentiment: 'negative',
    emotionIntensity: 'high',
    emotionType: 'frustration',
    contentOpportunity: 'high',
    summary: 'Entrepreneur burned out by hustle culture seeking sustainable alternatives.',
    targetAudience: ['entrepreneurs', 'founders', 'solopreneurs'],
    purchaseIntent: 'none'
  },

  // DESIRED OUTCOMES
  {
    id: 'desire1',
    title: 'I just want a simple, repeatable process. How do I get consistent clients?',
    url: 'https://www.reddit.com/r/consulting/comments/desire1',
    subreddit: 'consulting',
    author: 'seeking_clarity',
    score: 1890,
    numComments: 156,
    createdUtc: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    selftext: 'I just want a straightforward way to get clients every month. Not a complicated funnel, not a 47-step process, not a $5000 course. Just: here\'s who I help, here\'s what I do, here\'s how to work with me. How do I get to a place where clients come to me consistently? Looking for a way to make this predictable instead of feast or famine.',
    permalink: '/r/consulting/comments/desire1',
    linkFlairText: 'Question',
    upvoteRatio: 0.92,
    categories: ['desired_outcomes', 'repeated_questions'],
    painPoints: ['Inconsistent clients', 'Feast or famine cycle', 'Complicated processes'],
    questions: ['How do I get consistent clients?', 'How do I make this predictable?'],
    buyingTriggers: [],
    objections: [],
    desiredOutcomes: ['Simple repeatable process', 'Consistent client flow', 'Predictable revenue'],
    exactPhrases: ['I just want', 'How do I get', 'Looking for a way to'],
    sentiment: 'neutral',
    emotionIntensity: 'medium',
    contentOpportunity: 'high',
    summary: 'Consultant seeking simple, repeatable client acquisition process.',
    targetAudience: ['consultants', 'freelancers', 'service providers'],
    purchaseIntent: 'medium'
  },
  {
    id: 'desire2',
    title: 'I wish there was a way to scale without hiring a huge team',
    url: 'https://www.reddit.com/r/agency/comments/desire2',
    subreddit: 'agency',
    author: 'scaling_seeker',
    score: 1234,
    numComments: 98,
    createdUtc: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Goal is to double revenue but I don\'t want to manage 20 people. I want to achieve more with less overhead. Need help to figure out how to leverage systems, automation, or better positioning. Want to achieve freedom, not create a job for myself managing people.',
    permalink: '/r/agency/comments/desire2',
    linkFlairText: 'Strategy',
    upvoteRatio: 0.89,
    categories: ['desired_outcomes', 'fears'],
    painPoints: ['Scaling challenges', 'Team management burden', 'Overhead concerns'],
    questions: [],
    buyingTriggers: [],
    objections: ['Don\'t want to manage people'],
    desiredOutcomes: ['Scale without hiring', 'Automated systems', 'Freedom from management'],
    exactPhrases: ['I wish there was', 'Goal is to', 'Need help to', 'Want to achieve'],
    sentiment: 'neutral',
    emotionIntensity: 'low',
    contentOpportunity: 'high',
    summary: 'Agency owner wants to scale revenue without scaling headcount.',
    targetAudience: ['agency owners', 'service business owners'],
    purchaseIntent: 'medium'
  },

  // FAILED SOLUTIONS
  {
    id: 'failed1',
    title: 'I tried EVERYTHING - courses, coaching, software. Nothing worked.',
    url: 'https://www.reddit.com/r/entrepreneur/comments/failed1',
    subreddit: 'entrepreneur',
    author: 'tried_it_all',
    score: 2890,
    numComments: 234,
    createdUtc: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    selftext: 'I tried Course A ($2000) - was a waste of money, just fluff. I tried Coaching Program B ($5000) - complete disaster, coach barely showed up. I tried Software C ($300/month) - failed miserably, too complicated. Should have known better than to trust the marketing. Money down the drain. Total spent: over $15k in the last 2 years with nothing to show for it.',
    permalink: '/r/entrepreneur/comments/failed1',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.94,
    categories: ['failed_solutions', 'objections', 'strong_emotions'],
    painPoints: ['Wasted money on courses', 'Unhelpful coaching', 'Complicated software'],
    questions: [],
    buyingTriggers: [],
    objections: ['Courses are waste of money', 'Coaching doesn\'t work', 'Software too complicated'],
    desiredOutcomes: [],
    exactPhrases: ['I tried', 'was a waste of', 'complete disaster', 'failed miserably', 'Should have known better', 'Money down the drain'],
    sentiment: 'negative',
    emotionIntensity: 'high',
    emotionType: 'regret',
    contentOpportunity: 'high',
    summary: 'Entrepreneur spent $15k+ on courses, coaching, and software with no results.',
    targetAudience: ['entrepreneurs', 'course buyers', 'coaching clients'],
    purchaseIntent: 'low'
  },
  {
    id: 'failed2',
    title: 'Cold outreach was a waste of 6 months. Here\'s what I learned.',
    url: 'https://www.reddit.com/r/sales/comments/failed2',
    subreddit: 'sales',
    author: 'cold_emailer',
    score: 1567,
    numComments: 123,
    createdUtc: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    selftext: 'Sent 5000 cold emails. Got 3 replies. 0 clients. I tried the "proven templates" and the "guaranteed system" - didn\'t work for my industry. The gurus selling these courses don\'t mention that cold outreach is dead for most B2B. Complete waste of time that I\'ll never get back.',
    permalink: '/r/sales/comments/failed2',
    linkFlairText: 'Lesson Learned',
    upvoteRatio: 0.91,
    categories: ['failed_solutions', 'misconceptions'],
    painPoints: ['Low response rates', 'Wasted time', 'Generic advice doesn\'t work'],
    questions: [],
    buyingTriggers: [],
    objections: ['Cold outreach doesn\'t work'],
    desiredOutcomes: ['Better lead generation method'],
    exactPhrases: ['was a waste of', 'I tried', 'didn\'t work', 'Complete waste of time'],
    sentiment: 'negative',
    emotionIntensity: 'medium',
    contentOpportunity: 'high',
    summary: 'Sales professional discovered cold outreach doesn\'t work in their industry.',
    targetAudience: ['sales professionals', 'B2B businesses'],
    purchaseIntent: 'low'
  },

  // COMPARISONS
  {
    id: 'compare1',
    title: 'Platform A vs Platform B - Which is better for a complete beginner?',
    url: 'https://www.reddit.com/r/ecommerce/comments/compare1',
    subreddit: 'ecommerce',
    author: 'choosing_platform',
    score: 1890,
    numComments: 234,
    createdUtc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Trying to decide between Platform A and Platform B for my first online store. Which is better for someone with zero technical skills? I\'ve compared features but I\'m still confused. Difference between them seems small but prices are very different. Is the more expensive one actually better or just better marketed?',
    permalink: '/r/ecommerce/comments/compare1',
    linkFlairText: 'Question',
    upvoteRatio: 0.88,
    categories: ['comparisons', 'repeated_questions'],
    painPoints: ['Decision paralysis', 'Unclear differences', 'Price confusion'],
    questions: ['Which is better for beginners?', 'Is the expensive one worth it?'],
    buyingTriggers: [],
    objections: ['Price concerns'],
    desiredOutcomes: ['Right platform choice', 'Clear recommendation'],
    exactPhrases: ['vs', 'Which is better', 'compared to', 'Difference between'],
    sentiment: 'neutral',
    emotionIntensity: 'low',
    contentOpportunity: 'high',
    summary: 'Beginner e-commerce seller comparing platforms and seeking guidance.',
    targetAudience: ['e-commerce beginners', 'online sellers', 'store owners'],
    purchaseIntent: 'high'
  },
  {
    id: 'compare2',
    title: 'Hiring an agency vs doing it yourself - real experiences?',
    url: 'https://www.reddit.com/r/marketing/comments/compare2',
    subreddit: 'marketing',
    author: 'agency_question',
    score: 2345,
    numComments: 189,
    createdUtc: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Compared to hiring an agency, is DIY marketing actually viable? Better alternative to agencies? Agency quoted me $5k/month. Versus spending 20 hours/week doing it myself. What\'s the actual ROI difference? Has anyone compared both approaches?',
    permalink: '/r/marketing/comments/compare2',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.90,
    categories: ['comparisons', 'objections'],
    painPoints: ['Agency costs', 'Time investment', 'ROI uncertainty'],
    questions: ['Is DIY viable vs agency?', 'What\'s the ROI difference?'],
    buyingTriggers: [],
    objections: ['Agency too expensive'],
    desiredOutcomes: ['Cost-effective marketing solution'],
    exactPhrases: ['vs', 'Compared to', 'Better alternative to', 'Versus'],
    sentiment: 'neutral',
    emotionIntensity: 'low',
    contentOpportunity: 'high',
    summary: 'Business owner weighing agency vs DIY marketing approach.',
    targetAudience: ['small business owners', 'entrepreneurs'],
    purchaseIntent: 'medium'
  },

  // OBJECTIONS
  {
    id: 'object1',
    title: 'Too expensive for what you get - honest review of popular tool',
    url: 'https://www.reddit.com/r/SaaS/comments/object1',
    subreddit: 'SaaS',
    author: 'honest_reviewer',
    score: 3456,
    numComments: 289,
    createdUtc: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Not worth it. $297/month for features I can get elsewhere for free. Overpriced for what it does. Rip-off pricing model. Not enough value to justify the cost. Waste of money compared to alternatives. They market it like it\'s revolutionary but it\'s just a prettier interface on basic functionality.',
    permalink: '/r/SaaS/comments/object1',
    linkFlairText: 'Review',
    upvoteRatio: 0.92,
    categories: ['objections', 'complaints', 'comparisons'],
    painPoints: ['Overpriced software', 'Free alternatives exist', 'Limited functionality'],
    questions: [],
    buyingTriggers: [],
    objections: ['Too expensive', 'Not worth it', 'Better free alternatives', 'Rip-off'],
    desiredOutcomes: ['Fair pricing', 'Value for money'],
    exactPhrases: ['Too expensive', 'Not worth it', 'Overpriced', 'Rip-off', 'Waste of money', 'Not enough value'],
    sentiment: 'negative',
    emotionIntensity: 'medium',
    contentOpportunity: 'high',
    summary: 'User feels SaaS product is overpriced compared to free alternatives.',
    targetAudience: ['SaaS users', 'software buyers', 'small businesses'],
    purchaseIntent: 'none'
  },
  {
    id: 'object2',
    title: 'Can\'t afford to take the risk right now - anyone else in same boat?',
    url: 'https://www.reddit.com/r/entrepreneur/comments/object2',
    subreddit: 'entrepreneur',
    author: 'risk_aware',
    score: 1234,
    numComments: 98,
    createdUtc: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'I want to invest in my business but the monthly commitment scares me. What if it doesn\'t work? Can\'t afford to waste more money. Not ready to pay these prices when I\'m not sure of ROI. Need to see proof it works first before committing.',
    permalink: '/r/entrepreneur/comments/object2',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.89,
    categories: ['objections', 'fears'],
    painPoints: ['Budget constraints', 'Risk aversion', 'Uncertain ROI'],
    questions: [],
    buyingTriggers: [],
    objections: ['Can\'t afford', 'Risk too high', 'Need proof before paying'],
    desiredOutcomes: ['Guaranteed results', 'Lower risk investment'],
    exactPhrases: ['Can\'t afford', 'Not ready to pay', 'What if it doesn\'t work'],
    sentiment: 'negative',
    emotionIntensity: 'medium',
    emotionType: 'anxiety',
    contentOpportunity: 'high',
    summary: 'Entrepreneur hesitant to invest due to budget and risk concerns.',
    targetAudience: ['budget-conscious entrepreneurs', 'risk-averse buyers'],
    purchaseIntent: 'low'
  },

  // FEARS
  {
    id: 'fear1',
    title: 'What if I make the wrong choice? Terrified of committing to the wrong path.',
    url: 'https://www.reddit.com/r/careerguidance/comments/fear1',
    subreddit: 'careerguidance',
    author: 'anxious_chooser',
    score: 2345,
    numComments: 189,
    createdUtc: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'I\'m afraid of wasting another 2 years on something that won\'t work. Scared that I\'ll invest everything and fail. What if I\'m not cut out for this? Worried about making the wrong decision. Terrified of looking back with regret. I\'ve been stuck in analysis paralysis for months because I\'m scared of choosing wrong.',
    permalink: '/r/careerguidance/comments/fear1',
    linkFlairText: 'Advice Needed',
    upvoteRatio: 0.93,
    categories: ['fears', 'strong_emotions', 'desired_outcomes'],
    painPoints: ['Analysis paralysis', 'Fear of failure', 'Regret about past choices'],
    questions: [],
    buyingTriggers: [],
    objections: ['Fear of wrong choice'],
    desiredOutcomes: ['Certainty in decision', 'Guaranteed success path'],
    exactPhrases: ['What if', 'I\'m afraid', 'Scared that', 'Worried about', 'Terrified of'],
    sentiment: 'negative',
    emotionIntensity: 'high',
    emotionType: 'fear',
    contentOpportunity: 'high',
    summary: 'Person paralyzed by fear of making wrong career/business decision.',
    targetAudience: ['career changers', 'aspiring entrepreneurs', 'indecisive buyers'],
    purchaseIntent: 'low'
  },
  {
    id: 'fear2',
    title: 'I don\'t want to get scammed again. How do I verify someone is legit?',
    url: 'https://www.reddit.com/r/entrepreneur/comments/fear2',
    subreddit: 'entrepreneur',
    author: 'scam_wary',
    score: 1890,
    numComments: 156,
    createdUtc: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'After getting burned before, I\'m anxious about trusting anyone. Scared that the next "expert" will just take my money and run. How do you verify someone actually knows what they\'re talking about? Worried about testimonials being fake. I don\'t want to lose more money.',
    permalink: '/r/entrepreneur/comments/fear2',
    linkFlairText: 'Question',
    upvoteRatio: 0.91,
    categories: ['fears', 'failed_solutions'],
    painPoints: ['Past scams', 'Trust issues', 'Verification difficulty'],
    questions: ['How do I verify legitimacy?'],
    buyingTriggers: [],
    objections: ['Trust concerns', 'Fear of scams'],
    desiredOutcomes: ['Verifiable expertise', 'Trustworthy providers'],
    exactPhrases: ['I don\'t want to', 'I\'m anxious about', 'Scared that', 'Worried about'],
    sentiment: 'negative',
    emotionIntensity: 'medium',
    emotionType: 'anxiety',
    contentOpportunity: 'high',
    summary: 'Previously scammed person seeking ways to verify legitimacy.',
    targetAudience: ['scam victims', 'cautious buyers'],
    purchaseIntent: 'low'
  },

  // URGENT PROBLEMS
  {
    id: 'urgent1',
    title: 'Need help ASAP - client project due tomorrow and everything broke!',
    url: 'https://www.reddit.com/r/webdev/comments/urgent1',
    subreddit: 'webdev',
    author: 'desperate_dev',
    score: 890,
    numComments: 78,
    createdUtc: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    selftext: 'EMERGENCY! Need a quick fix ASAP. My deployment failed and I need help right away. Looking for the fastest way to resolve this. Client presentation is tomorrow morning. Any fast way to rollback or fix this? Urgent help needed!',
    permalink: '/r/webdev/comments/urgent1',
    linkFlairText: 'Help',
    upvoteRatio: 0.85,
    categories: ['urgent_problems', 'strong_emotions'],
    painPoints: ['Deployment failure', 'Client deadline', 'Technical issues'],
    questions: ['How to fix deployment quickly?'],
    buyingTriggers: [],
    objections: [],
    desiredOutcomes: ['Quick fix', 'Solution within hours'],
    exactPhrases: ['ASAP', 'quick fix', 'right away', 'Urgent', 'EMERGENCY', 'fast way'],
    sentiment: 'negative',
    emotionIntensity: 'high',
    emotionType: 'panic',
    contentOpportunity: 'medium',
    summary: 'Developer in emergency situation needing immediate deployment fix.',
    targetAudience: ['developers', 'freelancers', 'agencies'],
    purchaseIntent: 'high',
    timelineMentioned: 'tomorrow'
  },
  {
    id: 'urgent2',
    title: 'QUICK FIX NEEDED - website down and losing sales every minute',
    url: 'https://www.reddit.com/r/ecommerce/comments/urgent2',
    subreddit: 'ecommerce',
    author: 'losing_money',
    score: 1234,
    numComments: 98,
    createdUtc: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    selftext: 'Store crashed during our biggest promotion. Need help immediately! Losing $100s per minute. Anyone know a fast way to diagnose server issues? ASAP help appreciated. This is an emergency for my business.',
    permalink: '/r/ecommerce/comments/urgent2',
    linkFlairText: 'URGENT',
    upvoteRatio: 0.88,
    categories: ['urgent_problems', 'strong_emotions', 'objections'],
    painPoints: ['Website downtime', 'Lost revenue', 'No technical knowledge'],
    questions: [],
    buyingTriggers: [],
    objections: [],
    desiredOutcomes: ['Immediate fix', 'Prevent future downtime'],
    exactPhrases: ['QUICK FIX', 'immediately', 'ASAP', 'fast way', 'emergency'],
    sentiment: 'negative',
    emotionIntensity: 'high',
    emotionType: 'panic',
    contentOpportunity: 'medium',
    summary: 'E-commerce store owner losing money during site outage.',
    targetAudience: ['e-commerce owners', 'online sellers'],
    purchaseIntent: 'high',
    budgetMentioned: true
  },

  // REPEATED QUESTIONS
  {
    id: 'repeat1',
    title: 'Does anyone know how to actually get clients without cold outreach?',
    url: 'https://www.reddit.com/r/freelance/comments/repeat1',
    subreddit: 'freelance',
    author: 'client_seeker',
    score: 4567,
    numComments: 456,
    createdUtc: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Does anyone know a reliable way to get clients? I see this question asked all the time but never see real answers. Has anyone tried inbound marketing? Can someone explain how you actually get discovered? What\'s the best way to build pipeline without being salesy? I feel like I\'ve read 100 posts on this but still no clear answer.',
    permalink: '/r/freelance/comments/repeat1',
    linkFlairText: 'Question',
    upvoteRatio: 0.92,
    categories: ['repeated_questions', 'desired_outcomes'],
    painPoints: ['No client acquisition strategy', 'Inconsistent work', 'Tired of cold outreach'],
    questions: ['How to get clients without cold outreach?', 'How to get discovered?', 'How to build pipeline?'],
    buyingTriggers: [],
    objections: ['Don\'t want to do cold outreach'],
    desiredOutcomes: ['Reliable client source', 'Inbound leads'],
    exactPhrases: ['Does anyone know', 'Has anyone tried', 'Can someone explain', 'What\'s the best way to'],
    sentiment: 'neutral',
    emotionIntensity: 'low',
    contentOpportunity: 'high',
    summary: 'Frequently asked question about client acquisition alternatives.',
    targetAudience: ['freelancers', 'consultants', 'service providers'],
    purchaseIntent: 'medium'
  },
  {
    id: 'repeat2',
    title: 'Is there a way to automate this without spending a fortune?',
    url: 'https://www.reddit.com/r/smallbusiness/comments/repeat2',
    subreddit: 'smallbusiness',
    author: 'automation_asker',
    score: 2890,
    numComments: 234,
    createdUtc: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'This gets asked a lot but I still don\'t have a good answer. Is there a way to automate client onboarding? Every solution I find costs $500+/month. What tools do you actually use? Same question for invoicing, scheduling, follow-ups. The "affordable" options never seem to do enough.',
    permalink: '/r/smallbusiness/comments/repeat2',
    linkFlairText: 'Question',
    upvoteRatio: 0.91,
    categories: ['repeated_questions', 'objections'],
    painPoints: ['Manual processes', 'Expensive automation tools', 'Time-consuming tasks'],
    questions: ['How to automate affordably?', 'What tools work best?'],
    buyingTriggers: [],
    objections: ['Automation too expensive'],
    desiredOutcomes: ['Affordable automation', 'Streamlined processes'],
    exactPhrases: ['Is there a way to', 'What tools do you', 'This gets asked a lot'],
    sentiment: 'neutral',
    emotionIntensity: 'low',
    contentOpportunity: 'high',
    summary: 'Repeated question about affordable automation solutions.',
    targetAudience: ['small business owners', 'solopreneurs'],
    purchaseIntent: 'medium'
  },

  // STRONG EMOTIONS
  {
    id: 'emotion1',
    title: 'I am FURIOUS with this company. WORST decision I ever made.',
    url: 'https://www.reddit.com/r/Business/comments/emotion1',
    subreddit: 'Business',
    author: 'angry_customer',
    score: 5678,
    numComments: 567,
    createdUtc: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    selftext: 'I HATE this so much. Signed up for their "premium" service and it\'s been nothing but problems. Customer service is non-existent. They charged me 3 times! I\'m so angry I can barely type. WORST experience of my professional life. Stay FAR away from this company. Absolutely devastated that I wasted months on this.',
    permalink: '/r/Business/comments/emotion1',
    linkFlairText: 'Warning',
    upvoteRatio: 0.95,
    categories: ['strong_emotions', 'complaints', 'non_buying_reasons'],
    painPoints: ['Terrible service', 'Billing issues', 'No support'],
    questions: [],
    buyingTriggers: [],
    objections: ['Terrible customer service', 'Billing problems'],
    desiredOutcomes: [],
    exactPhrases: ['FURIOUS', 'HATE this so much', 'WORST decision', 'WORST experience', 'so angry', 'Stay FAR away', 'Absolutely devastated'],
    sentiment: 'negative',
    emotionIntensity: 'high',
    emotionType: 'anger',
    contentOpportunity: 'medium',
    summary: 'Extremely angry customer sharing terrible experience with a company.',
    targetAudience: ['business owners', 'B2B buyers'],
    purchaseIntent: 'none'
  },
  {
    id: 'emotion2',
    title: 'BEST decision I ever made! So happy I finally did this.',
    url: 'https://www.reddit.com/r/entrepreneur/comments/emotion2',
    subreddit: 'entrepreneur',
    author: 'happy_customer',
    score: 3456,
    numComments: 289,
    createdUtc: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    selftext: 'I absolutely love what this has done for my business. BEST purchase I\'ve made in 5 years. Changed everything for me. So happy I took the plunge despite my fears. I was skeptical but WOW am I glad I did it. Just wanted to share because I know others are on the fence.',
    permalink: '/r/entrepreneur/comments/emotion2',
    linkFlairText: 'Success Story',
    upvoteRatio: 0.94,
    categories: ['strong_emotions', 'buying_triggers', 'before_after'],
    painPoints: [],
    questions: [],
    buyingTriggers: ['Overcame skepticism', 'Worth the investment', 'Results exceeded expectations'],
    objections: [],
    desiredOutcomes: [],
    exactPhrases: ['BEST decision', 'absolutely love', 'BEST purchase', 'Changed everything', 'So happy', 'WOW'],
    sentiment: 'positive',
    emotionIntensity: 'high',
    emotionType: 'joy',
    contentOpportunity: 'medium',
    summary: 'Extremely satisfied customer sharing positive experience.',
    targetAudience: ['entrepreneurs', 'on-the-fence buyers'],
    purchaseIntent: 'high'
  },

  // BEFORE/AFTER STORIES
  {
    id: 'before1',
    title: 'I used to work 80 hours/week. Now I work 20. Here\'s what changed.',
    url: 'https://www.reddit.com/r/entrepreneur/comments/before1',
    subreddit: 'entrepreneur',
    author: 'transformed_owner',
    score: 6789,
    numComments: 567,
    createdUtc: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'I used to struggle with doing everything myself. Before I found this approach, I was burned out and ready to quit. Now I finally have time for my family. Transformed my business from a job into an actual business. Changed everything when I realized I was the bottleneck. Used to think I had to do it all - now I know better.',
    permalink: '/r/entrepreneur/comments/before1',
    linkFlairText: 'Case Study',
    upvoteRatio: 0.96,
    categories: ['before_after', 'buying_triggers', 'desired_outcomes'],
    painPoints: [],
    questions: [],
    buyingTriggers: ['Realization about delegation', 'Finding right approach', 'Systems implementation'],
    objections: [],
    desiredOutcomes: ['Work-life balance', 'Scalable business'],
    exactPhrases: ['I used to', 'Before I found', 'Now I finally', 'Transformed my', 'Changed everything'],
    sentiment: 'positive',
    emotionIntensity: 'medium',
    contentOpportunity: 'high',
    summary: 'Entrepreneur shares transformation from burnout to balanced life.',
    targetAudience: ['overworked entrepreneurs', 'business owners'],
    purchaseIntent: 'medium'
  },
  {
    id: 'before2',
    title: 'From $0 to $10k months - my journey (what I did differently)',
    url: 'https://www.reddit.com/r/freelance/comments/before2',
    subreddit: 'freelance',
    author: 'success_story',
    score: 4567,
    numComments: 389,
    createdUtc: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'I used to barely scrape by with $1-2k months. Before I made these changes, I was considering giving up. Now I consistently hit $10k+ and actually enjoy my work. Finally able to save money and plan for the future. What changed? I stopped chasing every client and got specific about who I help.',
    permalink: '/r/freelance/comments/before2',
    linkFlairText: 'Success',
    upvoteRatio: 0.94,
    categories: ['before_after', 'buying_triggers', 'desired_outcomes'],
    painPoints: [],
    questions: [],
    buyingTriggers: ['Niche specialization', 'Better positioning', 'Raising prices'],
    objections: [],
    desiredOutcomes: ['Consistent high income', 'Enjoyable work'],
    exactPhrases: ['I used to', 'Before I made', 'Now I consistently', 'Finally able to'],
    sentiment: 'positive',
    emotionIntensity: 'medium',
    contentOpportunity: 'high',
    summary: 'Freelancer shares journey from struggling to thriving through niche focus.',
    targetAudience: ['freelancers', 'consultants', 'service providers'],
    purchaseIntent: 'medium'
  },

  // MISCONCEPTIONS
  {
    id: 'miscon1',
    title: 'I thought success would feel different. I was wrong about everything.',
    url: 'https://www.reddit.com/r/entrepreneur/comments/miscon1',
    subreddit: 'entrepreneur',
    author: 'enlightened_one',
    score: 3456,
    numComments: 289,
    createdUtc: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'I thought having a big following meant success. I believed that revenue was the only metric that mattered. I assumed more clients = better business. Had no idea that the opposite was true. Was wrong about almost everything. I thought the hard part was starting - didn\'t realize the hard part is scaling sustainably while maintaining sanity.',
    permalink: '/r/entrepreneur/comments/miscon1',
    linkFlairText: 'Reflection',
    upvoteRatio: 0.93,
    categories: ['misconceptions', 'before_after'],
    painPoints: [],
    questions: [],
    buyingTriggers: [],
    objections: [],
    desiredOutcomes: [],
    exactPhrases: ['I thought', 'I believed that', 'I assumed', 'Had no idea', 'Was wrong about', 'didn\'t realize'],
    sentiment: 'neutral',
    emotionIntensity: 'low',
    contentOpportunity: 'high',
    summary: 'Entrepreneur discovers their assumptions about success were wrong.',
    targetAudience: ['entrepreneurs', 'business owners', 'aspiring founders'],
    purchaseIntent: 'low'
  },
  {
    id: 'miscon2',
    title: 'I misunderstood what "building in public" actually means',
    url: 'https://www.reddit.com/r/startups/comments/miscon2',
    subreddit: 'startups',
    author: 'learning_public',
    score: 2345,
    numComments: 189,
    createdUtc: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Thought it meant sharing every win. I was wrong - it\'s about sharing the struggles too. Misunderstood that vulnerability builds trust more than success posts. Had no idea that people connect more with failures than victories. I assumed people only want to see the highlight reel. Completely changed my approach now.',
    permalink: '/r/startups/comments/miscon2',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.91,
    categories: ['misconceptions', 'before_after'],
    painPoints: [],
    questions: [],
    buyingTriggers: [],
    objections: [],
    desiredOutcomes: ['Authentic connection', 'Trust building'],
    exactPhrases: ['Thought it meant', 'I was wrong', 'Misunderstood', 'Had no idea', 'I assumed'],
    sentiment: 'neutral',
    emotionIntensity: 'low',
    contentOpportunity: 'high',
    summary: 'Founder learns authentic sharing beats highlight reels.',
    targetAudience: ['startup founders', 'content creators'],
    purchaseIntent: 'low'
  },

  // BUYING TRIGGERS
  {
    id: 'buying1',
    title: 'Finally bought [Product] because I was tired of losing money every month',
    url: 'https://www.reddit.com/r/smallbusiness/comments/buying1',
    subreddit: 'smallbusiness',
    author: 'finally_converted',
    score: 1890,
    numComments: 156,
    createdUtc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Took the plunge after calculating I was losing $2k/month in inefficiency. Decided to purchase when I saw the ROI calculator. Pulled the trigger because the guarantee removed my risk. Best purchase I\'ve made this year. Why I bought: it solves exactly the problem that was keeping me up at night. Glad I bought it.',
    permalink: '/r/smallbusiness/comments/buying1',
    linkFlairText: 'Review',
    upvoteRatio: 0.92,
    categories: ['buying_triggers', 'desired_outcomes'],
    painPoints: [],
    questions: [],
    buyingTriggers: ['Calculated cost of inaction', 'ROI visibility', 'Money-back guarantee', 'Exact problem match'],
    objections: [],
    desiredOutcomes: ['Stop losing money', 'Efficiency gains'],
    exactPhrases: ['Finally bought', 'Took the plunge', 'Decided to purchase', 'Pulled the trigger', 'Best purchase', 'Why I bought', 'Glad I bought'],
    sentiment: 'positive',
    emotionIntensity: 'medium',
    contentOpportunity: 'high',
    summary: 'Customer shares the exact triggers that motivated their purchase decision.',
    targetAudience: ['on-the-fence buyers', 'budget-conscious owners'],
    purchaseIntent: 'high'
  },
  {
    id: 'buying2',
    title: 'What made me finally sign up after 6 months of hesitation',
    url: 'https://www.reddit.com/r/SaaS/comments/buying2',
    subreddit: 'SaaS',
    author: 'converted_user',
    score: 1234,
    numComments: 98,
    createdUtc: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Watched their free training and realized they actually know what they\'re talking about. Signed up immediately after the demo call - no pressure, just answers. Purchased because of the community aspect others don\'t have. The trigger was seeing real user results, not marketing claims.',
    permalink: '/r/SaaS/comments/buying2',
    linkFlairText: 'Discussion',
    upvoteRatio: 0.90,
    categories: ['buying_triggers', 'fears'],
    painPoints: [],
    questions: [],
    buyingTriggers: ['Free value first', 'No-pressure demo', 'Community proof', 'Real user results'],
    objections: [],
    desiredOutcomes: [],
    exactPhrases: ['finally sign up', 'Signed up immediately', 'Purchased because', 'The trigger was'],
    sentiment: 'positive',
    emotionIntensity: 'low',
    contentOpportunity: 'high',
    summary: 'User shares what converted them from hesitant prospect to customer.',
    targetAudience: ['SaaS buyers', 'hesitant prospects'],
    purchaseIntent: 'high'
  },

  // NON-BUYING REASONS
  {
    id: 'nobuy1',
    title: 'I didn\'t buy because the sales call felt like a hostage situation',
    url: 'https://www.reddit.com/r/entrepreneur/comments/nobuy1',
    subreddit: 'entrepreneur',
    author: 'escaped_prospect',
    score: 4567,
    numComments: 456,
    createdUtc: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'I was ready to buy until the call. Decided against it after they wouldn\'t give me a straight answer on pricing. Chose not to move forward because of the high-pressure tactics. Why I won\'t buy: if they\'re this pushy in sales, imagine what support is like. Returned it after 2 days when I realized the onboarding was terrible.',
    permalink: '/r/entrepreneur/comments/nobuy1',
    linkFlairText: 'Warning',
    upvoteRatio: 0.94,
    categories: ['non_buying_reasons', 'complaints'],
    painPoints: [],
    questions: [],
    buyingTriggers: [],
    objections: ['Pushy sales tactics', 'Hidden pricing', 'Poor onboarding'],
    desiredOutcomes: ['Transparent pricing', 'No-pressure sales'],
    exactPhrases: ['I didn\'t buy', 'Decided against', 'Chose not to', 'Why I won\'t buy', 'Returned it'],
    sentiment: 'negative',
    emotionIntensity: 'medium',
    contentOpportunity: 'high',
    summary: 'Lost sale due to high-pressure sales tactics and poor experience.',
    targetAudience: ['sales professionals', 'SaaS companies'],
    purchaseIntent: 'none'
  },
  {
    id: 'nobuy2',
    title: 'Cancelled my subscription - here\'s why they lost me as a customer',
    url: 'https://www.reddit.com/r/Business/comments/nobuy2',
    subreddit: 'Business',
    author: 'churned_customer',
    score: 2345,
    numComments: 189,
    createdUtc: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'Asked for a refund after 30 days. Why I cancelled: promised features never shipped, support takes 5 days to respond, and competitors offer the same thing for half the price. I didn\'t renew because the value just isn\'t there anymore. They got me in with great marketing but couldn\'t keep me with results.',
    permalink: '/r/Business/comments/nobuy2',
    linkFlairText: 'Feedback',
    upvoteRatio: 0.92,
    categories: ['non_buying_reasons', 'objections', 'comparisons'],
    painPoints: [],
    questions: [],
    buyingTriggers: [],
    objections: ['Missing features', 'Slow support', 'Better alternatives', 'Poor value'],
    desiredOutcomes: [],
    exactPhrases: ['Cancelled my', 'Asked for a refund', 'Why I cancelled', 'I didn\'t renew'],
    sentiment: 'negative',
    emotionIntensity: 'medium',
    contentOpportunity: 'high',
    summary: 'Customer churns due to unfulfilled promises and better alternatives.',
    targetAudience: ['SaaS companies', 'subscription businesses'],
    purchaseIntent: 'none'
  },

  // EXACT PHRASES / ADDITIONAL EXAMPLES
  {
    id: 'phrase1',
    title: 'Game changer - worth every penny',
    url: 'https://www.reddit.com/r/productivity/comments/phrase1',
    subreddit: 'productivity',
    author: 'phrase_user',
    score: 987,
    numComments: 78,
    createdUtc: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    selftext: 'This tool is a game changer. Worth every penny I paid. It\'s a steal at this price. No-brainer decision. Hands down the best investment I\'ve made. Should have done this years ago. Massive ROI from day one. Can\'t imagine going back to how I did things before.',
    permalink: '/r/productivity/comments/phrase1',
    linkFlairText: 'Review',
    upvoteRatio: 0.91,
    categories: ['exact_phrases', 'buying_triggers'],
    painPoints: [],
    questions: [],
    buyingTriggers: ['Clear ROI', 'Immediate value', 'Worth the investment'],
    objections: [],
    desiredOutcomes: [],
    exactPhrases: ['Game changer', 'Worth every penny', 'steal at this price', 'No-brainer', 'Hands down', 'Should have done this years ago', 'Massive ROI', 'Can\'t imagine going back'],
    sentiment: 'positive',
    emotionIntensity: 'medium',
    contentOpportunity: 'high',
    summary: 'Collection of exact phrases customers use to describe value.',
    targetAudience: ['marketers', 'copywriters', 'sales teams'],
    purchaseIntent: 'high'
  }
];

export class RedditScraper {
  /**
   * Get all sample posts (pre-analyzed)
   */
  getSamplePosts(): AnalyzedPost[] {
    return SAMPLE_POSTS;
  }

  /**
   * Filter posts by categories
   */
  private filterByCategories(posts: AnalyzedPost[], categories: InsightCategory[]): AnalyzedPost[] {
    if (!categories || categories.length === 0) return posts;
    return posts.filter(post => 
      post.categories?.some(cat => categories.includes(cat))
    );
  }

  /**
   * Filter posts by search query
   */
  private filterByQuery(posts: AnalyzedPost[], query: string): AnalyzedPost[] {
    if (!query || !query.trim()) return posts;
    const queryLower = query.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(queryLower) ||
      post.selftext.toLowerCase().includes(queryLower) ||
      post.subreddit.toLowerCase().includes(queryLower) ||
      post.painPoints?.some(p => p.toLowerCase().includes(queryLower)) ||
      post.questions?.some(q => q.toLowerCase().includes(queryLower)) ||
      post.exactPhrases?.some(p => p.toLowerCase().includes(queryLower)) ||
      post.categories?.some(c => c.includes(queryLower as InsightCategory))
    );
  }

  /**
   * Filter by subreddits
   */
  private filterBySubreddits(posts: AnalyzedPost[], subreddits: string[]): AnalyzedPost[] {
    if (!subreddits || subreddits.length === 0) return posts;
    return posts.filter(post => 
      subreddits.some(sub => 
        post.subreddit.toLowerCase().includes(sub.replace('r/', '').toLowerCase())
      )
    );
  }

  /**
   * Search for posts matching specific insight categories
   */
  async searchByCategories(
    categories: InsightCategory[],
    subreddits: string[] = [],
    maxResults: number = 50
  ): Promise<ScrapingResult> {
    let results = this.filterByCategories(SAMPLE_POSTS, categories);
    
    if (subreddits.length > 0) {
      results = this.filterBySubreddits(results, subreddits);
    }

    const categoriesFound = [...new Set(results.flatMap(p => p.categories || []))];

    return {
      success: true,
      posts: results.slice(0, maxResults) as unknown as RedditPost[],
      errors: [],
      metadata: {
        totalFound: results.length,
        totalProcessed: Math.min(results.length, maxResults),
        scrapedAt: new Date().toISOString(),
        categoriesFound
      }
    };
  }

  /**
   * Run full scraping workflow
   */
  async scrape(config: ScrapingConfig = DEFAULT_CONFIG): Promise<ScrapingResult> {
    console.log('Starting audience research scrape with config:', JSON.stringify(config, null, 2));

    let allPosts: AnalyzedPost[] = [...SAMPLE_POSTS];

    // Filter by categories if specified
    if (config.categories && config.categories.length > 0) {
      allPosts = this.filterByCategories(allPosts, config.categories);
    }

    // Filter by topics/query
    if (config.topics && config.topics.length > 0) {
      const topicQuery = config.topics.join(' ');
      allPosts = this.filterByQuery(allPosts, topicQuery);
    }

    // Filter by subreddits
    if (config.subreddits && config.subreddits.length > 0) {
      allPosts = this.filterBySubreddits(allPosts, config.subreddits);
    }

    // Filter by keywords
    if (config.keywords && config.keywords.length > 0) {
      const keywordQuery = config.keywords.join(' ');
      allPosts = this.filterByQuery(allPosts, keywordQuery);
    }

    const categoriesFound = [...new Set(allPosts.flatMap(p => p.categories || []))];

    return {
      success: true,
      posts: allPosts.slice(0, config.maxPosts) as unknown as RedditPost[],
      errors: [],
      metadata: {
        totalFound: allPosts.length,
        totalProcessed: Math.min(allPosts.length, config.maxPosts),
        scrapedAt: new Date().toISOString(),
        categoriesFound
      }
    };
  }

  /**
   * Quick search for a single topic/query
   */
  async quickSearch(
    query: string, 
    config: ScrapingConfig = DEFAULT_CONFIG
  ): Promise<ScrapingResult> {
    console.log(`Quick search for: ${query}`);

    let allPosts: AnalyzedPost[] = [...SAMPLE_POSTS];

    // Filter by query
    if (query && query.trim()) {
      allPosts = this.filterByQuery(allPosts, query);
    }

    // Filter by categories if specified
    if (config.categories && config.categories.length > 0) {
      allPosts = this.filterByCategories(allPosts, config.categories);
    }

    // Filter by subreddits
    if (config.subreddits && config.subreddits.length > 0) {
      allPosts = this.filterBySubreddits(allPosts, config.subreddits);
    }

    const categoriesFound = [...new Set(allPosts.flatMap(p => p.categories || []))];

    return {
      success: true,
      posts: allPosts.slice(0, config.maxPosts) as unknown as RedditPost[],
      errors: [],
      metadata: {
        totalFound: allPosts.length,
        totalProcessed: Math.min(allPosts.length, config.maxPosts),
        scrapedAt: new Date().toISOString(),
        categoriesFound
      }
    };
  }

  /**
   * Search by specific pattern/category
   */
  async searchByPattern(
    pattern: InsightCategory,
    industry: string = '',
    maxResults: number = 25
  ): Promise<ScrapingResult> {
    return this.searchByCategories([pattern], [], maxResults);
  }
}

// Export singleton instance
export const redditScraper = new RedditScraper();
