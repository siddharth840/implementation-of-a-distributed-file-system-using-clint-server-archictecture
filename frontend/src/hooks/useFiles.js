import React, { useState, useEffect } from 'react';
import axios from 'axios';

const useFiles = (currentUser = 'Admin') => {
    const [files, setFiles] = useState([]);
    const [stats, setStats] = useState({
        total_files: 0,
        storage_used: 0,
        active_clients: 0,
        locked_files: 0
    });
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(false);

    const refreshData = async () => {
        setLoading(true);
        try {
            const params = currentUser === 'Admin' ? {} : { owner: currentUser };
            const [filesRes, statsRes, activityRes] = await Promise.all([
                axios.get('/api/files', { params }),
                axios.get('/api/stats'),
                axios.get('/api/activity')
            ]);
            setFiles(filesRes.data);
            setStats(statsRes.data);
            setActivity(activityRes.data);
        } catch (error) {
            console.error("Error fetching files:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            await axios.post(`/api/upload?owner=${currentUser}`, formData);
            refreshData();
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    const deleteFile = async (filename) => {
        try {
            await axios.delete(`/api/file/${filename}`);
            refreshData();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const toggleLock = async (filename, isLocked) => {
        const endpoint = isLocked ? `/api/unlock/${filename}` : `/api/lock/${filename}`;
        try {
            await axios.post(endpoint);
            refreshData();
        } catch (error) {
            console.error("Lock toggle failed:", error);
        }
    };

    return { files, stats, activity, loading, refreshData, uploadFile, deleteFile, toggleLock };
};

export default useFiles;
