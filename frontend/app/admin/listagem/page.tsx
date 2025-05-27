'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    cpf: string;
    telefone: string;
}

export default function Listagem() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRole, setActiveRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/users/');
                const data = await response.json();
                setUsers(data);

                const initialRole = data.length > 0 ? data[0].role : null;
                setActiveRole(initialRole);
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

        try {
            const response = await fetch(`http://localhost:8000/api/users/${id}/delete/`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setUsers((prev) => prev.filter((user) => user.id !== id));
            } else {
                alert('Erro ao excluir usuário.');
            }
        } catch (error) {
            alert('Erro ao excluir usuário.');
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

    const roles = Object.keys(groupedUsers);

    if (loading) {
        return (
            <p className="text-center text-lg text-indigo-600 mt-20">Carregando usuários...</p>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100 px-6 py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-indigo-700 mb-10">
                Usuários do Sistema
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
                {roles.map((role) => (
                    <button
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={`px-5 py-2 rounded-full font-medium border transition-all
                ${activeRole === role
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-100'
                            }`}
                    >
                        {role} ({groupedUsers[role].length})
                    </button>
                ))}
            </div>

            {/* Listagem por Aba Ativa */}
            {activeRole && (
                <div>
                    <h2 className="text-2xl font-bold text-indigo-800 mb-6 capitalize text-center">
                        {activeRole}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {groupedUsers[activeRole].map((user) => (
                            <div
                                key={user.id}
                                className="bg-gray-200 border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all"
                            >
                                <div className="p-6 space-y-3">
                                    <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>
                                            <strong>Email:</strong> {user.email}
                                        </p>
                                        <p>
                                            <strong>CPF:</strong> {user.cpf}
                                        </p>
                                        <p>
                                            <strong>Telefone:</strong> {user.telefone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t px-6 py-4 bg-gray-300 rounded-b-2xl">
                                    <button
                                        onClick={() => handleEdit(user.id)}
                                        className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        Editar
                                    </button>

                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
