import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Lock, FileText, AlertCircle, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const PublicDownload = ({ token }) => {
    const [fileInfo, setFileInfo] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsPassword, setNeedsPassword] = useState(false);

    const fetchInfo = async (pass = null) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/api/shared/${token}`, {
                params: pass ? { password: pass } : {}
            });
            setFileInfo(res.data);
            setNeedsPassword(false);
        } catch (err) {
            if (err.response?.status === 401) {
                setNeedsPassword(true);
            } else {
                setError(err.response?.data?.detail || "Link invalid or expired");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInfo();
    }, [token]);

    const handleDownload = () => {
        const url = `/api/download/shared/${token}${password ? `?password=${password}` : ''}`;
        window.open(url, '_blank');
    };

    const formatSize = (bytes) => {
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading && !fileInfo) {
        return (
            <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f111a] text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f111a] to-[#0f111a]">
            {/* Branding */}
            <div className="mb-12 flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                    <ShieldCheck size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter">NIMBUS<span className="text-blue-500">FS</span></h1>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#161b2a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-8 text-center">
                    {error ? (
                        <div className="py-6">
                            <div className="bg-red-500/10 p-4 rounded-full inline-block mb-4 text-red-500">
                                <AlertCircle size={48} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Link Unavailable</h2>
                            <p className="text-white/50">{error}</p>
                            <button 
                                onClick={() => window.location.href = '/'}
                                className="mt-8 text-blue-400 hover:underline text-sm font-medium"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    ) : needsPassword ? (
                        <div className="space-y-6">
                            <div className="bg-blue-500/10 p-4 rounded-full inline-block mb-2 text-blue-500">
                                <Lock size={48} />
                            </div>
                            <h2 className="text-2xl font-bold">Secure Access</h2>
                            <p className="text-white/50 text-sm">This file is password protected. Enter the password provided by the sender.</p>
                            
                            <input 
                                type="password" 
                                placeholder="Enter password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-lg"
                                onKeyDown={(e) => e.key === 'Enter' && fetchInfo(password)}
                            />
                            
                            <button 
                                onClick={() => fetchInfo(password)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                            >
                                Unlock File
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-white/5 p-6 rounded-3xl inline-block mb-6 text-blue-400">
                                <FileText size={64} />
                            </div>
                            <h2 className="text-2xl font-bold mb-1 truncate px-4">{fileInfo.filename}</h2>
                            <div className="flex items-center justify-center gap-4 text-sm text-white/50 mb-8">
                                <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(fileInfo.upload_date).toLocaleDateString()}</span>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span>{formatSize(fileInfo.size)}</span>
                            </div>

                            <button 
                                onClick={handleDownload}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 active:scale-95"
                            >
                                <Download size={20} />
                                Download Now
                            </button>
                            
                            <p className="mt-6 text-xs text-white/30">
                                This link is protected by NimbusFS secure delivery.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default PublicDownload;
