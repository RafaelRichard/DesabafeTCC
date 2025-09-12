'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBackendUrl } from '../utils/backend';
import { loadStripe } from '@stripe/stripe-js';

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
                const response = await fetch(`${getBackendUrl()}/usuario_jwt/`, {
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

    // Função para iniciar pagamento via Stripe
    const iniciarPagamentoStripe = async () => {
        if (!psiquiatra) {
            toast.error('Profissional não encontrado para pagamento.');
            return;
        }
        try {
            const res = await fetch(`${getBackendUrl()}/api/stripe/pagamento/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    nome_produto: `Consulta ${planoNome}`,
                    preco: preco,
                    profissional_id: psiquiatra.id,
                    usuario_id: psiquiatra.id,
                })
            });
            const data = await res.json();
            if (data.checkout_url) {
                window.location.href = data.checkout_url; // Redireciona para o checkout Stripe
            } else {
                toast.error('Erro ao iniciar pagamento: ' + (data.error || ''));
            }
        } catch (err) {
            toast.error('Erro ao conectar com o servidor de pagamento.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-10 mt-12 border border-gray-200">
            <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">Pagamento da Consulta</h1>
            <div className="mb-6">
                <div className="text-lg font-semibold mb-2">Plano Selecionado:</div>
                <div className="text-xl text-indigo-700 font-bold">{planoNome}</div>
                <div className="text-lg mt-2">Valor: <span className="font-bold">{Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
            </div>

            <button
                onClick={iniciarPagamentoStripe}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg shadow mb-4"
            >
                Pagar com Stripe
            </button>

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
                                        {i + 1}x de {Number(preco / (i + 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={iniciarPagamentoStripe}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg mt-6 font-medium hover:bg-indigo-700 transition"
            >
                Confirmar Pagamento com Stripe
            </button>

            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}
