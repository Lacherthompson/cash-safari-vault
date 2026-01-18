import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, Flame } from 'lucide-react';

const DEMO_AMOUNTS = [5, 12, 8, 25, 15, 3, 20, 10, 18, 7, 30, 2];
const GOAL = 500;

// Sequence of tile indices to auto-check (creates a satisfying pattern)
const CHECK_SEQUENCE = [0, 4, 7, 2, 10, 5];

function DemoTile({ 
  amount, 
  isChecked, 
  isAnimating 
}: { 
  amount: number; 
  isChecked: boolean;
  isAnimating: boolean;
}) {
  return (
    <div
      className={`
        relative flex items-center justify-center rounded-full w-11 h-11 sm:w-12 sm:h-12 
        border font-medium select-none overflow-hidden transition-all duration-300
        ${isChecked 
          ? 'bg-primary border-primary scale-100' 
          : 'bg-accent border-border'
        }
        ${isAnimating ? 'scale-110' : ''}
      `}
    >
      {/* Unchecked state */}
      <span 
        className={`absolute text-xs font-medium transition-all duration-300 ${
          isChecked ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
        }`}
      >
        ${amount}
      </span>
      
      {/* Checked state */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ${
          isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      >
        <Check className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
        <span className="text-[8px] text-primary-foreground/80 font-semibold">${amount}</span>
      </div>
    </div>
  );
}

export function VaultDemo() {
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set([3, 8, 11])); // Start with some checked
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // Calculate progress
  const checkedAmounts = DEMO_AMOUNTS.filter((_, i) => checkedIndices.has(i));
  const totalSaved = checkedAmounts.reduce((sum, amt) => sum + amt, 0);
  const progressPercent = Math.min((totalSaved / GOAL) * 100, 100);

  // Auto-animate checking tiles
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = CHECK_SEQUENCE[sequenceIndex % CHECK_SEQUENCE.length];
      
      // Animate the tile
      setAnimatingIndex(nextIndex);
      
      // Toggle the checked state after a small delay
      setTimeout(() => {
        setCheckedIndices(prev => {
          const next = new Set(prev);
          if (next.has(nextIndex)) {
            next.delete(nextIndex);
          } else {
            next.add(nextIndex);
          }
          return next;
        });
        setAnimatingIndex(null);
      }, 200);

      setSequenceIndex(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [sequenceIndex]);

  return (
    <Card className="bg-card/80 border-border/60 p-5 sm:p-6 max-w-sm mx-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-display font-semibold text-foreground">Vacation Fund</h4>
          <p className="text-xs text-muted-foreground">Goal: $500</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <Flame className="w-4 h-4" />
          <span>3 day streak</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-2xl font-display font-bold text-foreground">${totalSaved}</span>
          <span className="text-sm text-muted-foreground">{progressPercent.toFixed(0)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Amount tiles grid */}
      <div className="grid grid-cols-6 gap-2 justify-items-center">
        {DEMO_AMOUNTS.map((amount, index) => (
          <DemoTile
            key={index}
            amount={amount}
            isChecked={checkedIndices.has(index)}
            isAnimating={animatingIndex === index}
          />
        ))}
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        Tap amounts as you save them ✨
      </p>
    </Card>
  );
}
