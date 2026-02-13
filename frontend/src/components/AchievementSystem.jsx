import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ACHIEVEMENTS = [
    { id: 'first_cmd', title: 'FIRST CONTACT', desc: 'Execute your first command', icon: '⚡', xp: 50, threshold: 1 },
    { id: 'cmd_10', title: 'SCRIPT KIDDIE', desc: 'Execute 10 commands', icon: '💻', xp: 100, threshold: 10 },
    { id: 'cmd_50', title: 'HACKER', desc: 'Execute 50 commands', icon: '🔓', xp: 250, threshold: 50 },
    { id: 'cmd_100', title: 'ELITE OPERATOR', desc: 'Execute 100 commands', icon: '👁', xp: 500, threshold: 100 },
    { id: 'cmd_250', title: 'GHOST IN THE MACHINE', desc: 'Execute 250 commands', icon: '👻', xp: 1000, threshold: 250 },
    { id: 'explorer', title: 'EXPLORER', desc: 'Browse 5 directories', icon: '🗂', xp: 75, threshold: 5 },
    { id: 'creator', title: 'ARCHITECT', desc: 'Create 3 files', icon: '📝', xp: 100, threshold: 3 },
    { id: 'scanner', title: 'RECON AGENT', desc: 'Run scan command', icon: '📡', xp: 75, threshold: 1 },
    { id: 'decoder', title: 'CRYPTANALYST', desc: 'Run decrypt command', icon: '🔑', xp: 150, threshold: 1 },
    { id: 'session_5', title: 'NIGHT OWL', desc: 'Spend 5 min in a session', icon: '🦉', xp: 200, threshold: 300 },
    { id: 'session_15', title: 'DEEP DIVE', desc: 'Spend 15 min in a session', icon: '🌊', xp: 500, threshold: 900 },
    { id: 'hacker_win', title: 'SYSTEM ROOTED', desc: 'Win the hacking minigame', icon: '🏴', xp: 300, threshold: 1 },
    { id: 'streak_3', title: 'ON FIRE', desc: '3-day login streak', icon: '🔥', xp: 200, threshold: 3 },
    { id: 'streak_7', title: 'UNSTOPPABLE', desc: '7-day login streak', icon: '⚡', xp: 500, threshold: 7 },
    { id: 'files_read_5', title: 'DATA MINER', desc: 'Read 5 files with cat', icon: '⛏', xp: 100, threshold: 5 },
    { id: 'shadow_found', title: 'SHADOW WALKER', desc: 'Find the hidden .shadow directory', icon: '🕵', xp: 500, threshold: 1 },
];

// XP required for each level (exponential curve)
const xpForLevel = (level) => Math.floor(100 * Math.pow(1.5, level - 1));

const AchievementSystem = ({ stats, onXPGain }) => {
    const [unlockedIds, setUnlockedIds] = useState(() => {
        const saved = localStorage.getItem('cyber_achievements');
        return saved ? JSON.parse(saved) : [];
    });
    const [showPanel, setShowPanel] = useState(false);
    const [newUnlock, setNewUnlock] = useState(null);

    // Check for new achievements
    useEffect(() => {
        if (!stats) return;
        const newUnlocks = [];

        ACHIEVEMENTS.forEach(ach => {
            if (unlockedIds.includes(ach.id)) return;
            let earned = false;

            switch (ach.id) {
                case 'first_cmd': earned = stats.commandCount >= 1; break;
                case 'cmd_10': earned = stats.commandCount >= 10; break;
                case 'cmd_50': earned = stats.commandCount >= 50; break;
                case 'cmd_100': earned = stats.commandCount >= 100; break;
                case 'cmd_250': earned = stats.commandCount >= 250; break;
                case 'explorer': earned = stats.dirsVisited >= 5; break;
                case 'creator': earned = stats.filesCreated >= 3; break;
                case 'scanner': earned = stats.scansRun >= 1; break;
                case 'decoder': earned = stats.decryptsRun >= 1; break;
                case 'session_5': earned = stats.sessionSeconds >= 300; break;
                case 'session_15': earned = stats.sessionSeconds >= 900; break;
                case 'hacker_win': earned = stats.hackWins >= 1; break;
                case 'streak_3': earned = stats.streak >= 3; break;
                case 'streak_7': earned = stats.streak >= 7; break;
                case 'files_read_5': earned = stats.filesRead >= 5; break;
                case 'shadow_found': earned = stats.shadowFound >= 1; break;
                default: break;
            }

            if (earned) newUnlocks.push(ach);
        });

        if (newUnlocks.length > 0) {
            const newIds = [...unlockedIds, ...newUnlocks.map(a => a.id)];
            setUnlockedIds(newIds);
            localStorage.setItem('cyber_achievements', JSON.stringify(newIds));

            // Show last unlock and give XP
            newUnlocks.forEach(ach => {
                onXPGain(ach.xp, `UNLOCKED: ${ach.title}`);
            });
            setNewUnlock(newUnlocks[newUnlocks.length - 1]);
            setTimeout(() => setNewUnlock(null), 4000);
        }
    }, [stats]);

    return (
        <>
            {/* Achievement unlock popup */}
            <AnimatePresence>
                {newUnlock && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] bg-black/95 border-2 border-amber-400 px-6 py-4 flex items-center gap-4 shadow-[0_0_40px_rgba(245,158,11,0.5)]"
                    >
                        <div className="text-4xl">{newUnlock.icon}</div>
                        <div>
                            <div className="text-amber-400 font-bold text-lg tracking-wider">🏆 ACHIEVEMENT UNLOCKED</div>
                            <div className="text-white font-bold">{newUnlock.title}</div>
                            <div className="text-amber-400/60 text-xs">{newUnlock.desc} • +{newUnlock.xp} XP</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Achievement toggle button in taskbar */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="text-xs text-amber-400 hover:text-white px-2 py-1 border border-amber-400/30 hover:border-amber-400 transition-all"
                title="Achievements"
            >
                🏆 {unlockedIds.length}/{ACHIEVEMENTS.length}
            </button>

            {/* Achievement panel */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-14 left-4 w-80 max-h-96 bg-black/95 border border-amber-400/50 z-[150] overflow-y-auto scrollbar-hide"
                    >
                        <div className="p-3 border-b border-amber-400/30 bg-amber-400/5 flex justify-between items-center sticky top-0">
                            <span className="text-amber-400 font-bold text-sm">ACHIEVEMENTS</span>
                            <button onClick={() => setShowPanel(false)} className="text-amber-400 hover:text-white text-xs">[X]</button>
                        </div>
                        <div className="p-2 space-y-1">
                            {ACHIEVEMENTS.map(ach => {
                                const unlocked = unlockedIds.includes(ach.id);
                                return (
                                    <div key={ach.id} className={`flex items-center gap-3 p-2 border rounded-sm transition-all ${unlocked
                                            ? 'border-amber-400/40 bg-amber-900/10'
                                            : 'border-gray-800 bg-black/50 opacity-50'
                                        }`}>
                                        <div className={`text-xl ${unlocked ? '' : 'grayscale opacity-30'}`}>{ach.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-bold truncate ${unlocked ? 'text-amber-400' : 'text-gray-600'}`}>
                                                {unlocked ? ach.title : '???'}
                                            </div>
                                            <div className={`text-[10px] truncate ${unlocked ? 'text-amber-400/50' : 'text-gray-700'}`}>
                                                {ach.desc}
                                            </div>
                                        </div>
                                        {unlocked && <div className="text-amber-400/50 text-[10px]">+{ach.xp}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export { ACHIEVEMENTS, xpForLevel };
export default AchievementSystem;
