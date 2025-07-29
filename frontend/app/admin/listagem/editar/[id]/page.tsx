'use client';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, useParams } from 'next/navigation';

interface User {
    id: number;
    nome: string;
    email: string;
    role: string;
    cpf: string;
    telefone: string;
    status?: string;
    foto?: any;
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
            let response;
            // Se houver foto, envia como multipart/form-data
            if (user.foto && user.foto instanceof File) {
                const formData = new FormData();
                Object.entries(user).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value);
                    }
                });
                response = await fetch(`http://localhost:8000/api/users/${id}/`, {
                    method: 'PUT',
                    body: formData,
                });
            } else {
                response = await fetch(`http://localhost:8000/api/users/${id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                });
            }

            if (response.ok) {
                toast.success('Usuário atualizado com sucesso!', {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setTimeout(() => {
                    router.push('/admin/listagem');
                }, 1500);
            } else {
                const errorData = await response.json();
                toast.error(errorData?.message || 'Erro ao atualizar usuário.', {
                    position: 'top-center',
                    autoClose: 4000,
                });
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
        <>
            <ToastContainer />
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 py-14 px-6">
                <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-md border border-indigo-100 p-10 rounded-3xl shadow-2xl">
                    <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-10">
                        ✏️ Editar Usuário
                    </h1>

                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={user.status || 'ativo'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                >
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Foto de Perfil</label>
                                <input
                                    type="file"
                                    name="foto"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // Atualiza o campo foto para envio
                                            setUser({ ...user, foto: file });
                                        }
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={user.nome || ''}
                                    onChange={handleChange}
                                    placeholder="Nome completo"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email || ''}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">CPF</label>
                                <input
                                    type="text"
                                    name="cpf"
                                    value={user.cpf || ''}
                                    onChange={handleChange}
                                    placeholder="000.000.000-00"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
                                <input
                                    type="text"
                                    name="telefone"
                                    value={user.telefone || ''}
                                    onChange={handleChange}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-end gap-4 pt-6">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full md:w-auto px-6 py-3 rounded-xl border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="w-full md:w-auto px-6 py-3 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition shadow-md"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
