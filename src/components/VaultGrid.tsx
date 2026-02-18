import { AmountTile } from './AmountTile';

interface VaultAmount {
  id: string;
  amount: number;
  is_checked: boolean;
  user_id: string;
}

interface VaultGridProps {
  amounts: VaultAmount[];
  onToggle: (id: string, currentState: boolean) => void;
  disabled?: boolean;
  loadingId?: string | null;
  currentUserId?: string;
}

export function VaultGrid({ amounts, onToggle, disabled, loadingId, currentUserId }: VaultGridProps) {
  return (
    <div className="grid grid-cols-6 md:grid-cols-7 gap-2">
      {amounts.map((item) => {
        const isOwned = !currentUserId || item.user_id === currentUserId;
        return (
          <AmountTile
            key={item.id}
            amount={item.amount}
            isChecked={item.is_checked}
            onToggle={() => onToggle(item.id, item.is_checked)}
            disabled={disabled || !isOwned}
            isLoading={loadingId === item.id}
          />
        );
      })}
    </div>
  );
}
