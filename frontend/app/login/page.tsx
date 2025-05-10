'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    // Pega o token CSRF do cookie
    const getCsrfToken = (): string | null => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='))?.split('=')[1] || null;
    };

    // Faz uma requisição para garantir que o cookie do CSRF seja enviado
    const fetchCsrfToken = async () => {
        try {
            await fetch('http://localhost:8000/get-csrf-token/', {
                credentials: 'include',
            });
        } catch (error) {
            console.error('Erro ao buscar CSRF token:', error);
        }
    };

    useEffect(() => {
        fetchCsrfToken();
    }, []);

    // Decodifica o token JWT
    const decodeJwt = (token: string): { role: string, email: string } => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Erro ao decodificar JWT:', error);
            return { role: '', email: '' };
        }
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');

        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            setMessage('Token CSRF não encontrado.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/login_usuario/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                setMessage(errorData.error || 'Credenciais inválidas.');
                return;
            }

            const data = await response.json();

            if (data.token) {
                const decoded = decodeJwt(data.token);
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_email', decoded.email);
                localStorage.setItem('user_role', decoded.role);
                setMessage('Login bem-sucedido!');

                switch (decoded.role) {
                    case 'Admin':
                        router.push('/area-admin');
                        break;
                    case 'Psicologo':
                        router.push('/area-do-psicologo');
                        break;
                    case 'Psiquiatra':
                        router.push('/area-do-psiquiatra');
                        break;
                    case 'Paciente':
                        router.push('/area-do-usuario');
                        break;
                    default:
                        setMessage('Tipo de usuário não reconhecido.');
                        break;
                }
                
            } else {
                setMessage('Token JWT não retornado.');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setMessage('Erro ao conectar com o servidor.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-2 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">Senha</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-2 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white p-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                    >
                        Entrar
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-500">
                    Não tem uma conta?{' '}
                    <Link href="/cadastro_usuario" className="text-indigo-600 hover:underline">
                        Cadastre-se aqui
                    </Link>
                </p>
                {message && (
                    <p className="mt-4 text-center text-sm text-red-500">{message}</p>
                )}
            </div>
        </div>
    );
}
