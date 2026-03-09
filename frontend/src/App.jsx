import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import useFiles from './hooks/useFiles';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [user, setUser] = useState({
        name: 'Admin',
        role: 'administrator',
        avatar: null
    });

    const fileApi = useFiles(user.name);

    // Auto-refresh when user changes
    useEffect(() => {
        fileApi.refreshData();
    }, [user.name]);

    const toggleUser = () => {
        if (user.name === 'Admin') {
            setUser({ name: 'Guest User', role: 'standard_user', avatar: null });
        } else {
            setUser({ name: 'Admin', role: 'administrator', avatar: null });
        }
    };

    return (
        <div className="flex h-screen bg-[#0f111a] text-white overflow-hidden font-sans">
            <Sidebar activeView={activeView} onViewChange={setActiveView} role={user.role} />

            <div className="flex-1 flex flex-col min-w-0">
                <Navbar
                    onUpload={fileApi.uploadFile}
                    isUploading={fileApi.loading}
                    user={user}
                    onToggleUser={toggleUser}
                />

                <main className="flex-1 overflow-y-auto p-6 transition-all duration-300">
                    <Dashboard
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                        fileApi={fileApi}
                        activeView={activeView}
                        role={user.role}
                    />
                </main>
            </div>
        </div>
    );
}

export default App;
