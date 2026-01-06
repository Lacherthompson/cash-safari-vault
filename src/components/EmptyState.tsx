import { Vault, Sparkles, Target, Users } from 'lucide-react';

interface EmptyStateProps {
  onCreateVault: () => void;
}

export function EmptyState({ onCreateVault }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Vault className="w-10 h-10 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Welcome to Cash Vault!</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Start your savings journey by creating your first vault. 
        Set a goal and check off amounts as you save.
      </p>

      <button
        onClick={onCreateVault}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors mb-12"
      >
        <Sparkles className="w-5 h-5" />
        Create Your First Vault
      </button>

      <div className="grid gap-6 sm:grid-cols-3 max-w-2xl mx-auto text-left">
        <div className="p-4 rounded-lg bg-card border border-border">
          <Target className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Set Your Goal</h3>
          <p className="text-sm text-muted-foreground">
            Choose any savings target from $10 to thousands
          </p>
        </div>
        
        <div className="p-4 rounded-lg bg-card border border-border">
          <Sparkles className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Check Amounts</h3>
          <p className="text-sm text-muted-foreground">
            Tap each amount as you save it and watch progress grow
          </p>
        </div>
        
        <div className="p-4 rounded-lg bg-card border border-border">
          <Users className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Invite Friends</h3>
          <p className="text-sm text-muted-foreground">
            Share vaults with others and save together
          </p>
        </div>
      </div>
    </div>
  );
}
