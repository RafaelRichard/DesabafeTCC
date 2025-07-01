'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiClipboard, FiSettings } from 'react-icons/fi';

// Função para pegar o cookie pelo nome
const getCookie = (name: string): string | null => {
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

export default function AreaPsiquiatra() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const [userName, setUserName] = useState('');
    const [foto, setFoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verificarAutenticacao = async () => {
            try {
                const response = await fetch('http://localhost:8000/usuario_jwt/', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    console.log('Usuário não autenticado, redirecionando para login');
                    router.push('/login');
                    return;
                }

                const data = await response.json();
                if (data.role === 'Psiquiatra') {
                    setIsLoggedIn(true);
                    setRole(data.role);
                    setUserName(data.email);
                    setFoto(data.foto || null);
                } else {
                    console.log('Usuário não é Psiquiatra, redirecionando');
                    router.push('/login');
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        verificarAutenticacao();
    }, [router]);

    const handleLogout = () => {
        document.cookie = "jwt=; Max-Age=0; path=/";
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
            <div className="flex flex-col w-full lg:w-72 bg-indigo-800 text-white h-full p-6 lg:h-auto shadow-lg items-center">
                {foto ? (
                    <img
                        src={`http://localhost:8000${foto}`}
                        alt="Foto de perfil"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white mb-4 shadow"
                    />
                ) : (
                    <img
                        src="/img/logo.png"
                        alt="Foto padrão"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white mb-4 shadow"
                    />
                )}
                <h2 className="text-2xl font-semibold mb-8 text-center lg:text-left">Área do Psiquiatra</h2>
                <nav className="flex flex-col space-y-4">
                    <Link href="/meu_perfil_psiquiatra" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiUser size={20} />
                        <span>Meu Perfil</span>
                    </Link>
                    <Link href="/consultas_psiquiatras" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
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
                                <Link href="/meu_perfil_psiquiatra">
                                    <button className="mt-4 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-300 w-full">
                                        Ver Perfil
                                    </button>
                                </Link>
                            </div>
                            <div className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Minhas Consultas</h3>
                                <p className="text-gray-500">Visualize e gerencie suas consultas.</p>
                                <Link href="/consultas_psiquiatras">
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
