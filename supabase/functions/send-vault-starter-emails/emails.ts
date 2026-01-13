// 14-Day Vault Starter Email Challenge Content
// Welcome (Day 0) + Days 1-14

export interface ChallengeEmail {
  day: number;
  subject: string;
  getHtml: (unsubscribeLink: string) => string;
}

const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center; }
    .header img { width: 50px; height: 50px; }
    .header h1 { color: #ffffff; margin: 10px 0 0 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 25px; }
    .content h2 { color: #10b981; font-size: 20px; margin-top: 0; }
    .content p { margin: 16px 0; color: #4a5568; }
    .action-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .action-box h3 { color: #059669; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; }
    .action-box p { margin: 0; color: #065f46; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 8px 0; font-size: 14px; color: #6b7280; }
    .footer a { color: #10b981; text-decoration: none; }
    .unsubscribe { font-size: 12px; color: #9ca3af; margin-top: 15px; }
    .unsubscribe a { color: #9ca3af; text-decoration: underline; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; color: #4a5568; }
    .emoji { font-size: 18px; }
  </style>
`;

const getEmailWrapper = (content: string, unsubscribeLink: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SaveTogether</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Questions? Just hit reply — we read every message.</p>
      <p><a href="https://savetogether.co">Visit SaveTogether</a></p>
      <p class="unsubscribe">
        <a href="${unsubscribeLink}">Unsubscribe from these emails</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export const challengeEmails: ChallengeEmail[] = [
  // Day 0 - Welcome Email
  {
    day: 0,
    subject: "Welcome to the 14-Day Vault Starter Challenge! 🎉",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Welcome to Your Savings Journey! 🎉</h2>
      <p>Congratulations on taking the first step toward building a lasting savings habit!</p>
      <p>Over the next 14 days, you'll receive daily emails with simple, actionable tasks designed to help you:</p>
      <ul>
        <li>Build momentum with small wins</li>
        <li>Develop a savings mindset</li>
        <li>Create lasting financial habits</li>
      </ul>
      <div class="action-box">
        <h3>📌 What's Next</h3>
        <p>Tomorrow you'll receive Day 1 with your first action item. Get ready to start building your savings habit!</p>
      </div>
      <p>Get excited — Day 1 starts tomorrow!</p>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 1
  {
    day: 1,
    subject: "Day 1: Let's Set Your Savings Goal 🎯",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 1: Define Your "Why" 🎯</h2>
      <p>Every successful savings journey starts with a clear goal. Today, we're going to get specific about what you're saving for.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Create your first vault on SaveTogether and set a specific savings goal with a target amount. Whether it's $500 for an emergency fund or $2,000 for a vacation — make it real.</p>
      </div>
      <p>Pro tip: Goals with emotional meaning are 3x more likely to be achieved. Don't just save "money" — save for something that excites you.</p>
      <a href="https://savetogether.co/" class="cta-button">Create Your Vault</a>
      <p>See you tomorrow for Day 2!</p>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 2
  {
    day: 2,
    subject: "Day 2: The Small Wins Strategy 💪",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 2: Start Small, Win Big 💪</h2>
      <p>Here's a secret: the amount you save today matters less than the act of saving itself. We're building a habit, not just a balance.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Check off your first amount in your vault — even if it's just $1. The goal is to get that first checkmark and feel the momentum.</p>
      </div>
      <p>Research shows that small wins create a dopamine response that makes you want to repeat the behavior. That's exactly what we're after.</p>
      <a href="https://savetogether.co/" class="cta-button">Make Your First Save</a>
      <p>How did it feel? Hit reply and let me know!</p>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 3
  {
    day: 3,
    subject: "Day 3: Find Your Hidden Money 🔍",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 3: The Subscription Audit 🔍</h2>
      <p>Today we're going treasure hunting in your bank statement. You'd be surprised how much "hidden money" is sitting in forgotten subscriptions.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Review your last bank statement and identify at least one subscription you can cancel or downgrade. Put that money toward your vault instead.</p>
      </div>
      <p>Common finds: Unused streaming services, gym memberships, apps on auto-renew, premium versions of things you use for free features only.</p>
      <a href="https://savetogether.co/" class="cta-button">Add to Your Vault</a>
      <p>Found something? Reply and tell me what you're cutting!</p>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 4
  {
    day: 4,
    subject: "Day 4: The 24-Hour Rule ⏰",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 4: Master the Pause ⏰</h2>
      <p>Impulse purchases are the silent killer of savings goals. Today, we're adding a powerful tool to your toolkit: the 24-hour rule.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Before any non-essential purchase today, wait 24 hours. Write down what you wanted to buy and revisit it tomorrow. If you still want it, buy it. If not, save that money.</p>
      </div>
      <p>Studies show that 70% of impulse purchases are regretted. The pause gives your rational brain time to catch up with your emotional brain.</p>
      <a href="https://savetogether.co/" class="cta-button">Track Your Progress</a>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 5
  {
    day: 5,
    subject: "Day 5: Automate Your Success 🤖",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 5: Set It and Forget It 🤖</h2>
      <p>The best savings happen automatically. Today, we're going to make saving effortless.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Set up an automatic transfer to your savings account — even if it's just $5 per week. The key is making it automatic so you don't have to think about it.</p>
      </div>
      <p>People who automate their savings save 2-3x more than those who do it manually. Remove the decision and watch your vault grow.</p>
      <a href="https://savetogether.co/" class="cta-button">Check Your Vault</a>
      <p>Automation set up? Reply and let me know!</p>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 6
  {
    day: 6,
    subject: "Day 6: The Savings Mindset Shift 🧠",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 6: Reframe Your Thinking 🧠</h2>
      <p>Here's a mindset shift that changes everything: You're not "giving up" spending — you're "choosing" your future.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Write down 3 things your future self will thank you for saving toward. Keep this somewhere you'll see it daily.</p>
      </div>
      <p>When you see savings as a choice rather than a sacrifice, the whole game changes. You're not depriving yourself — you're investing in yourself.</p>
      <a href="https://savetogether.co/" class="cta-button">Visit Your Vault</a>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 7
  {
    day: 7,
    subject: "Day 7: Week 1 Complete! 🏆",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Week 1 Complete! 🏆</h2>
      <p>You've made it through your first week! This is huge. Most people give up on new habits by day 3 — but not you.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Check your vault and celebrate your progress! How many amounts have you checked off? Reply and tell me your wins from this week.</p>
      </div>
      <p>Remember: Progress, not perfection. Even if you only saved a little, you're building the muscle that matters.</p>
      <a href="https://savetogether.co/" class="cta-button">See Your Progress</a>
      <p>Week 2 is going to be even better!</p>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 8
  {
    day: 8,
    subject: "Day 8: The Envelope Method 📬",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 8: Visual Budgeting 📬</h2>
      <p>Sometimes the best strategies are the simplest. Today, we're talking about the envelope method — a classic that works.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Pick one spending category (eating out, entertainment, coffee) and set a weekly cash limit. When it's gone, it's gone. Leftover? Goes to your vault.</p>
      </div>
      <p>Physical cash creates "pain of paying" that cards don't. It makes you more mindful of every dollar.</p>
      <a href="https://savetogether.co/" class="cta-button">Update Your Vault</a>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 9
  {
    day: 9,
    subject: "Day 9: Find Your Savings Buddy 👯",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 9: Accountability Partner 👯</h2>
      <p>Saving is easier with support. People with accountability partners are 65% more likely to achieve their goals.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Invite a friend or family member to join your savings journey. Share your goal with them or invite them to SaveTogether to save alongside you.</p>
      </div>
      <p>Pro tip: You can create shared vaults on SaveTogether! Save together for a trip, a gift, or just to keep each other motivated.</p>
      <a href="https://savetogether.co/" class="cta-button">Invite a Friend</a>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 10
  {
    day: 10,
    subject: "Day 10: Level Up Your Money Game 📚",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 10: Knowledge is Power 📚</h2>
      <p>The more you learn about money, the better you get at growing it. Today's about expanding your financial toolkit.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Check out our Savings Guide for more tips and strategies. Then explore the Earn More section to discover ways to boost your income.</p>
      </div>
      <p>Small knowledge gains compound just like money does. Invest 10 minutes in learning today.</p>
      <a href="https://savetogether.co/savings-guide" class="cta-button">Read the Savings Guide</a>
      <p style="text-align: center; margin-top: 10px;"><a href="https://savetogether.co/earn-more" style="color: #10b981;">Explore Earn More →</a></p>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 11
  {
    day: 11,
    subject: "Day 11: The No-Spend Challenge 🚫",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 11: No-Spend Day Challenge 🚫</h2>
      <p>Ready for a mini challenge? Today, we're going zero on non-essential spending.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Commit to a no-spend day. No coffee runs, no online shopping, no "just this one thing." Essentials only. Track what you would have spent and add it to your vault.</p>
      </div>
      <p>This isn't about deprivation — it's about awareness. You'll be surprised what you notice about your spending habits.</p>
      <a href="https://savetogether.co/" class="cta-button">Log Your Savings</a>
      <p>How did it go? Reply and tell me!</p>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 12
  {
    day: 12,
    subject: "Day 12: Celebrate Small Wins 🎊",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 12: You Deserve Celebration 🎊</h2>
      <p>We're almost at the finish line, and it's time to acknowledge how far you've come.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Look at your vault progress and give yourself credit. Then, plan a small, budget-friendly reward for completing the challenge. You've earned it!</p>
      </div>
      <p>Celebrating progress — not just end goals — keeps motivation high. What will your reward be?</p>
      <a href="https://savetogether.co/" class="cta-button">Check Your Progress</a>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 13
  {
    day: 13,
    subject: "Day 13: Building for the Long Term 🏗️",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Day 13: Your Next Chapter 🏗️</h2>
      <p>Tomorrow is the last day of our challenge, but your savings journey is just beginning. Let's set you up for long-term success.</p>
      <div class="action-box">
        <h3>📌 Today's Action</h3>
        <p>Review your vault and set your next goal. What will you save for after this? Having a goal waiting keeps the momentum going.</p>
      </div>
      <p>The habits you've built over the past 13 days are the foundation. Now it's about maintaining and growing.</p>
      <a href="https://savetogether.co/" class="cta-button">Plan Your Next Goal</a>
      <p>— The SaveTogether Team</p>
    `, unsubscribeLink)
  },
  
  // Day 14
  {
    day: 14,
    subject: "Day 14: You Did It! 🎉🏆",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>Congratulations — You Made It! 🎉🏆</h2>
      <p>14 days. You showed up, you took action, and you built something real.</p>
      <div class="action-box">
        <h3>📌 Final Action</h3>
        <p>Check your vault one more time. Look at all those checkmarks. That's you — every single one represents a choice you made to invest in your future.</p>
      </div>
      <p>Here's what you've accomplished:</p>
      <ul>
        <li>✅ Set a meaningful savings goal</li>
        <li>✅ Built a daily savings habit</li>
        <li>✅ Learned strategies that work</li>
        <li>✅ Proved to yourself that you can do this</li>
      </ul>
      <p>This isn't the end — it's the beginning. Keep using SaveTogether, keep checking off those amounts, and keep building toward your dreams.</p>
      <a href="https://savetogether.co/" class="cta-button">Visit Your Vault</a>
      <p>We're so proud of you. 💚</p>
      <p>— The SaveTogether Team</p>
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">P.S. Want to keep the accountability going? Reply and tell us about your experience. We'd love to hear your story!</p>
    `, unsubscribeLink)
  }
];
