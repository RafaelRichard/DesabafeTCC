'use client';

import { useState, useEffect } from 'react';

interface Profissional {
    id: number;
    nome: string;
    crm: string;
    crp?: string;
    especializacao: string;
}

interface Usuario {
    id: number;
    nome: string;
    email: string;
    telefone: string;
}

export default function Agendamento() {
    // Profissional estático
    const profissional: Profissional = {
        id: 1,
        nome: 'Dr. João Silva',
        crm: '123456',
        crp: '7891011',
        especializacao: 'Psiquiatra',
    };

    // Usuário estático
    const usuario: Usuario = {
        id: 4,
        nome: 'Maria Oliveira',
        email: 'maria@example.com',
        telefone: '(11) 98765-4321',
    };

    const [dataHora, setDataHora] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [status, setStatus] = useState<'pendente' | 'confirmado' | 'cancelado'>('pendente');
    const [linkConsulta, setLinkConsulta] = useState('');

    useEffect(() => {
        // Gerar automaticamente o link para a consulta
        if (dataHora) {
            const baseLink = `https://consulta-online.com/${profissional.nome.replace(/\s+/g, '-')}-${dataHora}`;
            setLinkConsulta(baseLink);
        }
    }, [dataHora]);

    const handleAgendar = async (e: React.FormEvent) => {
        e.preventDefault();

        const agendamento = {
            usuario_id: usuario.id,
            medico_id: profissional.id,
            data_hora: dataHora,
            status: status,
            link_consulta: linkConsulta,
            observacoes: observacoes,
            data_criacao: new Date().toISOString(), // Data de criação do agendamento
        };

        try {
            // Simulando a requisição do agendamento
            console.log('Agendamento:', agendamento);
            alert('Consulta agendada com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao agendar a consulta.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-20 p-8 bg-white rounded-lg shadow-xl">
            <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">
                Agendar Consulta com {profissional.nome}
            </h1>

            {/* Detalhes do Médico */}
            <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informações do Médico</h2>
                <p><strong>Nome:</strong> {profissional.nome}</p>
                <p><strong>CRM:</strong> {profissional.crm}</p>
                {profissional.crp && <p><strong>CRP:</strong> {profissional.crp}</p>}
                <p><strong>Especialização:</strong> {profissional.especializacao}</p>
            </div>

            {/* Detalhes do Usuário */}
            <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informações do Usuário</h2>
                <p><strong>Nome:</strong> {usuario.nome}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Telefone:</strong> {usuario.telefone}</p>
            </div>

            {/* Formulário de Agendamento */}
            <form onSubmit={handleAgendar} className="space-y-8">
                {/* Data e Hora */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Data e Hora</label>
                    <input
                        type="datetime-local"
                        value={dataHora}
                        onChange={(e) => setDataHora(e.target.value)}
                        required
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200"
                    />
                </div>

                {/* Status */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Status do Agendamento</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'pendente' | 'confirmado' | 'cancelado')}
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200"
                    >
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>

                {/* Link para Consulta (gerado automaticamente) */}
                <div className="flex flex-col">

                    <label className="font-medium text-gray-700">Link para Consulta Online</label>
                    <input
                        type="url"
                        value={`https://consulta-online.com/agendamento-${profissional?.id}-${dataHora}`}
                        readOnly
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-gray-100 cursor-not-allowed"
                    />
                </div>


                {/* Observações */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Observações (opcional)</label>
                    <textarea
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        rows={5}
                    />
                </div>

                {/* Botão de Confirmação */}
                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-10 py-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-300"
                    >
                        Confirmar Agendamento
                    </button>
                </div>
            </form>
        </div>
    );
}
