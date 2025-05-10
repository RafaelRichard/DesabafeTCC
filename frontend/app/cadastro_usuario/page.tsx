'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastroUsuario() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        cpf: '',
        role: 'Paciente',
        crm: '',
        crp: '',
        status: 'ativo',
    });
    const [message, setMessage] = useState('');
    const router = useRouter();

    // Função para obter o token CSRF
    const getCsrfToken = (): string | null => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='))
            ?.split('=')[1] || null;
    };

    // Função para validar o CPF
    const validateCPF = (cpf: string) => {
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        return cpfRegex.test(cpf);
    };

    // Função para lidar com as mudanças nos campos do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');

        // Validações (que você já tem)

        try {
            const csrfToken = getCsrfToken(); // Obtém o token CSRF do cookie
            if (!csrfToken) {
                setMessage('Token CSRF não encontrado.');
                return;
            }

            const response = await fetch('http://localhost:8000/cadastrar_usuario/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,  // Envia o token CSRF
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                // Armazenando o token JWT, que o backend agora retorna
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                    setMessage('Cadastro realizado com sucesso!');
                    router.push('/login');  // Redireciona para a página de login
                }
            } else {
                setMessage(data.error || 'Erro ao realizar cadastro.');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMessage('Erro ao conectar com o servidor.');
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-20 flex items-center justify-center px-4">
            <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8 md:p-10">
                <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
                    Criar Conta
                </h1>

                {message && (
                    <div
                        className={`mb-6 p-3 rounded text-center text-white ${message.includes('Erro') ? 'bg-red-500' : 'bg-green-500'
                            }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuário</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="Paciente">Paciente</option>
                            <option value="Psiquiatra">Psiquiatra</option>
                            <option value="Psicologo">Psicólogo</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (opcional)</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    {formData.role === 'Psiquiatra' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CRM</label>
                            <input
                                type="text"
                                name="crm"
                                value={formData.crm}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    )}

                    {formData.role === 'Psicologo' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CRP</label>
                            <input
                                type="text"
                                name="crp"
                                value={formData.crp}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300"
                    >
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}