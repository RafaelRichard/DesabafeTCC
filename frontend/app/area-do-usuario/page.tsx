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
import { FiUser, FiClipboard, FiFileText, FiFolder, FiBookOpen, FiCalendar, FiSettings } from 'react-icons/fi';

// Função utilitária para pegar o cookie
const getCookie = (name: string): string | null => {
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

export default function AreaDoUsuario() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const [userName, setUserName] = useState('');
    const [foto, setFoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [consultas, setConsultas] = useState<any[]>([]);
    const [loadingConsultas, setLoadingConsultas] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verificarUsuario = async () => {
            try {
                const response = await fetch('http://localhost:8000/usuario_jwt/', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    console.log('Usuário não autenticado. Redirecionando...');
                    router.push('/login');
                    return;
                }

                const data = await response.json();
                setIsLoggedIn(true);
                setRole(data.role);
                setUserName(data.email);
                setFoto(data.foto || null);
            } catch (error) {
                console.error('Erro ao validar usuário:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        verificarUsuario();
    }, [router]);

    // Buscar dados das consultas do paciente
    useEffect(() => {
        if (!isLoggedIn) return;
        fetch('http://localhost:8000/api/agendamentos_paciente/', { credentials: 'include' })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setConsultas(data);
                setLoadingConsultas(false);
            })
            .catch(() => {
                setConsultas([]);
                setLoadingConsultas(false);
            });
    }, [isLoggedIn]);

    const handleLogout = () => {
        document.cookie = 'jwt=; Max-Age=0; path=/';
        setIsLoggedIn(false);
        setRole('');
        setUserName('');
        router.push('/login');
    };

    if (loading) {
        return <p className="text-center text-xl text-gray-600">Carregando...</p>;
    }

    // Cálculo das métricas
    const totalConsultas = consultas.length;
    const proximasConsultas = consultas.filter(c => c.status === 'confirmado' || c.status === 'paga').length;
    const valorTotalInvestido = consultas.reduce((acc, c) => acc + (c.valor_pago_profissional || 0), 0);
    const concluidas = consultas.filter(c => c.status === 'Concluida');
    const avaliacoesPendentes = concluidas.length; // Simulando avaliações pendentes

    // Dados para o gráfico de evolução (consultas por status)
    const consultasConfirmadas = consultas.filter(c => c.status === 'confirmado').length;
    const consultasPagas = consultas.filter(c => c.status === 'paga').length;
    const consultasConcluidas = consultas.filter(c => c.status === 'Concluida').length;
    const consultasCanceladas = consultas.filter(c => c.status === 'cancelado').length;

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
                <h2 className="text-2xl font-semibold mb-8 text-center lg:text-left">Paciente Dashboard</h2>
                <nav className="flex flex-col space-y-2 sm:space-y-4 w-full">
                    <Link href="/meu_perfil" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiUser size={20} />
                        <span>Meu Perfil</span>
                    </Link>
                    <Link href="/consultas_paciente" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiCalendar size={20} />
                        <span>Minhas Consultas</span>
                    </Link>
                    <Link href="/prontuario_paciente" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiBookOpen size={20} />
                        <span>Acessar Prontuários</span>
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-indigo-600 mb-4 sm:mb-6">Área do Paciente</h1>
                {isLoggedIn && (
                    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8">
                        <div className="text-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-indigo-600 mb-2">Seja Bem-vindo, {role} {userName}!</h2>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-500">Acompanhe sua jornada de cuidado e gerencie suas consultas.</p>
                        </div>
                        
                        {/* Indicadores de Métricas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 justify-items-center">
                            {/* Total Consultas */}
                            <div className="w-full bg-indigo-700 rounded-2xl p-4 sm:p-6 lg:p-8 shadow text-white text-center border border-indigo-700">
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">Total Consultas</div>
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-widest">{totalConsultas}</div>
                                <div className="text-xs sm:text-sm mt-1 text-indigo-200">consultas realizadas</div>
                            </div>
                            {/* Próximas Consultas */}
                            <div className="w-full bg-emerald-600 rounded-2xl p-4 sm:p-6 lg:p-8 shadow text-white text-center border border-emerald-600">
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">Próximas Consultas</div>
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-widest">{proximasConsultas}</div>
                                <div className="text-xs sm:text-sm mt-1 text-emerald-200">agendadas</div>
                            </div>
                            {/* Investimento Total */}
                            <div className="w-full bg-indigo-500 rounded-2xl p-4 sm:p-6 lg:p-8 shadow text-white text-center border border-indigo-500">
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">Investimento Total</div>
                                <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-wide">
                                    {Number(valorTotalInvestido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                <div className="text-xs sm:text-sm mt-1 text-indigo-200">em saúde mental</div>
                            </div>
                            {/* Consultas Concluídas */}
                            <div className="w-full bg-yellow-500 rounded-2xl p-4 sm:p-6 lg:p-8 shadow text-white text-center border border-yellow-500">
                                <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">Consultas Concluídas</div>
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-widest">{avaliacoesPendentes}</div>
                                <div className="text-xs sm:text-sm mt-1 text-yellow-200">finalizadas</div>
                            </div>
                        </div>

                        {/* Gráfico de Status das Consultas */}
                        <div className="w-full max-w-4xl mx-auto bg-white/80 rounded-2xl shadow-xl border border-emerald-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center mb-6 sm:mb-8">
                            <h3 className="text-xl sm:text-2xl font-bold text-emerald-700 mb-4 sm:mb-6 text-center tracking-tight drop-shadow-lg uppercase">Status das Consultas</h3>
                            <div className="w-full h-[250px] sm:h-[320px] lg:h-[420px] flex items-center justify-center">
                                <Bar
                                    data={{
                                        labels: ['Confirmada', 'Paga', 'Concluída', 'Cancelada'],
                                        datasets: [
                                            {
                                                label: 'Quantidade',
                                                data: [consultasConfirmadas, consultasPagas, consultasConcluidas, consultasCanceladas],
                                                backgroundColor: [
                                                    'rgba(99,102,241,0.85)',
                                                    'rgba(16,185,129,0.85)',
                                                    'rgba(34,197,94,0.85)',
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
                                                    'rgba(34,197,94,1)',
                                                    'rgba(239,68,68,1)'
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
                                            }
                                        },
                                        scales: {
                                            x: {
                                                grid: {
                                                    display: false,
                                                },
                                                ticks: {
                                                    color: '#6366f1',
                                                    font: { 
                                                        size: 12,
                                                        weight: 'bold', 
                                                        family: 'Inter, sans-serif' 
                                                    },
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
                                                    font: { 
                                                        size: 14,
                                                        weight: 'bold', 
                                                        family: 'Inter, sans-serif' 
                                                    },
                                                },
                                                ticks: {
                                                    color: '#16a34a',
                                                    font: { 
                                                        size: 12,
                                                        weight: 'bold', 
                                                        family: 'Inter, sans-serif' 
                                                    },
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
  