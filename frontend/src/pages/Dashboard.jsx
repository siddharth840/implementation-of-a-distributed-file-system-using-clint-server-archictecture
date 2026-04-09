import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { renderAsync } from 'docx-preview';
import { Files, Database, Users, Lock, ChevronRight, Activity as ActivityIcon, Shield, Server, X, Eye, RotateCcw, Trash2 } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import FileTable from '../components/FileTable';
import FileDetails from '../components/FileDetails';
import ShareModal from '../components/ShareModal';
import LockModal from '../components/LockModal';
import useWebSockets from '../hooks/useWebSockets';
const Dashboard = ({ selectedFile, setSelectedFile, fileApi, activeView, role }) => {
    const { files, stats, activity, uploadFile, deleteFile, toggleLock, loading, restoreFile, permanentDeleteFile, createShareLink, nodeHealth } = fileApi;
    const [previewFile, setPreviewFile] = useState(null);
    const [shareFile, setShareFile] = useState(null);
    const [lockFile, setLockFile] = useState(null);
    const isAdmin = role === 'administrator';
    
    // Connect WebSocket to track active clients
    useWebSockets();

    const formatStorage = (bytes) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return gb.toFixed(2) + ' GB';
    };

    const onDownload = (filename) => {
        window.open(`/api/download/${filename}`, '_blank');
    };

    // Filter files based on view
    const filteredFiles = files.filter(f => {
        if (activeView === 'locked') return f.locked;
        return true;
    });

    const getHeader = () => {
        switch (activeView) {
            case 'files': return { title: 'My Files', sub: 'Access all your personal stored assets.' };
            case 'shared': return { title: 'Shared Links', sub: 'Monitor and manage your secure external links.' };
            case 'uploads': return { title: 'Recent Uploads', sub: 'Review your latest file sync activity.' };
            case 'locked': return { title: 'Locked Assets', sub: 'Encrypted and secured files preventing deletion.' };
            case 'activity': return { title: 'System Activity', sub: 'Full audit log of all file operations.' };
            case 'trash': return { title: 'Recycle Bin', sub: 'Restore deleted files or erase them forever.' };
            default: return {
                title: isAdmin ? 'Distributed File System' : 'Personal Cloud Storage',
                sub: isAdmin ? 'Manage and monitor decentralized storage nodes and encrypted file assets in real-time.' : 'Securely access and manage your documents stored on the NimbusFS network.'
            };
        }
    };

    const header = getHeader();

    return (
        <div className="flex h-full gap-6">
            <div className="flex-1 min-w-0 pb-10">
                <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 text-accent mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full text-accent whitespace-nowrap">
                            {isAdmin ? 'System Pulse' : 'Personal Vault'}
                        </span>
                        <ChevronRight size={14} className="text-gray-600" />
                        <span className="text-xs font-semibold text-gray-500 shrink-0">
                            {isAdmin ? 'Global Cluster' : 'Edge Node 1'}
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">{header.title}</h1>
                    <p className="text-gray-400 text-lg max-w-2xl font-medium leading-relaxed">
                        {header.sub}
                    </p>
                </header>

                {activeView === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatsCard
                            title={isAdmin ? "Total Files" : "My Files"}
                            value={isAdmin ? stats.total_files : files.length}
                            subtitle={isAdmin ? "Uploaded across nodes" : "Secured on network"}
                            icon={Files}
                            trend={isAdmin ? 12 : 5}
                        />
                        <StatsCard
                            title="Storage Used"
                            value={formatStorage(isAdmin ? stats.storage_used : files.reduce((acc, f) => acc + f.size, 0))}
                            subtitle={isAdmin ? "Used of 1.0 TB" : "Personal quota"}
                            icon={Database}
                            trend={-2}
                        />
                        {isAdmin ? (
                            <>
                                <StatsCard
                                    title="Active Clients"
                                    value={stats.active_clients}
                                    subtitle="Connected users"
                                    icon={Users}
                                    trend={5}
                                />
                                <StatsCard
                                    title="Locked Files"
                                    value={stats.locked_files}
                                    subtitle="Encrypted & secured"
                                    icon={Lock}
                                />
                            </>
                        ) : (
                            <>
                                <StatsCard
                                    title="Distribution"
                                    value="3x Nodes"
                                    subtitle="Redundant backup"
                                    icon={Server}
                                />
                                <StatsCard
                                    title="Security"
                                    value="AES-256"
                                    subtitle="System protocol"
                                    icon={Shield}
                                />
                            </>
                        )}
                    </div>
                )}

                {activeView !== 'activity' && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Files</h3>
                        </div>
                        <FileTable
                            files={filteredFiles}
                            onSelect={setSelectedFile}
                            onDelete={deleteFile}
                            onLock={(filename, isLocked) => setLockFile({ filename, isLocked })}
                            onDownload={onDownload}
                            isTrashView={activeView === 'trash'}
                            onRestore={restoreFile}
                            onPermanentDelete={permanentDeleteFile}
                            onPreview={setPreviewFile}
                            onShare={setShareFile}
                        />
                    </>
                )}

                {(isAdmin && activeView === 'activity') && (
                    <div className="mt-12 animate-in fade-in duration-700">
                        <h3 className="text-xl font-bold mb-6 text-gray-400">Activity Log</h3>
                        <div className="bg-[#161b2a] border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800 shadow-xl">
                            {activity.length > 0 ? activity.map((log) => (
                                <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#1f2937]/50 transition-all duration-200 cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${log.action === 'UPLOAD' ? 'bg-green-500/10 text-green-400' :
                                            log.action === 'DELETE' ? 'bg-red-500/10 text-red-400' :
                                                log.action === 'LOCK' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            <ActivityIcon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                <span className="text-accent">{log.user}</span> {log.action.toLowerCase().replace('_', ' ')}ed <span className="text-gray-300">{log.filename}</span>
                                            </p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-1 font-bold">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-700" />
                                </div>
                            )) : (
                                <div className="px-6 py-10 text-center text-gray-500">No recent activity</div>
                            )}
                        </div>
                    </div>
                )}

                {(isAdmin && activeView === 'dashboard') && (
                    <div className="mt-12 animate-in fade-in duration-700 delay-200">
                        <h3 className="text-xl font-bold mb-6">Node Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(nodeHealth).map(([nodeName, status]) => (
                                <NodeStatusCard 
                                    key={nodeName}
                                    name={`Node ${nodeName.replace('node', '')}`} 
                                    status={status === 'ACTIVE' ? 'Online' : status === 'LOADING' ? 'Syncing' : 'Offline'} 
                                    color={status === 'ACTIVE' ? 'green' : status === 'LOADING' ? 'yellow' : 'red'} 
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedFile && (
                <FileDetails
                    file={selectedFile}
                    onClose={() => setSelectedFile(null)}
                />
            )}

            {previewFile && (
                <PreviewModal
                    filename={previewFile}
                    onClose={() => setPreviewFile(null)}
                />
            )}

            {shareFile && (
                <ShareModal 
                    isOpen={true}
                    onClose={() => setShareFile(null)}
                    filename={shareFile}
                    onShare={createShareLink}
                />
            )}

            {lockFile && (
                <LockModal
                    isOpen={true}
                    onClose={() => setLockFile(null)}
                    filename={lockFile.filename}
                    isLocked={lockFile.isLocked}
                    onToggleLock={toggleLock}
                />
            )}
        </div>
    );
};

const PreviewModal = ({ filename, onClose }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
    const isPDF = /\.pdf$/i.test(filename);
    const isText = /\.(txt|md|js|css|json|py|html)$/i.test(filename);
    const isDocx = /\.docx$/i.test(filename);
    const docxRef = useRef(null);

    useEffect(() => {
        let url = null;
        const fetchPreview = async () => {
            try {
                const response = await axios.get(`/api/preview/${filename}`, {
                    responseType: 'blob'
                });
                url = URL.createObjectURL(response.data);
                setPreviewUrl(url);
                
                if (isDocx && docxRef.current) {
                    await renderAsync(response.data, docxRef.current, docxRef.current, {
                        className: "docx",
                        inWrapper: false,
                        ignoreWidth: false,
                        ignoreHeight: false,
                    });
                }
            } catch (error) {
                console.error("Error fetching preview:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();

        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [filename, isDocx]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0f111a]/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#161b2a] border border-gray-800 rounded-3xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/20 rounded-lg text-accent">
                            <Eye size={18} />
                        </div>
                        <h3 className="font-bold text-lg">{filename}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 bg-[#0f111a] overflow-auto flex items-center justify-center relative">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-medium">Decrypting asset...</p>
                        </div>
                    ) : isImage ? (
                        <img
                            src={previewUrl}
                            alt={filename}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : isPDF || (isText && !isDocx) ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-none"
                            title="Preview"
                        />
                    ) : isDocx ? (
                        <div ref={docxRef} className="w-full h-full bg-white text-black p-8 overflow-auto" />
                    ) : (
                        <div className="text-center p-10">
                            <div className="p-6 bg-gray-800/50 rounded-full inline-block mb-4">
                                <ActivityIcon size={48} className="text-gray-500" />
                            </div>
                            <h4 className="text-xl font-bold mb-2">No Preview Available</h4>
                            <p className="text-gray-400">This file type cannot be previewed directly. Please download it to view.</p>
                            <a
                                href={`/api/download/${filename}`}
                                className="mt-6 inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-full font-bold transition-colors"
                            >
                                <ChevronRight size={18} className="rotate-90" />
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NodeStatusCard = ({ name, status, color }) => (
    <div className="bg-[#161b2a] border border-gray-800 p-5 rounded-2xl flex items-center justify-between hover:border-gray-700 transition-all group cursor-default">
        <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${color === 'green' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : color === 'red' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.6)]'} group-hover:scale-125 transition-transform`} />
            <div>
                <span className="font-bold block tracking-tight">{name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${color === 'red' ? 'text-red-500' : 'text-gray-500'}`}>{status === 'Online' ? 'active' : status === 'Offline' ? 'offline' : 'rebalancing'}</span>
            </div>
        </div>
        <ChevronRight size={16} className="text-gray-800" />
    </div>
);

export default Dashboard;
