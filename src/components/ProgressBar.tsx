import { getVaultColorHsl } from '@/lib/vaultColors';

interface ProgressBarProps {
  current: number;
  goal: number;
  checkedCount?: number;
  totalCount?: number;
  accentColor?: string;
}

export function ProgressBar({ current, goal, checkedCount, totalCount, accentColor = 'emerald' }: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const showCount = checkedCount !== undefined && totalCount !== undefined;
  const colorHsl = getVaultColorHsl(accentColor);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-foreground">
          ${current.toLocaleString()}
        </span>
        <span className="text-muted-foreground font-medium">
          ${goal.toLocaleString()}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/80">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: `hsl(${colorHsl})`
          }}
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        {showCount ? (
          <>
            <span className="font-medium">{checkedCount}/{totalCount} checked</span>
            <span className="font-semibold" style={{ color: `hsl(${colorHsl})` }}>
              {percentage.toFixed(0)}%
            </span>
          </>
        ) : (
          <span 
            className="w-full text-center font-semibold"
            style={{ color: `hsl(${colorHsl})` }}
          >
            {percentage.toFixed(0)}% complete
          </span>
        )}
      </div>
    </div>
  );
}
