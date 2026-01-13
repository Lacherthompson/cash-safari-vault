import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpCircle, BookOpen, DollarSign, Settings, LogOut, Target, GraduationCap, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useNavigate } from 'react-router-dom';

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
        <Logo size="lg" />
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Learn dropdown for secondary items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Learn</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover z-50">
              <DropdownMenuItem onClick={() => navigate('/how-to-use')} className="gap-2 cursor-pointer">
                <HelpCircle className="h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/savings-guide')} className="gap-2 cursor-pointer">
                <BookOpen className="h-4 w-4" />
                Guide
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/earn-more')} className="gap-2 cursor-pointer">
                <DollarSign className="h-4 w-4" />
                Earn More
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary actions always visible */}
          <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3" onClick={() => navigate('/vault-starter')}>
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Challenge</span>
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
