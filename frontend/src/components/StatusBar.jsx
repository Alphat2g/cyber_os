import React, { useState, useEffect } from 'react';
import { xpForLevel } from './AchievementSystem';

const StatusBar = ({ totalXP, level, streak, sessionStart }) => {
    const [sessionTime, setSessionTime] = useState('0:00');
    const [pulse, setPulse] = useState(false);

    // Session timer
    useEffect(() => {
        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            setSessionTime(`${mins}:${secs.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(timer);
    }, [sessionStart]);

    const currentLevelXP = xpForLevel(level);
    const prevLevelXP = level > 1 ? xpForLevel(level - 1) : 0;
    const xpInLevel = totalXP - (level > 1 ? Array.from({ length: level - 1 }, (_, i) => xpForLevel(i + 1)).reduce((a, b) => a + b, 0) : 0);
    const xpNeeded = currentLevelXP;
    const progress = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

    // Pulse when XP changes
    useEffect(() => {
        setPulse(true);
        const t = setTimeout(() => setPulse(false), 600);
        return () => clearTimeout(t);
    }, [totalXP]);

    return (
        <div className="flex items-center gap-3 select-none">
            {/* Level badge */}
            <div className={`flex items-center gap-1 transition-all ${pulse ? 'scale-110' : 'scale-100'}`}>
                <span className="text-amber-400 font-bold text-xs">LV.{level}</span>
            </div>

            {/* XP bar */}
            <div className="w-24 h-2 bg-gray-800 border border-cyber-green/20 relative overflow-hidden" title={`${Math.floor(xpInLevel)}/${xpNeeded} XP`}>
                <div
                    className="h-full bg-gradient-to-r from-cyber-green to-amber-400 transition-all duration-500 xp-bar-glow"
                    style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 xp-bar-shimmer" />
            </div>

            {/* XP count */}
            <span className={`text-[10px] font-mono transition-all ${pulse ? 'text-amber-400' : 'text-cyber-green/50'}`}>
                {totalXP} XP
            </span>

            {/* Streak */}
            {streak > 0 && (
                <div className="flex items-center gap-1 text-[10px]" title={`${streak}-day streak`}>
                    <span className="text-orange-500">🔥</span>
                    <span className="text-orange-400 font-bold">{streak}</span>
                </div>
            )}

            {/* Session timer */}
            <span className="text-[10px] text-cyber-green/30 font-mono" title="Session time">
                ⏱ {sessionTime}
            </span>
        </div>
    );
};

export default StatusBar;
