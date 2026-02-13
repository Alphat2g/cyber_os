import React, { useState, useEffect, useRef, useCallback } from 'react';

const SystemMonitor = ({ onClose, isFocused }) => {
    const canvasRef = useRef(null);
    const [tab, setTab] = useState('GRAPHS');
    const [cpuHistory, setCpuHistory] = useState(() => Array(60).fill(15));
    const [memHistory, setMemHistory] = useState(() => Array(60).fill(40));
    const [netHistory, setNetHistory] = useState(() => Array(60).fill(5));
    const [processes, setProcesses] = useState([]);
    const [sortBy, setSortBy] = useState('cpu');
    const [cpuVal, setCpuVal] = useState(15);
    const [memVal, setMemVal] = useState(40);
    const [netVal, setNetVal] = useState(5);
    const animRef = useRef(null);

    // Simulated processes
    const baseProcesses = [
        { pid: 1, name: 'systemd', user: 'root', cpu: 0.1, mem: 0.5, status: 'RUNNING' },
        { pid: 42, name: 'ghost_daemon', user: 'root', cpu: 2.1, mem: 3.2, status: 'RUNNING' },
        { pid: 66, name: 'proxy_chain', user: 'user', cpu: 8.4, mem: 7.1, status: 'RUNNING' },
        { pid: 77, name: 'tor_relay', user: 'user', cpu: 5.7, mem: 4.3, status: 'RUNNING' },
        { pid: 101, name: 'crypto_miner', user: 'shadow', cpu: 45.2, mem: 12.8, status: 'RUNNING' },
        { pid: 128, name: 'neural_net.ai', user: 'root', cpu: 12.3, mem: 22.4, status: 'RUNNING' },
        { pid: 256, name: 'firewall_v3', user: 'root', cpu: 3.8, mem: 2.1, status: 'RUNNING' },
        { pid: 404, name: 'packet_sniffer', user: 'user', cpu: 6.2, mem: 5.5, status: 'SLEEPING' },
        { pid: 512, name: 'keylogger_det', user: 'root', cpu: 1.4, mem: 1.8, status: 'RUNNING' },
        { pid: 666, name: 'unknown_proc', user: '???', cpu: 0.0, mem: 15.7, status: 'ZOMBIE' },
        { pid: 777, name: 'quantum_sim', user: 'root', cpu: 18.9, mem: 28.3, status: 'RUNNING' },
        { pid: 888, name: 'darknet_node', user: 'shadow', cpu: 7.7, mem: 9.2, status: 'RUNNING' },
        { pid: 1024, name: 'xp_engine', user: 'system', cpu: 0.3, mem: 0.4, status: 'RUNNING' },
        { pid: 1337, name: 'cyber_shell', user: 'user', cpu: 2.0, mem: 3.0, status: 'RUNNING' },
    ];

    // Update data
    useEffect(() => {
        const timer = setInterval(() => {
            const newCpu = Math.min(100, Math.max(5, cpuVal + (Math.random() - 0.45) * 15));
            const newMem = Math.min(95, Math.max(20, memVal + (Math.random() - 0.5) * 5));
            const newNet = Math.min(100, Math.max(0, netVal + (Math.random() - 0.5) * 20));

            setCpuVal(newCpu);
            setMemVal(newMem);
            setNetVal(newNet);

            setCpuHistory(prev => [...prev.slice(1), newCpu]);
            setMemHistory(prev => [...prev.slice(1), newMem]);
            setNetHistory(prev => [...prev.slice(1), newNet]);

            // Fluctuate process values
            setProcesses(baseProcesses.map(p => ({
                ...p,
                cpu: Math.max(0, p.cpu + (Math.random() - 0.5) * 3).toFixed(1),
                mem: Math.max(0, p.mem + (Math.random() - 0.5) * 1).toFixed(1),
            })));
        }, 1000);

        return () => clearInterval(timer);
    }, [cpuVal, memVal, netVal]);

    // Draw graphs on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || tab !== 'GRAPHS') return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        const drawGraph = (data, yOffset, graphH, color, label, value) => {
            const y0 = yOffset;

            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(0, y0, w, graphH);

            // Grid lines
            ctx.strokeStyle = 'rgba(0,255,65,0.08)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < 4; i++) {
                const gy = y0 + (graphH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(w, gy);
                ctx.stroke();
            }

            // Line
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;

            data.forEach((val, i) => {
                const x = (i / (data.length - 1)) * w;
                const y = y0 + graphH - (val / 100) * graphH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Fill under
            ctx.lineTo(w, y0 + graphH);
            ctx.lineTo(0, y0 + graphH);
            ctx.closePath();
            ctx.fillStyle = color.replace('1)', '0.1)');
            ctx.fill();

            ctx.shadowBlur = 0;

            // Label
            ctx.fillStyle = color;
            ctx.font = 'bold 11px Courier New';
            ctx.fillText(`${label}: ${value.toFixed(1)}%`, 8, y0 + 16);
        };

        ctx.clearRect(0, 0, w, h);

        const gapSize = 8;
        const graphH = (h - gapSize * 2) / 3;

        drawGraph(cpuHistory, 0, graphH, 'rgba(0,255,65,1)', 'CPU', cpuVal);
        drawGraph(memHistory, graphH + gapSize, graphH, 'rgba(59,130,246,1)', 'MEM', memVal);
        drawGraph(netHistory, (graphH + gapSize) * 2, graphH, 'rgba(245,158,11,1)', 'NET', netVal);

    }, [cpuHistory, memHistory, netHistory, tab]);

    const sorted = [...processes].sort((a, b) => {
        if (sortBy === 'cpu') return b.cpu - a.cpu;
        if (sortBy === 'mem') return b.mem - a.mem;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.pid - b.pid;
    });

    return (
        <div className={`w-full h-full bg-black border-2 flex flex-col font-mono text-xs select-none ${isFocused ? 'border-cyber-green' : 'border-cyber-green/30'}`}>
            {/* Header */}
            <div className={`flex justify-between items-center p-1 px-2 border-b ${isFocused ? 'bg-cyber-green text-black' : 'bg-gray-900 text-cyber-green/50 border-cyber-green/30'}`}>
                <span className="font-bold text-sm">SYS_MONITOR v3.2</span>
                <button onClick={onClose} className="hover:bg-black hover:text-cyber-green px-1">[X]</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-cyber-green/20">
                {['GRAPHS', 'PROCESSES', 'DISK'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 py-1.5 text-[11px] font-bold transition-all ${tab === t
                            ? 'bg-cyber-green/20 text-cyber-green border-b-2 border-cyber-green'
                            : 'text-cyber-green/40 hover:text-cyber-green hover:bg-cyber-green/5'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {tab === 'GRAPHS' && (
                    <canvas ref={canvasRef} className="w-full h-full" />
                )}

                {tab === 'PROCESSES' && (
                    <div className="h-full overflow-y-auto">
                        <table className="w-full text-[10px]">
                            <thead className="sticky top-0 bg-black">
                                <tr className="text-cyber-green/60 border-b border-cyber-green/20">
                                    <th className="p-1 text-left cursor-pointer hover:text-cyber-green" onClick={() => setSortBy('pid')}>PID</th>
                                    <th className="p-1 text-left cursor-pointer hover:text-cyber-green" onClick={() => setSortBy('name')}>NAME</th>
                                    <th className="p-1 text-left">USER</th>
                                    <th className="p-1 text-right cursor-pointer hover:text-cyber-green" onClick={() => setSortBy('cpu')}>CPU%</th>
                                    <th className="p-1 text-right cursor-pointer hover:text-cyber-green" onClick={() => setSortBy('mem')}>MEM%</th>
                                    <th className="p-1 text-center">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map(p => (
                                    <tr key={p.pid} className={`border-b border-cyber-green/5 hover:bg-cyber-green/5 transition-colors ${p.status === 'ZOMBIE' ? 'text-red-400' : p.user === 'shadow' ? 'text-amber-400' : 'text-cyber-green/70'
                                        }`}>
                                        <td className="p-1">{p.pid}</td>
                                        <td className="p-1 font-bold">{p.name}</td>
                                        <td className="p-1 text-cyber-green/40">{p.user}</td>
                                        <td className="p-1 text-right">
                                            <span className={p.cpu > 10 ? 'text-red-400' : ''}>{p.cpu}</span>
                                        </td>
                                        <td className="p-1 text-right">{p.mem}</td>
                                        <td className="p-1 text-center">
                                            <span className={`text-[9px] px-1 ${p.status === 'RUNNING' ? 'text-green-400' :
                                                    p.status === 'ZOMBIE' ? 'text-red-400 animate-pulse' :
                                                        'text-yellow-400'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'DISK' && (
                    <div className="p-3 space-y-3">
                        {[
                            { mount: '/', device: 'CYBER_DRIVE_V1', total: '2.1 TB', used: 72 },
                            { mount: '/vault', device: 'ENCRYPTED_VOL', total: '500 GB', used: 34 },
                            { mount: '/swap', device: 'QUANTUM_SWAP', total: '64 GB', used: 89 },
                            { mount: '/shadow', device: 'HIDDEN_PART', total: '256 GB', used: 15 },
                            { mount: '/tmp', device: 'VOLATILE_MEM', total: '32 GB', used: 51 },
                        ].map((disk, i) => (
                            <div key={i} className="border border-cyber-green/10 p-2">
                                <div className="flex justify-between mb-1">
                                    <span className="text-cyber-green font-bold">{disk.mount}</span>
                                    <span className="text-cyber-green/40">{disk.device}</span>
                                </div>
                                <div className="w-full h-3 bg-gray-900 border border-cyber-green/10 relative overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${disk.used > 80 ? 'bg-red-500' : disk.used > 60 ? 'bg-amber-500' : 'bg-cyber-green'
                                            }`}
                                        style={{ width: `${disk.used}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-cyber-green/40">
                                    <span>{disk.total}</span>
                                    <span className={disk.used > 80 ? 'text-red-400' : ''}>{disk.used}% USED</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-1 px-2 border-t border-cyber-green/20 text-[10px] text-cyber-green/30 flex justify-between">
                <span>PROCESSES: {processes.length} | THREADS: {processes.length * 4}</span>
                <span>REFRESH: 1s</span>
            </div>
        </div>
    );
};

export default SystemMonitor;
