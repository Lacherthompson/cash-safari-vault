import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackScrollDepth } from '@/lib/analytics';

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

export const useScrollDepthTracking = () => {
  const location = useLocation();
  const firedThresholds = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Reset thresholds on route change
    firedThresholds.current = new Set();

    const getScrollPercentage = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return 0;
      return Math.round((scrollTop / docHeight) * 100);
    };

    const getDeviceType = (): 'mobile' | 'desktop' => {
      return window.innerWidth < 768 ? 'mobile' : 'desktop';
    };

    const handleScroll = () => {
      const scrollPercentage = getScrollPercentage();
      const deviceType = getDeviceType();

      for (const threshold of SCROLL_THRESHOLDS) {
        if (scrollPercentage >= threshold && !firedThresholds.current.has(threshold)) {
          firedThresholds.current.add(threshold);
          trackScrollDepth(threshold, location.pathname, deviceType);
        }
      }
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Check initial scroll position (user might land mid-page)
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [location.pathname]);
};
