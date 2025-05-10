'use client';

import { useState } from 'react';

export default function Prontuario() {
    const [historicoClinico, setHistoricoClinico] = useState('');
    const [diagnostico, setDiagnostico] = useState('');
    const [tratamento, setTratamento] = useState('');
    const [prescricao, setPrescricao] = useState('');
    const [medicoId, setMedicoId] = useState('');
    const [usuarioId, setUsuarioId] = useState('');
    const [dataCriacao, setDataCriacao] = useState<string | null>(null);
    const [prontuarioId, setProntuarioId] = useState('');

    // Simulando valores do paciente e médico (para propósitos de visualização)
    const pacienteId = 4; // ID do paciente (usuário autenticado)
    const medicoIdSimulado = 2; // ID do médico responsável

    const gerarProntuarioId = () => {
        return `PRONT-${Math.random().toString(36).substr(2, 9)}`;
    }

    const handleSalvarProntuario = (e: React.FormEvent) => {
        e.preventDefault();

        // Definindo a data de criação do prontuário
        setDataCriacao(new Date().toISOString());

        const prontuario = {
            id: prontuarioId || gerarProntuarioId(),
            usuario_id: pacienteId,
            medico_id: medicoIdSimulado,
            data_criacao: dataCriacao,
            historico_clinico: historicoClinico,
            diagnostico,
            tratamento,
            prescricao,
        };

        console.log('Prontuário salvo:', prontuario);
        alert('Prontuário salvo com sucesso!');
    }

    return (
        <div className="max-w-3xl mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">
                Criar Prontuário Médico
            </h1>

            <form onSubmit={handleSalvarProntuario} className="space-y-6">
                {/* Histórico Clínico */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Histórico Clínico</label>
                    <textarea
                        value={historicoClinico}
                        onChange={(e) => setHistoricoClinico(e.target.value)}
                        required
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        rows={5}
                    />
                </div>

                {/* Diagnóstico */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Diagnóstico</label>
                    <textarea
                        value={diagnostico}
                        onChange={(e) => setDiagnostico(e.target.value)}
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        rows={3}
                    />
                </div>

                {/* Tratamento */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Tratamento</label>
                    <textarea
                        value={tratamento}
                        onChange={(e) => setTratamento(e.target.value)}
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        rows={3}
                    />
                </div>

                {/* Prescrição */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Prescrição</label>
                    <textarea
                        value={prescricao}
                        onChange={(e) => setPrescricao(e.target.value)}
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        rows={3}
                    />
                </div>

                {/* ID do Médico */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Médico Responsável</label>
                    <input
                        type="text"
                        value={medicoIdSimulado}
                        readOnly
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* ID do Paciente */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Paciente</label>
                    <input
                        type="text"
                        value={pacienteId}
                        readOnly
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Botão de Salvar */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                    >
                        Salvar Prontuário
                    </button>
                </div>
            </form>
        </div>
    );
}
