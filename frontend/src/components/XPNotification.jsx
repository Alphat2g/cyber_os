import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const XPNotification = ({ event }) => {
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        if (event) {
            setQueue(prev => [...prev, event]);
            const timer = setTimeout(() => {
                setQueue(prev => prev.filter(item => item.id !== event.id));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [event]);

    return (
        <div className="fixed top-20 right-4 flex flex-col gap-2 z-[100] pointer-events-none">
            <AnimatePresence>
                {queue.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 80, scale: 0.5 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 40, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="bg-black/95 border border-amber-500 text-amber-500 px-4 py-2 font-mono shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-3 rounded-sm xp-notification"
                    >
                        <div className="text-xl font-bold xp-bounce">+{item.xp || 50}</div>
                        <div className="text-[10px] uppercase tracking-wider border-l border-amber-500/50 pl-2 leading-tight">
                            <div className="text-amber-300 font-bold">XP GAINED</div>
                            <div className="text-amber-500/70">{item.message || "SYSTEM ACTION"}</div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default XPNotification;
