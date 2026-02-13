import React, { useState, useRef, useEffect, useCallback } from 'react';
import FileIcon from './FileIcon';
import WindowManager from './WindowManager';
import MatrixRain from './MatrixRain';
import NetworkFeed from './NetworkFeed';
import XPNotification from './XPNotification';
import AchievementSystem from './AchievementSystem';
import StatusBar from './StatusBar';
import ContextMenu from './ContextMenu';
import { useScrambleText } from '../hooks/useScrambleText';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';

const DesktopEnvironment = () => {
    const [windows, setWindows] = useState([
        { id: 1, type: 'TERMINAL', x: 100, y: 50, isFocused: true, minimized: false, maximized: false }
    ]);
    const nextWinId = useRef(2);
    const [isDraggingFile, setIsDraggingFile] = useState(false);

    // Theme & Visuals
    const [theme, setTheme] = useState(() => localStorage.getItem('cyber_theme') || 'green');
    const [showMatrix, setShowMatrix] = useState(false);
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [chatUnread, setChatUnread] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockInput, setLockInput] = useState('');

    const [history, setHistory] = useState([
        { type: 'system', content: 'CYBER_OS v2.1 [QUANTUM BUILD]' },
        { type: 'system', content: 'Type "help" for available commands. ↑↓ for history, TAB to auto-complete.' },
    ]);

    // System Stats
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const [cpuLoad, setCpuLoad] = useState(12);
    const { playSuccessSound, playErrorSound, playTypingSound } = useSoundEffects();

    // XP & Gamification
    const [xpEvent, setXpEvent] = useState(null);
    const [totalXP, setTotalXP] = useState(() => parseInt(localStorage.getItem('cyber_total_xp') || '0'));
    const [level, setLevel] = useState(() => parseInt(localStorage.getItem('cyber_level') || '1'));
    const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('cyber_streak') || '0'));
    const [sessionStart] = useState(Date.now());

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('cyber_stats');
        return saved ? JSON.parse(saved) : {
            commandCount: 0, dirsVisited: 0, filesCreated: 0, filesRead: 0,
            scansRun: 0, decryptsRun: 0, hackWins: 0, shadowFound: 0,
            sessionSeconds: 0, streak: 0,
        };
    });

    useEffect(() => { localStorage.setItem('cyber_stats', JSON.stringify(stats)); }, [stats]);
    useEffect(() => {
        const t = setInterval(() => setStats(p => ({ ...p, sessionSeconds: p.sessionSeconds + 1 })), 1000);
        return () => clearInterval(t);
    }, []);

    // Streak
    useEffect(() => {
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('cyber_last_visit');
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastVisit === yesterday) {
            const ns = streak + 1;
            setStreak(ns); localStorage.setItem('cyber_streak', String(ns));
            setStats(p => ({ ...p, streak: ns }));
        } else if (lastVisit !== today) {
            setStreak(1); localStorage.setItem('cyber_streak', '1');
            setStats(p => ({ ...p, streak: 1 }));
        }
        localStorage.setItem('cyber_last_visit', today);
    }, []);

    const xpForLevel = (lvl) => Math.floor(100 * Math.pow(1.5, lvl - 1));

    const triggerXP = useCallback((message, amount = 50) => {
        setXpEvent({ id: Date.now(), message, xp: amount });
        playSuccessSound();
        setTotalXP(prev => {
            const newXP = prev + amount;
            localStorage.setItem('cyber_total_xp', String(newXP));
            let currentLevel = level;
            let xpSum = 0;
            for (let i = 1; i <= currentLevel; i++) xpSum += xpForLevel(i);
            while (newXP >= xpSum + xpForLevel(currentLevel + 1)) {
                currentLevel++; xpSum += xpForLevel(currentLevel);
            }
            if (currentLevel > level) {
                setLevel(currentLevel);
                localStorage.setItem('cyber_level', String(currentLevel));
                setTimeout(() => {
                    setXpEvent({ id: Date.now() + 1, message: `🎉 LEVEL UP! Level ${currentLevel}!`, xp: 0 });
                }, 1500);
            }
            return newXP;
        });
    }, [level, playSuccessSound]);

    const handleAchievementXP = useCallback((amount, message) => triggerXP(message, amount), [triggerXP]);

    useEffect(() => {
        const t = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
            setCpuLoad(p => Math.min(100, Math.max(0, p + (Math.random() - 0.5) * 10)));
        }, 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        document.body.className = `theme-${theme}`;
        localStorage.setItem('cyber_theme', theme);
    }, [theme]);

    const title = useScrambleText("CYBER_OS_V2.1", 50);

    // Window Management
    const openWindow = (type, data = {}) => {
        // Focus existing if singleton
        const singletons = ['SYSTEM_MONITOR', 'CHAT', 'MISSION_LOG', 'MINIGAME'];
        if (singletons.includes(type)) {
            const existing = windows.find(w => w.type === type);
            if (existing) {
                if (existing.minimized) {
                    setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, minimized: false, isFocused: true } : { ...w, isFocused: false }));
                } else {
                    focusWindow(existing.id);
                }
                return;
            }
        }
        const id = nextWinId.current++;
        setWindows(prev => [
            ...prev.map(w => ({ ...w, isFocused: false })),
            { id, type, x: 80 + (prev.length * 25), y: 40 + (prev.length * 25), isFocused: true, data, minimized: false, maximized: false }
        ]);
        triggerXP(`OPENED ${type.replace('_', ' ')}`, 15);
    };

    const closeWindow = (id) => setWindows(prev => prev.filter(w => w.id !== id));

    const focusWindow = (id) => {
        setWindows(prev => prev.map(w => ({
            ...w,
            isFocused: w.id === id,
            minimized: w.id === id ? false : w.minimized
        })));
    };

    const minimizeWindow = (id) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true, isFocused: false } : w));
    };

    const toggleTheme = () => {
        const themes = ['green', 'blue', 'red', 'amber'];
        setTheme(themes[(themes.indexOf(theme) + 1) % themes.length]);
        playSuccessSound();
    };

    const handleFileOpen = (fileName) => {
        if (fileName === 'my_docs' || fileName === 'folder') openWindow('FILE_EXPLORER', { path: '/' });
        else if (/\.(txt|enc|log|md|key|dat)$/.test(fileName)) openWindow('TEXT_EDITOR', { fileName, content: null });
        else if (/\.(hex|img)$/.test(fileName)) openWindow('IMAGE_VIEWER', { fileName, src: '' });
        else if (fileName === 'brute_force.exe') openWindow('MINIGAME');
    };

    const handleDragStart = () => setIsDraggingFile(true);
    const handleFileDrop = async (e, info, fileName) => {
        setIsDraggingFile(false);
        playTypingSound();
        handleFileOpen(fileName);
    };

    const handleCommand = async (cmd) => {
        const op = cmd.split(' ')[0].toLowerCase();
        setStats(prev => ({
            ...prev,
            commandCount: prev.commandCount + 1,
            scansRun: prev.scansRun + (op === 'scan' || op === 'nmap' ? 1 : 0),
            decryptsRun: prev.decryptsRun + (op === 'decrypt' ? 1 : 0),
            filesCreated: prev.filesCreated + (op === 'touch' || op === 'mkdir' ? 1 : 0),
            filesRead: prev.filesRead + (op === 'cat' ? 1 : 0),
            dirsVisited: prev.dirsVisited + (op === 'cd' ? 1 : 0),
            shadowFound: prev.shadowFound + (cmd.includes('shadow') ? 1 : 0),
        }));

        if (op === 'touch' || op === 'mkdir') triggerXP("SYSTEM MODIFIED", 60);
        if (op === 'scan' || op === 'nmap') triggerXP("RECON COMPLETE", 40);
        if (op === 'decrypt') triggerXP("DECRYPTION ATTEMPT", 75);
        if (op === 'cat') triggerXP("DATA ACCESSED", 15);

        if (cmd.startsWith('open ')) { handleFileOpen(cmd.split('open ')[1]); return { type: 'text', content: `Opening ${cmd.split('open ')[1]}...` }; }
        if (cmd === 'theme') { toggleTheme(); return { type: 'text', content: `Theme: ${theme}` }; }
        if (cmd === 'matrix') { setShowMatrix(!showMatrix); return { type: 'text', content: `Matrix ${showMatrix ? 'off' : 'on'}` }; }
        if (cmd === 'hack') { openWindow('MINIGAME'); return { type: 'text', content: 'Initiating BRUTE_FORCE...' }; }
        if (cmd === 'chat') { openWindow('CHAT'); return { type: 'text', content: 'Opening RELAY_CHAT...' }; }
        if (cmd === 'music' || cmd === 'play') { openWindow('MUSIC_PLAYER'); return { type: 'text', content: 'Opening CYBER_AUDIO...' }; }
        if (cmd === 'sysmon' || cmd === 'top' || cmd === 'htop') { openWindow('SYSTEM_MONITOR'); return { type: 'text', content: 'Opening System Monitor...' }; }
        if (cmd === 'explorer' || cmd === 'files') { openWindow('FILE_EXPLORER', { path: '/' }); return { type: 'text', content: 'Opening File Explorer...' }; }
        if (cmd === 'lock') { setIsLocked(true); return { type: 'text', content: 'SCREEN LOCKED.' }; }

        try {
            const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';
            const res = await axios.post(API_URL + '/terminal/command', { command: cmd });
            return res.data;
        } catch (error) {
            return { type: 'error', content: '⚠ CONNECTION_REFUSED: Backend offline' };
        }
    };

    // Desktop context menu
    const handleDesktopContextMenu = (e) => {
        e.preventDefault();
        if (isLocked) return;
        setIsStartMenuOpen(false);
        setContextMenu({
            x: Math.min(e.clientX, window.innerWidth - 200),
            y: Math.min(e.clientY, window.innerHeight - 300),
            items: [
                { icon: '⌨', label: 'New Terminal', shortcut: 'Ctrl+T', action: () => openWindow('TERMINAL') },
                { icon: '📁', label: 'File Explorer', shortcut: 'Ctrl+E', action: () => openWindow('FILE_EXPLORER', { path: '/' }) },
                { icon: '📊', label: 'System Monitor', action: () => openWindow('SYSTEM_MONITOR') },
                { icon: '🎵', label: 'Music Player', action: () => openWindow('MUSIC_PLAYER') },
                { icon: '💬', label: 'Open Chat', action: () => openWindow('CHAT') },
                { separator: true },
                { icon: '🎨', label: 'Change Theme', action: toggleTheme },
                { icon: '🟩', label: `Matrix: ${showMatrix ? 'ON' : 'OFF'}`, action: () => setShowMatrix(!showMatrix) },
                { separator: true },
                { icon: '📝', label: 'New File', action: () => openWindow('TEXT_EDITOR', { fileName: 'untitled.txt', content: '' }) },
                { icon: '🔄', label: 'Refresh Desktop', action: () => playSuccessSound() },
                { separator: true },
                { icon: '🔒', label: 'Lock Screen', shortcut: 'Ctrl+L', action: () => setIsLocked(true) },
            ]
        });
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (isLocked) {
                if (e.key === 'Enter') {
                    if (lockInput === 'cyber' || lockInput === '') setIsLocked(false);
                }
                return;
            }
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 't': e.preventDefault(); openWindow('TERMINAL'); break;
                    case 'e': e.preventDefault(); openWindow('FILE_EXPLORER', { path: '/' }); break;
                    case 'w': e.preventDefault(); {
                        const focused = windows.find(w => w.isFocused);
                        if (focused) closeWindow(focused.id);
                    } break;
                    case 'm': e.preventDefault(); setShowMatrix(p => !p); break;
                    case 'l': e.preventDefault(); setIsLocked(true); break;
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [windows, isLocked, lockInput]);

    // LOCK SCREEN
    if (isLocked) {
        return (
            <div className="w-screen h-screen bg-black flex flex-col items-center justify-center font-mono text-cyber-green select-none">
                <div className="scanline-overlay"></div>
                <div className="text-6xl mb-6 animate-pulse">🔒</div>
                <h1 className="text-3xl font-bold glitch-container mb-2" data-text="SYSTEM LOCKED">SYSTEM LOCKED</h1>
                <div className="text-xs text-cyber-green/40 mb-8">{time} | CYBER_OS v2.1</div>
                <div className="flex flex-col items-center gap-3">
                    <input
                        type="password"
                        value={lockInput}
                        onChange={(e) => setLockInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { setIsLocked(false); setLockInput(''); } }}
                        placeholder="Enter password or press ENTER..."
                        className="bg-black border border-cyber-green/30 text-cyber-green px-4 py-2 w-72 text-center text-sm outline-none focus:border-cyber-green"
                        autoFocus
                    />
                    <div className="text-[10px] text-cyber-green/20">Press ENTER to unlock</div>
                </div>
            </div>
        );
    }

    const startMenuApps = [
        {
            category: 'SYSTEM', items: [
                { icon: '⌨', label: 'Terminal', action: () => openWindow('TERMINAL') },
                { icon: '📁', label: 'File Explorer', action: () => openWindow('FILE_EXPLORER', { path: '/' }) },
                { icon: '📊', label: 'System Monitor', action: () => openWindow('SYSTEM_MONITOR') },
                { icon: '📝', label: 'Text Editor', action: () => openWindow('TEXT_EDITOR', { fileName: 'untitled.txt', content: '' }) },
            ]
        },
        {
            category: 'NETWORK', items: [
                { icon: '💬', label: 'Relay Chat', badge: chatUnread, action: () => openWindow('CHAT') },
                { icon: '🎵', label: 'Music Player', action: () => openWindow('MUSIC_PLAYER') },
                { icon: '🎮', label: 'Brute Force', action: () => openWindow('MINIGAME') },
                { icon: '📋', label: 'Mission Log', action: () => openWindow('MISSION_LOG') },
            ]
        },
        {
            category: 'SETTINGS', items: [
                { icon: '🎨', label: `Theme: ${theme.toUpperCase()}`, action: toggleTheme },
                { icon: '🟩', label: `Matrix: ${showMatrix ? 'ON' : 'OFF'}`, action: () => setShowMatrix(!showMatrix) },
            ]
        },
    ];

    return (
        <div
            className="w-screen h-screen bg-cyber-black overflow-hidden relative selection:bg-cyber-green selection:text-black transition-colors duration-500"
            onContextMenu={handleDesktopContextMenu}
            onClick={() => { setContextMenu(null); setIsStartMenuOpen(false); }}
        >
            <XPNotification event={xpEvent} />

            {showMatrix ? <MatrixRain /> : (
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-gradient-to-br from-cyber-green/10 via-transparent to-cyber-green/5"></div>
            )}

            {/* Header */}
            <div className="absolute top-0 left-0 w-full px-4 py-2 flex justify-between items-center z-20 select-none pointer-events-none bg-gradient-to-b from-black/70 to-transparent">
                <div className="flex flex-col pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleTheme(); }}>
                    <h1 className="text-lg md:text-xl font-bold glitch-container text-cyber-green" data-text={title}>{title}</h1>
                    <div className="text-[9px] text-cyber-green/30 font-mono mt-0.5">
                        KERNEL: v4.19 | THEME: {theme.toUpperCase()} | LV.{level}
                    </div>
                </div>
                <div className="text-right font-mono text-cyber-green flex flex-col items-end gap-0.5 pointer-events-auto">
                    <div className="text-sm font-bold cursor-pointer hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setShowMatrix(!showMatrix); }}>
                        {time}
                    </div>
                    <div className="text-[9px] flex gap-3">
                        <span className={cpuLoad > 80 ? 'text-red-500 animate-pulse' : 'text-cyber-green/40'}>CPU: {Math.floor(cpuLoad)}%</span>
                        <span className="text-cyber-green/40">MEM: 12GB</span>
                        <span className="text-cyber-green/40">NET: ON</span>
                    </div>
                </div>
            </div>

            {/* Desktop Icons */}
            <div className="p-4 pt-16 flex flex-col gap-4 h-full z-0 w-24 fixed top-0 left-0">
                <FileIcon name="TERMINAL" type="exe" onDoubleClick={() => { const t = windows.find(w => w.type === 'TERMINAL'); t ? focusWindow(t.id) : openWindow('TERMINAL'); }} />
                <FileIcon name="my_docs" type="folder" onDragStart={handleDragStart} onDragEnd={(e, i) => handleFileDrop(e, i, "my_docs")} onDoubleClick={() => handleFileOpen("my_docs")} />
                <FileIcon name="about_me.enc" onDragStart={handleDragStart} onDragEnd={(e, i) => handleFileDrop(e, i, "about_me.enc")} onDoubleClick={() => handleFileOpen("about_me.enc")} />
                <FileIcon name="projects.txt" onDragStart={handleDragStart} onDragEnd={(e, i) => handleFileDrop(e, i, "projects.txt")} onDoubleClick={() => handleFileOpen("projects.txt")} />
                <FileIcon name="contact.hex" onDragStart={handleDragStart} onDragEnd={(e, i) => handleFileDrop(e, i, "contact.hex")} onDoubleClick={() => handleFileOpen("contact.hex")} />
                <FileIcon name="brute_force.exe" type="exe" onDragStart={handleDragStart} onDragEnd={(e, i) => handleFileDrop(e, i, "brute_force.exe")} onDoubleClick={() => handleFileOpen("brute_force.exe")} />
                <FileIcon name="SYS_MON" type="exe" onDoubleClick={() => openWindow('SYSTEM_MONITOR')} />
                <FileIcon name="CHAT" type="exe" onDoubleClick={() => openWindow('CHAT')} />
                <FileIcon name="MUSIC" type="exe" onDoubleClick={() => openWindow('MUSIC_PLAYER')} />
                <FileIcon name="MISSIONS" type="exe" onDoubleClick={() => openWindow('MISSION_LOG')} />
            </div>

            {/* Network Feed */}
            <div className="absolute bottom-12 right-3 z-0 opacity-80">
                <NetworkFeed />
            </div>

            {/* Windows */}
            <div className="absolute inset-0 z-10 pt-14 pb-11 px-2 overflow-hidden pointer-events-none">
                <div className="relative w-full h-full">
                    <WindowManager
                        windows={windows} closeWindow={closeWindow} focusWindow={focusWindow}
                        minimizeWindow={minimizeWindow} onCommand={handleCommand} onFileOpen={handleFileOpen}
                        history={history} setHistory={setHistory} isDraggingFile={isDraggingFile}
                        playTypingSound={playTypingSound} onUnreadChange={setChatUnread}
                    />
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenu.items} onClose={() => setContextMenu(null)} />
            )}

            {/* Start Menu */}
            <AnimatePresence>
                {isStartMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scaleY: 0.8 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: 20, scaleY: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="fixed bottom-11 left-0 w-72 bg-black/98 border border-cyber-green/30 z-[100] font-mono shadow-[0_0_40px_rgba(0,255,65,0.1)] backdrop-blur-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* User Profile */}
                        <div className="p-3 border-b border-cyber-green/20 bg-cyber-green/5">
                            <div className="text-sm font-bold text-cyber-green">USER_01</div>
                            <div className="text-[10px] text-cyber-green/40 flex gap-3 mt-1">
                                <span>LV.{level}</span>
                                <span>{totalXP} XP</span>
                                {streak > 0 && <span>🔥 {streak}d streak</span>}
                            </div>
                        </div>

                        {/* App Categories */}
                        {startMenuApps.map((cat, ci) => (
                            <div key={ci}>
                                <div className="px-3 py-1 text-[9px] text-cyber-green/30 font-bold tracking-widest bg-black/30">
                                    {cat.category}
                                </div>
                                {cat.items.map((item, ii) => (
                                    <button
                                        key={ii}
                                        onClick={() => { item.action(); setIsStartMenuOpen(false); }}
                                        className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-cyber-green/10 transition-colors text-xs text-cyber-green/70 hover:text-cyber-green"
                                    >
                                        <span className="text-sm">{item.icon}</span>
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge > 0 && (
                                            <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold animate-pulse">{item.badge}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}

                        {/* Power */}
                        <div className="border-t border-cyber-green/20 p-2 flex gap-2">
                            <button onClick={() => { setIsLocked(true); setIsStartMenuOpen(false); }}
                                className="flex-1 text-center py-1.5 text-[10px] border border-cyber-green/20 text-cyber-green/50 hover:bg-cyber-green/10 hover:text-cyber-green">
                                🔒 LOCK
                            </button>
                            <button onClick={() => { window.location.reload(); }}
                                className="flex-1 text-center py-1.5 text-[10px] border border-amber-500/20 text-amber-500/50 hover:bg-amber-500/10 hover:text-amber-500">
                                🔄 REBOOT
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Taskbar */}
            <div className="absolute bottom-0 left-0 w-full h-10 bg-black/95 border-t border-cyber-green/30 flex items-center px-2 gap-1.5 z-50 select-none backdrop-blur-sm">
                <button
                    className="px-2.5 py-1 bg-cyber-green text-black font-bold text-xs hover:bg-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); setIsStartMenuOpen(!isStartMenuOpen); setContextMenu(null); playSuccessSound(); }}
                >
                    [START]
                </button>

                <div className="h-2/3 w-[1px] bg-cyber-green/15 mx-0.5"></div>

                {/* Window buttons */}
                <div className="flex gap-1 overflow-x-auto flex-1 scrollbar-hide">
                    {windows.map(win => (
                        <button
                            key={win.id}
                            onClick={(e) => { e.stopPropagation(); focusWindow(win.id); }}
                            className={`px-2 py-0.5 text-[10px] font-mono border truncate max-w-[110px] transition-all relative ${win.isFocused && !win.minimized
                                ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
                                : win.minimized
                                    ? 'bg-transparent border-cyber-green/10 text-cyber-green/25 hover:text-cyber-green/50'
                                    : 'bg-transparent border-cyber-green/20 text-cyber-green/40 hover:bg-cyber-green/10'
                                }`}
                        >
                            {win.type === 'CHAT' && chatUnread > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[7px] font-bold animate-pulse">{chatUnread}</span>
                            )}
                            {win.type.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="h-2/3 w-[1px] bg-cyber-green/15 mx-0.5"></div>

                <StatusBar totalXP={totalXP} level={level} streak={streak} sessionStart={sessionStart} />

                <div className="h-2/3 w-[1px] bg-cyber-green/15 mx-0.5"></div>

                <AchievementSystem stats={stats} onXPGain={handleAchievementXP} />
            </div>

            <div className="scanline-overlay"></div>
        </div>
    );
};

export default DesktopEnvironment;
