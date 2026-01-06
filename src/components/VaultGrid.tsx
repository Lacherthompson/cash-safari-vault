import { AmountTile } from './AmountTile';

interface VaultAmount {
  id: string;
  amount: number;
  is_checked: boolean;
}

interface VaultGridProps {
  amounts: VaultAmount[];
  onToggle: (id: string, currentState: boolean) => void;
  disabled?: boolean;
}

export function VaultGrid({ amounts, onToggle, disabled }: VaultGridProps) {
  return (
    <div className="grid grid-cols-6 md:grid-cols-7 gap-2">
      {amounts.map((item) => (
        <AmountTile
          key={item.id}
          amount={item.amount}
          isChecked={item.is_checked}
          onToggle={() => onToggle(item.id, item.is_checked)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
