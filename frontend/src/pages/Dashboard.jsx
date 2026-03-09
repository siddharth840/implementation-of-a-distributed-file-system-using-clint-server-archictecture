import React from 'react';
import { Files, Database, Users, Lock, ChevronRight, Activity as ActivityIcon, Shield, Server } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import FileTable from '../components/FileTable';
import FileDetails from '../components/FileDetails';

const Dashboard = ({ selectedFile, setSelectedFile, fileApi, activeView, role }) => {
    const { files, stats, activity, uploadFile, deleteFile, toggleLock, loading } = fileApi;
    const isAdmin = role === 'administrator';

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
            case 'shared': return { title: 'Shared with Me', sub: 'Files shared by other decentralized nodes.' };
            case 'uploads': return { title: 'Recent Uploads', sub: 'Review your latest file sync activity.' };
            case 'locked': return { title: 'Locked Assets', sub: 'Encrypted and secured files preventing deletion.' };
            case 'activity': return { title: 'System Activity', sub: 'Full audit log of all file operations.' };
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
                            onLock={toggleLock}
                            onDownload={onDownload}
                        />
                    </>
                )}

                {(isAdmin && (activeView === 'dashboard' || activeView === 'activity' || activeView === 'uploads')) && (
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
                                                <span className="text-accent">{log.user}</span> {log.action.toLowerCase()}ed <span className="text-gray-300">{log.filename}</span>
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
                            <NodeStatusCard name="Node 1" status="Online" color="green" />
                            <NodeStatusCard name="Node 2" status="Online" color="green" />
                            <NodeStatusCard name="Node 3" status="Syncing" color="yellow" />
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
        </div>
    );
};

const NodeStatusCard = ({ name, status, color }) => (
    <div className="bg-[#161b2a] border border-gray-800 p-5 rounded-2xl flex items-center justify-between hover:border-gray-700 transition-all group cursor-default">
        <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${color === 'green' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.6)]'} group-hover:scale-125 transition-transform`} />
            <div>
                <span className="font-bold block tracking-tight">{name}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{status === 'Online' ? 'active' : 'rebalancing'}</span>
            </div>
        </div>
        <ChevronRight size={16} className="text-gray-800" />
    </div>
);

export default Dashboard;
