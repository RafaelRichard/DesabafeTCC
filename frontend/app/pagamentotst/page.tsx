'use client';

import { useState } from 'react';

export default function Pagamento() {
    const [metodoPagamento, setMetodoPagamento] = useState('');
    const [statusPagamento, setStatusPagamento] = useState('pendente');
    const [valor, setValor] = useState(0);
    const [transacaoId, setTransacaoId] = useState('');
    const [dataPagamento, setDataPagamento] = useState<string | null>(null);

    // Simulando valores do agendamento e usuário (para propósitos de visualização)
    const agendamentoId = 12345; // Exemplo de ID do agendamento
    const usuarioId = 4; // ID do usuário autenticado
    const valorConsulta = 250.00; // Valor da consulta (exemplo)

    const gerarTransacaoId = () => {
        return `TRANS-${Math.random().toString(36).substr(2, 9)}`;
    }

    const handleFinalizarPagamento = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulando a data de pagamento (se o pagamento for realizado)
        if (statusPagamento === 'pago') {
            setDataPagamento(new Date().toISOString());
        }

        const pagamento = {
            agendamento_id: agendamentoId,
            usuario_id: usuarioId,
            status: statusPagamento,
            metodo_pagamento: metodoPagamento,
            valor,
            data_pagamento: dataPagamento,
            transacao_id: transacaoId || gerarTransacaoId(),
            data_criacao: new Date().toISOString(),
        };

        console.log('Pagamento realizado:', pagamento);
        alert('Pagamento processado com sucesso!');
    }

    return (
        <div className="max-w-3xl mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">
                Finalizar Pagamento da Consulta
            </h1>

            <form onSubmit={handleFinalizarPagamento} className="space-y-6">
                {/* Método de Pagamento */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Método de Pagamento</label>
                    <select
                        value={metodoPagamento}
                        onChange={(e) => setMetodoPagamento(e.target.value)}
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                        <option value="" disabled>Escolha o método</option>
                        <option value="cartao_credito">Cartão de Crédito</option>
                        <option value="cartao_debito">Cartão de Débito</option>
                        <option value="pix">PIX</option>
                        <option value="paypal">PayPal</option>
                    </select>
                </div>

                {/* Status do Pagamento */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Status do Pagamento</label>
                    <select
                        value={statusPagamento}
                        onChange={(e) => setStatusPagamento(e.target.value)}
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                        <option value="falhou">Falhou</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>

                {/* Valor */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Valor da Consulta</label>
                    <input
                        type="number"
                        value={valor || valorConsulta}
                        onChange={(e) => setValor(parseFloat(e.target.value))}
                        required
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        step="0.01"
                        min="0"
                    />
                </div>

                {/* ID da Transação */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">ID da Transação</label>
                    <input
                        type="text"
                        value={transacaoId || gerarTransacaoId()}
                        readOnly
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Link para Consulta Online */}
                <div className="flex flex-col">
                    <label className="font-medium text-gray-700">Link para Consulta Online</label>
                    <input
                        type="url"
                        value={`https://consulta-online.com/agendamento-${agendamentoId}`}
                        readOnly
                        className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Botão de Finalização */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                    >
                        Finalizar Pagamento
                    </button>
                </div>
            </form>
        </div>
    );
}
