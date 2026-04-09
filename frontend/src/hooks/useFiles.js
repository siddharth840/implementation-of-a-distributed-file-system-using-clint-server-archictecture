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
    const [settings, setSettings] = useState({});
    const [nodeHealth, setNodeHealth] = useState({ node1: 'LOADING', node2: 'LOADING', node3: 'LOADING' });
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const refreshData = async (searchQuery = '', showDeleted = false) => {
        if (currentUser === 'Guest') return;
        setLoading(true);
        try {
            const params = {
                ...(currentUser === 'Admin' ? {} : { owner: currentUser }),
                search: searchQuery,
                deleted: showDeleted
            };
            const [filesRes, statsRes, activityRes, settingsRes, healthRes] = await Promise.all([
                axios.get('/api/files', { params }),
                axios.get('/api/stats'),
                axios.get('/api/activity'),
                axios.get('/api/settings'),
                axios.get('/api/nodes/health').catch(() => ({ data: {} }))
            ]);
            setFiles(filesRes.data);
            setStats(statsRes.data);
            setActivity(activityRes.data);
            setSettings(settingsRes.data);
            if (healthRes.data) setNodeHealth(healthRes.data);
        } catch (error) {
            console.error("Error fetching files:", error);
        } finally {
            setLoading(false);
        }
    };

    // Removed automatic refresh on mount to prevent unauthorized calls before login
    // refreshData() is now controlled by the parent component (App.jsx)

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            setLoading(true);
            setUploadProgress(0);
            await axios.post(`/api/upload?owner=${currentUser}`, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            refreshData();
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setLoading(false);
            setUploadProgress(0);
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

    const toggleLock = async (filename, currentLockState, durationHours = null) => {
        try {
            if (currentLockState) {
                await axios.post(`/api/unlock/${filename}`);
            } else {
                const params = durationHours ? `?duration_hours=${durationHours}` : '';
                await axios.post(`/api/lock/${filename}${params}`);
            }
            refreshData();
        } catch (error) {
            console.error("Lock toggle failed:", error);
        }
    };

    const restoreFile = async (filename) => {
        try {
            await axios.post(`/api/restore/${filename}`);
            refreshData('', true); // Stay in trash view
        } catch (error) {
            console.error("Restore failed:", error);
        }
    };

    const permanentDeleteFile = async (filename) => {
        try {
            await axios.delete(`/api/file/${filename}?permanent=true`);
            refreshData('', true); // Stay in trash view
        } catch (error) {
            console.error("Permanent delete failed:", error);
        }
    };

    const createShareLink = async (filename, expiryHours = 24, password = '') => {
        try {
            const res = await axios.post(`/api/share/${filename}`, {
                expiry_hours: expiryHours,
                password: password || null
            });
            return res.data;
        } catch (error) {
            console.error("Share link creation failed:", error);
            throw error;
        }
    };

    const updateSetting = async (key, value) => {
        try {
            await axios.post('/api/settings', { key, value });
            refreshData();
        } catch (error) {
            console.error("Update setting failed:", error);
        }
    };

    return { files, stats, activity, settings, nodeHealth, loading, uploadProgress, refreshData, uploadFile, deleteFile, toggleLock, restoreFile, permanentDeleteFile, createShareLink, updateSetting };
};

export default useFiles;
