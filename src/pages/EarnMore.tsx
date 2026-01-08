import { useEffect } from 'react';
import { DollarSign, ShoppingBag, ClipboardList, Briefcase, TrendingUp, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { AuthenticatedNav } from '@/components/AuthenticatedNav';
const earnMoreJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Side Income Ideas: Ways to Make Extra Money",
  "description": "Discover proven ways to earn extra money on the side. From cash-back apps to freelancing, find the best side income opportunities.",
  "author": {
    "@type": "Organization",
    "name": "SaveTogether"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SaveTogether"
  }
};

interface IncomeOption {
  name: string;
  description: string;
  potentialEarnings: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeCommitment: string;
  affiliateSlot?: boolean;
}

const cashBackApps: IncomeOption[] = [
  {
    name: 'Rakuten',
    description: 'Earn cash back on online purchases at thousands of stores. Simply shop through their portal or use their browser extension.',
    potentialEarnings: '$50-$300/year',
    difficulty: 'Easy',
    timeCommitment: 'Minimal',
    affiliateSlot: true,
  },
  {
    name: 'Ibotta',
    description: 'Get cash back on groceries and everyday purchases. Scan receipts or link loyalty cards for automatic savings.',
    potentialEarnings: '$100-$500/year',
    difficulty: 'Easy',
    timeCommitment: '5-10 min/week',
    affiliateSlot: true,
  },
  {
    name: 'Fetch Rewards',
    description: 'Scan any receipt to earn points on thousands of products. No clipping coupons—just scan and earn towards gift cards.',
    potentialEarnings: '$50-$200/year',
    difficulty: 'Easy',
    timeCommitment: '2-5 min/week',
    affiliateSlot: true,
  },
];

const surveySites: IncomeOption[] = [
  {
    name: 'Swagbucks',
    description: 'Earn points for surveys, watching videos, shopping online, and searching the web. Redeem for gift cards or PayPal cash.',
    potentialEarnings: '$50-$200/month',
    difficulty: 'Easy',
    timeCommitment: '1-3 hours/week',
    affiliateSlot: true,
  },
  {
    name: 'Survey Junkie',
    description: 'Complete market research surveys and earn points redeemable for cash via PayPal or e-gift cards.',
    potentialEarnings: '$40-$100/month',
    difficulty: 'Easy',
    timeCommitment: '2-4 hours/week',
    affiliateSlot: true,
  },
  {
    name: 'UserTesting',
    description: 'Get paid to test websites and apps. Share your screen and thoughts while navigating digital products.',
    potentialEarnings: '$10-$60/test',
    difficulty: 'Medium',
    timeCommitment: 'Flexible',
    affiliateSlot: true,
  },
];

const freelancingPlatforms: IncomeOption[] = [
  {
    name: 'Fiverr',
    description: 'Offer services in writing, design, programming, marketing, and more. Set your own prices and work on your schedule.',
    potentialEarnings: '$100-$5,000+/month',
    difficulty: 'Medium',
    timeCommitment: 'Flexible',
    affiliateSlot: true,
  },
  {
    name: 'Upwork',
    description: 'Find freelance jobs in various fields. Build long-term client relationships and grow your freelance business.',
    potentialEarnings: '$500-$10,000+/month',
    difficulty: 'Medium',
    timeCommitment: '10-40+ hours/week',
    affiliateSlot: true,
  },
  {
    name: 'Taskrabbit',
    description: 'Get paid for local tasks like furniture assembly, moving help, cleaning, and handyman work.',
    potentialEarnings: '$20-$50/hour',
    difficulty: 'Medium',
    timeCommitment: 'Flexible',
    affiliateSlot: true,
  },
];

const passiveIncomeOptions: IncomeOption[] = [
  {
    name: 'Dividend Stocks',
    description: 'Invest in companies that pay regular dividends. Build a portfolio that generates passive income over time.',
    potentialEarnings: '2-5% annually',
    difficulty: 'Medium',
    timeCommitment: 'Research upfront',
    affiliateSlot: true,
  },
  {
    name: 'High-Yield Savings',
    description: 'Park your emergency fund or savings in accounts earning 4-5% APY. Completely passive income on money you already have.',
    potentialEarnings: '4-5% APY',
    difficulty: 'Easy',
    timeCommitment: 'Minimal',
    affiliateSlot: true,
  },
  {
    name: 'Rental Income',
    description: 'Rent out a spare room, parking space, or storage area. Platforms like Airbnb and Neighbor make it easy.',
    potentialEarnings: '$200-$2,000+/month',
    difficulty: 'Hard',
    timeCommitment: 'Varies',
    affiliateSlot: true,
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
    case 'Medium':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    case 'Hard':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const IncomeCard = ({ option }: { option: IncomeOption }) => (
  <Card className="h-full hover:shadow-lg transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="text-lg">{option.name}</CardTitle>
        <Badge variant="outline" className={getDifficultyColor(option.difficulty)}>
          {option.difficulty}
        </Badge>
      </div>
      <CardDescription className="text-sm">{option.description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Potential Earnings:</span>
        <span className="font-semibold text-primary">{option.potentialEarnings}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Time Commitment:</span>
        <span className="font-medium">{option.timeCommitment}</span>
      </div>
    </CardContent>
  </Card>
);

const SectionHeader = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="p-3 rounded-xl bg-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  </div>
);

const EarnMore = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Side Income Ideas | Ways to Make Extra Money - SaveTogether"
        description="Discover proven ways to earn extra money on the side. From cash-back apps to freelancing platforms, find the best side income opportunities to boost your savings."
        path="/earn-more"
      />

      <AuthenticatedNav />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <DollarSign className="h-5 w-5" />
            <span className="font-medium">Side Income Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ways to Make Extra Money
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Boost your savings by earning extra income on the side. From effortless cash-back 
            apps to flexible freelancing, find opportunities that fit your lifestyle.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">$500+</div>
            <div className="text-sm text-muted-foreground">Avg. Annual Cash Back</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">10+</div>
            <div className="text-sm text-muted-foreground">Income Opportunities</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">Flexible</div>
            <div className="text-sm text-muted-foreground">Work on Your Time</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">Free</div>
            <div className="text-sm text-muted-foreground">To Get Started</div>
          </Card>
        </div>

        {/* Cash-Back Apps Section */}
        <section className="mb-12">
          <SectionHeader
            icon={ShoppingBag}
            title="Cash-Back Apps"
            description="Earn money on purchases you're already making. These apps require minimal effort and can add up to hundreds per year."
          />
          <div className="grid md:grid-cols-3 gap-4">
            {cashBackApps.map((option) => (
              <IncomeCard key={option.name} option={option} />
            ))}
          </div>
        </section>

        {/* Survey Sites Section */}
        <section className="mb-12">
          <SectionHeader
            icon={ClipboardList}
            title="Survey & Reward Sites"
            description="Share your opinions and get paid. Great for earning extra cash during downtime."
          />
          <div className="grid md:grid-cols-3 gap-4">
            {surveySites.map((option) => (
              <IncomeCard key={option.name} option={option} />
            ))}
          </div>
        </section>

        {/* Freelancing Platforms Section */}
        <section className="mb-12">
          <SectionHeader
            icon={Briefcase}
            title="Freelancing Platforms"
            description="Turn your skills into income. Whether you write, design, code, or build, there's a market for your talents."
          />
          <div className="grid md:grid-cols-3 gap-4">
            {freelancingPlatforms.map((option) => (
              <IncomeCard key={option.name} option={option} />
            ))}
          </div>
        </section>

        {/* Passive Income Section */}
        <section className="mb-12">
          <SectionHeader
            icon={TrendingUp}
            title="Passive Income Options"
            description="Make your money work for you. These options require upfront effort but can generate ongoing income."
          />
          <div className="grid md:grid-cols-3 gap-4">
            {passiveIncomeOptions.map((option) => (
              <IncomeCard key={option.name} option={option} />
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="mb-12">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Pro Tips for Maximizing Side Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span><strong>Stack your earnings:</strong> Use multiple cash-back apps together for maximum savings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span><strong>Start small:</strong> Begin with easy wins like cash-back apps before committing to time-intensive options.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span><strong>Track everything:</strong> Monitor your earnings to see what's worth your time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span><strong>Reinvest earnings:</strong> Put your side income directly into savings or investments.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">5.</span>
                  <span><strong>Be consistent:</strong> Small, regular efforts compound into significant earnings over time.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Work-Life Balance Section */}
        <section className="mb-12">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Heart className="h-6 w-6 text-purple-500" />
                </div>
                A Note on Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed">
                While we believe in the power of building wealth and reaching your financial goals, 
                we also believe that <strong>your well-being comes first</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This page is not about hustle culture or grinding yourself into the ground. It's about 
                knowing your options and making informed choices that fit <em>your</em> life. Some weeks 
                you might have energy to explore a side project. Other weeks, rest is the best investment 
                you can make.
              </p>
              <div className="bg-background/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">Remember:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Rest is productive.</strong> You cannot pour from an empty cup.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>There are no limits when you plan.</strong> But plans should include time for joy, relationships, and self-care.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Financial freedom is a means, not an end.</strong> The goal is a life well-lived, not just a bank account well-filled.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span><strong>Start small, stay sustainable.</strong> Consistency beats intensity every time.</span>
                  </li>
                </ul>
              </div>
              <p className="text-muted-foreground italic">
                Take what serves you from this guide, and leave what doesn't. Your path to financial 
                wellness should make you feel empowered, not exhausted.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Boost Your Savings?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Combine your side income with smart saving habits. Start tracking your savings goals today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/savings-guide')}>
              View Savings Guide
            </Button>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p>
            <strong>Disclaimer:</strong> Earnings potential varies based on time invested, location, and individual effort. 
            Some links on this page may be affiliate links. We only recommend products and services we believe in. 
            This is not financial advice—please do your own research before making any decisions.
          </p>
        </div>
      </main>
    </div>
  );
};

export default EarnMore;
