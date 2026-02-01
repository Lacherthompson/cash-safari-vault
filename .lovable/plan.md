
# Optimize Mobile Landing for Facebook Traffic

This plan addresses the 98-99% bounce rate by restructuring the mobile landing page to capture attention within the first 0.5 seconds and communicate value before users scroll away.

---

## The Core Problem

Facebook users are bouncing in under 0.5 seconds. They're not scrolling, not reading, not clicking. The current mobile landing page has these issues:

1. Too much text above the fold
2. No immediate visual/interactive hook
3. CTA uses unfamiliar jargon ("Vault")
4. Trust signals load too slowly
5. Excessive padding wastes precious screen space

---

## Strategy: Show, Don't Tell

Instead of asking users to read paragraphs before seeing the product, we flip the experience:

```text
BEFORE (current):
┌────────────────────┐
│    [Large Logo]    │
│   [Badge Text]     │
│   [Big Headline]   │
│  [Paragraph 1...]  │
│  [Paragraph 2...]  │
│  [Two Buttons]     │
│   (scroll to see   │
│      demo...)      │
└────────────────────┘

AFTER (proposed):
┌────────────────────┐
│  [Compact Header]  │
│ [Trust: 2K+ savers]│
│ [Short Headline]   │
│                    │
│  ┌──────────────┐  │
│  │  VAULT DEMO  │  │ ← Interactive demo
│  │  (animated)  │  │   visible immediately
│  └──────────────┘  │
│                    │
│ [Start Free - CTA] │
└────────────────────┘
```

---

## Changes Overview

| Priority | Change | Impact |
|----------|--------|--------|
| High | Move VaultDemo above the fold on mobile | Immediate visual hook |
| High | Simplify headline for cold traffic | Instant comprehension |
| High | Remove jargon from CTA | Lower friction |
| Medium | Show static trust numbers first, then animate | Faster perceived load |
| Medium | Reduce padding on mobile | More content visible |
| Medium | Single primary CTA on mobile | Clearer action |
| Low | Show sticky CTA immediately on mobile | Always-visible action |

---

## Detailed Changes

### 1. Restructure Mobile Hero Section

Reorder content so the interactive demo appears above the fold on mobile:

```tsx
{/* Mobile-first layout */}
<section className="mx-auto max-w-5xl px-4 py-8 sm:py-16 text-center">
  {/* Trust badge - compact */}
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                  bg-primary/10 text-primary text-xs font-medium mb-4">
    <Sparkles className="h-3 w-3" />
    2,100+ savers • No bank link
  </div>
  
  {/* Shorter, clearer headline */}
  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold 
                 tracking-tight mb-4 sm:mb-6">
    {headline}
  </h2>
  
  {/* Hide secondary text on mobile */}
  <p className="hidden sm:block text-lg text-muted-foreground ...">
    Set a goal, check off each save...
  </p>
  
  {/* Demo FIRST on mobile, after text on desktop */}
  <div className="mb-6 sm:hidden">
    <VaultDemo />
  </div>
  
  {/* Single CTA on mobile */}
  <Button className="w-full sm:w-auto h-12 sm:h-14 ...">
    Start Saving Free
  </Button>
</section>
```

### 2. Simplify Headlines for Cold Traffic

Update the A/B test variants to remove jargon:

| Current | Proposed |
|---------|----------|
| "The Savings Method That Actually Works" | "Finally, saving made simple" |
| "Save Your First $1,000 — No Budgeting Required" | "Watch your savings grow, $5 at a time" |

### 3. Replace Jargon CTA

| Current | Proposed |
|---------|----------|
| "Try Your First Vault — Free" | "Start Saving Free" |
| "See How It Works" | (hide on mobile) |

### 4. Optimize Trust Signals Load

Pre-populate with approximate static values, then update with live data:

```tsx
// Show immediately, update when data loads
const fallbackStats = { userCount: 2100, vaultCount: 3400, totalSaved: 125000 };
const displayStats = data ?? fallbackStats;
```

### 5. Reduce Mobile Padding

```tsx
// Hero section
<section className="py-6 sm:py-16 ...">  {/* was py-16 sm:py-20 */}

// Badge
<div className="mb-3 sm:mb-6 ...">  {/* was mb-6 */}

// Headline
<h2 className="text-2xl sm:text-4xl ...">  {/* was text-4xl sm:text-5xl */}
```

### 6. Show Sticky CTA Immediately on Mobile

```tsx
// Remove scroll threshold on mobile
const [showStickyCTA, setShowStickyCTA] = useState(true); // Always show on mobile

useEffect(() => {
  // Only add scroll behavior for desktop
  if (window.innerWidth >= 640) {
    const handleScroll = () => setShowStickyCTA(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }
}, []);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/LandingPage.tsx` | Restructure hero layout, adjust padding, update CTAs |
| `src/components/SocialProofStats.tsx` | Add fallback static values for instant display |
| `src/hooks/useABTest.ts` | Update headline variants (optional) |

---

## Measuring Success

After publishing, track these metrics:

1. **Bounce rate** - Target: reduce from 98% to <80%
2. **Session duration** - Target: increase from 0.5s to >5s
3. **Scroll depth** - Target: >30% reach bottom of hero
4. **CTA click rate** - Target: >3% of visitors

---

## Important Note

These changes are not currently published. The live site is still running the old version. Before measuring impact:

1. Implement these mobile optimizations
2. **Publish** the changes
3. Wait 3-5 days for fresh traffic data
4. Compare analytics
