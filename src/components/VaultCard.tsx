import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';
import { Flame } from 'lucide-react';

interface VaultCardProps {
  id: string;
  name: string;
  goalAmount: number;
  savedAmount: number;
  currentStreak?: number;
  streakFrequency?: string;
}

export function VaultCard({ id, name, goalAmount, savedAmount, currentStreak = 0, streakFrequency = 'weekly' }: VaultCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card
      className="p-6 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => navigate(`/vault/${id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        {currentStreak > 0 && (
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-medium">{currentStreak}</span>
          </div>
        )}
      </div>
      <ProgressBar current={savedAmount} goal={goalAmount} />
    </Card>
  );
}
