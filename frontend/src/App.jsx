import React from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import useFiles from './hooks/useFiles';
import PublicDownload from './components/PublicDownload';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

function AppContent() {
    const { user, loading } = useAuth();
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [activeView, setActiveView] = React.useState('dashboard');
    const [searchQuery, setSearchQuery] = React.useState('');

    // Simple routing for shared links
    const path = window.location.pathname;
    const isSharedPath = path.startsWith('/shared/');
    const shareToken = isSharedPath ? path.split('/')[2] : null;

    const fileApi = useFiles(user?.name || 'Guest');

    // Sync views and data
    React.useEffect(() => {
        if (!loading && user && !isSharedPath) {
            fileApi.refreshData(searchQuery, activeView === 'trash');
        }
    }, [user, activeView, searchQuery, isSharedPath, loading]);

    if (loading) return null;

    if (isSharedPath && shareToken) {
        return <PublicDownload token={shareToken} />;
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <div className="flex h-screen bg-[#0f111a] text-white overflow-hidden font-sans">
            <Sidebar activeView={activeView} onViewChange={setActiveView} role={user.role} />

            <div className="flex-1 flex flex-col min-w-0">
                <Navbar
                    onUpload={fileApi.uploadFile}
                    isUploading={fileApi.loading}
                    uploadProgress={fileApi.uploadProgress}
                    user={user}
                    onToggleUser={() => {}} // User switching is now through login
                    onSearch={setSearchQuery}
                    onViewChange={setActiveView}
                    activity={fileApi.activity}
                />

                <main className="flex-1 overflow-y-auto p-6 transition-all duration-300">
                    {activeView === 'settings' ? (
                        <Settings 
                            user={user} 
                            onToggleUser={() => {}} 
                            stats={fileApi.stats} 
                            nodeHealth={fileApi.nodeHealth}
                            updateSetting={fileApi.updateSetting}
                            settings={fileApi.settings}
                        />
                    ) : (
                        <Dashboard
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            fileApi={fileApi}
                            activeView={activeView}
                            role={user.role}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
