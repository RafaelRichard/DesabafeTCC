'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface User {
    id: number;
    nome: string;
    email: string;
    role: string;
    cpf: string;
    telefone: string;
}

export default function EditarUsuario() {
    const router = useRouter();
    const { id } = useParams() as { id?: string };
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/users/${id}/`);
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Erro ao buscar usuário:', error);
                setError('Erro ao carregar dados do usuário.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (user) {
            setUser({ ...user, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const response = await fetch(`http://localhost:8000/api/users/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            if (response.ok) {
                alert('Usuário atualizado com sucesso!');
                router.push('/admin/listagem');
            } else {
                const errorData = await response.json();
                setError(errorData?.message || 'Erro ao atualizar usuário.');
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            setError('Erro inesperado. Tente novamente.');
        }
    };

    const handleCancel = () => router.push('/admin/listagem');

    if (loading) return <div className="text-center text-indigo-600 py-16 text-lg">Carregando dados...</div>;
    if (!user) return <div className="text-center text-red-500 py-16 text-lg">Usuário não encontrado.</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100 py-12 px-6">
            <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
                <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">
                    Editar Usuário
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1 text-gray-700 font-medium">Nome</label>
                            <input
                                type="text"
                                name="nome"
                                value={user.nome || ''}
                                onChange={handleChange}
                                placeholder="Nome completo"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-gray-700 font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user.email || ''}
                                onChange={handleChange}
                                placeholder="Email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1 text-gray-700 font-medium">CPF</label>
                            <input
                                type="text"
                                name="cpf"
                                value={user.cpf || ''}
                                onChange={handleChange}
                                placeholder="000.000.000-00"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-gray-700 font-medium">Telefone</label>
                            <input
                                type="text"
                                name="telefone"
                                value={user.telefone || ''}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="w-full md:w-auto px-6 py-3 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
