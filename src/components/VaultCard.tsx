import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';

interface VaultCardProps {
  id: string;
  name: string;
  goalAmount: number;
  savedAmount: number;
}

export function VaultCard({ id, name, goalAmount, savedAmount }: VaultCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card
      className="p-6 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => navigate(`/vault/${id}`)}
    >
      <h3 className="font-semibold text-lg mb-4">{name}</h3>
      <ProgressBar current={savedAmount} goal={goalAmount} />
    </Card>
  );
}
