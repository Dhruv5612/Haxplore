import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            console.log('Auth check starting...');
            console.log('Stored Token:', !!token);
            if (storedUser) {
                console.log('Stored User Role:', JSON.parse(storedUser).role);
            }

            if (token) {
                try {
                    // Verify token and get fresh user data
                    const res = await api.get('/auth/me');
                    console.log('Server verified user:', res.data.email, res.data.role);
                    setUser(res.data);
                    // Update stored user data
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (error) {
                    console.error('Auth verification failed:', error);
                    // If server check fails but we have stored user, keep it temporarily (offline mode)
                    if (storedUser) {
                        console.warn('Falling back to stored user');
                        setUser(JSON.parse(storedUser));
                    } else {
                        console.warn('No stored user, clearing auth');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, ...userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const res = await api.post('/auth/register', data);
        const { token, ...userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
