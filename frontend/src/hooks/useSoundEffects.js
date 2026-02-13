import { useRef, useCallback } from 'react';

export const useSoundEffects = () => {
    const audioContextRef = useRef(null);

    const getAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContextRef.current;
    };

    const playTone = (freq, type, duration) => {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    const playTypingSound = useCallback(() => {
        // High pitched short blip
        playTone(800 + Math.random() * 200, 'square', 0.05);
    }, []);

    const playSuccessSound = useCallback(() => {
        // Ascending chime
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        [440, 554, 659].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);

            gain.gain.setValueAtTime(0.1, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    }, []);

    const playErrorSound = useCallback(() => {
        // Low buzzing
        playTone(150, 'sawtooth', 0.3);
    }, []);

    return { playTypingSound, playSuccessSound, playErrorSound };
};
