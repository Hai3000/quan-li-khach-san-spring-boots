import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            api.post(`/auth/online/${parsed.id}`).catch(() => { });
        }
        setLoading(false);

        const handleUnload = () => {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (currentUser && currentUser.id) {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
                navigator.sendBeacon(`${baseUrl}/auth/logout/${currentUser.id}`);
            }
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);

    const login = async (username, password) => {
        try {
            const data = await api.post('/auth/login', { username, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        if (user?.id) {
            try {
                await api.post(`/auth/logout/${user.id}`);
            } catch (e) { }
        }
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
