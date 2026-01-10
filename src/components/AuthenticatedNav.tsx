import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { HelpCircle, BookOpen, DollarSign, Settings, LogOut, Rocket } from 'lucide-react';
import savetogetherLogo from '@/assets/savetogether-logo.png';

export const AuthenticatedNav = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <img 
          src={savetogetherLogo} 
          alt="SaveTogether" 
          className="h-16 sm:h-[106px] cursor-pointer" 
          onClick={() => navigate('/')} 
        />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3" onClick={() => navigate('/how-to-use')}>
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3" onClick={() => navigate('/savings-guide')}>
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Savings Guide</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3" onClick={() => navigate('/earn-more')}>
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Earn More</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3" onClick={() => navigate('/vault-starter')}>
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Vault Starter</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3 text-destructive hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};
