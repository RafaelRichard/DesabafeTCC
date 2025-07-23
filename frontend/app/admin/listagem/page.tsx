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
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 px-6 py-12">
            <h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-12 tracking-tight">
                Painel de Usuários
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
                {roles.map((role) => (
                    <button
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={`px-6 py-2.5 rounded-full font-semibold border backdrop-blur-md shadow-md transition
                        ${activeRole === role
                                ? 'bg-indigo-700 text-white border-indigo-700'
                                : 'bg-white/60 text-indigo-700 border-indigo-300 hover:bg-indigo-100'
                            }`}
                    >
                        {role} ({groupedUsers[role].length})
                    </button>
                ))}
            </div>

            {/* Lista por Aba */}
            {activeRole && (
                <div>
                    <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-8 capitalize">
                        {activeRole}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                        {groupedUsers[activeRole].map((user) => (
                            <div
                                key={user.id}
                                className="bg-white/60 border border-indigo-100 rounded-3xl shadow-xl p-6 backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-2xl"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><span className="font-medium text-indigo-600">Email:</span> {user.email}</p>
                                        <p><span className="font-medium text-indigo-600">CPF:</span> {user.cpf}</p>
                                        <p><span className="font-medium text-indigo-600">Telefone:</span> {user.telefone}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-indigo-100 pt-4 mt-4">
                                    <button
                                        onClick={() => handleEdit(user.id)}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        🗑️ Excluir
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
