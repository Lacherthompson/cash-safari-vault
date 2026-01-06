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
      className={`amount-circle ${isChecked ? 'checked' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className={`amount-text ${isChecked ? 'fade-out' : 'fade-in'}`}>
        ${amount}
      </span>
      <svg
        className={`checkmark-icon ${isChecked ? 'fade-in' : 'fade-out'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline className="checkmark-path" points="20 6 9 17 4 12" />
      </svg>
    </button>
  );
}
