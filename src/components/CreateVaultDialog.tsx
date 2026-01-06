import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface CreateVaultDialogProps {
  onCreateVault: (name: string, goalAmount: number) => Promise<void>;
}

export function CreateVaultDialog({ onCreateVault }: CreateVaultDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedAmount = goalAmount.replace(/,/g, '');
    const amount = parseInt(cleanedAmount, 10);
    if (!amount || amount < 10) return;
    
    setLoading(true);
    try {
      await onCreateVault(name || 'My Vault', amount);
      setOpen(false);
      setName('');
      setGoalAmount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Savings goal ($)"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              min={10}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Minimum $10
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Vault'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
