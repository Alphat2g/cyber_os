import React, { useState, useEffect } from 'react';

const BootSequence = ({ onComplete }) => {
    const [lines, setLines] = useState([]);
    const [progress, setProgress] = useState(0);

    // Load returning user stats
    const level = parseInt(localStorage.getItem('cyber_level') || '1');
    const streak = parseInt(localStorage.getItem('cyber_streak') || '0');
    const totalXP = parseInt(localStorage.getItem('cyber_total_xp') || '0');
    const isReturning = totalXP > 0;

    useEffect(() => {
        const bootText = [
            "BIOS DATE 01/15/2077 14:22:56 VER 1.0.2",
            "CPU: QUANTUM CORE i9-9900K @ 8.2 GHz",
            "Memory Test: 65536K .......... OK",
            "Detecting Primary Master ... CYBER_DRIVE_V1",
            "Detecting Primary Slave ... NONE",
            "Booting from Hard Disk...",
            "Loading Kernel v4.19-PHANTOM...",
            "Loading CYBER_OS v2.1 [QUANTUM BUILD]...",
            "Initializing Graphics Engine... OK",
            "Initializing Audio Subsystem... OK",
            "Initializing Network... CONNECTED to DR_NET",
            "Establishing encrypted tunnel... OK",
            "Mounting File System... OK",
            "Loading Achievement Engine... OK",
            "Starting Desktop Environment...",
            ...(isReturning ? [
                "",
                `═══════════════════════════════════`,
                `  WELCOME BACK, USER_01`,
                `  Level: ${level} | XP: ${totalXP}${streak > 1 ? ` | 🔥 Streak: ${streak} days` : ''}`,
                `═══════════════════════════════════`,
            ] : [
                "",
                "WELCOME NEW USER: GUEST_ACCESS",
                "Type 'help' in the terminal to begin.",
            ]),
        ];

        let delay = 0;
        bootText.forEach((line, index) => {
            delay += Math.random() * 200 + 60;
            setTimeout(() => {
                setLines(prev => [...prev, line]);
                setProgress(Math.floor(((index + 1) / bootText.length) * 100));

                if (index === bootText.length - 1) {
                    setTimeout(onComplete, 1000);
                }
            }, delay);
        });
    }, [onComplete]);

    return (
        <div className="w-screen h-screen bg-black text-cyber-green font-mono p-8 text-sm md:text-base overflow-hidden cursor-none select-none flex flex-col">
            <div className="flex-1 overflow-hidden">
                {lines.map((line, i) => (
                    <div key={i} className={`fade-in ${line.startsWith('═') || line.startsWith('  WELCOME') || line.startsWith('  Level') ? 'text-amber-400 font-bold' : ''}`}>
                        {line}
                    </div>
                ))}
                <div className="animate-pulse text-xl mt-2">▋</div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-cyber-green/50 mb-1">
                    <span>LOADING SYSTEM</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-900 border border-cyber-green/20">
                    <div
                        className="h-full boot-progress-bar transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BootSequence;
