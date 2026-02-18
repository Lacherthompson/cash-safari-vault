import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

const DISMISSED_KEY = 'pwa_install_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Subtle bottom banner that asks mobile users to install the PWA.
 * - Only appears when the browser fires `beforeinstallprompt` (Chrome/Android)
 * - Dismissal is persisted in localStorage so it won't reappear
 * - iOS users see the banner with manual instructions (no prompt API on Safari)
 */
export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or already installed (standalone mode)
    if (
      localStorage.getItem(DISMISSED_KEY) ||
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as { standalone?: boolean }).standalone;
    setIsIOS(ios);

    if (ios) {
      // iOS Safari: no beforeinstallprompt — show manual instructions after delay
      const timer = setTimeout(() => setVisible(true), 30_000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/97 backdrop-blur-sm border-t border-border px-4 py-3 flex items-center gap-3 shadow-elevated">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">Add to your home screen</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isIOS
            ? 'Tap the share icon, then "Add to Home Screen"'
            : 'Quick access, works offline'}
        </p>
      </div>
      {!isIOS && (
        <Button size="sm" className="shrink-0 gap-1.5 h-9 text-xs" onClick={handleInstall}>
          <Download className="h-3.5 w-3.5" />
          Install
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8 text-muted-foreground"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
