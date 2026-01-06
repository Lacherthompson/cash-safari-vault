import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';
import { Flame } from 'lucide-react';
import { getVaultColorHsl } from '@/lib/vaultColors';

interface VaultCardProps {
  id: string;
  name: string;
  goalAmount: number;
  savedAmount: number;
  currentStreak?: number;
  streakFrequency?: string;
  accentColor?: string;
}

export function VaultCard({ 
  id, 
  name, 
  goalAmount, 
  savedAmount, 
  currentStreak = 0, 
  streakFrequency = 'weekly',
  accentColor = 'emerald'
}: VaultCardProps) {
  const navigate = useNavigate();
  const colorHsl = getVaultColorHsl(accentColor);
  const percentage = Math.min((savedAmount / goalAmount) * 100, 100);
  
  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5 border-border/60"
      onClick={() => navigate(`/vault/${id}`)}
    >
      {/* Accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
        style={{ 
          backgroundColor: `hsl(${colorHsl})`,
          width: `${percentage}%`
        }}
      />
      
      <div className="p-6 pt-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-lg tracking-tight">{name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              ${savedAmount.toLocaleString()} saved
            </p>
          </div>
          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{currentStreak}</span>
            </div>
          )}
        </div>
        <ProgressBar 
          current={savedAmount} 
          goal={goalAmount} 
          accentColor={accentColor}
        />
      </div>
    </Card>
  );
}
