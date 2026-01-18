import { useEffect, useState, useRef } from 'react';
import { Users, Target, PiggyBank, Shield, CreditCard, Lock } from 'lucide-react';
import { useSocialProof } from '@/hooks/useSocialProof';

function formatNumber(num: number, prefix = ''): string {
  if (num >= 1000000) {
    return `${prefix}${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `${prefix}${(num / 1000).toFixed(1)}K+`;
  }
  if (num >= 10) {
    return `${prefix}${num}+`;
  }
  return `${prefix}${num}`;
}

function useCountUp(target: number, duration = 1500): number {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated || target === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    const element = ref.current;
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [target, duration, hasAnimated]);

  return count;
}

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  prefix?: string;
}

function StatItem({ icon: Icon, value, label, prefix = '' }: StatItemProps) {
  const animatedValue = useCountUp(value);
  
  return (
    <div className="flex items-center gap-2.5">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-left">
        <div className="font-display font-bold text-lg text-foreground">
          {formatNumber(animatedValue, prefix)}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function SocialProofStats() {
  const { data, isLoading } = useSocialProof();

  // Don't show anything if loading or no data
  if (isLoading || !data) return null;

  // Only show stats if we have meaningful data
  const hasUsers = data.userCount > 0;
  const hasVaults = data.vaultCount > 0;
  const hasSaved = data.totalSaved > 0;

  if (!hasUsers && !hasVaults && !hasSaved) return null;

  return (
    <div className="space-y-8">
      {/* Live Stats */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {hasUsers && (
          <StatItem icon={Users} value={data.userCount} label="Savers" />
        )}
        {hasVaults && (
          <StatItem icon={Target} value={data.vaultCount} label="Goals Created" />
        )}
        {hasSaved && (
          <StatItem icon={PiggyBank} value={data.totalSaved} label="Saved Together" prefix="$" />
        )}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5" />
          <span>No credit card required</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          <span>Your data stays private</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          <span>Works with any bank</span>
        </div>
      </div>
    </div>
  );
}
