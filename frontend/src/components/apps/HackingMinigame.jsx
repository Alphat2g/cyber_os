import React, { useState, useEffect, useCallback } from 'react';

const HackingMinigame = ({ onClose, isFocused }) => {
    const [targetSequence, setTargetSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [gameState, setGameState] = useState('START'); // START, PLAYING, WON, LOST
    const [level, setLevel] = useState(1);
    const [message, setMessage] = useState('INITIALIZING BRUTE_FORCE...');
    const [timeLeft, setTimeLeft] = useState(100);

    // Keyboard mapping for "grid" feel
    // We'll map Arrow Keys to specific chars or maybe just use ASDW/Arrows as "Up/Down/Left/Right" 
    // mapped to the 4 main chars, plus maybe Enter/Space.
    // Let's use 4 directions as the main interaction mechanic for "Speed Hacking"
    // UP: A, DOWN: B, LEFT: X, RIGHT: Y

    const startLevel = useCallback((lvl) => {
        const length = lvl + 3;
        // Chars corresponding to directions
        const chars = ['↑', '↓', '←', '→'];
        const newSeq = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]);
        setTargetSequence(newSeq);
        setPlayerSequence([]);
        setGameState('PLAYING');
        setMessage(`LEVEL ${lvl}: SYNC SIGNAL`);
        // Time decreases as level increases
        setTimeLeft(100 - (lvl * 5));
    }, []);

    useEffect(() => {
        if (gameState === 'START') {
            startLevel(1);
        }
    }, [gameState, startLevel]);

    // Timer logic
    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    setGameState('LOST');
                    setMessage('CONNECTION TIMED OUT');
                    return 0;
                }
                return prev - 0.5; // Drain speed
            });
        }, 100);

        return () => clearInterval(timer);
    }, [gameState]);

    const handleInput = useCallback((char) => {
        if (gameState !== 'PLAYING') return;

        const newSeq = [...playerSequence, char];

        // Immediate validation
        const currentIndex = newSeq.length - 1;
        if (newSeq[currentIndex] !== targetSequence[currentIndex]) {
            setGameState('LOST');
            setMessage('SIGNAL DESYNC. DETECTED.');
            return;
        }

        setPlayerSequence(newSeq);
        setTimeLeft(prev => Math.min(100, prev + 5)); // Bonus time for correct hit

        if (newSeq.length === targetSequence.length) {
            if (level >= 5) {
                setGameState('WON');
                setMessage('SYSTEM ROOTED. ACCESS GRANTED.');
            } else {
                setLevel(l => l + 1);
                setTimeout(() => startLevel(level + 1), 200);
            }
        }
    }, [gameState, playerSequence, targetSequence, level, startLevel]);

    // Keyboard Listener
    useEffect(() => {
        if (!isFocused) return;

        const handleKeyDown = (e) => {
            if (gameState === 'WON' || gameState === 'LOST') {
                if (e.key === 'Enter') {
                    setLevel(1);
                    setGameState('START');
                }
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    handleInput('↑'); break;
                case 'ArrowDown':
                case 's':
                    handleInput('↓'); break;
                case 'ArrowLeft':
                case 'a':
                    handleInput('←'); break;
                case 'ArrowRight':
                case 'd':
                    handleInput('→'); break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocused, gameState, handleInput]);

    return (
        <div className={`w-full h-full bg-black border-2 flex flex-col font-mono p-4 select-none duration-200 ${gameState === 'LOST' ? 'border-red-600 shadow-[0_0_20px_red]' :
                gameState === 'WON' ? 'border-green-500 shadow-[0_0_20px_lime]' :
                    isFocused ? 'border-amber-500' : 'border-amber-900'
            }`}>
            <div className="flex justify-between items-center mb-4 border-b border-amber-500/50 pb-2">
                <span className="text-amber-500 font-bold animate-pulse">BRUTE_FORCE_V2.0</span>
                <button onClick={onClose} className="text-amber-500 hover:text-white">[X]</button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                {/* Timer Bar */}
                <div className="absolute top-0 w-full h-1 bg-gray-800">
                    <div
                        className={`h-full transition-all duration-100 ${timeLeft < 20 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.max(0, timeLeft)}%` }}
                    />
                </div>

                <div className={`text-xl font-bold drop-shadow-md text-center transition-colors ${gameState === 'LOST' ? 'text-red-500' :
                        gameState === 'WON' ? 'text-green-500' : 'text-amber-400'
                    }`}>
                    {message}
                </div>

                {gameState === 'PLAYING' && (
                    <div className="flex flex-col items-center gap-6 w-full">
                        {/* Sequence Display */}
                        <div className="flex gap-2 flex-wrap justify-center max-w-full px-4">
                            {targetSequence.map((char, i) => {
                                const isHit = i < playerSequence.length;
                                const isCurrent = i === playerSequence.length;
                                return (
                                    <div key={i} className={`
                                        w-10 h-10 flex items-center justify-center text-xl font-bold border-2 transition-all duration-100
                                        ${isHit ? 'border-green-500 bg-green-900/50 text-green-400 scale-90' :
                                            isCurrent ? 'border-amber-400 bg-amber-900/20 text-white scale-110 shadow-[0_0_10px_orange]' :
                                                'border-gray-700 text-gray-600'}
                                    `}>
                                        {char}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="text-xs text-gray-500 mt-4">
                            USE KEYBOARD ARROWS OR W/A/S/D
                        </div>
                    </div>
                )}

                {(gameState === 'WON' || gameState === 'LOST') && (
                    <div className="text-center animate-bounce mt-4">
                        <p className="text-sm text-gray-400 mb-2">PRESS [ENTER] TO RESTART</p>
                        <button
                            onClick={() => { setLevel(1); setGameState('START'); }}
                            className="px-6 py-2 bg-amber-600 text-black font-bold hover:bg-amber-500 w-full"
                        >
                            RESTART SYSTEM
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HackingMinigame;
