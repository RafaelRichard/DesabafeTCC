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
    status?: string;
}

function BarChartSVG({ data }: { data: { role: string; count: number; color: string }[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    const barHeight = 32;
    const chartHeight = data.length * (barHeight + 16) + 20;
    return (
        <svg width={340} height={chartHeight} viewBox={`0 0 340 ${chartHeight}`} className="mx-auto">
            {data.map((slice, i) => {
                const barWidth = (slice.count / max) * 220;
                return (
                    <g key={slice.role}>
                        <rect x={100} y={20 + i * (barHeight + 16)} width={barWidth} height={barHeight} rx={10} fill={slice.color} />
                        <text x={20} y={40 + i * (barHeight + 16)} fontSize={16} fontWeight={700} fill="#333">{slice.role}</text>
                        <text x={110 + barWidth} y={40 + i * (barHeight + 16)} fontSize={16} fontWeight={700} fill="#333">{slice.count}</text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function Listagem() {
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeRole, setActiveRole] = useState<string | null>(null);
    const router = useRouter();

    // 🔒 Validação de Admin
    useEffect(() => {
        const verificarAutenticacao = async () => {
            try {
                const response = await fetch('http://localhost:8000/usuario_jwt/', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    router.push('/login');
                    return;
                }

                const data = await response.json();
                if (data.role !== 'Admin') {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                router.push('/login');
            } finally {
                setAuthLoading(false);
            }
        };

        verificarAutenticacao();
    }, [router]);

    // 🔄 Buscar usuários
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
                setLoadingUsers(false);
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
    const COLORS = ['#6366f1', '#22c55e', '#f59e42', '#e11d48', '#7c3aed', '#0ea5e9'];
    const stats = roles.map((role, idx) => ({
        role,
        count: groupedUsers[role].length,
        color: COLORS[idx % COLORS.length]
    }));

    if (authLoading || loadingUsers) {
        return (
            <p className="text-center text-lg text-indigo-600 mt-20">Carregando...</p>
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 px-6 py-12">
            <h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-8 tracking-tight">
                Painel de Usuários
            </h1>

            {/* Gráfico de barras estatístico */}
            <div className="flex flex-col items-center mb-10 bg-white/80 border border-indigo-200 rounded-2xl shadow-lg px-8 py-8 max-w-2xl mx-auto">
                <span className="text-xl font-bold text-indigo-700 mb-4 tracking-tight">Distribuição de Usuários por Papel</span>
                <BarChartSVG data={stats} />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-10 bg-white/70 border border-indigo-100 rounded-xl shadow px-4 py-4">
                {roles.map((role) => (
                    <button
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={`px-6 py-2.5 rounded-full font-semibold border backdrop-blur-md shadow-md transition
                        ${activeRole === role
                                ? 'bg-indigo-700 text-white border-indigo-700 scale-105'
                                : 'bg-white/60 text-indigo-700 border-indigo-300 hover:bg-indigo-100'
                            }`}
                    >
                        {role} <span className="ml-2 inline-block bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 text-xs font-bold">{groupedUsers[role].length}</span>
                    </button>
                ))}
            </div>

            {/* Lista por Aba */}
            {activeRole && (
                <div>
                    <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-8 capitalize drop-shadow-lg">
                        {activeRole}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                        {groupedUsers[activeRole].map((user) => (
                            <div
                                key={user.id}
                                className="bg-white/95 border border-indigo-300 rounded-3xl shadow-2xl p-7 backdrop-blur-md transition-all hover:scale-[1.05] hover:shadow-indigo-400 flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow ${user.role === 'Admin' ? 'bg-yellow-100 text-yellow-800' : user.role === 'Psicologo' ? 'bg-blue-100 text-blue-800' : user.role === 'Psiquiatra' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{user.role}</span>
                                        {user.status && (
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow ${user.status === 'ativo' ? 'bg-green-200 text-green-800 border border-green-300' : 'bg-red-200 text-red-800 border border-red-300'}`}>{user.status === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-extrabold text-indigo-800 mb-2 tracking-tight drop-shadow-lg">{user.name}</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><span className="font-medium text-indigo-600">Email:</span> {user.email}</p>
                                        <p><span className="font-medium text-indigo-600">CPF:</span> {user.cpf}</p>
                                        <p><span className="font-medium text-indigo-600">Telefone:</span> {user.telefone}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-indigo-100 pt-4 mt-4">
                                    <button
                                        onClick={() => handleEdit(user.id)}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-1 drop-shadow"
                                    >
                                        <span>✏️</span> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-1 drop-shadow"
                                    >
                                        <span>🗑️</span> Excluir
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
