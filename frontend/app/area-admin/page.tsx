'use client';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend);
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUsers, FiClipboard, FiFileText, FiFolder, FiBookOpen, FiCalendar, FiSettings, FiList } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

// Função para pegar o cookie pelo nome
const getCookie = (name: string): string | null => {
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

export default function AreaDoAdmin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const [userName, setUserName] = useState('');
    const [foto, setFoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [tipo, setTipo] = useState<'psiquiatra' | 'psicologo' | 'paciente'>('psiquiatra');
    const [dados, setDados] = useState<any[]>([]);
    const router = useRouter();


    useEffect(() => {
        const verificarAutenticacao = async () => {
            try {
                const response = await fetch('http://localhost:8000/usuario_jwt/', {
                    credentials: 'include',
                });
                if (!response.ok) {
                    router.push('/login');
                    return;
                }
                const data = await response.json();
                if (data.role === 'Admin') {
                    setIsLoggedIn(true);
                    setRole(data.role);
                    setUserName(data.email);
                    setFoto(data.foto || null);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        verificarAutenticacao();
    }, [router]);

    // Buscar dados conforme tipo selecionado
    useEffect(() => {
        if (!isLoggedIn) return;
        let url = '';
        if (tipo === 'psiquiatra') url = 'http://localhost:8000/api/agendamentos_profissional/?tipo=psiquiatra';
        else if (tipo === 'psicologo') url = 'http://localhost:8000/api/agendamentos_profissional/?tipo=psicologo';
        else url = 'http://localhost:8000/api/agendamentos_paciente/';
        fetch(url, { credentials: 'include' })
            .then(res => res.ok ? res.json() : [])
            .then(data => setDados(data))
            .catch(() => setDados([]));
    }, [tipo, isLoggedIn]);


    const handleLogout = () => {
        // Remover o cookie no logout
        document.cookie = "jwt=; Max-Age=0; path=/";  // Remover o cookie
        setIsLoggedIn(false);
        setRole('');
        setUserName('');
        router.push('/login');
    };

    if (loading) {
        return <p>Carregando...</p>;  
    }

    // Função utilitária para pegar o campo financeiro correto
    const getValor = (item: any) => {
        if (tipo === 'paciente') return item.valor_pago_profissional || 0;
        return item.valor_recebido_profissional || 0;
    };

    return (
        <div className="pt-16 bg-gray-50 min-h-screen flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="flex flex-col w-full lg:w-72 bg-indigo-800 text-white min-h-[180px] lg:min-h-screen p-4 sm:p-6 shadow-lg items-center lg:items-start">
                {foto ? (
                    <img
                        src={`http://localhost:8000${foto}`}
                        alt="Foto de perfil"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white mb-4 shadow"
                    />
                ) : (
                    <img
                        src="/img/logo.png"
                        alt="Foto padrão"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white mb-4 shadow"
                    />
                )}
                <h2 className="text-2xl font-semibold mb-8 text-center lg:text-left">Admin Dashboard</h2>
                <nav className="flex flex-col space-y-2 sm:space-y-4 w-full">
                    <Link href="/cadastro_usuario" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiUsers size={20} />
                        <span>Cadastrar Usuário</span>
                    </Link>
                    <Link href="/consultas_admin" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiCalendar size={20} />
                        <span>Gerenciar Consultas</span>
                    </Link>
                    <Link href="/meu_perfil_admin" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiSettings size={20} />
                        <span>Meu Perfil</span>
                    </Link>
                    {/* Botão para a listagem de cadastros */}
                    <Link href="/admin/listagem" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiList size={20} />
                        <span>Listar Cadastros</span>
                    </Link>
                </nav>
                <div className="mt-6 lg:mt-auto w-full">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 p-3 rounded-lg hover:bg-red-700 transition duration-300 mt-6"
                    >
                        Sair
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-100 p-4 sm:p-6 lg:p-12">
                <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-6">Área de Administração</h1>
                {isLoggedIn && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-semibold text-indigo-600 mb-2">Seja Bem-vindo, {role} {userName}!</h2>
                            <p className="text-lg text-gray-500">Gerencie os usuários e consultas da plataforma.</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 bg-white/70 border border-indigo-100 rounded-xl shadow px-2 sm:px-4 py-3 sm:py-4">
                            <span className="text-lg font-bold text-indigo-700 mb-2 tracking-tight">Visualizar dados de:</span>
                            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                                {[
                                    { value: 'psiquiatra', label: 'Psiquiatra' },
                                    { value: 'psicologo', label: 'Psicólogo' },
                                    { value: 'paciente', label: 'Paciente' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setTipo(opt.value as any)}
                                        className={`px-6 py-2.5 rounded-full font-semibold border backdrop-blur-md shadow-md transition
                                            ${tipo === opt.value
                                                ? 'bg-indigo-700 text-white border-indigo-700 scale-105'
                                                : 'bg-white/60 text-indigo-700 border-indigo-300 hover:bg-indigo-100'}`}
                                        aria-pressed={tipo === opt.value}
                                    >
                                        {opt.label}
                                        <span className="ml-2 inline-block bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 text-xs font-bold">
                                            {tipo === opt.value ? dados.length : ''}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Indicadores e Gráfico */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-10 justify-items-center">
                            {/* Total Consultas */}
                            <div className="w-full bg-indigo-700 rounded-2xl p-4 sm:p-8 shadow text-white text-center border border-indigo-700">
                                <div className="text-2xl font-bold mb-1">Total Consultas</div>
                                <div className="text-4xl font-extrabold tracking-widest">{Number(dados.reduce((acc, c) => acc + getValor(c), 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                <div className="text-sm mt-1 text-indigo-200">{dados.length} consultas</div>
                            </div>
                            {/* Receita Total */}
                            <div className="w-full bg-emerald-600 rounded-2xl p-4 sm:p-8 shadow text-white text-center border border-emerald-600">
                                <div className="text-2xl font-bold mb-1">Receita Total</div>
                                <div className="text-4xl font-extrabold tracking-widest">
                                    {Number(
                                        dados.reduce((acc, c) => acc + getValor(c), 0)
                                        - dados.filter(c => c.status === 'cancelado').reduce((acc, c) => acc + getValor(c), 0)
                                    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                <div className="text-sm mt-1 text-emerald-200">{dados.filter(c => c.status === 'paga' || c.status === 'confirmado').length} consultas</div>
                            </div>
                            {/* Cancelado */}
                            <div className="w-full bg-red-600 rounded-2xl p-4 sm:p-8 shadow text-white text-center border border-red-600">
                                <div className="text-2xl font-bold mb-1">Cancelado</div>
                                <div className="text-4xl font-extrabold tracking-widest">{Number(dados.filter(c => c.status === 'cancelado').reduce((acc, c) => acc + getValor(c), 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                <div className="text-sm mt-1 text-red-200">{dados.filter(c => c.status === 'cancelado').length} consultas</div>
                            </div>
                        </div>
                        <div className="w-full max-w-3xl mx-auto bg-white/80 rounded-2xl shadow-xl border border-emerald-100 p-4 sm:p-8 flex flex-col items-center">
                            <h3 className="text-2xl font-bold text-emerald-700 mb-6 text-center tracking-tight drop-shadow-lg uppercase">Consultas por Status</h3>
                            <div className="w-full max-w-5xl mx-auto h-[320px] sm:h-[420px] flex items-center justify-center">
                                <Bar
                                    data={{
                                        labels: ['Confirmada', 'Paga', 'Cancelada'],
                                        datasets: [
                                            {
                                                label: 'Quantidade',
                                                data: [
                                                    dados.filter(c => c.status === 'confirmado').length,
                                                    dados.filter(c => c.status === 'paga').length,
                                                    dados.filter(c => c.status === 'cancelado').length,
                                                ],
                                                backgroundColor: [
                                                    'rgba(99,102,241,0.85)',
                                                    'rgba(16,185,129,0.85)',
                                                    'rgba(239,68,68,0.85)'
                                                ],
                                                borderRadius: 14,
                                                barPercentage: 0.45,
                                                categoryPercentage: 0.35,
                                                borderWidth: 2,
                                                borderColor: '#fff',
                                                hoverBackgroundColor: [
                                                    'rgba(99,102,241,1)',
                                                    'rgba(16,185,129,1)',
                                                    'rgba(239,68,68,1)'
                                                ],
                                            },
                                            {
                                                label: 'Valor (R$)',
                                                data: [
                                                    dados.filter(c => c.status === 'confirmado').reduce((acc, c) => acc + getValor(c), 0),
                                                    dados.filter(c => c.status === 'paga').reduce((acc, c) => acc + getValor(c), 0),
                                                    dados.filter(c => c.status === 'cancelado').reduce((acc, c) => acc + getValor(c), 0),
                                                ],
                                                backgroundColor: [
                                                    'rgba(67,56,202,0.85)',
                                                    'rgba(4,120,87,0.85)',
                                                    'rgba(185,28,28,0.85)'
                                                ],
                                                borderRadius: 14,
                                                barPercentage: 0.45,
                                                categoryPercentage: 0.35,
                                                borderWidth: 2,
                                                borderColor: '#fff',
                                                hoverBackgroundColor: [
                                                    'rgba(67,56,202,1)',
                                                    'rgba(4,120,87,1)',
                                                    'rgba(185,28,28,1)'
                                                ],
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        animation: {
                                            duration: 1200,
                                            easing: 'easeInOutQuart',
                                        },
                                        plugins: {
                                            legend: {
                                                display: false,
                                            },
                                            title: {
                                                display: false,
                                            },
                                            tooltip: {
                                                backgroundColor: '#312e81',
                                                titleColor: '#fff',
                                                bodyColor: '#fff',
                                                borderColor: '#6366f1',
                                                borderWidth: 2,
                                                padding: 16,
                                                caretSize: 8,
                                                callbacks: {
                                                    label: function (context) {
                                                        if (context.dataset.label === 'Valor (R$)') {
                                                            return `${context.dataset.label}: ${Number(context.parsed.y).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
                                                        }
                                                        return `${context.dataset.label}: ${context.parsed.y}`;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            x: {
                                                grid: {
                                                    display: false,
                                                },
                                                ticks: {
                                                    color: '#6366f1',
                                                    font: { size: 16, weight: 'bold', family: 'Inter, sans-serif' },
                                                    padding: 8,
                                                },
                                            },
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(99,102,241,0.08)',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Quantidade',
                                                    color: '#16a34a',
                                                    font: { size: 16, weight: 'bold', family: 'Inter, sans-serif' },
                                                },
                                                ticks: {
                                                    color: '#16a34a',
                                                    font: { size: 15, weight: 'bold', family: 'Inter, sans-serif' },
                                                    padding: 8,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
