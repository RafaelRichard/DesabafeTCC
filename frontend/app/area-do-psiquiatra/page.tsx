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
  const [consultasData, setConsultasData] = useState<any[]>([]);
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
          // Buscar agendamentos reais
          const agRes = await fetch('http://localhost:8000/api/agendamentos_profissional/', { credentials: 'include' });
          if (agRes.ok) {
            const agData = await agRes.json();
            setConsultasData(agData);
          }
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
      <div className="flex flex-col w-full lg:w-72 bg-indigo-800 text-white min-h-[180px] lg:min-h-screen p-4 sm:p-6 shadow-lg items-center lg:items-start">
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
  <nav className="flex flex-col space-y-2 sm:space-y-4 w-full">
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
  <div className="flex-1 bg-gradient-to-br from-indigo-50 via-emerald-50 to-white p-4 sm:p-6 lg:p-12 min-h-screen">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-8 tracking-tight drop-shadow-lg">Área do Psiquiatra</h1>
        {isLoggedIn && (
          <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-10 max-w-7xl mx-auto border border-emerald-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-10 justify-items-center">
              {/* Total Consultas - Roxo */}
              <div className="w-full bg-indigo-700 rounded-2xl p-4 sm:p-8 shadow text-white text-center border border-indigo-700">
                <div className="text-2xl font-bold mb-1">Total Consultas</div>
                <div className="text-4xl font-extrabold tracking-widest">{Number(consultasData.reduce((acc, c) => acc + (c.valor_recebido_profissional || 0), 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div className="text-sm mt-1 text-indigo-200">{consultasData.length} consultas</div>
              </div>
              {/* Receita Total - Verde */}
              <div className="w-full bg-emerald-600 rounded-2xl p-4 sm:p-8 shadow text-white text-center border border-emerald-600">
                <div className="text-2xl font-bold mb-1">Receita Total</div>
                <div className="text-4xl font-extrabold tracking-widest">
                  {Number(
                    consultasData.reduce((acc, c) => acc + (c.valor_recebido_profissional || 0), 0)
                    - consultasData.filter(c => c.status === 'cancelado').reduce((acc, c) => acc + (c.valor_recebido_profissional || 0), 0)
                  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-sm mt-1 text-emerald-200">{consultasData.filter(c => c.status === 'paga' || c.status === 'confirmado').length} consultas</div>
              </div>
              {/* Cancelado - Vermelho */}
              <div className="w-full bg-red-600 rounded-2xl p-4 sm:p-8 shadow text-white text-center border border-red-600">
                <div className="text-2xl font-bold mb-1">Cancelado</div>
                <div className="text-4xl font-extrabold tracking-widest">{Number(consultasData.filter(c => c.status === 'cancelado').reduce((acc, c) => acc + (c.valor_recebido_profissional || 0), 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div className="text-sm mt-1 text-red-200">{consultasData.filter(c => c.status === 'cancelado').length} consultas</div>
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
                          consultasData.filter(c => c.status === 'confirmado').length,
                          consultasData.filter(c => c.status === 'paga').length,
                          consultasData.filter(c => c.status === 'cancelado').length,
                        ],
                        backgroundColor: [
                          'rgba(99,102,241,0.85)', // Confirmada - Roxo
                          'rgba(16,185,129,0.85)', // Paga - Verde
                          'rgba(239,68,68,0.85)' // Cancelada - Vermelho
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
                          consultasData.filter(c => c.status === 'confirmado').reduce((acc, c) => acc + (c.valor_recebido_profissional || 0), 0),
                          consultasData.filter(c => c.status === 'paga').reduce((acc, c) => acc + (c.valor_recebido_profissional || 0), 0),
                          consultasData.filter(c => c.status === 'cancelado').reduce((acc, c) => acc + (c.valor_recebido_profissional || 0), 0),
                        ],
                        backgroundColor: [
                          'rgba(67,56,202,0.85)', // Confirmada - Indigo-700
                          'rgba(4,120,87,0.85)', // Paga - Emerald-700
                          'rgba(185,28,28,0.85)' // Cancelada - Red-700
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
