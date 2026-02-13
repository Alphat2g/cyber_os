import React, { useState, useEffect } from 'react';

const MissionLog = ({ onClose, isFocused }) => {
    // Initial Load
    const [missions, setMissions] = useState(() => {
        const saved = localStorage.getItem('cyber_missions');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: "INITIALIZE", desc: "Boot up the system.", completed: true },
            { id: 2, title: "EXPLORE", desc: "Open 'My Documents' and read 'welcome.txt'.", completed: false },
        ];
    });

    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        localStorage.setItem('cyber_missions', JSON.stringify(missions));
    }, [missions]);

    const toggleMission = (id) => {
        setMissions(prev => prev.map(m =>
            m.id === id ? { ...m, completed: !m.completed } : m
        ));
    };

    const addMission = () => {
        if (!newTitle.trim()) return;
        const newMission = {
            id: Date.now(),
            title: newTitle.toUpperCase(),
            desc: newDesc || "NO DATA",
            completed: false
        };
        setMissions([...missions, newMission]);
        setNewTitle('');
        setNewDesc('');
        setIsEditing(false);
    };

    const deleteMission = (id) => {
        setMissions(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className={`w-full h-full bg-cyber-black border-2 flex flex-col font-mono select-none ${isFocused ? 'border-amber-500' : 'border-amber-900/50'}`}>
            {/* Window Header */}
            <div className={`flex justify-between items-center p-1 px-2 border-b ${isFocused ? 'bg-amber-500 text-black' : 'bg-black text-amber-600 border-amber-900/50'}`}>
                <span className="font-bold text-sm">MISSION_LOG.EXE</span>
                <button onClick={onClose} className="hover:bg-black hover:text-amber-500 px-1">[X]</button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-black/80 relative">
                <div className="flex justify-between items-center mb-4 border-b border-amber-500/30 pb-2">
                    <h2 className="text-amber-500 text-lg">ACTIVE OPERATIONS</h2>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-xs border border-amber-500/50 px-2 py-1 text-amber-500 hover:bg-amber-500 hover:text-black"
                    >
                        {isEditing ? 'CANCEL' : '+ NEW OPERATION'}
                    </button>
                </div>

                {isEditing && (
                    <div className="bg-amber-900/20 p-2 mb-4 border border-amber-500/50">
                        <input
                            className="bg-black/50 border border-amber-500/30 w-full mb-2 p-1 text-amber-500 placeholder-amber-500/30 outline-none"
                            placeholder="OPERATION TITLE"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <input
                            className="bg-black/50 border border-amber-500/30 w-full mb-2 p-1 text-amber-500 placeholder-amber-500/30 outline-none"
                            placeholder="DETAILS..."
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                        />
                        <button
                            onClick={addMission}
                            className="w-full bg-amber-600 text-black font-bold py-1 hover:bg-amber-500"
                        >
                            UPLOAD
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {missions.length === 0 && <div className="text-amber-900 text-center mt-10">NO ACTIVE MISSIONS</div>}
                    {missions.map(mission => (
                        <div key={mission.id} className={`group relative flex items-start gap-3 p-2 border ${mission.completed ? 'border-green-500/30 bg-green-900/10' : 'border-amber-500/30 hover:bg-amber-900/10'} transition-colors`}>
                            <div
                                className={`w-5 h-5 border flex items-center justify-center cursor-pointer flex-shrink-0 ${mission.completed ? 'border-green-500 bg-green-500 text-black' : 'border-amber-500'}`}
                                onClick={() => toggleMission(mission.id)}
                            >
                                {mission.completed && '✓'}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold ${mission.completed ? 'text-green-500 line-through' : 'text-amber-500'}`}>{mission.title}</h3>
                                <p className={`text-sm ${mission.completed ? 'text-green-700' : 'text-amber-200/70'}`}>{mission.desc}</p>
                            </div>
                            <button
                                onClick={() => deleteMission(mission.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-500 text-xs hover:underline absolute top-2 right-2"
                            >
                                [DELETE]
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-amber-900/50 text-xs text-amber-700">
                PROGRESS: {missions.length > 0 ? Math.round((missions.filter(m => m.completed).length / missions.length) * 100) : 0}%
            </div>
        </div>
    );
};

export default MissionLog;
