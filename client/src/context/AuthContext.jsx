import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Check token expiration
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        localStorage.removeItem('token');
                        setUser(null);
                    } else {
                        // Set default headers
                        axios.defaults.headers.common['x-auth-token'] = token;
                        // Fetch user data (optional, or just use decoded data for basic info)
                        // For now, let's just assume valid if token is valid and set user from decoded
                        // Ideally we stick to server validation, but for quick load:
                        setUser(decoded.user);

                        // Verify with server (better approach)
                        try {
                            const res = await axios.get('http://localhost:5000/api/auth/user');
                            setUser(res.data);
                        } catch (err) {
                            console.error("Token verification failed", err);
                            localStorage.removeItem('token');
                            setUser(null);
                        }
                    }
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;

        const decoded = jwtDecode(res.data.token);
        // Fetch full user details if needed or just use ID
        // setUser(decoded.user);

        // Let's fetch the full user object to have the name
        const userRes = await axios.get('http://localhost:5000/api/auth/user');
        setUser(userRes.data);
        return true;
    };

    const register = async (name, email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;

        const userRes = await axios.get('http://localhost:5000/api/auth/user');
        setUser(userRes.data);
        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
