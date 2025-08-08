'use client';

import { useEffect, useState } from 'react';
import { getBackendUrl } from '../utils/backend';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiClipboard, FiSettings } from 'react-icons/fi';
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

// Função para pegar o cookie pelo nome
const getCookie = (name: string): string | null => {
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

export default function AreaPsiquiatra() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const [userName, setUserName] = useState('');
    const [foto, setFoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verificarAutenticacao = async () => {
            try {
                const response = await fetch('http://localhost:8000/usuario_jwt/', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    console.log('Usuário não autenticado, redirecionando para login');
                    router.push('/login');
                    return;
                }

                const data = await response.json();
                if (data.role === 'Psiquiatra') {
                    setIsLoggedIn(true);
                    setRole(data.role);
                    setUserName(data.email);
                    setFoto(data.foto || null);
                } else {
                    console.log('Usuário não é Psiquiatra, redirecionando');
                    router.push('/login');
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        verificarAutenticacao();
    }, [router]);

    const handleLogout = () => {
        document.cookie = "jwt=; Max-Age=0; path=/";
        setIsLoggedIn(false);
        setRole('');
        setUserName('');
        router.push('/login');
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    return (
        <div className="pt-16 bg-gray-50 min-h-screen flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="flex flex-col w-full lg:w-72 bg-indigo-800 text-white h-full p-6 lg:h-auto shadow-lg items-center">
                {foto ? (
                    <img
                        src={foto ? `${getBackendUrl()}/${foto}` : "/img/logo.png"}
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
                <h2 className="text-2xl font-semibold mb-8 text-center lg:text-left">Área do Psiquiatra</h2>
                <nav className="flex flex-col space-y-4">
                    <Link href="/meu_perfil_psiquiatra" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiUser size={20} />
                        <span>Meu Perfil</span>
                    </Link>
                    <Link href="/consultas_psiquiatras" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiClipboard size={20} />
                        <span>Minhas Consultas</span>
                    </Link>
                    <Link href="/prontuario_psiquiatra" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                        <FiSettings size={20} />
                        <span>Prontuário</span>
                    </Link>
                </nav>
                <div className="mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 p-3 rounded-lg hover:bg-red-700 transition duration-300 mt-6"
                    >
                        Sair
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-100 p-6 lg:p-12">
                <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-6">Área do Psiquiatra</h1>
                {isLoggedIn && (
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-semibold text-indigo-600 mb-2">Seja Bem-vindo, Psiquiatra {userName}!</h2>
                            <p className="text-lg text-gray-500">Gerencie seus dados e consultas.</p>
                        </div>

                        {/* Gráfico Chart.js - visual profissional com Tailwind */}
                        <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-indigo-50 via-white to-green-50 rounded-2xl shadow-2xl border border-indigo-200 p-8 flex flex-col items-center transition-all duration-300 hover:shadow-indigo-300">
                          <h3 className="text-2xl font-bold text-indigo-700 mb-6 text-center drop-shadow-sm tracking-tight">Consultas e Receita por Status</h3>
                          <div className="w-full h-[350px] md:h-[400px] flex items-center justify-center">
                            <Bar
                              data={{
                                labels: ['Confirmada', 'Pendente', 'Cancelada'],
                                datasets: [
                                  {
                                    label: 'Consultas',
                                    data: [12, 5, 3],
                                    backgroundColor: 'rgba(99,102,241,0.85)', // indigo-500
                                    borderRadius: 8,
                                    barPercentage: 0.6,
                                    categoryPercentage: 0.5,
                                  },
                                  {
                                    label: 'Valor Recebido',
                                    data: [1200, 500, 0],
                                    backgroundColor: 'rgba(34,197,94,0.85)', // green-500
                                    borderRadius: 8,
                                    barPercentage: 0.6,
                                    categoryPercentage: 0.5,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                    labels: {
                                      color: '#312e81', // indigo-900
                                      font: { size: 16, weight: 'bold' },
                                      padding: 24,
                                    },
                                  },
                                  title: { display: false },
                                  tooltip: {
                                    backgroundColor: '#312e81',
                                    titleColor: '#fff',
                                    bodyColor: '#fff',
                                    borderColor: '#6366f1',
                                    borderWidth: 1,
                                    callbacks: {
                                      label: function(context) {
                                        if (context.dataset.label === 'Valor Recebido') {
                                          return `${context.dataset.label}: R$${context.parsed.y}`;
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
                                      font: { size: 15, weight: 'bold' },
                                    },
                                  },
                                  y: {
                                    beginAtZero: true,
                                    grid: {
                                      color: '#e0e7ff',
                                    },
                                    title: {
                                      display: true,
                                      text: 'Quantidade / Valor (R$)',
                                      color: '#16a34a',
                                      font: { size: 16, weight: 'bold' },
                                    },
                                    ticks: {
                                      color: '#16a34a',
                                      font: { size: 15, weight: 'bold' },
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
