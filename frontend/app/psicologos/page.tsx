'use client';

import { useEffect, useState } from 'react';

export default function AreaPsicologo() {
    const [dados, setDados] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDados = async () => {
            const token = localStorage.getItem('auth_token');

            try {
                const response = await fetch('http://localhost:8000/api/usuario/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                console.log('Status da resposta:', response.status); // Verifica o código de status da resposta
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Erro detalhado:', errorData);
                    throw new Error(errorData.error || 'Erro ao buscar dados do psicólogo');
                }
                
                const data = await response.json();
                setDados(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDados();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Carregando seus dados...</p>
            </div>
        );
    }

    if (!dados) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500">Erro ao carregar seus dados.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white py-16 px-4 flex justify-center">
            <div className="bg-white rounded-xl shadow-xl p-10 max-w-3xl w-full">
                <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">Área do Psicólogo</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
                    <div>
                        <p className="font-semibold">Nome:</p>
                        <p>{dados.nome}</p>
                    </div>
                    <div>
                        <p className="font-semibold">E-mail:</p>
                        <p>{dados.email}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Telefone:</p>
                        <p>{dados.telefone || 'Não informado'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">CPF:</p>
                        <p>{dados.cpf}</p>
                    </div>
                    <div>
                        <p className="font-semibold">CRP:</p>
                        <p>{dados.crp}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Status:</p>
                        <span className={`font-medium px-2 py-1 rounded ${
                            dados.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                        }`}>
                            {dados.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
