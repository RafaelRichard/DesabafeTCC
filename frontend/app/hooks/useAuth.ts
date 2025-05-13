'use client';

import { useEffect, useState } from 'react';

interface User {
    email: string;
    role: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('http://localhost:8000/usuario_jwt/', {
                    credentials: 'include', // para cookies HttpOnly
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Erro ao buscar usuário:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return {
        user,
        isLoggedIn: !!user,
        role: user?.role ?? null,
        loading,
    };
};
