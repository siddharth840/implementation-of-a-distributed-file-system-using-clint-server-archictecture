import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Upload, User, ChevronRight, Activity as ActivityIcon } from 'lucide-react';

const Navbar = ({ onUpload, isUploading, uploadProgress, user, onToggleUser, onSearch, onViewChange, activity = [] }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <header className="h-20 bg-[#161b2a] border-b border-gray-800 flex items-center justify-between px-8 z-30 transition-colors">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search files, folders, or activity..."
                        className="w-full bg-[#0f111a] border border-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-accent transition-all text-sm"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <label className={`relative overflow-hidden flex items-center gap-2 bg-accent hover:bg-accent-hover transition-colors text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg shadow-accent/20 cursor-pointer ${isUploading ? 'opacity-90 pointer-events-none' : ''}`}>
                    {isUploading && (
                        <div 
                            className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 pointer-events-none" 
                            style={{ width: `${uploadProgress}%` }}
                        />
                    )}
                    <Upload size={18} className="relative z-10" />
                    <span className="relative z-10">{isUploading ? `Uploading... ${uploadProgress}%` : 'Upload File'}</span>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                </label>

                <div className="flex items-center gap-4 text-gray-400 relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`hover:text-white transition-colors relative ${showNotifications ? 'text-white' : ''}`}
                    >
                        <Bell size={20} />
                        {activity.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full border-2 border-[#161b2a]" />
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-4 w-80 bg-[#161b2a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#1f2937]/30">
                                <h4 className="font-bold text-sm tracking-tight">Recent Notifications</h4>
                                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold uppercase">{activity.length} New</span>
                            </div>
                            <div className="max-h-96 overflow-y-auto py-2 divide-y divide-gray-800/30">
                                {activity.slice(0, 10).map((log) => (
                                    <div key={log.id} className="p-4 hover:bg-[#1f2937]/50 transition-colors cursor-pointer group">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 p-1.5 rounded-lg ${
                                                log.action === 'UPLOAD' ? 'bg-green-500/10 text-green-400' :
                                                log.action === 'DELETE' ? 'bg-red-500/10 text-red-400' :
                                                'bg-accent/10 text-accent'
                                            }`}>
                                                <ActivityIcon size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-300 leading-normal">
                                                    <span className="font-bold text-white">{log.user}</span> {log.action.toLowerCase().replace('_', ' ')}ed <span className="font-medium text-accent italic">{log.filename}</span>
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-1.5 font-bold uppercase tracking-tighter">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {activity.length === 0 && (
                                    <div className="py-10 text-center text-gray-500 text-sm italic">
                                        No recent activity
                                    </div>
                                )}
                            </div>
                            <div 
                                onClick={() => { setShowNotifications(false); onViewChange('activity'); }}
                                className="p-3 text-center border-t border-gray-800 bg-[#1f2937]/10 hover:bg-[#1f2937]/30 transition-colors cursor-pointer"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">View All Logs</span>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => onViewChange('settings')}
                        className="hover:text-white transition-colors"
                    >
                        <Settings size={20} />
                    </button>
                </div>

                <div
                    onClick={onToggleUser}
                    className="flex items-center gap-3 pl-6 border-l border-gray-800 cursor-pointer group"
                >
                    <div className="text-right flex flex-col justify-center">
                        <p className="text-sm font-bold text-white group-hover:text-accent transition-colors leading-none">{user.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{user.role.replace('_', ' ')}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center p-[2px] shadow-lg shadow-accent/10">
                        <div className="w-full h-full rounded-full bg-[#161b2a] flex items-center justify-center overflow-hidden">
                            <User className="text-gray-400 group-hover:scale-110 transition-transform" size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
