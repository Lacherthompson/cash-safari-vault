import { useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

export function useClickSound() {

  const playClick = useCallback(() => {
    // Haptics — fire and forget
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

    // Audio — oscillator tone, more reliable than noise on iOS WKWebView
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio not available — ignore
    }
  }, []);

  return { playClick };
}
