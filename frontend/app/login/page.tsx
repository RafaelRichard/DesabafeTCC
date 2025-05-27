'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    // Pega o token CSRF de cookies
    const getCookie = (name: string): string | null => {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
    };

    useEffect(() => {
        // Solicita CSRF ao backend
        const fetchCsrfToken = async () => {
            try {
                await fetch('http://localhost:8000/get-csrf-token/', {
                    credentials: 'include',
                });
            } catch (error) {
                console.error('Erro ao buscar CSRF token:', error);
            }
        };
        fetchCsrfToken();
    }, []);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');

        const csrfToken = getCookie('csrftoken');
        if (!csrfToken) {
            setMessage('Token CSRF não encontrado.');
            return;
        }

        try {
            // Envia login
            const response = await fetch('http://localhost:8000/login_usuario/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setMessage(errorData.error || 'Credenciais inválidas.');
                return;
            }

            // Obtém dados do usuário
            const userInfoRes = await fetch('http://localhost:8000/usuario_jwt/', {
                method: 'GET',
                credentials: 'include',
            });

            if (!userInfoRes.ok) {
                setMessage('Erro ao obter dados do usuário.');
                return;
            }

            const userInfo = await userInfoRes.json();
            console.log('Usuário autenticado:', userInfo);

            // Armazenando o JWT no cookie com o nome correto 'jwt'
            // document.cookie = `jwt=${userInfo.token}; path=/; max-age=3600; secure; HttpOnly`;

            window.dispatchEvent(new Event('authChanged')); 

            // Redireciona de acordo com o papel
            switch (userInfo.role) {
                case 'Admin':
                    console.log('Redirecionando para a área: Admin');
                    router.push('/area-admin');
                    break;
                case 'Psicologo':
                    console.log('Redirecionando para a área: Psicologo');
                    router.push('/area-do-psicologo');
                    break;
                case 'Psiquiatra':
                    console.log('Redirecionando para a área: Psiquiatra');
                    router.push('/area-do-psiquiatra');
                    break;
                case 'Paciente':
                    console.log('Redirecionando para a área: Paciente');
                    router.push('/area-do-usuario');
                    break;
                default:
                    console.log('Tipo de usuário não reconhecido:', userInfo.role);
                    setMessage('Tipo de usuário não reconhecido.');
                    break;
            }

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setMessage('Erro ao conectar com o servidor.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-6 rounded shadow-md w-full max-w-sm"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

                {message && (
                    <p className="mb-4 text-sm text-red-600 text-center">{message}</p>
                )}

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Senha
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
                >
                    Entrar
                </button>

                <p className="mt-4 text-center text-sm">
                    Não tem uma conta?{' '}
                    <Link href="/cadastro_usuario" className="text-indigo-600 hover:underline">
                        Cadastre-se
                    </Link>
                </p>

                <p className="mt-2 text-center text-sm">
                    <Link href="/recuperar-senha" className="text-indigo-600 hover:underline">
                        Esqueceu a senha?
                    </Link>
                </p>

            </form>
        </div>
    );
}
