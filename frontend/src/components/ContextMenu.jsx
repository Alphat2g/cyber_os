import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContextMenu = ({ x, y, items, onClose }) => {
    return (
        <>
            {/* Invisible overlay to catch clicks outside */}
            <div
                className="fixed inset-0 z-[200]"
                onClick={onClose}
                onContextMenu={(e) => { e.preventDefault(); onClose(); }}
            />

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.12 }}
                    className="fixed z-[201] bg-black/95 border border-cyber-green/40 min-w-48 shadow-[0_0_30px_rgba(0,255,65,0.15)] font-mono text-xs backdrop-blur-sm"
                    style={{ left: x, top: y }}
                >
                    {items.map((item, i) => {
                        if (item.separator) {
                            return <div key={i} className="h-[1px] bg-cyber-green/10 my-1" />;
                        }
                        return (
                            <button
                                key={i}
                                onClick={() => { item.action(); onClose(); }}
                                className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-cyber-green/10 transition-colors group"
                                disabled={item.disabled}
                            >
                                <span className="text-sm w-5 text-center opacity-60 group-hover:opacity-100">{item.icon}</span>
                                <span className={`flex-1 ${item.danger ? 'text-red-400' : 'text-cyber-green/80'} group-hover:text-cyber-green`}>
                                    {item.label}
                                </span>
                                {item.shortcut && (
                                    <span className="text-[9px] text-cyber-green/30 ml-4">{item.shortcut}</span>
                                )}
                            </button>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default ContextMenu;
