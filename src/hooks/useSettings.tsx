import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SettingsContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('sound_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setSoundEnabledState(data.sound_enabled);
      } else if (!error) {
        // Create default settings if they don't exist
        await supabase.from('user_settings').insert({
          user_id: user.id,
          sound_enabled: true,
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    if (!user) return;
    
    setSoundEnabledState(enabled);
    
    await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        sound_enabled: enabled,
      }, { onConflict: 'user_id' });
  }, [user]);

  return (
    <SettingsContext.Provider value={{ soundEnabled, setSoundEnabled, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
