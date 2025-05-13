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
        if (!id) {
            console.error('ID não encontrado');
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/users/${id}/`);
                const contentType = response.headers.get('Content-Type');

                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    console.error('Esperado JSON, mas recebido:', contentType);
                }
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar usuário', error);
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
                setError(errorData?.message || 'Erro desconhecido ao atualizar o usuário.');
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário', error);
            setError('Erro ao atualizar o usuário. Tente novamente mais tarde.');
        }
    };

    const handleCancel = () => {
        router.push('/admin/listagem');
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8">Carregando...</div>;
    }

    if (!user) {
        return <div className="flex justify-center items-center p-8 text-red-600">Erro ao carregar usuário. Tente novamente.</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-indigo-600 text-center">Editar Usuário</h1>
            {error && <div className="bg-red-500 text-white p-4 mb-6 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        type="text"
                        name="name"
                        value={user.nome || ''}
                        onChange={handleChange}
                        placeholder="Nome"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <input
                        type="email"
                        name="email"
                        value={user.email || ''}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        type="text"
                        name="cpf"
                        value={user.cpf || ''}
                        onChange={handleChange}
                        placeholder="CPF"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <input
                        type="text"
                        name="phone"
                        value={user.telefone || ''}
                        onChange={handleChange}
                        placeholder="Telefone"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
                <div>
                    <select
                        name="role"
                        value={user.role || ''}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                        <option value="">Selecione uma função</option>
                        <option value="admin">Admin</option>
                        <option value="psicologo">Psicólogo</option>
                        <option value="medico">Médico</option>
                        <option value="paciente">Paciente</option>
                    </select>
                </div>

                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="w-full md:w-1/2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Salvar
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full md:w-1/2 bg-gray-500 text-white ml-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </form>

        </div>
    );
}
