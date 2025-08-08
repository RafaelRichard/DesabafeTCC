'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        toast.dismiss();

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
                if (errorData.error === 'Usuário inativo') {
                    toast.warn('Usuário inativo! Solicite ativação ao administrador.', {
                        position: 'top-center',
                        autoClose: 4000,
                        theme: 'colored',
                    });
                } else {
                    toast.error(errorData.error || 'Credenciais inválidas.', {
                        position: 'top-center',
                        autoClose: 4000,
                    });
                }
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

            // Mensagem de sucesso com Toastify
            toast.success('Login realizado com sucesso!', {
                position: 'top-center',
                autoClose: 2000,
                theme: 'colored',
            });

            window.dispatchEvent(new Event('authChanged'));

            // Redireciona de acordo com o papel após um pequeno delay para mostrar o toast
            setTimeout(() => {
                switch (userInfo.role) {
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
            }, 1200);

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setMessage('Erro ao conectar com o servidor.');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-green-100 px-4">
                <form
                    onSubmit={handleLogin}
                    className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-indigo-100 flex flex-col gap-4"
                >
                    <h2 className="text-3xl font-extrabold mb-2 text-center text-indigo-700 drop-shadow-sm tracking-tight">Login</h2>
                    <p className="text-center text-gray-500 mb-4">Acesse sua conta para continuar</p>

                    {message && (
                        <p className="mb-2 text-sm text-red-600 text-center font-semibold">{message}</p>
                    )}

                    <div className="mb-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-indigo-50/60 placeholder-gray-400 text-gray-800"
                            placeholder="Digite seu e-mail"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-indigo-50/60 placeholder-gray-400 text-gray-800"
                            placeholder="Digite sua senha"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-bold shadow hover:bg-indigo-700 transition duration-300 text-lg tracking-wide"
                    >
                        Entrar
                    </button>

                    <p className="mt-4 text-center text-sm">
                        Não tem uma conta?{' '}
                        <Link href="/cadastro_usuario" className="text-indigo-600 hover:underline font-semibold">
                            Cadastre-se
                        </Link>
                    </p>

                    <p className="mt-2 text-center text-sm">
                        <Link href="/recuperar-senha" className="text-indigo-600 hover:underline font-semibold">
                            Esqueceu a senha?
                        </Link>
                    </p>
                </form>
            </div>
        </>
    );
}
