import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

const TextEditor = ({ fileName, content: initialContent, onClose, isFocused }) => {
    const [text, setText] = useState(initialContent || "");
    const [status, setStatus] = useState(initialContent ? "LOADED" : "LOADING...");
    const [isDirty, setIsDirty] = useState(false);

    // If fileName provides a path, we might need to load it if content is empty
    useEffect(() => {
        if (!initialContent && fileName && fileName !== 'untitled') {
            loadContent();
        } else if (initialContent) {
            setText(initialContent);
            setStatus("READY");
        }
    }, [fileName]); // Only re-run if filename changes

    const loadContent = async () => {
        setStatus("FETCHING...");
        try {
            // Determine path - simplistic logic for now
            // If it came from file explorer, fileName might be a path?
            // For MVP let's assume all edited files are relative to root or we use the passed content
            const res = await axios.post(`${API_URL}/files/read`, { path: fileName });
            if (res.data.content !== undefined) {
                setText(res.data.content);
                setStatus("READY");
            } else {
                setStatus("ERROR: READ FAILED");
            }
        } catch (err) {
            setStatus("ERROR: CONNECTION FAILED");
        }
    };

    const handleSave = async () => {
        setStatus("SAVING...");
        try {
            const res = await axios.post(`${API_URL}/files/write`, {
                path: fileName,
                content: text
            });
            if (res.data.status === 'success') {
                setStatus("SAVED");
                setIsDirty(false);
                setTimeout(() => setStatus("READY"), 2000);
            } else {
                setStatus("ERROR: SAVE FAILED");
            }
        } catch (err) {
            setStatus("ERROR: NET FAILURE");
        }
    };

    return (
        <div className={`w-full h-full bg-cyber-gray border ${isFocused ? 'border-cyber-green' : 'border-cyber-gray'} flex flex-col font-mono text-sm`}>
            {/* Header */}
            <div className={`flex justify-between items-center p-1 border-b ${isFocused ? 'bg-cyber-green text-black' : 'bg-cyber-gray text-cyber-green border-cyber-green'}`}>
                <span>NANO_VISUAL: {fileName} {isDirty ? '*' : ''}</span>
                <div className="flex gap-1">
                    <button onClick={handleSave} className="hover:bg-black/20 px-2 font-bold">[SAVE]</button>
                    <button onClick={onClose} className="hover:bg-black/20 px-2">[X]</button>
                </div>
            </div>
            {/* Content */}
            <textarea
                className="flex-1 bg-cyber-black text-cyber-green p-2 outline-none resize-none font-mono"
                value={text}
                onChange={(e) => { setText(e.target.value); setIsDirty(true); }}
                spellCheck={false}
            />
            <div className="p-1 text-xs text-cyber-green/50 bg-cyber-black border-t border-cyber-green/20 flex justify-between">
                <span>LINES: {text.split('\n').length} | MODE: INSERT</span>
                <span className={status.includes("ERROR") ? "text-red-500" : "text-cyber-green/70"}>{status}</span>
            </div>
        </div>
    );
};

export default TextEditor;
