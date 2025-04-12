'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUsers, FiClipboard, FiSettings, FiList } from 'react-icons/fi'; // Ícone para listagem

export default function AreaDoAdmin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);  
    const router = useRouter();  

    useEffect(() => {
        const authToken = localStorage.getItem('auth_token');

        if (!authToken) {
            router.push('/login');
            return;
        }

        const userRole = localStorage.getItem('user_role');
        const userEmail = localStorage.getItem('user_email');

        if (userRole && userEmail && userRole === 'Admin') {
            setIsLoggedIn(true);
            setRole(userRole);
            setUserName(userEmail);
        } else {
            router.push('/login');
        }

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
                <h2 className="text-2xl font-semibold mb-8 text-center lg:text-left">Admin Dashboard</h2>
                <nav className="flex flex-col space-y-4">
                    <Link href="/admin/usuarios" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiUsers size={20} />
                        <span>Gerenciar Usuários</span>
                    </Link>
                    <Link href="/admin/consultas" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiClipboard size={20} />
                        <span>Gerenciar Consultas</span>
                    </Link>
                    <Link href="/admin/configuracoes" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiSettings size={20} />
                        <span>Configurações</span>
                    </Link>
                    {/* Botão para a listagem de cadastros */}
                    <Link href="/admin/listagem" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiList size={20} />
                        <span>Listar Cadastros</span>
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
                <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-6">Área de Administração</h1>
                {isLoggedIn && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-semibold text-indigo-600 mb-2">Seja Bem-vindo, {role} {userName}!</h2>
                            <p className="text-lg text-gray-500">Gerencie os usuários e consultas da plataforma.</p>
                        </div>

                        {/* Grid de Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Usuários Cadastrados</h3>
                                <p className="text-gray-500">Visualize e gerencie os usuários registrados no sistema.</p>
                                <Link href="/admin/listagem">
                                    <button className="mt-4 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-300 w-full">
                                        Ver Usuários
                                    </button>
                                </Link>
                            </div>
                            <div className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Consultas Pendentes</h3>
                                <p className="text-gray-500">Gerencie as consultas pendentes ou confirmadas.</p>
                                <Link href="/admin/consultas">
                                    <button className="mt-4 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-300 w-full">
                                        Ver Consultas
                                    </button>
                                </Link>
                            </div>
                            <div className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Configurações do Sistema</h3>
                                <p className="text-gray-500">Ajuste configurações gerais da plataforma.</p>
                                <Link href="/admin/configuracoes">
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
