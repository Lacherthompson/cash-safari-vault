import { VAULT_COLORS, VaultColorId } from '@/lib/vaultColors';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  value: VaultColorId;
  onChange: (color: VaultColorId) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {VAULT_COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onChange(color.id)}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            "ring-2 ring-offset-2 ring-offset-background",
            value === color.id ? "ring-foreground scale-110" : "ring-transparent hover:ring-muted-foreground/50"
          )}
          style={{ backgroundColor: `hsl(${color.id === 'emerald' ? 'var(--vault-emerald)' : 
            color.id === 'blue' ? 'var(--vault-blue)' :
            color.id === 'violet' ? 'var(--vault-violet)' :
            color.id === 'amber' ? 'var(--vault-amber)' :
            color.id === 'rose' ? 'var(--vault-rose)' :
            'var(--vault-cyan)'})` }}
          aria-label={color.name}
        >
          {value === color.id && (
            <Check className="h-4 w-4 text-white drop-shadow-sm" />
          )}
        </button>
      ))}
    </div>
  );
}
