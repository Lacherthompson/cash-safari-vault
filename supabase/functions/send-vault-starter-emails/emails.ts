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
  // Day 0 - Welcome Email (sent immediately after purchase via stripe-webhook)
  {
    day: 0,
    subject: "Welcome to Vault Starter. Let's do this together.",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <h2>We're really glad you're here.</h2>
      <p>Saving can feel intimidating, especially if money has mostly been about survival, stress, or "I'll deal with it later." Vault Starter exists because we believe saving shouldn't require perfection, spreadsheets, or guilt.</p>
      <p>Over the next 14 days, we'll walk through this together. Small steps. Realistic actions. No shaming. No "just stop buying coffee" nonsense.</p>
      <p>You might see us mention something called "Today's action." That just means the one small step we're suggesting for the day. There's never more than one, and it's always optional.</p>
      <p>Some days will take five minutes. Some days are rest days. All days are designed to help you feel more in control, not more overwhelmed.</p>
      <p><strong>Tomorrow, we start with the easiest win.</strong></p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  
  // Day 1
  {
    day: 1,
    subject: "Day 1: The easiest win (promise)",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p>We used to think saving had to start with a big lifestyle change. Turns out, momentum matters more than amount.</p>
      <p>Today is about creating a place for your savings to live.</p>
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
        <p style="margin-top: 12px;">Set the total amount. You'll manually add savings as you go.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Create Your Vault</a>
      <p>If you want, hit reply and tell us what you named it.</p>
      <p>Tomorrow, we'll make this vault feel more real without adding stress.</p>
    `, unsubscribeLink)
  },
  
  // Day 2
  {
    day: 2,
    subject: "Day 2: Make it feel real",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p>A goal only sticks if it feels personal.</p>
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Add one personal detail to your vault:</p>
        <ul>
          <li>A description of why it matters</li>
          <li>A start date</li>
          <li>Or invite someone to save with you</li>
        </ul>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Open Your Vault</a>
      <p>Reply if you invited someone — we love seeing shared goals.</p>
      <p>Tomorrow, we'll find money you already have.</p>
    `, unsubscribeLink)
  },
  
  // Day 3
  {
    day: 3,
    subject: "The $50 you're about to find",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p>Most people don't fail at saving. They just don't know where their money is quietly leaking.</p>
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Check your bank or card app for one forgotten or unnecessary charge.</p>
        <p style="margin-top: 8px;">Cancel it or downgrade it.</p>
        <p style="margin-top: 8px;">Move that amount into your vault, even if it's small.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Add to Your Vault</a>
      <p>Reply and tell us what you found.</p>
      <p><strong>Tomorrow is a rest day.</strong> That's intentional.</p>
    `, unsubscribeLink)
  },
  
  // Day 4 (REST)
  {
    day: 4,
    subject: "Let the win sink in",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p><strong>No action today.</strong></p>
      <p>Yesterday proved that money can move with intention.</p>
      <p>Tomorrow, we'll talk about building a saving rhythm.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  
  // Day 5
  {
    day: 5,
    subject: "Day 5: Pick your saving moment",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p>What works isn't motivation — it's rhythm.</p>
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Decide when you'll manually add money to your vault.</p>
        <p style="margin-top: 8px;"><strong>Examples:</strong></p>
        <ul>
          <li>After payday</li>
          <li>End of the week</li>
          <li>After a no-spend day</li>
        </ul>
        <p style="margin-top: 8px;">Write it down somewhere visible.</p>
      </div>
      <p>Reply if you want accountability.</p>
      <p>Tomorrow is a recovery day.</p>
    `, unsubscribeLink)
  },
  
  // Day 6 (REST)
  {
    day: 6,
    subject: "You didn't fall behind",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p><strong>No action today.</strong></p>
      <p>If you missed something earlier, you didn't fail.</p>
      <p>Tomorrow, we'll check progress gently.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  
  // Day 7
  {
    day: 7,
    subject: "One week in",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p>Most people have already:</p>
      <ul>
        <li>Created a real goal</li>
        <li>Found extra money</li>
        <li>Built awareness</li>
      </ul>
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Check your progress bar.</p>
        <p style="margin-top: 8px;">Adjust the goal if needed — or keep it as is.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Check Your Progress</a>
      <p>Reply and tell us how week one felt.</p>
      <p>Tomorrow, we slow down.</p>
    `, unsubscribeLink)
  },
  
  // Day 8 (REST)
  {
    day: 8,
    subject: "Midpoint pause",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p><strong>No action today.</strong></p>
      <p>Tomorrow, we'll do a quick check-in.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  
  // Day 9
  {
    day: 9,
    subject: "Day 9: Quick check-in",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p>Halfway through is where honesty matters most.</p>
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Ask yourself: does this goal still feel doable?</p>
        <p style="margin-top: 8px;">Adjust if needed — smaller is smarter.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Review Your Vault</a>
      <p>Reply if you want to talk it through.</p>
      <p>Tomorrow, we'll share resources if you need more breathing room.</p>
    `, unsubscribeLink)
  },
  
  // Day 10
  {
    day: 10,
    subject: "More breathing room (if you need it)",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p>Sometimes there truly isn't extra money — and that's real.</p>
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Bookmark one helpful page:</p>
        <p style="margin-top: 8px;"><a href="https://savetogether.co/savings-guide" style="color: #059669;">Savings Guide</a></p>
        <p style="margin-top: 4px;"><a href="https://savetogether.co/earn-more" style="color: #059669;">Earn More</a></p>
      </div>
      <p>Don't do everything.</p>
      <p>Tomorrow is a rest day.</p>
    `, unsubscribeLink)
  },
  
  // Day 11 (REST)
  {
    day: 11,
    subject: "You're still doing great",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p><strong>No action today.</strong></p>
      <p>Staying engaged is the win.</p>
      <p>Tomorrow, we strengthen the habit.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  
  // Day 12
  {
    day: 12,
    subject: "Day 12: Strengthen the habit",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p>You've practiced saving manually. That matters.</p>
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Add any amount to your vault — even $1.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">Add to Your Vault</a>
      <p>Reply "done" if you want quiet accountability.</p>
      <p>Tomorrow, we pause again.</p>
    `, unsubscribeLink)
  },
  
  // Day 13 (REST)
  {
    day: 13,
    subject: "Almost there",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p><strong>No action today.</strong></p>
      <p>Tomorrow, we wrap this up.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  },
  
  // Day 14
  {
    day: 14,
    subject: "Don't stop now",
    getHtml: (unsubscribeLink: string) => getEmailWrapper(`
      <p>You built a system — not just a number.</p>
      <div class="action-box">
        <h3>📌 Today's action</h3>
        <p>Reply and tell us one thing you're proud of.</p>
        <p style="margin-top: 8px;">Then check your next vault milestone.</p>
      </div>
      <a href="https://savetogether.co/" class="cta-button">View Your Progress</a>
      <p>We're really glad you did this with us.</p>
      <p>— SaveTogether</p>
    `, unsubscribeLink)
  }
];
