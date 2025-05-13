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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/users/');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Tem certeza que deseja excluir este usuário?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:8000/api/users/${id}/delete/`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setUsers(prev => prev.filter(user => user.id !== id));
            } else {
                alert("Erro ao excluir usuário.");
            }
        } catch (error) {
            alert("Erro ao excluir usuário.");
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/admin/listagem/editar/${id}`);
    };

    const groupedUsers = users.reduce<Record<string, User[]>>((acc, user) => {
        if (!acc[user.role]) acc[user.role] = [];
        acc[user.role].push(user);
        return acc;
    }, {});

    if (loading) {
        return <p className="text-center text-lg text-indigo-600 mt-20">Carregando usuários...</p>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100 py-16 px-6">
            <h1 className="text-5xl font-bold text-center text-indigo-700 mb-12">Usuários do Sistema</h1>

            {Object.entries(groupedUsers).map(([role, roleUsers]) => (
                <div key={role} className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-2xl font-semibold text-indigo-700 capitalize">{role}</span>
                        <span className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">{roleUsers.length} usuário(s)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                        {roleUsers.map(user => (
                            <div
                                key={user.id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                            >
                                <div className="p-6 space-y-4">
                                    <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>CPF:</strong> {user.cpf}</p>
                                        <p><strong>Telefone:</strong> {user.phone}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t p-4 bg-gray-50 rounded-b-2xl">
                                    <button
                                        onClick={() => handleEdit(user.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
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
    );
}
