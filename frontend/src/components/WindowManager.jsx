import React from 'react';
import { motion } from 'framer-motion';
import TerminalWindow from './TerminalWindow';
import TextEditor from './apps/TextEditor';
import ImageViewer from './apps/ImageViewer';
import HackingMinigame from './apps/HackingMinigame';
import FileExplorer from './apps/FileExplorer';
import MissionLog from './apps/MissionLog';
import SystemMonitor from './apps/SystemMonitor';
import ChatApp from './apps/ChatApp';
import MusicPlayer from './apps/MusicPlayer';

const APP_SIZES = {
    TERMINAL: { width: 'w-[55%]', height: 'h-[65%]' },
    TEXT_EDITOR: { width: 'w-[50%]', height: 'h-[60%]' },
    IMAGE_VIEWER: { width: 'w-[40%]', height: 'h-[50%]' },
    MINIGAME: { width: 'w-[45%]', height: 'h-[55%]' },
    FILE_EXPLORER: { width: 'w-[50%]', height: 'h-[55%]' },
    MISSION_LOG: { width: 'w-[40%]', height: 'h-[60%]' },
    SYSTEM_MONITOR: { width: 'w-[50%]', height: 'h-[65%]' },
    CHAT: { width: 'w-[55%]', height: 'h-[65%]' },
    MUSIC_PLAYER: { width: 'w-[45%]', height: 'h-[55%]' },
};

const APP_LABELS = {
    TERMINAL: '⌨ TERMINAL',
    TEXT_EDITOR: '📝 NANO_VISUAL',
    IMAGE_VIEWER: '🖼 IMG_VIEW',
    MINIGAME: '🎮 BRUTE_FORCE',
    FILE_EXPLORER: '📁 FILES',
    MISSION_LOG: '📋 MISSIONS',
    SYSTEM_MONITOR: '📊 SYS_MON',
    CHAT: '💬 RELAY_CHAT',
    MUSIC_PLAYER: '🎵 MUSIC_PLAYER',
};

const WindowManager = ({ windows, closeWindow, focusWindow, minimizeWindow, onCommand, onFileOpen, history, setHistory, isDraggingFile, playTypingSound, onUnreadChange }) => {
    return (
        <>
            {windows.map((win) => {
                if (win.minimized) return null;

                const isFocused = win.isFocused;
                const sizes = APP_SIZES[win.type] || { width: 'w-1/2', height: 'h-2/3' };
                const isMaximized = win.maximized;

                return (
                    <motion.div
                        key={win.id}
                        drag={!isMaximized}
                        dragMomentum={false}
                        initial={{ x: win.x, y: win.y, scale: 0.8, opacity: 0 }}
                        animate={{
                            x: isMaximized ? 0 : win.x,
                            y: isMaximized ? 0 : win.y,
                            scale: 1,
                            opacity: 1,
                            zIndex: isFocused ? 50 : 10,
                            width: isMaximized ? '100%' : undefined,
                            height: isMaximized ? '100%' : undefined,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onMouseDown={() => focusWindow(win.id)}
                        className={`absolute ${isMaximized ? 'w-full h-full' : `${sizes.width} ${sizes.height}`} shadow-2xl rounded-sm overflow-hidden flex flex-col pointer-events-auto ${isFocused ? 'shadow-[0_0_30px_rgba(0,255,65,0.15)]' : ''
                            }`}
                    >
                        {/* Window Title Bar (except for apps that render their own) */}
                        {!['TERMINAL', 'TEXT_EDITOR', 'IMAGE_VIEWER', 'MINIGAME', 'FILE_EXPLORER', 'MISSION_LOG', 'SYSTEM_MONITOR', 'CHAT', 'MUSIC_PLAYER'].includes(win.type) && (
                            <div className={`flex justify-between items-center p-1 px-2 border-b ${isFocused ? 'bg-cyber-green text-black' : 'bg-gray-900 text-cyber-green/50'}`}>
                                <span className="font-bold text-xs">{APP_LABELS[win.type] || win.type}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => minimizeWindow?.(win.id)} className="hover:bg-black/20 px-1 text-xs">—</button>
                                    <button onClick={() => closeWindow(win.id)} className="hover:bg-black/20 px-1 text-xs">[X]</button>
                                </div>
                            </div>
                        )}

                        {win.type === 'TERMINAL' && (
                            <TerminalWindow
                                isOpen={true}
                                onClose={() => closeWindow(win.id)}
                                onCommand={onCommand}
                                history={history}
                                setHistory={setHistory}
                                isDraggingFile={isDraggingFile}
                                playTypingSound={playTypingSound}
                            />
                        )}

                        {win.type === 'TEXT_EDITOR' && (
                            <TextEditor
                                fileName={win.data?.fileName}
                                content={win.data?.content}
                                onClose={() => closeWindow(win.id)}
                                isFocused={isFocused}
                            />
                        )}

                        {win.type === 'IMAGE_VIEWER' && (
                            <ImageViewer
                                fileName={win.data?.fileName}
                                src={win.data?.src}
                                onClose={() => closeWindow(win.id)}
                                isFocused={isFocused}
                            />
                        )}

                        {win.type === 'MINIGAME' && (
                            <HackingMinigame
                                onClose={() => closeWindow(win.id)}
                                isFocused={isFocused}
                            />
                        )}

                        {win.type === 'FILE_EXPLORER' && (
                            <FileExplorer
                                path={win.data?.path}
                                onClose={() => closeWindow(win.id)}
                                onFileOpen={onFileOpen}
                                isFocused={isFocused}
                            />
                        )}

                        {win.type === 'MISSION_LOG' && (
                            <MissionLog
                                onClose={() => closeWindow(win.id)}
                                isFocused={isFocused}
                            />
                        )}

                        {win.type === 'SYSTEM_MONITOR' && (
                            <SystemMonitor
                                onClose={() => closeWindow(win.id)}
                                isFocused={isFocused}
                            />
                        )}

                        {win.type === 'CHAT' && (
                            <ChatApp
                                onClose={() => closeWindow(win.id)}
                                isFocused={isFocused}
                                onUnreadChange={onUnreadChange}
                            />
                        )}

                        {win.type === 'MUSIC_PLAYER' && (
                            <MusicPlayer
                                onClose={() => closeWindow(win.id)}
                                isFocused={isFocused}
                            />
                        )}
                    </motion.div>
                );
            })}
        </>
    );
};

export default WindowManager;
