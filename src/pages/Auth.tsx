import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { Footer } from '@/components/Footer';
import { HelpCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get redirect path from URL params (for vault invitations)
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    // If user lands on /auth with a recovery link, redirect to dedicated page
    const hash = window.location.hash?.replace(/^#/, '') ?? '';
    const hashParams = new URLSearchParams(hash);
    const type = hashParams.get('type');

    if (type === 'recovery') {
      navigate(`/reset-password${window.location.hash}`, { replace: true });
      return;
    }

    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters.',
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
    <div className="flex min-h-screen flex-col bg-background p-4">
      <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
            SaveTogether
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {isForgotPassword 
              ? 'Reset your password' 
              : isLogin 
                ? 'Welcome back' 
                : 'Start your savings journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-12"
          />
          {!isForgotPassword && (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="h-12"
              />
              {!isLogin && <PasswordStrengthIndicator password={password} />}
            </div>
          )}
          <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
            {loading 
              ? '...' 
              : isForgotPassword 
                ? 'Send Reset Link' 
                : isLogin 
                  ? 'Sign In' 
                  : 'Create Account'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          {isForgotPassword ? (
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

      <Footer />
    </div>
  );
}
