interface AmountTileProps {
  amount: number;
  isChecked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function AmountTile({ amount, isChecked, onToggle, disabled, isLoading }: AmountTileProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled || isLoading}
      className={`amount-circle ${isChecked ? 'checked' : ''} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Unchecked state: show amount */}
      <span className={`amount-text ${isChecked ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
        ${amount}
      </span>
      
      {/* Checked state: show checkmark + small amount below */}
      <div className={`checked-content ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <svg
          className="checkmark-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline className="checkmark-path" points="20 6 9 17 4 12" />
        </svg>
        <span className="checked-amount">${amount}</span>
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      )}
    </button>
  );
}
