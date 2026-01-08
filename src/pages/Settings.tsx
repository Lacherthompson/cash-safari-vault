import { useSettings } from '@/hooks/useSettings';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthenticatedNav } from '@/components/AuthenticatedNav';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Volume2, VolumeX, Palette } from 'lucide-react';

export default function Settings() {
  const { soundEnabled, setSoundEnabled, loading } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        <Card className="p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-muted-foreground" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Sound Effects</p>
                <p className="text-sm text-muted-foreground">
                  Play click sound when checking amounts
                </p>
              </div>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
              disabled={loading}
            />
          </div>
        </Card>

        <Card className="p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </Card>

      </main>
    </div>
  );
}
