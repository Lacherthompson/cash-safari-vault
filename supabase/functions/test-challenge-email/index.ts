import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const UNSUBSCRIBE_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "default-secret";

interface ChallengeEmail {
  day: number;
  subject: string;
  getHtml: (unsubscribeLink: string) => string;
}

const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 10px 0 0 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 25px; }
    .content h2 { color: #10b981; font-size: 20px; margin-top: 0; }
    .content p { margin: 16px 0; color: #4a5568; }
    .action-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .action-box h3 { color: #059669; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; }
    .action-box p { margin: 0; color: #065f46; }
    .action-box ul { margin: 10px 0 0 0; padding-left: 20px; color: #065f46; }
    .action-box li { margin: 4px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 8px 0; font-size: 14px; color: #6b7280; }
    .footer a { color: #10b981; text-decoration: none; }
    .unsubscribe { font-size: 12px; color: #9ca3af; margin-top: 15px; }
    .unsubscribe a { color: #9ca3af; text-decoration: underline; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; color: #4a5568; }
    .progress-tracker { background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; text-align: center; }
    .progress-tracker .day-label { font-size: 13px; color: #64748b; margin-bottom: 8px; font-weight: 500; }
    .progress-tracker .progress-bar { font-family: monospace; font-size: 16px; letter-spacing: 2px; color: #10b981; }
    .progress-tracker .progress-message { font-size: 13px; color: #059669; margin-top: 8px; font-weight: 500; }
    .did-you-know { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .did-you-know h4 { color: #b45309; margin: 0 0 8px 0; font-size: 14px; font-weight: 600; }
    .did-you-know p { margin: 0; color: #92400e; font-size: 14px; }
    .mindset-moment { background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .mindset-moment h4 { color: #6d28d9; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; }
    .mindset-moment .quote { font-style: italic; color: #5b21b6; font-size: 16px; margin-bottom: 12px; line-height: 1.5; }
    .mindset-moment .reflection { color: #7c3aed; font-size: 14px; margin-top: 12px; }
    .micro-story { background: #f1f5f9; border-radius: 8px; padding: 14px 18px; margin: 16px 0; font-size: 14px; color: #475569; font-style: italic; }
    .week-summary { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .week-summary h4 { color: #059669; margin: 0 0 12px 0; font-size: 15px; font-weight: 600; }
    .week-summary ul { margin: 0; padding-left: 20px; }
    .week-summary li { color: #047857; margin: 6px 0; font-size: 14px; }
  </style>
`;

// Helper to generate progress bar
const getProgressBar = (day: number): string => {
  const totalDays = 14;
  const filled = day;
  const empty = totalDays - day;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  let message = '';
  if (day === 0) message = "Your journey begins!";
  else if (day === 7) message = "🎉 Halfway there!";
  else if (day === 14) message = "🏆 Challenge complete!";
  else if (day < 7) message = `${7 - day} days to halfway`;
  else message = `${14 - day} days to go`;
  
  return `
    <div class="progress-tracker">
      <div class="day-label">Day ${day} of 14</div>
      <div class="progress-bar">[${bar}]</div>
      <div class="progress-message">${message}</div>
    </div>
  `;
};

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

const challengeEmails: ChallengeEmail[] = [
  {
    day: 0,
    subject: "Welcome to Vault Starter. Let's do this together.",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(0)}
      <h2>We're really glad you're here.</h2>
      <p>Saving can feel intimidating, especially if money has mostly been about survival, stress, or "I'll deal with it later." Vault Starter exists because we believe saving shouldn't require perfection, spreadsheets, or guilt.</p>
      <p>Over the next 14 days, we'll walk through this together. Small steps. Realistic actions. No shaming. No "just stop buying coffee" nonsense.</p>
      
      <div class="week-summary">
        <h4>📅 Here's what to expect:</h4>
        <ul>
          <li><strong>Week 1:</strong> Set up your vault, open a dedicated savings account, find hidden money, build your rhythm</li>
          <li><strong>Week 2:</strong> Check in, adjust, strengthen, and celebrate</li>
          <li><strong>REST days:</strong> Days 4, 6, 8, 11, and 13 — no action required</li>
        </ul>
      </div>
      
      <p><strong>How it works:</strong> You'll save money into a dedicated savings account, then come back to SaveTogether to click off amounts in your vault to track your progress. The vault is your visual tracker — your savings account is where the actual money lives.</p>
      <p>Some days will take five minutes. Some days are rest days. All days are designed to help you feel more in control, not more overwhelmed.</p>
      <p><strong>💡 Quick tip:</strong> Star this email so you can find us in your inbox.</p>
      <p><strong>Tomorrow, we start with the easiest win.</strong></p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  {
    day: 1,
    subject: "Day 1: The easiest win (promise)",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(1)}
      <p>We used to think saving had to start with a big lifestyle change. Turns out, momentum matters more than amount.</p>
      <p>Today is about creating a place to track your savings progress.</p>
      
      <div class="did-you-know">
        <h4>💡 Did you know?</h4>
        <p>Research shows that people who name their savings goals are <strong>42% more likely</strong> to reach them. The name creates emotional connection — and emotional goals stick.</p>
      </div>
      
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Open SaveTogether and create ONE vault.</p>
        <p style="margin-top: 12px;">Pick a goal that feels emotionally motivating, not "responsible."</p>
        <p style="margin-top: 8px;"><strong>Examples:</strong></p>
        <ul>
          <li>Emergency cushion</li>
          <li>Pay off a card</li>
          <li>Trip fund</li>
          <li>Peace-of-mind buffer</li>
        </ul>
        <p style="margin-top: 12px;">Set the total amount. This creates your clickable amounts that you'll check off as you save.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Create Your Vault</a>
      
      <div class="micro-story">
        💬 "I named mine 'Freedom Fund.' Every time I click off an amount, I feel like I'm buying back my own time." — SaveTogether user
      </div>
      
      <p>If you want, hit reply and tell us what you named it.</p>
      <p>Tomorrow, we'll set up where your actual savings will live.</p>
    `, unsubscribeLink)
  },
  {
    day: 2,
    subject: "Day 2: Create your savings home",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(2)}
      <p>Your vault is set up — now let's give your money a home that's separate from your everyday spending.</p>
      
      <div class="did-you-know">
        <h4>💡 Did you know?</h4>
        <p>People who keep their savings in a <strong>separate account</strong> from their checking are significantly less likely to dip into it. Out of sight, out of mind — but in a good way.</p>
      </div>
      
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Open a dedicated savings account — one that's NOT connected to an account you regularly use.</p>
        <p style="margin-top: 12px;"><strong>Why separate?</strong></p>
        <ul>
          <li>Reduces temptation to "borrow" from yourself</li>
          <li>Makes your progress feel more real</li>
          <li>Creates a mental boundary around your goal</li>
        </ul>
        <p style="margin-top: 12px;">Not sure what type of account to open? Check out our guide:</p>
      </div>
      <a href="https://savetogether.co/savings-guide" class="cta-button">View Savings Guide</a>
      
      <div class="micro-story">
        💬 "I opened a high-yield savings account at a different bank than my checking. Having to transfer money manually made me think twice before touching it." — SaveTogether user
      </div>
      
      <p>Reply and let us know what type of account you chose!</p>
      <p>Tomorrow, we'll find some hidden money to put in it.</p>
    `, unsubscribeLink)
  },
  {
    day: 3,
    subject: "The $50 you're about to find",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(3)}
      <p>Most people don't fail at saving. They just don't know where their money is quietly leaking.</p>
      
      <div class="did-you-know">
        <h4>💡 Did you know?</h4>
        <p>Americans spend an average of <strong>$219/month on subscriptions</strong> — and forget about nearly a third of them. That's potentially $70+ per month hiding in your statements.</p>
      </div>
      
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Check your bank or card app for one forgotten or unnecessary charge.</p>
        <p style="margin-top: 8px;"><strong>Common culprits:</strong></p>
        <ul>
          <li>Gym memberships you haven't used</li>
          <li>Streaming services you forgot about</li>
          <li>Free trials that converted to paid</li>
          <li>Apps with premium tiers</li>
        </ul>
        <p style="margin-top: 12px;">Cancel it or downgrade it. <strong>Transfer that amount to your savings account</strong>, even if it's small.</p>
        <p style="margin-top: 8px;">Then come back to SaveTogether and click off the matching amount in your vault to track your progress!</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Track It In Your Vault</a>
      
      <div class="micro-story">
        💬 "I found $127 in forgotten subscriptions last month. An app I downloaded years ago was charging me $9.99/month." — SaveTogether user
      </div>
      
      <p>Reply and tell us what you found.</p>
      <p><strong>Tomorrow is a rest day.</strong> That's intentional.</p>
    `, unsubscribeLink)
  },
  {
    day: 4,
    subject: "Let the win sink in",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(4)}
      <p><strong>No action today.</strong> This is your first REST day.</p>
      
      <div class="mindset-moment">
        <h4>✨ Mindset Moment</h4>
        <p class="quote">"Saving isn't about being good with money. It's about deciding that future-you matters."</p>
        <p>Yesterday you proved something important: your money can move with intention. That subscription you found? It was quietly draining your account. Now that money is going to your savings instead.</p>
        <p class="reflection">💭 Take a moment: How did it feel to take that control back?</p>
      </div>
      
      <p>Tomorrow, we'll talk about building a rhythm that sticks.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  {
    day: 5,
    subject: "Day 5: Pick your saving moment",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(5)}
      <p>What works isn't motivation — it's rhythm.</p>
      
      <div class="did-you-know">
        <h4>💡 Did you know?</h4>
        <p><strong>Habit stacking</strong> — linking a new habit to an existing one — increases success rates by 65%. Instead of "I'll save more," try "After I get paid, I'll transfer money to my savings account."</p>
      </div>
      
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Decide when you'll transfer money to your savings account and update your vault.</p>
        <p style="margin-top: 8px;"><strong>Example habit stacks:</strong></p>
        <ul>
          <li>After payday → transfer to savings account → click off amount in vault</li>
          <li>After Sunday coffee → check vault progress</li>
          <li>After a no-spend day → transfer the amount you saved</li>
          <li>End of week → update vault with what you saved</li>
        </ul>
        <p style="margin-top: 8px;">Write it down somewhere visible.</p>
      </div>
      
      <p>Reply if you want accountability. We're happy to check in.</p>
      <p>Tomorrow is a recovery day.</p>
    `, unsubscribeLink)
  },
  {
    day: 6,
    subject: "You didn't fall behind",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(6)}
      <p><strong>No action today.</strong></p>
      
      <div class="mindset-moment">
        <h4>✨ Mindset Moment</h4>
        <p class="quote">"Progress isn't about perfection. It's about direction."</p>
        <p>If you missed something earlier — maybe you haven't opened that savings account yet, or your vault is still empty — that's okay. You're still here. You're still reading. That counts.</p>
        <p>The goal isn't to be perfect. It's to be present.</p>
        <p class="reflection">💭 What's one small thing you could do tomorrow to feel more in control?</p>
      </div>
      
      <p>Tomorrow, we'll check progress gently.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  {
    day: 7,
    subject: "🎉 One week in — you're halfway there",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(7)}
      <p><strong>You made it to the halfway point.</strong> That's not small.</p>
      
      <div class="did-you-know">
        <h4>💡 Did you know?</h4>
        <p>Most people quit new habits in week 2. By reaching day 7, you're already <strong>ahead of 60% of goal-setters</strong>. Momentum compounds.</p>
      </div>
      
      <div class="week-summary">
        <h4>🏆 Week 1 Wins — You've already:</h4>
        <ul>
          <li>Created a real, named goal in your vault</li>
          <li>Opened a dedicated savings account</li>
          <li>Found hidden money in your subscriptions</li>
          <li>Established a saving rhythm</li>
          <li>Shown up for 7 days straight</li>
        </ul>
      </div>
      
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Check your vault progress bar.</p>
        <p style="margin-top: 8px;">Adjust the goal if needed — or keep it as is.</p>
        <p style="margin-top: 8px;">Either way, acknowledge how far you've come.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Check Your Progress</a>
      
      <p>Reply and tell us how week one felt.</p>
      <p>Tomorrow, we slow down.</p>
    `, unsubscribeLink)
  },
  {
    day: 8,
    subject: "Midpoint pause",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(8)}
      <p><strong>No action today.</strong> You've earned this pause.</p>
      
      <div class="mindset-moment">
        <h4>✨ Mindset Moment</h4>
        <p class="quote">"Small deposits, made consistently, lead to big changes over time. Not because of the money — but because of the person you become while making them."</p>
        <p>Week 1 wasn't about getting rich. It was about proving to yourself that you can make money move with intention. That's a skill. And skills compound.</p>
        <p class="reflection">💭 What's one thing you learned about yourself this week?</p>
      </div>
      
      <p>Tomorrow, we'll do a quick check-in.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  {
    day: 9,
    subject: "Day 9: Honest check-in",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(9)}
      <p>Halfway through is where honesty matters most.</p>
      
      <div class="did-you-know">
        <h4>💡 Did you know?</h4>
        <p>The most successful savers <strong>adjust their goals 2-3 times</strong> before landing on what works. Flexibility isn't failure — it's strategy.</p>
      </div>
      
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Ask yourself: does this goal still feel doable?</p>
        <p style="margin-top: 8px;">If it feels too ambitious, scale it down. There's no shame in smaller. Smaller goals that happen beat big goals that don't.</p>
        <p style="margin-top: 8px;">If it feels too easy, consider stretching it — but only if that excites you.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Review Your Vault</a>
      
      <p>Reply if you want to talk it through. We're here.</p>
      <p>Tomorrow, we'll share resources if you need more breathing room.</p>
    `, unsubscribeLink)
  },
  {
    day: 10,
    subject: "More breathing room (if you need it)",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(10)}
      <p>Sometimes there truly isn't extra money — and that's real.</p>
      
      <div class="did-you-know">
        <h4>💡 Did you know?</h4>
        <p><strong>78% of Americans</strong> live paycheck to paycheck. If saving feels hard, you're not alone — and you're not failing. The system makes this difficult.</p>
      </div>
      
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Bookmark one helpful page for when you're ready:</p>
        <p style="margin-top: 8px;"><a href="https://savetogether.co/savings-guide" style="color: #059669;"><strong>Savings Guide</strong></a> — Learn about different savings account types to maximize your money</p>
        <p style="margin-top: 4px;"><a href="https://savetogether.co/earn-more" style="color: #059669;"><strong>Earn More</strong></a> — Side income ideas that actually work</p>
      </div>
      
      <p>Don't try to do everything. Just know these exist when you need them.</p>
      <p>Tomorrow is a rest day.</p>
    `, unsubscribeLink)
  },
  {
    day: 11,
    subject: "You're still doing great",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(11)}
      <p><strong>No action today.</strong> Just 3 more days after this.</p>
      
      <div class="mindset-moment">
        <h4>✨ Mindset Moment</h4>
        <p class="quote">"Consistency beats intensity. The $5 you transfer to your savings account every week matters more than the $500 you planned to save 'someday.'"</p>
        <p>Staying engaged is the win. You've opened these emails. You've thought about your money differently. That's not nothing — that's the foundation of real change.</p>
        <p class="reflection">💭 What would reaching this goal change for you — not just financially, but emotionally?</p>
      </div>
      
      <p>Tomorrow, we strengthen the habit.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  {
    day: 12,
    subject: "Day 12: Strengthen the habit",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(12)}
      <p>You've practiced saving manually. That matters more than you think.</p>
      
      <div class="did-you-know">
        <h4>💡 Did you know?</h4>
        <p>The <strong>$1 you save today is worth more</strong> than the $10 you plan to save "someday." Action — any action — builds the neural pathways that make saving automatic over time.</p>
      </div>
      
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Transfer any amount to your savings account — even $1.</p>
        <p style="margin-top: 8px;">Then click off the matching amount in your vault.</p>
        <p style="margin-top: 8px;">The point isn't the amount. The point is proving to yourself that you can move money on purpose, whenever you choose.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Update Your Vault</a>
      
      <div class="micro-story">
        💬 "I transfer $3 to my savings every time I make coffee at home instead of buying it out. It's not much, but seeing those amounts get clicked off in my vault changed how I think about small decisions." — SaveTogether user
      </div>
      
      <p>Reply "done" if you want quiet accountability.</p>
      <p>Tomorrow, we pause again.</p>
    `, unsubscribeLink)
  },
  {
    day: 13,
    subject: "Almost there",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(13)}
      <p><strong>No action today.</strong> Final rest before the finish.</p>
      
      <div class="mindset-moment">
        <h4>✨ Mindset Moment</h4>
        <p class="quote">"The goal was never perfection. The goal was practice. And you've been practicing."</p>
        <p>Tomorrow we wrap up — but this isn't really an ending. You've built something that doesn't stop on day 14. The vault stays. The savings account stays. The rhythm stays. The awareness stays.</p>
        <p class="reflection">💭 What will you do differently going forward? What surprised you about this process?</p>
      </div>
      
      <p>Tomorrow, we celebrate what you've built.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  {
    day: 14,
    subject: "🏆 Day 14: You did it",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      ${getProgressBar(14)}
      <p><strong>You built a system — not just a number.</strong></p>
      
      <div class="week-summary">
        <h4>🎓 What you learned in 14 days:</h4>
        <ul>
          <li>How to create goals that actually motivate you</li>
          <li>The power of a dedicated savings account</li>
          <li>Where your money was quietly leaking</li>
          <li>The power of small, consistent action</li>
          <li>How to adjust without feeling like you failed</li>
          <li>That showing up matters more than being perfect</li>
        </ul>
      </div>
      
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Reply and tell us one thing you're proud of.</p>
        <p style="margin-top: 8px;">Then check your vault to see your progress!</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">View Your Progress</a>
      
      <p><strong>What's next?</strong></p>
      <ul>
        <li>Keep your saving rhythm going — transfer to savings, click off in vault</li>
        <li>Set a new milestone when you hit this one</li>
        <li>Invite someone to save with you</li>
        <li>Come back to the Savings Guide or Earn More when you need ideas</li>
      </ul>
      
      <div class="micro-story">
        💬 Want to share your experience? Reply to this email — we might feature your story (anonymously) to inspire others.
      </div>
      
      <p>We're really glad you did this with us.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  }
];

// Generate unsubscribe token
async function generateUnsubscribeToken(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + UNSUBSCRIBE_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, user_id, day } = await req.json();

    if (!email || day === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and day" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailContent = challengeEmails.find(e => e.day === day);
    if (!emailContent) {
      return new Response(
        JSON.stringify({ error: `No email content found for day ${day}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate unsubscribe link
    const testUserId = user_id || "test-user-id";
    const token = await generateUnsubscribeToken(testUserId);
    const unsubscribeLink = `${SUPABASE_URL}/functions/v1/unsubscribe-emails?user_id=${testUserId}&token=${token}&type=vault_starter`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SaveTogether <hello@savetogether.co>",
        to: [email],
        subject: `[TEST] ${emailContent.subject}`,
        html: emailContent.getHtml(unsubscribeLink),
      }),
    });

    const resendData = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Test email sent successfully for day ${day} to ${email}`);

    return new Response(
      JSON.stringify({ success: true, day, email, messageId: resendData.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in test-challenge-email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
