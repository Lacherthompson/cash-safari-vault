import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

type Variant = 'A' | 'B';

interface ABTestConfig {
  testName: string;
  variants: {
    A: string;
    B: string;
  };
}

interface ABTestResult {
  variant: Variant;
  value: string;
}

/**
 * Simple A/B testing hook that:
 * 1. Assigns users to a variant (persisted in localStorage)
 * 2. Tracks the assignment in Google Analytics
 * 3. Returns the variant and value to display
 */
export function useABTest(config: ABTestConfig): ABTestResult {
  const storageKey = `ab_test_${config.testName}`;
  
  const [variant, setVariant] = useState<Variant>(() => {
    // Check if user already has an assignment
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'A' || stored === 'B') {
        return stored;
      }
    }
    // Randomly assign 50/50
    return Math.random() < 0.5 ? 'A' : 'B';
  });

  useEffect(() => {
    // Persist the assignment
    localStorage.setItem(storageKey, variant);
    
    // Track the variant view in analytics
    trackEvent('ab_test_view', {
      test_name: config.testName,
      variant: variant,
      headline: config.variants[variant],
    });
  }, [variant, config.testName, config.variants, storageKey]);

  return {
    variant,
    value: config.variants[variant],
  };
}

/**
 * Track when a user converts (clicks CTA) with their variant
 */
export function trackABConversion(testName: string, variant: Variant) {
  trackEvent('ab_test_conversion', {
    test_name: testName,
    variant: variant,
  });
}
