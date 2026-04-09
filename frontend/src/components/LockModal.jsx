import React, { useState } from 'react';
import { X, Lock, Unlock, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LockModal = ({ isOpen, onClose, filename, isLocked, onToggleLock }) => {
    const [duration, setDuration] = useState('permanent');
    const [loading, setLoading] = useState(false);

    const handleAction = async () => {
        setLoading(true);
        try {
            if (isLocked) {
                await onToggleLock(filename, true);
            } else {
                const hours = duration === 'permanent' ? null : parseInt(duration);
                await onToggleLock(filename, false, hours);
            }
            onClose();
        } catch (error) {
            console.error("Lock action failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1c2e] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isLocked ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {isLocked ? <Unlock size={20} /> : <Lock size={20} />}
                            </div>
                            <h2 className="text-xl font-bold text-white">{isLocked ? "Unlock File" : "Lock File"}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-white/60 text-sm leading-relaxed">
                            {isLocked 
                                ? `Unlocking "${filename}" will allow it to be deleted or modified again.`
                                : `Locking "${filename}" prevents deletion and ensures data stability.`
                            }
                        </p>
                    </div>

                    {!isLocked && (
                        <div className="space-y-4 mb-8">
                            <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Lock Settings</label>
                            
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { id: 'permanent', label: 'Permanent Lock', icon: Shield, desc: 'Locked until manually released' },
                                    { id: '1', label: '1 Hour', icon: Clock, desc: 'Auto-unlocks after 60 mins' },
                                    { id: '4', label: '4 Hours', icon: Clock, desc: 'Useful for short-term sync' },
                                    { id: '24', label: '24 Hours', icon: Clock, desc: 'Full day security' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setDuration(opt.id)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${
                                            duration === opt.id 
                                            ? 'bg-blue-600/10 border-blue-500 text-white' 
                                            : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10 hover:text-white'
                                        }`}
                                    >
                                        <opt.icon size={18} className={duration === opt.id ? 'text-blue-400' : 'text-white/30'} />
                                        <div>
                                            <div className="font-bold text-sm">{opt.label}</div>
                                            <div className="text-[10px] opacity-50">{opt.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleAction}
                        disabled={loading}
                        className={`w-full font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg ${
                            isLocked 
                            ? 'bg-green-600 hover:bg-green-500 shadow-green-600/20' 
                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                        }`}
                    >
                        {loading ? "Processing..." : (isLocked ? "Release Lock" : "Secure File")}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LockModal;
