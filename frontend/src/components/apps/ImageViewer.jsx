import React from 'react';

const ImageViewer = ({ fileName, src, onClose, isFocused }) => {
    return (
        <div className={`w-full h-full bg-cyber-black border ${isFocused ? 'border-amber-400' : 'border-cyber-gray'} flex flex-col font-mono text-sm`}>
            {/* Header */}
            <div className={`flex justify-between items-center p-1 border-b ${isFocused ? 'bg-amber-400 text-black' : 'bg-cyber-gray text-amber-400 border-amber-400'}`}>
                <span>HOLO_VIEW: {fileName}</span>
                <button onClick={onClose} className="hover:text-white px-2">[X]</button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]">
                <div className="absolute inset-0 bg-cyber-green/5 mix-blend-overlay pointer-events-none"></div>
                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

                <img src={src} alt={fileName} className="max-w-full max-h-full border-2 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)] filter contrast-125 sepia-100 hue-rotate-15" />
            </div>
        </div>
    );
};

export default ImageViewer;
