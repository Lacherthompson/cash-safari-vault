import { Check } from 'lucide-react';

interface AmountTileProps {
  amount: number;
  isChecked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function AmountTile({ amount, isChecked, onToggle, disabled }: AmountTileProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`amount-tile aspect-square w-full text-sm md:text-base ${isChecked ? 'checked' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isChecked ? (
        <svg
          className="w-5 h-5 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline className="checkmark" points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span>${amount}</span>
      )}
    </button>
  );
}
