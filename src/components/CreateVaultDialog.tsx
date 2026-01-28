import { useState, forwardRef, useImperativeHandle } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ColorPicker';
import { Plus } from 'lucide-react';
import { VaultColorId } from '@/lib/vaultColors';

interface CreateVaultDialogProps {
  onCreateVault: (name: string, goalAmount: number, accentColor: VaultColorId) => Promise<void>;
}

export interface CreateVaultDialogRef {
  open: () => void;
}

const MAX_NAME_LENGTH = 100;
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 1000000000;

export const CreateVaultDialog = forwardRef<CreateVaultDialogRef, CreateVaultDialogProps>(
  function CreateVaultDialog({ onCreateVault }, ref) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [accentColor, setAccentColor] = useState<VaultColorId>('emerald');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }));

    const validateInputs = (vaultName: string, amount: number): string | null => {
      if (vaultName.length > MAX_NAME_LENGTH) {
        return `Name must be ${MAX_NAME_LENGTH} characters or less`;
      }
      if (amount < MIN_AMOUNT) {
        return `Minimum goal is $${MIN_AMOUNT}`;
      }
      if (amount > MAX_AMOUNT) {
        return `Maximum goal is $${MAX_AMOUNT.toLocaleString()}`;
      }
      return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      
      const cleanedAmount = goalAmount.replace(/,/g, '');
      const amount = parseInt(cleanedAmount, 10);
      const vaultName = name.trim() || 'My Vault';
      
      const validationError = validateInputs(vaultName, amount || 0);
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setLoading(true);
      try {
        await onCreateVault(vaultName, amount, accentColor);
        setOpen(false);
        setName('');
        setGoalAmount('');
        setAccentColor('emerald');
        setError(null);
      } catch {
        setError('Failed to create vault. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.slice(0, MAX_NAME_LENGTH);
      setName(value);
      setError(null);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9,]/g, '');
      setGoalAmount(value);
      setError(null);
    };

    return (
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setError(null);
          setAccentColor('emerald');
        }
      }}>
        <DialogTrigger asChild>
          <Button className="gap-2 shadow-soft">
            <Plus className="h-4 w-4" />
            Try a Vault
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Create a Vault</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="vault-name">Vault Name</Label>
              <Input
                id="vault-name"
                placeholder="e.g. Emergency Fund"
                value={name}
                onChange={handleNameChange}
                maxLength={MAX_NAME_LENGTH}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                {name.length}/{MAX_NAME_LENGTH} characters
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-amount">Savings Goal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="goal-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="10,000"
                  value={goalAmount}
                  onChange={handleAmountChange}
                  required
                  className="h-11 pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                $10 – $1,000,000,000
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <ColorPicker value={accentColor} onChange={setAccentColor} />
            </div>
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            
            <p className="text-xs text-muted-foreground">
              Start small — most people begin with $100 or less. You can change this anytime.
            </p>
            
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? 'Creating...' : 'Create Vault'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
