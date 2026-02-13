import React, { useState, useEffect, useRef } from 'react';

const NetworkFeed = ({ onAction }) => {
    const [feed, setFeed] = useState([]);
    const bottomRef = useRef(null);
    const [highlight, setHighlight] = useState(false);

    const baseMessages = [
        "Scanning port 443... [OPEN]",
        "Intercepting packet 0x4F...",
        "Decryption key fragment found.",
        "System: USER_01 connected.",
        "Warning: Intrusion detected in Sector 7.",
        "Download complete: stealth_kit.v2",
        "Uploading data to secure server...",
        "Proxy chain established: NY → TK → LDN",
        "Firewall breach attempt blocked.",
        "Signal strength: 98%",
        "Mining crypto-shard... Success.",
        "Establishing handshake with ghost protocol.",
        "Error: corrupted memory block ignored.",
        "Accessing dark node...",
        "Trace complete. IP hidden.",
        "Brute-force attempt on PORT 22 detected.",
        "Quantum encryption handshake complete.",
        "Data exfiltration: 2.4TB transferred.",
        "Anonymous relay established via TOR.",
        "Firmware update available: v3.7.1-PHANTOM",
        "ICE barrier detected. Recalibrating...",
        "Node 7G responding to heartbeat.",
        "Memory defrag: recovered 512MB.",
        "Packet loss: 0.02% - ACCEPTABLE",
        "Security audit: PASSED",
        "Rogue process PID:666 terminated.",
        "Satellite uplink: ACTIVE",
        "DNS poisoning attempt neutralized.",
        "Steganographic payload extracted.",
        "Zero-day vulnerability patched.",
        "Darknet marketplace update received.",
        "Shell spawned on remote target.",
        "Certificate pinning: ENFORCED",
        "Botnet C2 traffic rerouted.",
        "Keylogger signature matched. Quarantined.",
        "VPN tunnel MTU optimized: 1420",
        "Honeypot triggered at 10.0.3.77",
        "Blockchain transaction verified.",
        "Kernel panic averted at 0xDEADBEEF",
        "Covert channel established via ICMP",
    ];

    const urgentMessages = [
        "⚠ ALERT: Unknown entity probing firewall!",
        "⚠ CRITICAL: Root access attempt detected!",
        "🔑 RARE KEY FRAGMENT: Available for 30s only!",
        "⚡ BONUS: Double XP active for next command!",
        "🎯 MISSION UPDATE: New objective available.",
        "🔥 THREAT LEVEL: ELEVATED",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const isUrgent = Math.random() > 0.88;
            const pool = isUrgent ? urgentMessages : baseMessages;
            const msg = pool[Math.floor(Math.random() * pool.length)];
            const timestamp = new Date().toLocaleTimeString([], { hour12: false });

            if (isUrgent) {
                setHighlight(true);
                setTimeout(() => setHighlight(false), 2000);
            }

            setFeed(prev => {
                const newFeed = [...prev, { text: `[${timestamp}] ${msg}`, urgent: isUrgent }];
                if (newFeed.length > 30) newFeed.shift();
                return newFeed;
            });
        }, 1800 + Math.random() * 1200);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [feed]);

    return (
        <div className={`w-64 h-48 bg-black/90 border p-2 font-mono text-xs overflow-hidden flex flex-col pointer-events-none select-none relative transition-all duration-500 ${highlight ? 'border-red-500/80 shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'border-cyber-green/20'
            }`}>
            <div className="absolute top-0 right-0 text-[10px] text-cyber-green/40 p-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                NET_FEED
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5 mt-3">
                {feed.map((line, i) => (
                    <div key={i} className={`truncate leading-tight ${line.urgent
                            ? 'text-red-400 font-bold'
                            : i === feed.length - 1
                                ? 'text-cyber-green/90'
                                : 'text-cyber-green/40'
                        }`}>
                        {line.text}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-black to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
        </div>
    );
};

export default NetworkFeed;
