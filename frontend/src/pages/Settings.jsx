import React, { useState } from 'react';
import { User, Shield, HardDrive, Bell, Lock, Globe, Save, ChevronRight, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = ({ user, onToggleUser, stats, nodeHealth, updateSetting, settings }) => {
    const { updateName } = useAuth();
    const [name, setName] = useState(user.name);
    const [twoFactorAuth, setTwoFactorAuth] = useState(settings.two_factor_auth === 'true');
    const [autoLock, setAutoLock] = useState(settings.auto_lock === 'true');
    const [isSaving, setIsSaving] = useState(false);

    const handleNameUpdate = async () => {
        setIsSaving(true);
        const result = await updateName(name);
        setIsSaving(false);
        if (result.success) {
            alert("Name updated successfully!");
        } else {
            alert(result.error);
        }
    };

    const handleToggleTwoFactorAuth = (val) => {
        setTwoFactorAuth(val);
        updateSetting('two_factor_auth', val.toString());
    };

    const handleToggleAutoLock = (val) => {
        setAutoLock(val);
        updateSetting('auto_lock', val.toString());
    };

    const SettingSection = ({ icon: Icon, title, children }) => (
        <div className="bg-[#161b2a] border border-gray-800 rounded-3xl p-8 mb-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                </div>
            </div>
            {children}
        </div>
    );

    const SettingRow = ({ label, description, children }) => (
        <div className="flex items-center justify-between py-6 first:pt-0 last:pb-0 border-b border-gray-800/50 last:border-0">
            <div className="pr-10">
                <p className="font-bold text-gray-200 mb-1">{label}</p>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{description}</p>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );

    const Toggle = ({ enabled, setEnabled }) => (
        <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${enabled ? 'bg-accent shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'bg-gray-800'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    );

    const Progress = ({ value, label }) => (
        <div className="w-full">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                <span>{label}</span>
                <span>{value.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-1000" 
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );

    const storageUsedGB = stats.storage_used / (1024 * 1024 * 1024);
    const storagePercent = (storageUsedGB / 1024) * 100; // Assuming 1TB total

    const isAdmin = user.role === 'administrator';

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 text-accent mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full text-accent uppercase">
                        {isAdmin ? 'System Pulse' : 'Personal Vault'}
                    </span>
                    <ChevronRight size={14} className="text-gray-600" />
                    <span className="text-xs font-semibold text-gray-500">Global Config</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Account Settings</h1>
                <p className="text-gray-400 text-lg font-medium">{isAdmin ? 'Configure system-wide distributed storage protocols and manage node clusters.' : 'Manage your personal cloud profile and storage preferences.'}</p>
            </header>

            <SettingSection icon={User} title="Personal Profile">
                <div className="flex items-center gap-8 mb-10 pb-10 border-b border-gray-800">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center p-[3px] shadow-2xl shadow-accent/20">
                            <div className="w-full h-full rounded-[21px] bg-[#161b2a] flex items-center justify-center overflow-hidden">
                                <User className="text-gray-600 group-hover:text-accent transition-colors" size={48} />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Display Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#0f111a] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors font-medium text-white" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Network Role</label>
                                <div className="px-4 py-3 bg-[#0f111a]/50 border border-gray-800/50 rounded-xl text-xs text-gray-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield size={12} className={isAdmin ? 'text-accent' : 'text-gray-600'} />
                                    {user.role.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button 
                        onClick={handleNameUpdate}
                        disabled={isSaving}
                        className={`px-8 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-accent/20 transition-all active:scale-[0.98] ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {isSaving ? 'Saving...' : 'Save Personal Changes'}
                    </button>
                </div>
            </SettingSection>

            <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : ''} gap-6 mb-6`}>
                <SettingSection icon={HardDrive} title="Storage Allocation">
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-3xl font-extrabold tracking-tighter text-white">{storageUsedGB.toFixed(2)} GB</h4>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Managed Allocation</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isAdmin ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-gray-800 text-gray-400'}`}>
                                    {isAdmin ? 'Root Cluster' : 'Standard Node'}
                                </span>
                            </div>
                        </div>
                        <Progress value={storagePercent} label="Disk Utilization" />
                    </div>
                    {isAdmin && (
                        <button className="w-full py-3 rounded-2xl border border-dashed border-accent/20 text-accent/60 hover:text-white hover:border-accent hover:bg-accent/5 transition-all text-[10px] font-black uppercase tracking-widest">
                            Provision New Storage Node
                        </button>
                    )}
                </SettingSection>

                {isAdmin && (
                    <SettingSection icon={Cpu} title="Node Distribution">
                        <div className="space-y-4">
                            {Object.entries(nodeHealth).map(([node, status], idx) => (
                                <div key={node} className="flex items-center justify-between p-3.5 bg-[#0f111a] rounded-2xl border border-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                                        <span className="text-xs font-bold text-gray-300">Node {node.replace('node', '')}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-mono font-bold uppercase tracking-tighter">127.0.0.1:800{idx + 1}</span>
                                </div>
                            ))}
                        </div>
                    </SettingSection>
                )}
            </div>

            <SettingSection icon={Shield} title="Security & Compliance">
                <div className="divide-y divide-gray-800/30">
                    <SettingRow 
                        label="Decentralized 2FA" 
                        description="Enforce multi-node confirmation for administrative file deletions and system updates."
                    >
                        <Toggle enabled={twoFactorAuth} setEnabled={isAdmin ? handleToggleTwoFactorAuth : () => {}} />
                    </SettingRow>
                    <SettingRow 
                        label="Auto-Lock Protocol" 
                        description="Automatically encrypt files 24 hours after entry if significant activity is not detected."
                    >
                        <Toggle enabled={autoLock} setEnabled={isAdmin ? handleToggleAutoLock : () => {}} />
                    </SettingRow>
                    <SettingRow 
                        label="Geo-Redundancy" 
                        description="Distribute file chunks across distinct physical availability zones for maximum durability."
                    >
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent italic">
                            <span>High Availability</span>
                            <Globe size={14} />
                        </div>
                    </SettingRow>
                </div>
                {!isAdmin && (
                    <div className="mt-8 p-4 bg-gray-800/20 rounded-2xl border border-gray-800/50 flex items-center gap-4">
                        <Lock className="text-gray-600" size={20} />
                        <p className="text-[11px] text-gray-500 font-medium italic">Some security parameters are locked by the network administrator.</p>
                    </div>
                )}
            </SettingSection>
        </div>
    );
};

export default Settings;
