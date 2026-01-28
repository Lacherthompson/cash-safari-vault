
# Emotional Hook and Trust Improvements

This plan implements the 3 key changes from the UX feedback to create emotional connection and reduce friction for new visitors.

---

## Summary

The feedback identifies that while the product is solid, the homepage lacks emotional pull and the first action feels like a big commitment. We'll address this with:

1. **Reframed CTAs** - Change from system language ("Create a vault") to tiny-win language ("Start with $5")
2. **Pain-point messaging** - Add a sentence that makes users feel understood
3. **Reassurance micro-copy** - Add trust signals at hesitation points

---

## Change 1: Reframe CTAs to Tiny Wins

**Current state:**
- Landing page: "Start Saving Free"
- Empty state: "Create Your First Vault"
- Vault dialog button: "New Vault"

**New approach:**
- Landing page: "Try Your First Vault — Free"
- Secondary CTA: "See How It Works" (keep as-is, it's good)
- Empty state: "Start with a Small Goal"
- Vault dialog button: "Try a Vault"

**Files to modify:**
- `src/pages/LandingPage.tsx` - Primary CTA button text
- `src/components/EmptyState.tsx` - First vault creation CTA
- `src/components/CreateVaultDialog.tsx` - Dialog trigger button

---

## Change 2: Add Pain-Point Messaging

Add a line that names the struggle directly on the landing page, making users feel seen.

**New copy to add below the hero subheading:**

> "Saving feels hard — not because you're bad with money, but because most tools don't make it feel human."

**Placement:** After the current subheading ("Set a goal, check off each save..."), add this as a second paragraph with slightly different styling to stand out.

**File to modify:**
- `src/pages/LandingPage.tsx` - Hero section

---

## Change 3: Add Reassurance Micro-Copy

Add trust-building micro-copy at key hesitation points.

**Auth page (signup mode):**
- Below the "Create Account" button, add: "Free forever for personal use. No credit card needed."

**Vault creation dialog:**
- Below the form fields, add: "Start small — most people begin with $100 or less. You can change this anytime."

**Empty state page:**
- Below the CTA button, add: "No pressure — you can delete or edit vaults anytime."

**Files to modify:**
- `src/pages/Auth.tsx` - Signup reassurance
- `src/components/CreateVaultDialog.tsx` - Goal-setting reassurance
- `src/components/EmptyState.tsx` - First vault reassurance

---

## Technical Details

### LandingPage.tsx Changes

**Hero section updates:**
```text
Line ~136: Change "Start Saving Free" → "Try Your First Vault — Free"

Line ~126-128: After the existing subheading paragraph, add new pain-point line:
<p className="text-base text-muted-foreground/80 max-w-xl mx-auto italic">
  Saving feels hard — not because you're bad with money, 
  but because most tools don't make it feel human.
</p>

Line ~167: Change "Get Started" → "Start Your First Vault"
```

### Auth.tsx Changes

**Signup mode reassurance:**
```text
Line ~195: After the submit button, when not in login mode, add:
{!isLogin && !isForgotPassword && (
  <p className="text-xs text-muted-foreground text-center">
    Free forever for personal use. No credit card needed.
  </p>
)}
```

### CreateVaultDialog.tsx Changes

**Button text and reassurance:**
```text
Line ~89: Change "New Vault" → "Try a Vault"

Line ~124: Before the submit button, add:
<p className="text-xs text-muted-foreground">
  Start small — most people begin with $100 or less. You can change this anytime.
</p>
```

### EmptyState.tsx Changes

**CTA and reassurance:**
```text
Line ~24-26: Change button text from "Create Your First Vault" → "Start with a Small Goal"

Line ~27: Add after button:
<p className="text-sm text-muted-foreground mt-3">
  No pressure — you can delete or edit vaults anytime.
</p>
```

---

## Expected Impact

| Metric | Expected Change |
|--------|-----------------|
| Bounce rate | Decrease (emotional hook in first 5 seconds) |
| Sign-up rate | Increase (lower perceived commitment) |
| Vault creation | Increase (reassurance reduces hesitation) |
| Time on page | Increase (pain-point copy creates engagement) |

---

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/LandingPage.tsx` | CTA text, pain-point messaging |
| `src/pages/Auth.tsx` | Signup reassurance micro-copy |
| `src/components/CreateVaultDialog.tsx` | Button text, form reassurance |
| `src/components/EmptyState.tsx` | CTA text, post-button reassurance |
