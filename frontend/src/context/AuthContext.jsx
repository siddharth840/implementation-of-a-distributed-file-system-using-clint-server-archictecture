import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await axios.post('/api/login', formData);
            const { access_token, user: userData } = response.data;
            
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set axios header synchronously to prevent race conditions in subsequent requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            
            setToken(access_token);
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.response?.data?.detail || 'Login failed' };
        }
    };

    const register = async (username, password, role = 'standard_user') => {
        try {
            await axios.post('/api/register', { username, password, role });
            return await login(username, password);
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error: error.response?.data?.detail || 'Registration failed' };
        }
    };

    const updateName = async (newName) => {
        try {
            const response = await axios.put('/api/user/name', { name: newName });
            if (response.data.access_token) {
                const { access_token, user: userData } = response.data;
                localStorage.setItem('token', access_token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Set axios header synchronously to prevent race conditions
                axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                
                setToken(access_token);
                setUser(userData);
            }
            return { success: true };
        } catch (error) {
            console.error('Update name failed:', error);
            return { success: false, error: error.response?.data?.detail || 'Update failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Remove axios header synchronously
        delete axios.defaults.headers.common['Authorization'];
        
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, updateName, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
