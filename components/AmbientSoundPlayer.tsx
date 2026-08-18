'use client';

import React, { useState, useEffect, useRef } from 'react';

type SoundMode = 'rain' | 'binaural' | 'waves' | 'wind';

export default function AmbientSoundPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<SoundMode>('rain');
  const [volume, setVolume] = useState(0.2);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (mode === 'binaural') {
        // Binaural 432Hz and 440Hz Sine waves
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        osc2.frequency.setValueAtTime(440, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.15, ctx.currentTime);

        osc1.connect(subGain);
        osc2.connect(subGain);
        subGain.connect(masterGain);

        osc1.start();
        osc2.start();
        sourceNodeRef.current = osc1;
      } else {
        // Synthesized Pink Noise / Rain buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter
        const filter = ctx.createBiquadFilter();
        filter.type = mode === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(mode === 'rain' ? 800 : 400, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        sourceNodeRef.current = whiteNoise;
      }

      setIsPlaying(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleModeChange = (newMode: SoundMode) => {
    setMode(newMode);
    if (isPlaying) {
      stopAudio();
      setTimeout(() => startAudio(), 100);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const modeLabels: Record<SoundMode, { label: string; icon: string }> = {
    rain: { label: 'Gentle Rain', icon: '🌧️' },
    binaural: { label: '432Hz Waves', icon: '🧠' },
    waves: { label: 'Ocean Waves', icon: '🌊' },
    wind: { label: 'Forest Wind', icon: '🌲' },
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: 12,
        padding: '16px 20px',
        margin: '18px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={togglePlay}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: isPlaying ? '#059669' : 'var(--amber)',
            color: isPlaying ? '#ffffff' : '#0f172a',
            border: 'none',
            fontSize: 18,
            fontWeight: 900,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {isPlaying ? '⏸' : '🎧'}
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <b style={{ fontSize: 14, color: '#ffffff' }}>Ambient Study Soundscape</b>
            {isPlaying && (
              <span style={{ fontSize: 10, background: '#065f46', color: '#34d399', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                PLAYING {mode.toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            Offline synthesized focus beats to eliminate distractions
          </div>
        </div>
      </div>

      {/* Mode Presets & Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.1)', padding: '3px 6px', borderRadius: 8 }}>
          {(['rain', 'binaural', 'waves', 'wind'] as const).map(m => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: mode === m ? 'var(--amber)' : 'transparent',
                color: mode === m ? '#0f172a' : '#cbd5e1',
              }}
            >
              {modeLabels[m].icon} {modeLabels[m].label}
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>🔊</span>
          <input
            type="range"
            min="0.05"
            max="0.6"
            step="0.05"
            value={volume}
            onChange={e => handleVolumeChange(Number(e.target.value))}
            style={{ width: 70, accentColor: 'var(--amber)' }}
          />
        </div>
      </div>
    </div>
  );
}
