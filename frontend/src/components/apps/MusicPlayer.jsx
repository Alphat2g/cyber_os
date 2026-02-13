import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TRACKS = [
    { id: 1, title: 'NEON_DISTORTION', artist: 'MD_NETWORK', duration: '0:45', url: 'https://raw.githubusercontent.com/mdn/webaudio-examples/master/audio-analyser/viper.mp3' },
    { id: 2, title: 'VOID_RUNNER', artist: 'CYBER_VIBE', duration: '3:20', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a164c4.mp3' },
    { id: 3, title: 'SYNTH_PULSE', artist: 'NEURAL_LINK', duration: '2:45', url: 'https://cdn.pixabay.com/audio/2021/11/24/audio_83984852c5.mp3' },
];

const MusicPlayer = ({ onClose, isFocused }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [visualMode, setVisualMode] = useState('BARS'); // BARS or PULSE
    const [isPeak, setIsPeak] = useState(false);

    const audioRef = useRef(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);

    const track = TRACKS[currentTrackIndex];

    // Setup Audio Visualizer
    useEffect(() => {
        if (!audioRef.current) return;

        const setupVisualizer = () => {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
                analyserRef.current = audioCtxRef.current.createAnalyser();
                sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioCtxRef.current.destination);
                analyserRef.current.fftSize = 256;
            }
        };

        const draw = () => {
            if (!canvasRef.current || !analyserRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            analyserRef.current.getByteFrequencyData(dataArray);

            // Peak detection for pulse effect
            const average = dataArray.reduce((p, c) => p + c, 0) / bufferLength;
            if (average > 80) { // Threshold for "peak"
                setIsPeak(true);
                setTimeout(() => setIsPeak(false), 50);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (visualMode === 'BARS') {
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = (dataArray[i] / 255) * canvas.height;
                    const r = 0;
                    const g = 255;
                    const b = 65;

                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dataArray[i] / 255})`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = `rgba(0, 255, 65, 0.5)`;
                    x += barWidth + 1;
                }
            } else {
                // PULSE / CIRCLE MODE
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = 40 + (average / 2);

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = '#00ff41';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Inner pulsing glow
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * 0.8, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(0, 255, 65, ${average / 400})`;
                ctx.fill();

                // Particle rings
                for (let i = 0; i < bufferLength; i += 8) {
                    const angle = (i / bufferLength) * Math.PI * 2;
                    const h = (dataArray[i] / 255) * 30;
                    const x1 = centerX + Math.cos(angle) * radius;
                    const y1 = centerY + Math.sin(angle) * radius;
                    const x2 = centerX + Math.cos(angle) * (radius + h);
                    const y2 = centerY + Math.sin(angle) * (radius + h);

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = `rgba(0, 255, 65, ${dataArray[i] / 255})`;
                    ctx.stroke();
                }
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        if (isPlaying) {
            setupVisualizer();
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            draw();
        } else {
            cancelAnimationFrame(animationRef.current);
        }

        return () => cancelAnimationFrame(animationRef.current);
    }, [isPlaying, visualMode]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
        setIsPlaying(true);
    };

    const onTimeUpdate = () => {
        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setProgress((current / duration) * 100);
    };

    return (
        <div className={`w-full h-full bg-black border-2 flex flex-col font-mono text-xs select-none transition-all ${isFocused ? 'border-cyber-green shadow-[0_0_20px_rgba(0,255,65,0.2)]' : 'border-cyber-green/30'} ${isPeak ? 'translate-y-0.5' : ''}`}>
            {/* Header */}
            <div className={`flex justify-between items-center p-1 px-2 border-b ${isFocused ? 'bg-cyber-green text-black' : 'bg-gray-900 text-cyber-green/50 border-cyber-green/30'}`}>
                <span className="font-bold text-sm">CYBER_AUDIO_v1.1</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setVisualMode(visualMode === 'BARS' ? 'PULSE' : 'BARS')}
                        className="hover:bg-black hover:text-cyber-green px-1 border border-black/20"
                    >
                        [{visualMode}]
                    </button>
                    <button onClick={onClose} className="hover:bg-black hover:text-cyber-green px-1">[X]</button>
                </div>
            </div>

            {/* Visualizer Area */}
            <div className={`flex-1 relative overflow-hidden bg-black/40 ${isPeak ? 'brightness-125' : ''}`}>
                <canvas ref={canvasRef} className="w-full h-full" width={400} height={200} />
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <span className="text-cyber-green/40 animate-pulse text-[10px]">WAITING_FOR_AUDIO_STREAM...</span>
                    </div>
                )}

                {/* Track Info Overlay */}
                <div className="absolute top-2 left-2 p-2 bg-black/60 border border-cyber-green/10 backdrop-blur-sm">
                    <div className="text-cyber-green font-bold text-[10px] tracking-tighter uppercase">{track.title}</div>
                    <div className="text-cyber-green/40 text-[8px]">{track.artist}</div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-3 bg-black/80 border-t border-cyber-green/20">
                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-900 mb-4 cursor-pointer relative" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const pct = x / rect.width;
                    audioRef.current.currentTime = pct * audioRef.current.duration;
                }}>
                    <div className="absolute h-full bg-cyber-green shadow-[0_0_10px_rgba(0,255,65,0.5)]" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrev} className="text-cyber-green/60 hover:text-cyber-green transition-colors text-lg">⏮</button>
                        <button onClick={togglePlay} className="w-10 h-10 border border-cyber-green flex items-center justify-center text-cyber-green hover:bg-cyber-green hover:text-black transition-all">
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                        <button onClick={handleNext} className="text-cyber-green/60 hover:text-cyber-green transition-colors text-lg">⏭</button>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="text-[8px] text-cyber-green/30 uppercase tracking-widest">VOLUME_CONTROL</div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-24 accent-cyber-green bg-transparent h-1 appearance-none border border-cyber-green/20"
                        />
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={track.url}
                onTimeUpdate={onTimeUpdate}
                onEnded={handleNext}
                crossOrigin="anonymous"
            />
        </div>
    );
};

export default MusicPlayer;
