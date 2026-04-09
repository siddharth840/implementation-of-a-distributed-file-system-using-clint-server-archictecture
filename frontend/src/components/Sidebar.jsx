import { LayoutDashboard, Folder, Share2, UploadCloud, Lock, History, Settings, Cloud, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, active = false, onClick, variant = 'default' }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-lg mb-1 ${
            active ? 'bg-accent text-white shadow-lg shadow-accent/20' : 
            variant === 'danger' ? 'text-red-400 hover:bg-red-500/10' :
            'text-gray-400 hover:bg-[#1f2937] hover:text-white'
        }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </div>
);

const Sidebar = ({ activeView, onViewChange, role }) => {
    const { logout } = useAuth();
    const isAdmin = role === 'administrator';

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'files', label: 'My Files', icon: Folder },
        { id: 'shared', label: 'Shared', icon: Share2 },
        { id: 'uploads', label: 'Uploads', icon: UploadCloud },
        { id: 'locked', label: 'Locked', icon: Lock },
        ...(isAdmin ? [{ id: 'activity', label: 'Activity', icon: History }] : []),
        { id: 'trash', label: 'Trash', icon: Trash2 },
    ];

    return (
        <div className="w-64 h-full bg-[#161b2a] border-r border-gray-800 flex flex-col p-4 z-20">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="p-2 bg-accent rounded-xl shadow-lg shadow-accent/20">
                    <Cloud className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight">NimbusFS</span>
            </div>

            <nav className="flex-1">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={activeView === item.id}
                        onClick={() => onViewChange(item.id)}
                    />
                ))}
            </nav>

            <div className="pt-4 border-t border-gray-800 space-y-1">
                <SidebarItem
                    icon={Settings}
                    label="Settings"
                    active={activeView === 'settings'}
                    onClick={() => onViewChange('settings')}
                />
                <SidebarItem
                    icon={LogOut}
                    label="Sign Out"
                    variant="danger"
                    onClick={logout}
                />
            </div>
        </div>
    );
};

export default Sidebar;
