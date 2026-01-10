import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, updatePassword, user, isRecoveryMode, clearRecoveryMode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get redirect path from URL params (for vault invitations)
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    // Only redirect if user is logged in AND not in recovery mode
    if (user && !isRecoveryMode) {
      navigate(redirectPath);
    }
  }, [user, isRecoveryMode, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle password update (recovery mode)
    if (isRecoveryMode) {
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
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
      return;
    }
    
    if (isForgotPassword) {
      if (!email) {
        toast({
          title: 'Missing email',
          description: 'Please enter your email address.',
          variant: 'destructive',
        });
        return;
      }
      
      setLoading(true);
      try {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Check your email',
            description: 'We sent a password reset link to your email.',
          });
          setIsForgotPassword(false);
        }
      } finally {
        setLoading(false);
      }
      return;
    }
    
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password.',
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
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Invalid credentials',
              description: 'Check your email and password.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Already registered',
              description: 'This email is already in use. Try signing in.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome!',
            description: 'Account created successfully.',
          });
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
            SaveTogether
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {isRecoveryMode
              ? 'Set your new password'
              : isForgotPassword 
                ? 'Reset your password' 
                : isLogin 
                  ? 'Welcome back' 
                  : 'Start your savings journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRecoveryMode ? (
            <>
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
            </>
          ) : (
            <>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-12"
              />
              {!isForgotPassword && (
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="h-12"
                />
              )}
            </>
          )}
          <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
            {loading 
              ? '...' 
              : isRecoveryMode
                ? 'Update Password'
                : isForgotPassword 
                  ? 'Send Reset Link' 
                  : isLogin 
                    ? 'Sign In' 
                    : 'Create Account'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          {isRecoveryMode ? (
            <button
              type="button"
              onClick={() => {
                clearRecoveryMode();
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel and sign in
            </button>
          ) : isForgotPassword ? (
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/40">
          <Link 
            to="/how-to-use" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            How it works
          </Link>
          <Link 
            to="/savings-guide" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Savings Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
