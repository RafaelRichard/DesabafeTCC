'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PagamentoPlano() {
    const searchParams = useSearchParams();

    const planoNome = searchParams?.get('plano') || 'Mensal';
    const preco = parseFloat(searchParams?.get('valor') || '200.00');

    const [psiquiatra, setPsiquiatra] = useState<null | {
        id: number;
        nome: string;
        especialidade: string;
        crm: string;
    }>(null);

    const [status, setStatus] = useState<'pendente' | 'pago' | 'falhou' | 'cancelado'>('pendente');
    const [metodoPagamento, setMetodoPagamento] = useState('');
    const [parcelas, setParcelas] = useState(1);
    const [cartao, setCartao] = useState({
        nome: '',
        numero: '',
        validade: '',
        cvv: '',
    });

    const pixCopiaCola = `00020101021126330014br.gov.bcb.pix0111532291848585204000053039865802BR5919RAFAEL R DE ALMEIDA6009ARACATUBA62070503***6304BF50`;

    useEffect(() => {
        const buscarUsuario = async () => {
            try {
                const response = await fetch('http://localhost:8000/usuario_jwt/', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Falha ao buscar usuário');
                }

                const data = await response.json();
                setPsiquiatra({
                    id: data.id,
                    nome: data.nome,
                    especialidade: data.especialidade || 'Médico',
                    crm: data.crm || 'Não informado',
                });
            } catch (error) {
                console.error('Erro ao buscar psiquiatra:', error);
            }
        };

        buscarUsuario();
    }, []);

    const iniciarPagamento = () => {
        if (!metodoPagamento) {
            toast.warn('Selecione um método de pagamento.');
            return;
        }

        if (metodoPagamento.startsWith('cartao')) {
            if (!cartao.nome || !cartao.numero || !cartao.validade || !cartao.cvv) {
                toast.warn('Preencha todos os dados do cartão.');
                return;
            }
        }

        console.log({
            plano: planoNome,
            valor: preco,
            metodo_pagamento: metodoPagamento,
            parcelas: metodoPagamento === 'cartao_credito' ? parcelas : null,
            cartao: metodoPagamento.startsWith('cartao') ? cartao : null,
        });

        toast.success('Pagamento processado com sucesso!');
        setStatus('pago');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pt-24 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-indigo-700 text-center mb-10">Pagamento do Plano</h1>

                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-indigo-600 mb-2">Plano Selecionado</h2>
                        <p><strong>Plano:</strong> {planoNome}</p>
                        <p><strong>Valor:</strong> R$ {preco.toFixed(2)}</p>
                        <p><strong>Status:</strong> {status}</p>
                    </div>

                    {psiquiatra ? (
                        <div>
                            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Profissional</h2>
                            <p><strong>Nome:</strong> {psiquiatra.nome}</p>
                            <p><strong>Especialidade:</strong> {psiquiatra.especialidade}</p>
                            <p><strong>CRM:</strong> {psiquiatra.crm}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Carregando dados do profissional...</p>
                    )}

                    <div>
                        <h2 className="text-xl font-semibold text-indigo-600 mb-2">Método de Pagamento</h2>
                        <select
                            className="w-full border rounded-lg px-4 py-2"
                            value={metodoPagamento}
                            onChange={(e) => setMetodoPagamento(e.target.value)}
                        >
                            <option value="">Selecione</option>
                            <option value="pix">PIX</option>
                            <option value="cartao_credito">Cartão de Crédito</option>
                            <option value="cartao_debito">Cartão de Débito</option>
                        </select>
                    </div>

                    {metodoPagamento === 'pix' && (
                        <div className="bg-gray-50 p-4 rounded-lg border mt-4">
                            <p className="font-medium mb-2">Código PIX (copie e cole):</p>

                            <textarea
                                className="w-full bg-gray-100 p-2 rounded resize-none text-sm"
                                rows={3}
                                readOnly
                                value={pixCopiaCola}
                            />

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(pixCopiaCola);
                                    toast.success('Código PIX copiado para a área de transferência!');
                                }}
                                className="mt-3 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm"
                            >
                                Copiar código PIX
                            </button>   

                            {/* Container do Toast */}
                            <ToastContainer position="top-center" autoClose={3000} />
                        </div>
                    )}


                    {(metodoPagamento === 'cartao_credito' || metodoPagamento === 'cartao_debito') && (
                        <div className="grid gap-4 mt-4">
                            <input
                                type="text"
                                placeholder="Nome no Cartão"
                                className="border rounded-lg px-4 py-2"
                                value={cartao.nome}
                                onChange={(e) => setCartao({ ...cartao, nome: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Número do Cartão"
                                className="border rounded-lg px-4 py-2"
                                value={cartao.numero}
                                onChange={(e) => setCartao({ ...cartao, numero: e.target.value })}
                            />
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Validade (MM/AA)"
                                    className="border rounded-lg px-4 py-2 w-1/2"
                                    value={cartao.validade}
                                    onChange={(e) => setCartao({ ...cartao, validade: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="CVV"
                                    className="border rounded-lg px-4 py-2 w-1/2"
                                    value={cartao.cvv}
                                    onChange={(e) => setCartao({ ...cartao, cvv: e.target.value })}
                                />
                            </div>

                            {metodoPagamento === 'cartao_credito' && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Parcelamento</label>
                                    <select
                                        className="w-full border rounded-lg px-4 py-2"
                                        value={parcelas}
                                        onChange={(e) => setParcelas(Number(e.target.value))}
                                    >
                                        {[...Array(5)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}x de R$ {(preco / (i + 1)).toFixed(2)} sem juros
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={iniciarPagamento}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg mt-6 font-medium hover:bg-indigo-700 transition"
                    >
                        Confirmar Pagamento
                    </button>
                </div>
                <ToastContainer position="top-center" autoClose={3000} />
            </div>
        </div>
    );
}
