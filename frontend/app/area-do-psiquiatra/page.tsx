'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiPhone, FiClipboard, FiSettings } from 'react-icons/fi'; // Ícones

export default function AreaPsiquiatra() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const authToken = localStorage.getItem('auth_token');
        
        // Se não houver token de autenticação, redireciona para o login
        if (!authToken) {
            router.push('/login');
            return;
        }
    
        const userRole = localStorage.getItem('user_role');
        const userEmail = localStorage.getItem('user_email');
    
        // Verifica se o usuário é psiquiatra, caso contrário redireciona para o login
        if (userRole && userEmail && userRole === 'Psiquiatra') {
            setIsLoggedIn(true);
            setRole(userRole);
            setUserName(userEmail);
        } else {
            router.push('/login');
        }

        // Simula a carga de dados do psiquiatra (já vindo do localStorage)
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
        setIsLoggedIn(false);
        setRole('');
        setUserName('');
        router.push('/login');
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    return (
        <div className="pt-16 bg-gray-50 min-h-screen flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="flex flex-col w-full lg:w-72 bg-indigo-800 text-white h-full p-6 lg:h-auto shadow-lg">
                <h2 className="text-2xl font-semibold mb-8 text-center lg:text-left">Área do Psiquiatra</h2>
                <nav className="flex flex-col space-y-4">
                    <Link href="/psiquiatra/perfil" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiUser size={20} />
                        <span>Meu Perfil</span>
                    </Link>
                    <Link href="/psiquiatra/consultas" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiClipboard size={20} />
                        <span>Minhas Consultas</span>
                    </Link>
                    <Link href="/psiquiatra/configuracoes" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiSettings size={20} />
                        <span>Configurações</span>
                    </Link>
                </nav>
                <div className="mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 p-3 rounded-lg hover:bg-red-700 transition duration-300 mt-6"
                    >
                        Sair
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-100 p-6 lg:p-12">
                <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-6">Área do Psiquiatra</h1>
                {isLoggedIn && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-semibold text-indigo-600 mb-2">Seja Bem-vindo, Psiquiatra {userName}!</h2>
                            <p className="text-lg text-gray-500">Gerencie seus dados e consultas.</p>
                        </div>

                        {/* Grid de Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Meu Perfil</h3>
                                <p className="text-gray-500">Veja e edite suas informações pessoais.</p>
                                <Link href="/psiquiatra/perfil">
                                    <button className="mt-4 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-300 w-full">
                                        Ver Perfil
                                    </button>
                                </Link>
                            </div>
                            <div className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Minhas Consultas</h3>
                                <p className="text-gray-500">Visualize e gerencie suas consultas.</p>
                                <Link href="/psiquiatra/consultas">
                                    <button className="mt-4 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-300 w-full">
                                        Ver Consultas
                                    </button>
                                </Link>
                            </div>
                            <div className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Configurações</h3>
                                <p className="text-gray-500">Ajuste suas configurações de conta.</p>
                                <Link href="/psiquiatra/configuracoes">
                                    <button className="mt-4 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-300 w-full">
                                        Acessar Configurações
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
