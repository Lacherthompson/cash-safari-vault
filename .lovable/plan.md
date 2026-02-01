

# Add Scroll Depth Tracking

This feature will measure how far users scroll on the landing page, helping identify exactly where Facebook traffic drops off.

---

## What This Will Track

| Threshold | What It Means |
|-----------|---------------|
| 25% | User saw the hero section and demo |
| 50% | User scrolled past social proof stats |
| 75% | User reached the testimonials section |
| 100% | User saw the entire page including footer CTA |

Each threshold fires only once per page view to avoid duplicate events.

---

## Implementation Approach

### 1. Create a Scroll Depth Tracking Hook

A new custom hook `useScrollDepthTracking` that:
- Calculates scroll percentage based on document height
- Fires Google Analytics events at 25%, 50%, 75%, and 100% thresholds
- Tracks which thresholds have already fired (prevents duplicates)
- Includes device type (mobile/desktop) for segmentation
- Cleans up event listeners on unmount

### 2. Add Analytics Event Function

Add a new tracking function in `analytics.ts`:

```typescript
export const trackScrollDepth = (
  depth: number, 
  page: string,
  deviceType: 'mobile' | 'desktop'
) => {
  trackEvent('scroll_depth', {
    depth_percentage: depth,
    page_path: page,
    device_type: deviceType,
  });
};
```

### 3. Integrate with Landing Page

Add the hook to `LandingPage.tsx` to start tracking when the page loads.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/hooks/useScrollDepthTracking.ts` | Create new hook |
| `src/lib/analytics.ts` | Add `trackScrollDepth` function |
| `src/pages/LandingPage.tsx` | Import and use the hook |

---

## Technical Details

The hook will use the Intersection Observer API for efficiency (no scroll event spam):

```typescript
// Thresholds to track
const SCROLL_THRESHOLDS = [25, 50, 75, 100];

// Calculate scroll percentage
const getScrollPercentage = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  return Math.round((scrollTop / docHeight) * 100);
};
```

Alternatively, a throttled scroll listener approach works well for this use case since we only need to fire events at 4 specific points.

---

## Viewing the Data

After publishing, you'll be able to see scroll depth data in Google Analytics under:
- **Reports > Engagement > Events**
- Filter by event name: `scroll_depth`
- Segment by `device_type` to compare mobile vs desktop behavior

This will show you exactly what percentage of mobile visitors scroll past each section.

