import { useState, forwardRef, useImperativeHandle } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface CreateVaultDialogProps {
  onCreateVault: (name: string, goalAmount: number) => Promise<void>;
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
        await onCreateVault(vaultName, amount);
        setOpen(false);
        setName('');
        setGoalAmount('');
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
        if (!isOpen) setError(null);
      }}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Vault
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Vault</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Vault name (optional)"
                value={name}
                onChange={handleNameChange}
                maxLength={MAX_NAME_LENGTH}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {name.length}/{MAX_NAME_LENGTH} characters
              </p>
            </div>
            <div>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Savings goal ($)"
                value={goalAmount}
                onChange={handleAmountChange}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                $10 – $1,000,000,000
              </p>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Vault'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
