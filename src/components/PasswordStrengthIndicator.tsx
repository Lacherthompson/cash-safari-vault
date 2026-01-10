import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

interface StrengthResult {
  level: StrengthLevel;
  score: number;
  label: string;
}

function calculateStrength(password: string): StrengthResult {
  let score = 0;
  
  if (password.length === 0) {
    return { level: 'weak', score: 0, label: '' };
  }
  
  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Determine level based on score
  if (score <= 2) {
    return { level: 'weak', score: 1, label: 'Weak' };
  } else if (score <= 3) {
    return { level: 'fair', score: 2, label: 'Fair' };
  } else if (score <= 5) {
    return { level: 'good', score: 3, label: 'Good' };
  } else {
    return { level: 'strong', score: 4, label: 'Strong' };
  }
}

const strengthColors: Record<StrengthLevel, string> = {
  weak: 'bg-destructive',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-green-500',
};

const strengthTextColors: Record<StrengthLevel, string> = {
  weak: 'text-destructive',
  fair: 'text-orange-500',
  good: 'text-yellow-500',
  strong: 'text-green-500',
};

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);
  
  if (password.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-200',
              segment <= strength.score
                ? strengthColors[strength.level]
                : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', strengthTextColors[strength.level])}>
        {strength.label}
      </p>
    </div>
  );
}
