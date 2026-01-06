import { useCallback, useRef } from 'react';

export function useClickSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playClick = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create noise buffer for a crisp click
    const bufferSize = ctx.sampleRate * 0.015; // 15ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill with noise that decays quickly
    for (let i = 0; i < bufferSize; i++) {
      const decay = 1 - (i / bufferSize);
      data[i] = (Math.random() * 2 - 1) * decay * decay;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // High-pass filter for crisp attack
    const highPass = ctx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 1000;

    // Gain for volume
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.6, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.015);

    noiseSource.connect(highPass);
    highPass.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.015);
  }, []);

  return { playClick };
}
