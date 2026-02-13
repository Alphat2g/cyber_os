import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

const COMMANDS = [
    'ls', 'cd', 'pwd', 'cat', 'touch', 'rm', 'mkdir', 'cp', 'mv', 'echo',
    'clear', 'help', 'whoami', 'neofetch', 'scan', 'ping', 'traceroute',
    'ps', 'uptime', 'ifconfig', 'nmap', 'decrypt', 'status', 'users',
    'sudo', 'ssh', 'history', 'date', 'hostname', 'uname', 'df',
    'hack', 'theme', 'matrix', 'open'
];

const TerminalWindow = ({ isOpen, onClose, onCommand, history, setHistory, isDraggingFile, playTypingSound }) => {
    const [input, setInput] = useState('');
    const [currentPath, setCurrentPath] = useState('/');
    const [cmdHistory, setCmdHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [tabHint, setTabHint] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [commandCount, setCommandCount] = useState(() => {
        return parseInt(localStorage.getItem('cyber_cmd_count') || '0');
    });
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    // Focus input when window gains focus
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Typewriter effect for response
    const typewriterAppend = useCallback((text, type = 'response') => {
        setIsTyping(true);
        const lines = text.split('\n');
        let lineIdx = 0;

        // Add all lines at once but with a small delay for effect
        const addLines = () => {
            if (lineIdx < lines.length) {
                const batch = lines.slice(lineIdx, lineIdx + 3).join('\n');
                if (lineIdx === 0) {
                    setHistory(prev => [...prev, { type, content: batch }]);
                } else {
                    setHistory(prev => {
                        const updated = [...prev];
                        const last = updated[updated.length - 1];
                        updated[updated.length - 1] = { ...last, content: last.content + '\n' + batch };
                        return updated;
                    });
                }
                lineIdx += 3;
                setTimeout(addLines, 30);
            } else {
                setIsTyping(false);
            }
        };
        addLines();
    }, [setHistory]);

    // Simple path resolver
    const resolvePath = (path) => {
        if (path.startsWith('/')) return path;
        const base = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);
        const parts = path.split('/').filter(Boolean);
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                if (base.length > 0) base.pop();
            } else {
                base.push(part);
            }
        }
        return '/' + base.join('/');
    };

    const handleKeyDown = (e) => {
        // Tab completion
        if (e.key === 'Tab') {
            e.preventDefault();
            const partial = input.trim().toLowerCase();
            if (partial) {
                const match = COMMANDS.find(c => c.startsWith(partial));
                if (match) {
                    setInput(match + ' ');
                    setTabHint('');
                }
            }
            return;
        }

        // Command history navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length > 0) {
                const newIndex = historyIndex < cmdHistory.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                setInput(cmdHistory[cmdHistory.length - 1 - newIndex] || '');
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(cmdHistory[cmdHistory.length - 1 - newIndex] || '');
            } else {
                setHistoryIndex(-1);
                setInput('');
            }
            return;
        }

        if (e.key === 'Enter') {
            const cmd = input.trim();
            setHistory(prev => [...prev, { type: 'user', content: `${getPrompt()} ${cmd}` }]);
            setInput('');
            setTabHint('');
            setHistoryIndex(-1);

            if (cmd) {
                setCmdHistory(prev => [...prev, cmd]);
                const newCount = commandCount + 1;
                setCommandCount(newCount);
                localStorage.setItem('cyber_cmd_count', String(newCount));
                processCommand(cmd);
            }
        } else {
            if (playTypingSound && e.key.length === 1) {
                playTypingSound();
            }
            // Live tab hint
            const newInput = e.key.length === 1 ? input + e.key : input;
            const partial = newInput.trim().toLowerCase();
            if (partial && !partial.includes(' ')) {
                const match = COMMANDS.find(c => c.startsWith(partial) && c !== partial);
                setTabHint(match ? match.slice(partial.length) : '');
            } else {
                setTabHint('');
            }
        }
    };

    const getPrompt = () => {
        const shortPath = currentPath === '/' ? '/' : currentPath.split('/').pop() || '/';
        return `user@cyber:~${currentPath === '/' ? '' : currentPath}$`;
    };

    const processCommand = async (cmd) => {
        if (cmd === 'clear') {
            setHistory([]);
            return;
        }

        if (cmd === 'help') {
            setHistory(prev => [...prev, {
                type: 'system',
                content: (
                    'Available Commands:\n'
                    + '──────────────────────────────────\n'
                    + '  FILE SYSTEM:\n'
                    + '    ls, cd, pwd, cat, touch, mkdir,\n'
                    + '    rm, cp, mv, echo\n'
                    + '  NETWORK:\n'
                    + '    scan, ping, traceroute, nmap, ssh\n'
                    + '  SYSTEM:\n'
                    + '    whoami, neofetch, ps, uptime,\n'
                    + '    status, users, ifconfig, df,\n'
                    + '    hostname, uname, date, history,\n'
                    + '    decrypt, sudo\n'
                    + '  APPS:\n'
                    + '    hack, theme, matrix, open [file]\n'
                    + '    clear\n'
                    + '──────────────────────────────────\n'
                    + `  Commands executed: ${commandCount}`
                )
            }]);
            return;
        }

        const args = cmd.split(' ');
        const operation = args[0];
        const getTarget = () => args[1] ? resolvePath(args[1]) : currentPath;

        try {
            let res;
            if (operation === 'ls') {
                const target = getTarget();
                res = await axios.get(`${API_URL}/files/list?path=${target}`);
                if (res.data.files) {
                    const fileList = res.data.files.map(f =>
                        `${f.type === 'folder' ? '📁 ' : '📄 '}${f.name}${f.type === 'file' ? ` (${f.size}b)` : ''}`
                    ).join('\n');
                    setHistory(prev => [...prev, { type: 'response', content: fileList || '(empty directory)' }]);
                } else {
                    throw new Error(res.data.error || 'Unknown error');
                }
            } else if (operation === 'cd') {
                if (!args[1] || args[1] === '~') {
                    setCurrentPath('/');
                    return;
                }
                const target = getTarget();
                res = await axios.get(`${API_URL}/files/list?path=${target}`);
                if (res.data.error) {
                    throw new Error(`cd: ${args[1]}: No such directory`);
                } else {
                    setCurrentPath(target);
                    setHistory(prev => [...prev, { type: 'response', content: `→ ${target}` }]);
                }
            } else if (operation === 'pwd') {
                setHistory(prev => [...prev, { type: 'response', content: currentPath }]);
            } else if (operation === 'cat') {
                if (!args[1]) throw new Error('Usage: cat [filename]');
                const target = resolvePath(args[1]);
                res = await axios.post(`${API_URL}/files/read`, { path: target });
                if (res.data.content !== undefined) {
                    typewriterAppend(res.data.content);
                } else {
                    throw new Error(res.data.error || 'File not found');
                }
            } else if (operation === 'touch') {
                if (!args[1]) throw new Error('Usage: touch [filename]');
                const target = resolvePath(args[1]);
                res = await axios.post(`${API_URL}/files/create`, { path: target, type: 'file' });
                if (res.data.status === 'success') {
                    setHistory(prev => [...prev, { type: 'response', content: `✓ Created: ${target}` }]);
                } else {
                    throw new Error(res.data.error);
                }
            } else if (operation === 'mkdir') {
                if (!args[1]) throw new Error('Usage: mkdir [foldername]');
                const target = resolvePath(args[1]);
                res = await axios.post(`${API_URL}/files/create`, { path: target, type: 'folder' });
                if (res.data.status === 'success') {
                    setHistory(prev => [...prev, { type: 'response', content: `✓ Created folder: ${target}` }]);
                } else {
                    throw new Error(res.data.error);
                }
            } else if (operation === 'rm') {
                if (!args[1]) throw new Error('Usage: rm [filename]');
                const target = resolvePath(args[1]);
                res = await axios.post(`${API_URL}/files/delete`, { path: target });
                if (res.data.status === 'success') {
                    setHistory(prev => [...prev, { type: 'response', content: `✗ Deleted: ${target}` }]);
                } else {
                    throw new Error(res.data.error);
                }
            } else if (operation === 'cp') {
                if (args.length < 3) throw new Error('Usage: cp [source] [destination]');
                const src = resolvePath(args[1]);
                const dst = resolvePath(args[2]);
                res = await axios.post(`${API_URL}/files/copy`, { path: src, destination: dst });
                if (res.data.status === 'success') {
                    setHistory(prev => [...prev, { type: 'response', content: `✓ Copied ${src} → ${dst}` }]);
                } else {
                    throw new Error(res.data.error);
                }
            } else if (operation === 'mv') {
                if (args.length < 3) throw new Error('Usage: mv [source] [destination]');
                const src = resolvePath(args[1]);
                const dst = resolvePath(args[2]);
                res = await axios.post(`${API_URL}/files/move`, { path: src, destination: dst });
                if (res.data.status === 'success') {
                    setHistory(prev => [...prev, { type: 'response', content: `✓ Moved ${src} → ${dst}` }]);
                } else {
                    throw new Error(res.data.error);
                }
            } else if (operation === 'echo' && args.includes('>')) {
                const arrowIdx = args.indexOf('>');
                const text = args.slice(1, arrowIdx).join(' ').replace(/^['"]|['"]$/g, '');
                const filename = args[arrowIdx + 1];
                if (filename) {
                    const target = resolvePath(filename);
                    res = await axios.post(`${API_URL}/files/write`, { path: target, content: text });
                    if (res.data.status === 'success') {
                        setHistory(prev => [...prev, { type: 'response', content: `✓ Wrote to ${target}` }]);
                    } else {
                        setHistory(prev => [...prev, { type: 'error', content: res.data.error }]);
                    }
                }
            } else {
                // Forward to backend command handler (whoami, neofetch, scan, ping, etc.)
                const response = await onCommand(cmd);
                if (response.type === 'list') {
                    setHistory(prev => [...prev, { type: 'response', content: 'Use ls to list files.' }]);
                } else if (response.type === 'text' || response.type === 'response') {
                    typewriterAppend(response.content);
                } else if (response.type === 'error') {
                    setHistory(prev => [...prev, { type: 'error', content: response.content }]);
                } else if (response.type === 'clear') {
                    setHistory([]);
                } else {
                    setHistory(prev => [...prev, { type: 'response', content: JSON.stringify(response) }]);
                }
            }
        } catch (err) {
            setHistory(prev => [...prev, { type: 'error', content: err.message || 'Command failed' }]);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`w-full h-full bg-cyber-black/95 border p-0 font-mono shadow-[0_0_20px_rgba(0,255,0,0.2)] backdrop-blur-sm flex flex-col relative transition-all duration-300 ${isDraggingFile ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]' : 'border-cyber-green/50'}`}
            onClick={() => inputRef.current?.focus()}
        >
            {/* Drag Overlay */}
            {isDraggingFile && (
                <div className="absolute inset-0 bg-cyber-black/80 flex items-center justify-center z-50 pointer-events-none border-2 border-dashed border-amber-400 m-2">
                    <div className="text-amber-400 text-xl font-bold animate-pulse">
                        [ DROP FILE TO DECRYPT ]
                    </div>
                </div>
            )}

            {/* Title bar */}
            <div className="flex justify-between items-center px-3 py-1.5 border-b border-cyber-green/30 bg-cyber-green/5 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-cyber-green text-sm font-bold">TERMINAL</span>
                    <span className="text-cyber-green/30 text-xs">|</span>
                    <span className="text-cyber-green/50 text-xs">{currentPath}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-cyber-green/40 text-xs">CMD: {commandCount}</span>
                    <button onClick={onClose} className="text-cyber-green hover:text-red-400 transition-colors text-sm">[X]</button>
                </div>
            </div>

            {/* Output */}
            <div className="flex-1 overflow-y-auto space-y-1 px-3 py-2 scrollbar-hide text-sm">
                {history.map((line, i) => (
                    <div key={i} className={`leading-relaxed ${line.type === 'error' ? 'text-red-400'
                        : line.type === 'user' ? 'text-white/90'
                            : line.type === 'system' ? 'text-amber-400'
                                : 'text-cyber-green/90'
                        }`}>
                        <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm">{line.content}</pre>
                    </div>
                ))}
                {isTyping && (
                    <div className="text-cyber-green animate-pulse text-xs">▋</div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2 border-t border-cyber-green/20 flex items-center bg-cyber-black/50 shrink-0">
                <span className="text-cyber-green/80 mr-2 text-sm shrink-0">{getPrompt()}</span>
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                        className="bg-transparent border-none outline-none text-cyber-green w-full focus:ring-0 text-sm caret-cyber-green"
                        autoFocus
                        spellCheck={false}
                    />
                    {/* Tab hint ghost text */}
                    {tabHint && (
                        <span className="absolute left-0 top-0 text-cyber-green/20 text-sm pointer-events-none select-none">
                            {input}{tabHint}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TerminalWindow;
