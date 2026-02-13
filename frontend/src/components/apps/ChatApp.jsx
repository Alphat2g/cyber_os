import React, { useState, useEffect, useRef } from 'react';

const CONTACTS = [
    { id: 'phantom', name: 'PHANTOM_X', status: 'ONLINE', avatar: '👻', role: 'Hacker' },
    { id: 'null', name: 'NULL_BYTE', status: 'ONLINE', avatar: '💀', role: 'Data Broker' },
    { id: 'dark', name: 'D4RK_ECHO', status: 'AWAY', avatar: '🌑', role: 'Intel Agent' },
    { id: 'root', name: 'R00T_ACCESS', status: 'ONLINE', avatar: '🔓', role: 'Sysadmin' },
    { id: 'oracle', name: 'THE_ORACLE', status: 'UNKNOWN', avatar: '🔮', role: 'Mysterious' },
];

const NPC_MESSAGES = {
    phantom: [
        "Yo, I just cracked that AES-256 key. You want in?",
        "Don't trust NULL_BYTE. Something's off about that one.",
        "I found a backdoor in the mainframe. Meet me in the shadow node.",
        "Got a new exploit ready. Zero-day stuff. Interested?",
        "The feds are getting closer. Stay encrypted.",
        "I intercepted a message from the inner circle. Big things coming.",
        "Remember: the firewall has a 3-second gap at 03:00.",
        "Just finished a pentest on MegaCorp. They're wide open.",
    ],
    null: [
        "I have 10TB of classified data. Name your price.",
        "Someone's watching your packets. I can see the traces.",
        "The dark auction starts in 2 hours. Rare exploits.",
        "I can get you access to any system. Just give me a target.",
        "Payment accepted. The files are in your /vault directory.",
        "I noticed some unusual process activity on your machine...",
        "New batch of credentials just dropped. Fresh from a breach.",
    ],
    dark: [
        "Agent report: Sector 7 compromised.",
        "Encrypt everything. Protocol OMEGA is active.",
        "Don't respond to pings from 10.13.37.x — it's a honeypot.",
        "Mission brief incoming. Eyes only.",
        "I've been deep cover for 6 months. The things I've seen...",
        "Intel says they're deploying quantum decryption next week.",
        "Trust no one. The moles are everywhere.",
    ],
    root: [
        "System update available. Contains critical security patches.",
        "I've given you elevated privileges. Use them wisely.",
        "Memory leak detected in quantum_sim. Monitoring.",
        "Your disk usage is getting high. Clean up /tmp.",
        "I've noticed unauthorized access attempts on your account.",
        "Backup completed successfully. 2.1TB archived.",
        "New user 'shadow' was created. Wasn't me. Investigate.",
    ],
    oracle: [
        "The path you seek lies beyond the firewall of perception.",
        "01001000 01100101 01101100 01110000",
        "When the last node falls, the truth will emerge.",
        "You are not ready for what lies in /dev/null.",
        "The number 42 appears 7 times in the source code. Coincidence?",
        "I have seen the future. It is encrypted.",
        "Ask yourself: who watches the watchers?",
    ],
};

const ChatApp = ({ onClose, isFocused, onUnreadChange }) => {
    const [activeContact, setActiveContact] = useState('phantom');
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('cyber_chat_messages');
        return saved ? JSON.parse(saved) : {
            phantom: [{ from: 'npc', text: 'Hey, you made it. Welcome to the shadow network.', time: Date.now() }],
            null: [{ from: 'npc', text: 'Business inquiries only. What do you need?', time: Date.now() }],
            dark: [{ from: 'npc', text: '... connection established. Encryption verified.', time: Date.now() }],
            root: [{ from: 'npc', text: 'System admin here. Your account has been flagged for review.', time: Date.now() }],
            oracle: [{ from: 'npc', text: "You seek answers. But do you know the questions?", time: Date.now() }],
        };
    });
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(null);
    const [unread, setUnread] = useState({ phantom: 0, null: 0, dark: 0, root: 0, oracle: 0 });
    const bottomRef = useRef(null);

    // Persist messages
    useEffect(() => {
        localStorage.setItem('cyber_chat_messages', JSON.stringify(messages));
    }, [messages]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeContact]);

    // NPC auto-messages (Instagram psychology — someone texted you!)
    useEffect(() => {
        const timers = CONTACTS.map(contact => {
            const delay = 15000 + Math.random() * 45000;
            return setInterval(() => {
                const pool = NPC_MESSAGES[contact.id];
                const msg = pool[Math.floor(Math.random() * pool.length)];

                // Show typing indicator first
                setTyping(contact.id);
                setTimeout(() => {
                    setTyping(null);
                    setMessages(prev => ({
                        ...prev,
                        [contact.id]: [...(prev[contact.id] || []), { from: 'npc', text: msg, time: Date.now() }]
                    }));

                    // Update unread if not viewing this contact
                    setUnread(prev => ({
                        ...prev,
                        [contact.id]: prev[contact.id] + 1
                    }));
                }, 2000 + Math.random() * 2000);
            }, delay);
        });

        return () => timers.forEach(clearInterval);
    }, []);

    // Report unread count to parent (for taskbar badge)
    useEffect(() => {
        const total = Object.values(unread).reduce((a, b) => a + b, 0);
        onUnreadChange?.(total);
    }, [unread]);

    // Clear unread when switching contacts
    useEffect(() => {
        setUnread(prev => ({ ...prev, [activeContact]: 0 }));
    }, [activeContact]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { from: 'user', text: input.trim(), time: Date.now() };
        setMessages(prev => ({
            ...prev,
            [activeContact]: [...(prev[activeContact] || []), userMsg]
        }));
        setInput('');

        // NPC responds after a delay
        const contact = activeContact;
        setTimeout(() => {
            setTyping(contact);
            setTimeout(() => {
                setTyping(null);
                const pool = NPC_MESSAGES[contact];
                const response = pool[Math.floor(Math.random() * pool.length)];
                setMessages(prev => ({
                    ...prev,
                    [contact]: [...(prev[contact] || []), { from: 'npc', text: response, time: Date.now() }]
                }));
            }, 1500 + Math.random() * 2500);
        }, 500);
    };

    const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

    return (
        <div className={`w-full h-full bg-black border-2 flex font-mono text-xs select-none ${isFocused ? 'border-cyber-green' : 'border-cyber-green/30'}`}>
            {/* Sidebar — Contact List */}
            <div className="w-44 border-r border-cyber-green/20 flex flex-col bg-black/80">
                <div className={`p-2 border-b font-bold text-sm flex justify-between items-center ${isFocused ? 'bg-cyber-green text-black border-black' : 'bg-gray-900 text-cyber-green/50 border-cyber-green/30'}`}>
                    <span>RELAY_CHAT</span>
                    <button onClick={onClose} className="hover:bg-black hover:text-cyber-green px-1">[X]</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {CONTACTS.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setActiveContact(c.id)}
                            className={`w-full p-2 flex items-center gap-2 border-b border-cyber-green/5 transition-all text-left ${activeContact === c.id
                                    ? 'bg-cyber-green/10 text-cyber-green'
                                    : 'text-cyber-green/40 hover:bg-cyber-green/5 hover:text-cyber-green/70'
                                }`}
                        >
                            <span className="text-lg">{c.avatar}</span>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold truncate text-[11px]">{c.name}</div>
                                <div className="text-[9px] flex items-center gap-1 text-cyber-green/30">
                                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'ONLINE' ? 'bg-green-500' :
                                            c.status === 'AWAY' ? 'bg-yellow-500' :
                                                'bg-gray-500'
                                        }`}></span>
                                    {c.status}
                                </div>
                            </div>
                            {unread[c.id] > 0 && (
                                <div className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold animate-pulse">
                                    {unread[c.id]}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                {totalUnread > 0 && (
                    <div className="p-1 text-center text-[9px] text-red-400 border-t border-cyber-green/10 animate-pulse">
                        {totalUnread} UNREAD MESSAGE{totalUnread > 1 ? 'S' : ''}
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-2 border-b border-cyber-green/20 flex items-center gap-2 bg-black/50">
                    <span className="text-lg">{CONTACTS.find(c => c.id === activeContact)?.avatar}</span>
                    <div>
                        <div className="font-bold text-cyber-green text-sm">{CONTACTS.find(c => c.id === activeContact)?.name}</div>
                        <div className="text-[9px] text-cyber-green/30">{CONTACTS.find(c => c.id === activeContact)?.role} • ENCRYPTED</div>
                    </div>
                    <div className="ml-auto text-[9px] text-cyber-green/20">🔒 E2E ENCRYPTED</div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
                    {(messages[activeContact] || []).map((msg, i) => (
                        <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-2 rounded-sm ${msg.from === 'user'
                                    ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30'
                                    : 'bg-gray-900 text-cyber-green/80 border border-cyber-green/10'
                                }`}>
                                <div className="text-[11px] leading-relaxed">{msg.text}</div>
                                <div className="text-[8px] text-cyber-green/20 mt-1 text-right">{formatTime(msg.time)}</div>
                            </div>
                        </div>
                    ))}
                    {typing === activeContact && (
                        <div className="flex justify-start">
                            <div className="bg-gray-900 text-cyber-green/50 p-2 rounded-sm border border-cyber-green/10 text-[11px]">
                                <span className="typing-dots">typing</span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-2 border-t border-cyber-green/20 flex gap-2">
                    <input
                        className="flex-1 bg-black border border-cyber-green/30 text-cyber-green px-2 py-1.5 text-[11px] outline-none focus:border-cyber-green"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type encrypted message..."
                    />
                    <button
                        onClick={handleSend}
                        className="bg-cyber-green text-black px-3 py-1 font-bold text-[11px] hover:bg-white transition-colors"
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatApp;
