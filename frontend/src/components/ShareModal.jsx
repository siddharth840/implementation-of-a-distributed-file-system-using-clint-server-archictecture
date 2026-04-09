import React, { useState } from 'react';
import { X, Copy, Check, Clock, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShareModal = ({ isOpen, onClose, filename, onShare }) => {
    const [expiry, setExpiry] = useState(24);
    const [password, setPassword] = useState('');
    const [sharedLink, setSharedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleShare = async () => {
        setLoading(true);
        try {
            const data = await onShare(filename, expiry, password);
            const fullLink = `${window.location.origin}/shared/${data.token}`;
            setSharedLink(fullLink);
        } catch (error) {
            console.error("Failed to share:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sharedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1c2e] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Share "{filename}"</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {!sharedLink ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                                    <Clock size={16} /> Link Expiry (Hours)
                                </label>
                                <input 
                                    type="number" 
                                    value={expiry} 
                                    onChange={(e) => setExpiry(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                                    <Lock size={16} /> Password Protection (Optional)
                                </label>
                                <input 
                                    type="password" 
                                    placeholder="Enter password..."
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>

                            <button 
                                onClick={handleShare}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300"
                            >
                                {loading ? "Generating..." : "Generate Secure Link"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm mb-4">
                                Secure link successfully generated!
                            </div>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={sharedLink}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white font-mono text-sm focus:outline-none"
                                />
                                <button 
                                    onClick={copyToClipboard}
                                    className="absolute right-2 top-1.5 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-colors"
                                >
                                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-white/40 text-center italic">
                                This link will expire in {expiry} hours.
                            </p>
                            <button 
                                onClick={onClose}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ShareModal;
