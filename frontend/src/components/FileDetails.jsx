import React from 'react';
import { X, FileText, User, Calendar, Clock, Database, Shield, Share2 } from 'lucide-react';

const FileDetails = ({ file, onClose }) => {
    if (!file) return null;

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-96 bg-[#161b2a] border-l border-gray-800 h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-bold">File Details</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mb-4 shadow-2xl shadow-accent/20">
                        <FileText size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-center break-all">{file.filename}</h3>
                    <p className="text-gray-500 text-sm mt-1">{formatSize(file.size)}</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold">Information</h4>
                        <div className="space-y-3">
                            <InfoItem icon={User} label="Owner" value={file.owner} />
                            <InfoItem icon={Calendar} label="Created" value={formatDate(file.upload_date)} />
                            <InfoItem icon={Clock} label="Last Modified" value={formatDate(file.upload_date)} />
                            <InfoItem icon={Database} label="Storage" value={file.size > 1024 * 1024 ? "Optimized" : "Standard"} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold">Distributed Nodes</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {['Node 1', 'Node 2', 'Node 3'].map((node, i) => (
                                <div key={i} className="bg-[#0f111a] p-2 rounded-lg border border-gray-800 flex flex-col items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    <span className="text-[10px] text-gray-400 font-medium">{node}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-800 space-y-3">
                <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 transition-colors py-3 rounded-xl font-semibold text-sm">
                    <Shield size={18} />
                    Manage Permissions
                </button>
                <button className="w-full flex items-center justify-center gap-2 border border-gray-700 hover:bg-gray-800 transition-colors py-3 rounded-xl font-semibold text-sm">
                    <Share2 size={18} />
                    Share File
                </button>
            </div>
        </div>
    );
};

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="p-1.5 bg-gray-800 rounded-lg text-gray-400">
            <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{label}</p>
            <p className="text-sm font-medium truncate">{value}</p>
        </div>
    </div>
);

export default FileDetails;
