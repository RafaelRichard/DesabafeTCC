'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    cpf: string;
    phone: string;
}

export default function Listagem() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Função para buscar usuários da API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/users/');
                const data = await response.json();
                setUsers(data);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar usuários', error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Função para deletar um usuário
    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Tem certeza que deseja excluir este usuário?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:8000/api/users/${id}/delete/`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setUsers((prevUsers) => prevUsers.filter(user => user.id !== id));
            } else {
                console.error('Erro ao excluir usuário');
                alert("Erro ao excluir o usuário. Tente novamente.");
            }
        } catch (error) {
            console.error('Erro ao excluir usuário', error);
            alert("Erro ao excluir o usuário. Tente novamente.");
        }
    };

    // Função para editar o usuário
    const handleEdit = (id: number) => {
        router.push(`/admin/listagem/editar/${id}`);
    };

    // Se a página estiver carregando, exibe a mensagem
    if (loading) {
        return <p className="text-center mt-10 text-lg text-indigo-600">Carregando...</p>;
    }

    // Agrupar os usuários por role
    const groupedUsers = users.reduce<Record<string, User[]>>((acc, user) => {
        if (!acc[user.role]) {
            acc[user.role] = [];
        }
        acc[user.role].push(user);
        return acc;
    }, {});

    return (
        <div className="pt-16 bg-gray-50 min-h-screen p-6">
            <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-8">Listagem de Usuários</h1>

            <div className="space-y-12">
                {Object.keys(groupedUsers).map((role) => (
                    <div key={role}>
                        <h2 className="text-3xl font-semibold text-indigo-600 mb-6 capitalize">{role}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {groupedUsers[role].map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{user.name}</h3>
                                    <p className="text-gray-500 text-sm mb-1">{user.email}</p>
                                    <p className="text-gray-500 text-sm mb-1">{user.cpf}</p>
                                    <p className="text-gray-500 text-sm mb-4">{user.phone}</p>

                                    <div className="flex justify-between gap-4">
                                        <button
                                            onClick={() => handleEdit(user.id)}
                                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-300"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
