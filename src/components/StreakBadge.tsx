import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  frequency: string;
}

export function StreakBadge({ currentStreak, longestStreak, frequency }: StreakBadgeProps) {
  const frequencyLabel = {
    daily: 'day',
    weekly: 'week',
    biweekly: 'bi-week',
  }[frequency] || 'week';

  const plural = currentStreak === 1 ? '' : 's';

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-full ${currentStreak > 0 ? 'bg-orange-500/20' : 'bg-muted'}`}>
          <Flame className={`h-5 w-5 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <p className="text-sm font-medium">
            {currentStreak} {frequencyLabel}{plural} streak
          </p>
          <p className="text-xs text-muted-foreground">
            Best: {longestStreak} {frequencyLabel}{longestStreak === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </div>
  );
}
