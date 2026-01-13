import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t border-border/40 bg-muted/20 ${className}`}>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} SaveTogether. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=61586156342899"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/savetogether.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
