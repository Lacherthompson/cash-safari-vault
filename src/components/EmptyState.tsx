import { Vault, Sparkles, Target, Users } from 'lucide-react';

interface EmptyStateProps {
  onCreateVault: () => void;
}

export function EmptyState({ onCreateVault }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-8 shadow-soft">
        <Vault className="w-12 h-12 text-primary" />
      </div>
      
      <h2 className="text-3xl font-display font-bold tracking-tight mb-3">Welcome to Cash Vault!</h2>
      <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
        Start your savings journey by creating your first vault. 
        Set a goal and check off amounts as you save.
      </p>

      <button
        onClick={onCreateVault}
        className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-elevated hover:shadow-premium hover:-translate-y-0.5 mb-16"
      >
        <Sparkles className="w-5 h-5" />
        Create Your First Vault
      </button>

      <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto text-left">
        <div className="p-5 rounded-xl bg-card border border-border/60 shadow-soft hover:shadow-elevated transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold mb-1.5">Set Your Goal</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Choose any savings target from $10 to millions
          </p>
        </div>
        
        <div className="p-5 rounded-xl bg-card border border-border/60 shadow-soft hover:shadow-elevated transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold mb-1.5">Check Amounts</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tap each amount as you save it and watch progress grow
          </p>
        </div>
        
        <div className="p-5 rounded-xl bg-card border border-border/60 shadow-soft hover:shadow-elevated transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold mb-1.5">Invite Friends</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Share vaults with others and save together
          </p>
        </div>
      </div>
    </div>
  );
}
