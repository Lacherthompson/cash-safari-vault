import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Clock, Layers, Shield, Landmark, CircleDollarSign, ExternalLink } from 'lucide-react';
import SEO from '@/components/SEO';
import savetogetherLogo from '@/assets/savetogether-logo.png';

const savingsGuideJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Save Money — Best Savings Strategies That Work",
  "description": "Complete guide to high-yield savings accounts, CDs, Treasury bills, and other savings options to grow your money safely.",
  "author": {
    "@type": "Organization",
    "name": "SaveTogether"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SaveTogether"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://savetogether.lovable.app/savings-guide"
  },
  "datePublished": "2025-01-07",
  "dateModified": "2025-01-07"
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a high-yield savings account (HYSA)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A high-yield savings account is an online savings account that offers significantly higher interest rates than traditional banks, typically 4-5% APY. They are FDIC insured up to $250,000 and provide easy access to your money."
      }
    },
    {
      "@type": "Question",
      "name": "What is a CD ladder strategy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A CD ladder divides your savings across multiple CDs with different maturity dates. As each CD matures, you reinvest it into a new long-term CD. This strategy provides regular access to funds while earning higher long-term rates."
      }
    },
    {
      "@type": "Question",
      "name": "Are Treasury Bills (T-Bills) a good savings option?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Treasury Bills are short-term government securities backed by the U.S. Treasury, considered one of the safest investments available. They offer 4.5-5.5% APY and are state tax exempt, making them ideal for conservative investors seeking safety."
      }
    }
  ]
};

export default function SavingsGuide() {
  const navigate = useNavigate();

  const savingsOptions = [
    {
      icon: TrendingUp,
      title: 'High-Yield Savings Account (HYSA)',
      apy: '4.00% - 5.00% APY',
      description: 'The easiest way to earn more on your savings. These online accounts offer significantly higher interest rates than traditional banks.',
      pros: ['FDIC insured up to $250,000', 'Easy access to your money', 'No minimum balance at many banks', 'Compound interest grows your money'],
      cons: ['Rates can change with the market', 'May have monthly withdrawal limits'],
      bestFor: 'Emergency funds and short-term savings goals',
    },
    {
      icon: Clock,
      title: 'Certificate of Deposit (CD)',
      apy: '4.50% - 5.25% APY',
      description: 'Lock your money for a fixed term (3 months to 5 years) in exchange for a guaranteed interest rate that won\'t change.',
      pros: ['Guaranteed fixed rate', 'FDIC insured', 'Higher rates for longer terms', 'Predictable returns'],
      cons: ['Early withdrawal penalties', 'Money is locked up', 'May miss out if rates rise'],
      bestFor: 'Money you won\'t need for a specific period',
    },
    {
      icon: Layers,
      title: 'CD Ladder Strategy',
      apy: 'Varies by term',
      description: 'Divide your savings across multiple CDs with different maturity dates. As each CD matures, reinvest it into a new long-term CD.',
      pros: ['Regular access to some funds', 'Takes advantage of higher long-term rates', 'Reduces interest rate risk', 'Builds consistent liquidity'],
      cons: ['More complex to manage', 'Requires planning', 'Lower returns than all long-term CDs'],
      bestFor: 'Maximizing returns while maintaining some flexibility',
      howItWorks: [
        'Divide $5,000 into 5 CDs: $1,000 each in 1, 2, 3, 4, and 5-year terms',
        'When the 1-year CD matures, reinvest into a new 5-year CD',
        'Every year, one CD matures giving you access to funds',
        'All your money eventually earns the highest 5-year rates',
      ],
    },
    {
      icon: Landmark,
      title: 'Money Market Account',
      apy: '3.50% - 4.75% APY',
      description: 'A hybrid between checking and savings. Offers competitive rates with check-writing privileges and debit card access.',
      pros: ['Higher rates than regular savings', 'Check-writing ability', 'FDIC insured', 'More flexible access'],
      cons: ['May require higher minimum balance', 'Limited transactions per month', 'Rates vary'],
      bestFor: 'Those who want higher yields with easy access',
    },
    {
      icon: Shield,
      title: 'Treasury Bills (T-Bills)',
      apy: '4.50% - 5.50% APY',
      description: 'Short-term government securities backed by the U.S. Treasury. Considered one of the safest investments available.',
      pros: ['Backed by U.S. government', 'State tax exempt', 'Very low risk', 'Various term lengths'],
      cons: ['Must hold to maturity for best returns', 'Minimum investment required', 'Less liquid than savings'],
      bestFor: 'Conservative investors seeking safety',
    },
    {
      icon: CircleDollarSign,
      title: 'I Bonds (Series I Savings Bonds)',
      apy: 'Inflation-adjusted rate',
      description: 'Government savings bonds that protect against inflation. The rate adjusts every 6 months based on inflation.',
      pros: ['Inflation protection', 'Tax advantages', 'Backed by U.S. government', 'Low risk'],
      cons: ['$10,000 annual purchase limit', 'Must hold for 1 year minimum', 'Penalty if redeemed before 5 years'],
      bestFor: 'Long-term savings and inflation protection',
    },
  ];

  return (
    <>
      <SEO
        title="Savings Guide — How to Save Money Smartly"
        description="Compare high-yield savings accounts, CDs, Treasury bills, and other savings options. Learn the best strategies to grow your money safely in 2025."
        path="/savings-guide"
        type="article"
        jsonLd={{ ...savingsGuideJsonLd, ...faqJsonLd }}
      />
      <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={savetogetherLogo} alt="SaveTogether" className="h-20" />
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Intro Section */}
        <section>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-4">
            How to Save Money — Best Savings Strategies That Work
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Want to know where to keep your savings to grow your money faster? Here's a complete breakdown of the best savings options — from high-yield savings accounts to CDs and Treasury bills. These proven savings tips help you reach your financial goals safely.
          </p>
        </section>

        {/* Savings Options */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display font-semibold tracking-tight">
            Best Ways to Save Money in 2025
          </h2>
          {savingsOptions.map((option, index) => (
            <Card key={index} className="border-border/60 bg-card/50 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <option.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-semibold">{option.title}</h3>
                      <p className="text-sm font-medium text-vault-emerald mt-0.5">{option.apy}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {option.description}
                </CardDescription>

                {option.howItWorks && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-display font-semibold text-sm mb-2">How CD Laddering Works:</h4>
                    <ol className="space-y-1.5">
                      {option.howItWorks.map((step, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary font-medium">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-display font-semibold text-sm text-vault-emerald mb-2">Pros</h4>
                    <ul className="space-y-1">
                      {option.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-vault-emerald">✓</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm text-vault-coral mb-2">Cons</h4>
                    <ul className="space-y-1">
                      {option.cons.map((con, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-vault-coral">✗</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40">
                  <p className="text-sm">
                    <span className="font-display font-semibold">Best for: </span>
                    <span className="text-muted-foreground">{option.bestFor}</span>
                  </p>
                </div>

                {/* Placeholder for future affiliate links */}
                {/* 
                <div className="pt-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    Compare Top {option.title.split(' ')[0]} Rates
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
                */}
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Quick Comparison */}
        <section>
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-4">
            Compare Savings Options — Which Is Right for You?
          </h2>
          <Card className="border-border/60 bg-card/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="text-left p-4 font-display font-semibold">Option</th>
                      <th className="text-left p-4 font-display font-semibold">Access</th>
                      <th className="text-left p-4 font-display font-semibold">Risk</th>
                      <th className="text-left p-4 font-display font-semibold">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/40">
                      <td className="p-4 font-medium">HYSA</td>
                      <td className="p-4 text-muted-foreground">Anytime</td>
                      <td className="p-4 text-vault-emerald">Very Low</td>
                      <td className="p-4 text-muted-foreground">Emergency Fund</td>
                    </tr>
                    <tr className="border-b border-border/40">
                      <td className="p-4 font-medium">CD</td>
                      <td className="p-4 text-muted-foreground">At maturity</td>
                      <td className="p-4 text-vault-emerald">Very Low</td>
                      <td className="p-4 text-muted-foreground">Fixed Goals</td>
                    </tr>
                    <tr className="border-b border-border/40">
                      <td className="p-4 font-medium">CD Ladder</td>
                      <td className="p-4 text-muted-foreground">Periodic</td>
                      <td className="p-4 text-vault-emerald">Very Low</td>
                      <td className="p-4 text-muted-foreground">Balanced Approach</td>
                    </tr>
                    <tr className="border-b border-border/40">
                      <td className="p-4 font-medium">Money Market</td>
                      <td className="p-4 text-muted-foreground">Anytime</td>
                      <td className="p-4 text-vault-emerald">Very Low</td>
                      <td className="p-4 text-muted-foreground">Flexible Savings</td>
                    </tr>
                    <tr className="border-b border-border/40">
                      <td className="p-4 font-medium">T-Bills</td>
                      <td className="p-4 text-muted-foreground">At maturity</td>
                      <td className="p-4 text-vault-emerald">Lowest</td>
                      <td className="p-4 text-muted-foreground">Safety First</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">I Bonds</td>
                      <td className="p-4 text-muted-foreground">After 1 year</td>
                      <td className="p-4 text-vault-emerald">Very Low</td>
                      <td className="p-4 text-muted-foreground">Inflation Hedge</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Disclaimer */}
        <section className="text-center text-sm text-muted-foreground pt-4">
          <p>
            APY rates are estimates and subject to change. Always verify current rates with financial institutions.
            This is educational content, not financial advice.
          </p>
        </section>

        <div className="text-center pt-4">
          <Button onClick={() => navigate('/')} size="lg" className="font-display">
            Back to Vaults
          </Button>
        </div>
      </main>
    </div>
    </>
  );
}
