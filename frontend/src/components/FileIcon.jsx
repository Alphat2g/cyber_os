import React from 'react';
import { motion } from 'framer-motion';

const FileIcon = ({ name, type = 'file', onDragStart, onDragEnd, onDoubleClick }) => {
    const isExe = type === 'exe';

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDoubleClick={onDoubleClick}
            whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
            className="flex flex-col items-center gap-2 cursor-grab w-24 p-2 group"
        >
            <div className={`w-12 h-12 border-2 flex items-center justify-center transition-colors ${isExe
                    ? 'border-red-500 bg-red-900/20 group-hover:bg-red-500/20'
                    : 'border-cyber-green bg-cyber-black group-hover:bg-cyber-green/20'
                }`}>
                {/* Simple geometric icon */}
                <div className={`w-8 h-8 border relative ${isExe ? 'border-red-500/50' : 'border-cyber-green/50'
                    }`}>
                    <div className={`absolute top-0 right-0 w-3 h-3 ${isExe ? 'bg-red-500/50' : 'bg-cyber-green/50'
                        }`}></div>
                    {isExe && (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-500 font-bold">EXE</div>
                    )}
                </div>
            </div>
            <span className={`text-xs font-mono text-center select-none bg-cyber-black px-1 ${isExe ? 'text-red-500' : 'text-cyber-green'
                }`}>
                {name}
            </span>
        </motion.div>
    );
};

export default FileIcon;
