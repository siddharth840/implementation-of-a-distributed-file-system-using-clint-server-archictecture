import React from 'react';
import { FileText, MoreVertical, Download, Trash2, Lock, Unlock } from 'lucide-react';

const FileTable = ({ files, onSelect, onDelete, onLock, onDownload }) => {
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-[#161b2a] border border-gray-800 rounded-2xl overflow-hidden mt-8">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">File Name</th>
                        <th className="px-6 py-4 font-semibold">Size</th>
                        <th className="px-6 py-4 font-semibold">Uploaded By</th>
                        <th className="px-6 py-4 font-semibold">Last Modified</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {files.map((file) => (
                        <tr
                            key={file.id}
                            className="hover:bg-[#1f2937]/50 transition-colors cursor-pointer group"
                            onClick={() => onSelect(file)}
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-800 rounded-lg text-accent">
                                        <FileText size={18} />
                                    </div>
                                    <span className="font-medium text-sm">{file.filename}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">{formatSize(file.size)}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">{file.owner}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">{formatDate(file.upload_date)}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${file.locked ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${file.locked ? 'bg-red-400' : 'bg-green-400'}`} />
                                    {file.locked ? 'Locked' : 'Unlocked'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDownload(file.filename); }}
                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onLock(file.filename, file.locked); }}
                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        {file.locked ? <Unlock size={16} /> : <Lock size={16} />}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(file.filename); }}
                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {files.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                                No files found. Start by uploading one!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default FileTable;
