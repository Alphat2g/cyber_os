import React, { useState } from 'react';
import FileIcon from '../FileIcon';
import axios from 'axios';

const FileExplorer = ({ path = '/', onClose, onFileOpen, isFocused }) => {
    const [currentPath, setCurrentPath] = useState(path);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pathHistory, setPathHistory] = useState([path]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Fetch files from backend
    const loadFiles = async (dir) => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';
            const res = await axios.post(`${API_URL}/files/list`, { path: dir });
            if (res.data.files) {
                setFiles(res.data.files);
            }
        } catch (err) {
            // Fallback to mock data if backend fails
            setFiles([
                { name: 'details.txt', type: 'file', size: '2.4 KB' },
                { name: 'scan_results.img', type: 'image', size: '156 KB' },
                { name: 'backup.hex', type: 'file', size: '1.1 MB' },
                { name: 'network_log.enc', type: 'file', size: '89 KB' },
                { name: 'secret_key.dat', type: 'file', size: '256 B' },
                { name: 'archives', type: 'folder', size: '--' },
            ]);
        }
        setLoading(false);
    };

    React.useEffect(() => { loadFiles(currentPath); }, [currentPath]);

    const navigateTo = (dir) => {
        const newPath = currentPath === '/' ? `/${dir}` : `${currentPath}/${dir}`;
        setCurrentPath(newPath);
        const newHistory = [...pathHistory.slice(0, historyIndex + 1), newPath];
        setPathHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const goBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setCurrentPath(pathHistory[historyIndex - 1]);
        }
    };

    const goForward = () => {
        if (historyIndex < pathHistory.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setCurrentPath(pathHistory[historyIndex + 1]);
        }
    };

    const goUp = () => {
        if (currentPath === '/') return;
        const parent = currentPath.split('/').slice(0, -1).join('/') || '/';
        setCurrentPath(parent);
        const newHistory = [...pathHistory.slice(0, historyIndex + 1), parent];
        setPathHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleDoubleClick = (file) => {
        if (file.type === 'folder' || file.type === 'directory') {
            navigateTo(file.name);
        } else {
            onFileOpen(file.name);
        }
    };

    const pathParts = currentPath.split('/').filter(Boolean);

    return (
        <div className={`w-full h-full bg-black border-2 flex flex-col font-mono select-none ${isFocused ? 'border-cyber-green' : 'border-cyber-green/30'}`}>
            {/* Header */}
            <div className={`flex justify-between items-center p-1 px-2 border-b ${isFocused ? 'bg-cyber-green text-black' : 'bg-gray-900 text-cyber-green/50 border-cyber-green/30'}`}>
                <span className="font-bold text-sm">FILE_EXPLORER</span>
                <button onClick={onClose} className="hover:bg-black hover:text-cyber-green px-1">[X]</button>
            </div>

            {/* Toolbar */}
            <div className="flex gap-1 p-1.5 border-b border-cyber-green/20 text-xs items-center">
                <button
                    onClick={goBack}
                    disabled={historyIndex <= 0}
                    className={`px-2 py-0.5 border border-cyber-green/20 ${historyIndex > 0 ? 'text-cyber-green hover:bg-cyber-green/10' : 'text-cyber-green/20 cursor-not-allowed'}`}
                >◀</button>
                <button
                    onClick={goForward}
                    disabled={historyIndex >= pathHistory.length - 1}
                    className={`px-2 py-0.5 border border-cyber-green/20 ${historyIndex < pathHistory.length - 1 ? 'text-cyber-green hover:bg-cyber-green/10' : 'text-cyber-green/20 cursor-not-allowed'}`}
                >▶</button>
                <button
                    onClick={goUp}
                    disabled={currentPath === '/'}
                    className={`px-2 py-0.5 border border-cyber-green/20 ${currentPath !== '/' ? 'text-cyber-green hover:bg-cyber-green/10' : 'text-cyber-green/20 cursor-not-allowed'}`}
                >▲</button>

                <div className="flex-1 ml-2">
                    {/* Breadcrumb */}
                    <div className="flex items-center text-cyber-green/50">
                        <button
                            onClick={() => { setCurrentPath('/'); }}
                            className="hover:text-cyber-green"
                        >/</button>
                        {pathParts.map((part, i) => (
                            <span key={i} className="flex items-center">
                                <button
                                    onClick={() => setCurrentPath('/' + pathParts.slice(0, i + 1).join('/'))}
                                    className="hover:text-cyber-green"
                                >{part}</button>
                                {i < pathParts.length - 1 && <span className="mx-1 text-cyber-green/20">/</span>}
                            </span>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => loadFiles(currentPath)}
                    className="px-2 py-0.5 border border-cyber-green/20 text-cyber-green hover:bg-cyber-green/10"
                >⟳</button>
            </div>

            {/* File Grid */}
            <div className="flex-1 p-3 grid grid-cols-4 content-start gap-3 overflow-y-auto scrollbar-hide bg-black/50">
                {loading ? (
                    <div className="col-span-4 text-center text-cyber-green/30 py-8 animate-pulse">
                        Loading directory...
                    </div>
                ) : files.length === 0 ? (
                    <div className="col-span-4 text-center text-cyber-green/30 py-8">
                        Directory empty
                    </div>
                ) : (
                    files.map((file, idx) => (
                        <FileIcon
                            key={idx}
                            name={file.name}
                            type={file.type === 'folder' || file.type === 'directory' ? 'folder' : file.name.endsWith('.img') ? 'image' : 'file'}
                            onDoubleClick={() => handleDoubleClick(file)}
                        />
                    ))
                )}
            </div>

            {/* Status */}
            <div className="p-1 px-2 border-t border-cyber-green/20 text-[10px] text-cyber-green/40 flex justify-between">
                <span>{files.length} OBJECTS | PATH: {currentPath}</span>
                <span>ENCRYPTED VOLUME</span>
            </div>
        </div>
    );
};

export default FileExplorer;
