import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidRecovery, setIsValidRecovery] = useState(false);
  const { updatePassword, user, isRecoveryMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash?.replace(/^#/, '') ?? '';
    const hashParams = new URLSearchParams(hash);
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    if (type === 'recovery' && accessToken) {
      setIsValidRecovery(true);
    } else if (isRecoveryMode) {
      setIsValidRecovery(true);
    } else {
      // No valid recovery session, redirect to auth
      toast({
        title: 'Invalid or expired link',
        description: 'Please request a new password reset link.',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [isRecoveryMode, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please enter and confirm your new password.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords match.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password updated!',
          description: 'Your password has been changed successfully.',
        });
        // Clear URL hash and navigate home
        window.location.hash = '';
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isValidRecovery) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
            SaveTogether
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Set your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="h-12"
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="h-12"
          />
          <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
            {loading ? '...' : 'Update Password'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            to="/auth"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
