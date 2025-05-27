'use client';

import { useRouter } from 'next/navigation';

export default function Planos() {
    const router = useRouter();

    const planos = [
        {
            nome: 'Mensal',
            preco: 'R$ 200,00',
            descricao: 'Plano mensal ideal para quem precisa de flexibilidade.',
            beneficios: [
                'Acesso completo à plataforma',
                'Suporte dedicado',
                'Atualizações incluídas',
            ],
            destaque: false,
        },
        {
            nome: 'Anual',
            preco: 'R$ 2.000,00',
            descricao: 'Economize R$ 400 com o plano anual.',
            beneficios: [
                'Tudo do plano mensal',
                'Prioridade no suporte',
                'Desconto exclusivo',
            ],
            destaque: false,
        },
        {
            nome: 'Oferta Gratuita',
            preco: '1 mês grátis',
            descricao: 'Aproveite essa oferta por tempo limitado!',
            beneficios: [
                'Acesso total durante o mês',
                'Sem cobrança inicial',
                'Cancele a qualquer momento',
            ],
            destaque: true,
        },
    ];

    const verificarLoginERedirecionar = async () => {
        try {
            const response = await fetch('http://localhost:8000/usuario_jwt/', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                // Usuário está logado
                router.push('/pagamentoplano');
            } else {
                // Não está logado
                router.push('/login');
            }
        } catch (error) {
            console.error('Erro ao verificar login:', error);
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100 py-12 px-6">
            <h1 className="text-4xl font-bold text-center text-indigo-700 mb-12">Planos para Médicos</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {planos.map((plano, index) => (
                    <div
                        key={index}
                        className={`p-8 rounded-2xl border shadow-md transition flex flex-col justify-between
                            ${plano.destaque ? 'bg-teal-100 border-teal-300 shadow-lg' : 'bg-white border-indigo-100 hover:shadow-lg'}
                        `}
                    >
                        <div>
                            {plano.destaque && (
                                <span className="inline-block bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                                    Oferta Especial
                                </span>
                            )}

                            <h2 className="text-2xl font-bold text-indigo-800 mb-2">{plano.nome}</h2>
                            <p className={`text-3xl font-extrabold mb-4 ${plano.destaque ? 'text-teal-700' : 'text-indigo-600'}`}>
                                {plano.preco}
                            </p>
                            <p className="text-gray-600 mb-6">{plano.descricao}</p>

                            <ul className="space-y-2 text-sm text-gray-700">
                                {plano.beneficios.map((beneficio, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        ✅ <span>{beneficio}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={verificarLoginERedirecionar}
                            className={`mt-8 w-full py-3 rounded-lg font-medium transition
                                ${plano.destaque
                                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                            `}
                        >
                            {plano.destaque ? 'Começar Grátis' : 'Assinar'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
