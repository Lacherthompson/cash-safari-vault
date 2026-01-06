import { useState } from 'react';
import { MoreVertical, Pencil, Trash2, RotateCcw, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type SortOption = 'default' | 'amount-asc' | 'amount-desc' | 'checked-first' | 'unchecked-first';

interface VaultMenuProps {
  vaultName: string;
  streakFrequency: string;
  onEdit: (name: string, frequency: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onReset: () => Promise<void>;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  isOwner: boolean;
}

export function VaultMenu({ 
  vaultName, 
  streakFrequency,
  onEdit, 
  onDelete, 
  onReset, 
  sortOption, 
  onSortChange,
  isOwner 
}: VaultMenuProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [editName, setEditName] = useState(vaultName);
  const [editFrequency, setEditFrequency] = useState(streakFrequency);
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    setLoading(true);
    try {
      await onEdit(editName, editFrequency);
      setEditOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await onReset();
    } finally {
      setLoading(false);
      setResetOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSortOpen(true)}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort Amounts
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuItem onClick={() => {
                setEditName(vaultName);
                setEditFrequency(streakFrequency);
                setEditOpen(true);
              }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Vault
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResetOpen(true)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Progress
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Vault
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Dialog */}
      <Dialog open={sortOpen} onOpenChange={setSortOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sort Amounts</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { value: 'default', label: 'Default (Original Order)' },
              { value: 'amount-asc', label: 'Amount: Low to High' },
              { value: 'amount-desc', label: 'Amount: High to Low' },
              { value: 'checked-first', label: 'Checked First' },
              { value: 'unchecked-first', label: 'Unchecked First' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value as SortOption);
                  setSortOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  sortOption === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vault</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vault Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="My Vault"
              />
            </div>
            <div className="space-y-2">
              <Label>Streak Frequency</Label>
              <Select value={editFrequency} onValueChange={setEditFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How often you need to save to maintain your streak
              </p>
            </div>
            <Button onClick={handleEdit} className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this vault?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{vaultName}" and all saved progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This will uncheck all amounts in this vault. Your streak will also be reset. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              {loading ? 'Resetting...' : 'Reset Progress'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
