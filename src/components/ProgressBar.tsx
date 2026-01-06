interface ProgressBarProps {
  current: number;
  goal: number;
}

export function ProgressBar({ current, goal }: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">
          ${current.toLocaleString()}
        </span>
        <span className="text-muted-foreground">
          ${goal.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-center text-sm text-muted-foreground">
        {percentage.toFixed(0)}% complete
      </div>
    </div>
  );
}
