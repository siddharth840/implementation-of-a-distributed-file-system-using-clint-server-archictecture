import React from 'react';
import { Search, Bell, Settings, Upload, User, LogOut } from 'lucide-react';

const Navbar = ({ onUpload, isUploading, user, onToggleUser }) => {
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <header className="h-20 bg-[#161b2a] border-b border-gray-800 flex items-center justify-between px-8 z-10 transition-colors">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search files, folders, or activity..."
                        className="w-full bg-[#0f111a] border border-gray-700 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-accent transition-all text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <label className={`flex items-center gap-2 bg-accent hover:bg-accent-hover transition-colors text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg shadow-accent/20 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload size={18} />
                    <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                </label>

                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-white transition-colors">
                        <Bell size={20} />
                    </button>
                    <button className="hover:text-white transition-colors">
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
                            <User className="text-gray-400" size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
