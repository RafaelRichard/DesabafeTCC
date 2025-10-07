"use client";

import { useEffect, useState } from "react";
import { getBackendUrl } from '../utils/backend';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import AvaliacaoModal from '../components/AvaliacaoModal';

interface Usuario {
  id: number;
  nome: string;
  role: string;
  especialidade?: string;
}

interface Consulta {
  id: number;
  data_hora: string;
  paciente_nome?: string;
  usuario_nome?: string;  // Nome do paciente vem do backend
  profissional?: Usuario;
  psiquiatra?: number;
  psiquiatra_nome?: string;
  psicologo?: number;
  psicologo_nome?: string;
  status: string;
  especialidade?: string;
  start: string;
  end: string;
  title: string;
}

export default function ConsultasAdmin() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [tab, setTab] = useState<'psicologo' | 'psiquiatra' | 'paciente'>('psicologo');
  
  // Estados para controle do calendário
  const [viewPsicologo, setViewPsicologo] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [datePsicologo, setDatePsicologo] = useState<Date>(new Date());
  const [viewPsiquiatra, setViewPsiquiatra] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [datePsiquiatra, setDatePsiquiatra] = useState<Date>(new Date());

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const res = await fetch(`${getBackendUrl()}/api/agendamentos/`, { credentials: 'include' });
        if (!res.ok) throw new Error('Erro ao buscar consultas');
        const data = await res.json();

        // Processa os dados para criar a estrutura esperada
        const consultasProcessadas = data.map((consulta: any) => {
          // Determina o profissional baseado nos dados do backend
          let profissional: Usuario | undefined;
          let especialidade = '';
          
          if (consulta.psiquiatra && consulta.psiquiatra_nome) {
            profissional = {
              id: consulta.psiquiatra,
              nome: consulta.psiquiatra_nome,
              role: 'Psiquiatra'
            };
            especialidade = 'Psiquiatria';
          } else if (consulta.psicologo && consulta.psicologo_nome) {
            profissional = {
              id: consulta.psicologo,
              nome: consulta.psicologo_nome,
              role: 'Psicologo'
            };
            especialidade = 'Psicologia';
          }

          // Nome do paciente
          const pacienteNome = consulta.usuario_nome || consulta.paciente_nome || 'Paciente não identificado';

          return {
            ...consulta,
            profissional,
            especialidade,
            paciente_nome: pacienteNome,
            // Mantém os campos originais para compatibilidade
            psiquiatra_nome: consulta.psiquiatra_nome,
            psicologo_nome: consulta.psicologo_nome,
            usuario_nome: consulta.usuario_nome
          };
        });

        setConsultas(consultasProcessadas);
      } catch (err: any) {
        setErro(err?.message || 'Erro ao carregar consultas.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, []);

  // Funções para alterar status das consultas
  const handleConfirmar = async () => {
    if (!modalConsulta) return;
    
    try {
      const response = await fetch(`${getBackendUrl()}/api/agendamentos/${modalConsulta.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'confirmado' })
      });
      
      if (!response.ok) throw new Error('Erro ao confirmar consulta');
      
      // Atualiza o estado local
      setConsultas(prev => prev.map(c => 
        c.id === modalConsulta.id ? { ...c, status: 'confirmado' } : c
      ));
      setModalConsulta({ ...modalConsulta, status: 'confirmado' });
    } catch (error) {
      console.error('Erro ao confirmar consulta:', error);
      alert('Erro ao confirmar consulta. Tente novamente.');
    }
  };

  const handleCancelar = async () => {
    if (!modalConsulta) return;
    
    try {
      const response = await fetch(`${getBackendUrl()}/api/agendamentos/${modalConsulta.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'cancelado' })
      });
      
      if (!response.ok) throw new Error('Erro ao cancelar consulta');
      
      // Atualiza o estado local
      setConsultas(prev => prev.map(c => 
        c.id === modalConsulta.id ? { ...c, status: 'cancelado' } : c
      ));
      setModalConsulta({ ...modalConsulta, status: 'cancelado' });
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
      alert('Erro ao cancelar consulta. Tente novamente.');
    }
  };

  const handleAlterarStatus = async () => {
    if (!modalConsulta) return;
    
    try {
      const response = await fetch(`${getBackendUrl()}/api/agendamentos/${modalConsulta.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Concluida' })
      });
      
      if (!response.ok) throw new Error('Erro ao alterar status da consulta');
      
      // Atualiza o estado local
      setConsultas(prev => prev.map(c => 
        c.id === modalConsulta.id ? { ...c, status: 'Concluida' } : c
      ));
      setModalConsulta({ ...modalConsulta, status: 'Concluida' });
    } catch (error) {
      console.error('Erro ao alterar status da consulta:', error);
      alert('Erro ao alterar status da consulta. Tente novamente.');
    }
  };

  // Funções para avaliação
  const handleAvaliar = (agendamentoId: number) => {
    // Fechar TODOS os modais primeiro
    setModalConsulta(null);
    setShowAllModal(false);
    setMostrarAvaliacoes(false);
    setAvaliacaoModalOpen(false);
    
    // Aguardar um tick do React e então buscar avaliações
    setTimeout(() => {
      buscarAvaliacoesEMostrar(agendamentoId);
    }, 0);
  };

  const buscarAvaliacoesEMostrar = async (agendamentoId: number) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/avaliacoes/agendamento/${agendamentoId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const avaliacoes = await response.json();
        setAvaliacoesExistentes(avaliacoes);
        setMostrarAvaliacoes(true);
      } else {
        alert('Erro ao buscar avaliações');
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      alert('Erro de conexão');
    }
  };

  const handleAvaliacaoSuccess = () => {
    alert('Avaliação enviada com sucesso!');
    setAvaliacaoModalOpen(false);
    setAgendamentoParaAvaliar(null);
  };

  const consultasPorPsicologo = consultas.filter(c => c.profissional && c.profissional.role === 'Psicologo');
  const consultasPorPsiquiatra = consultas.filter(c => c.profissional && c.profissional.role === 'Psiquiatra');


  // Estados compartilhados para o calendário customizado
  const today = new Date();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Funções auxiliares para o calendário
  function getMonthMatrix(month: Date) {
    const year = month.getFullYear();
    const monthIdx = month.getMonth();
    const firstDay = new Date(year, monthIdx, 1);
    const lastDay = new Date(year, monthIdx + 1, 0);
    const firstWeekDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const matrix: (Date | null)[][] = [];
    let week: (Date | null)[] = [];
    let dayCount = 1;
    for (let i = 0; i < firstWeekDay; i++) week.push(null);
    while (dayCount <= daysInMonth) {
      week.push(new Date(year, monthIdx, dayCount));
      if (week.length === 7) {
        matrix.push(week);
        week = [];
      }
      dayCount++;
    }
    if (week.length) {
      while (week.length < 7) week.push(null);
      matrix.push(week);
    }
    return matrix;
  }

  function getWeekArray(date: Date) {
    const week: (Date | null)[] = [];
    const start = new Date(date);
    start.setDate(date.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      week.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return [week];
  }

  // Navegação
  const handlePrev = () => {
    if (view === 'month') setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    if (view === 'week') setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
    if (view === 'day') setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
  };
  const handleNext = () => {
    if (view === 'month') setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    if (view === 'week') setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
    if (view === 'day') setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
  };

  // Função para obter eventos agrupados por dia
  function getEventosPorDia(consultas: Consulta[]) {
  const eventos = consultas.map(c => {
    const [ano, mes, dia, hora = '00', min = '00'] = c.data_hora.replace('T', '-').replace(/:/g, '-').split('-');
    const start = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(min));
    let nomePaciente = c.paciente_nome;
    
    if (!nomePaciente || nomePaciente === 'undefined') {
      if (c.especialidade && c.profissional && c.profissional.nome) {
        nomePaciente = `${c.especialidade} - ${c.profissional.nome}`;
      } else if (c.profissional && c.profissional.nome) {
        nomePaciente = c.profissional.nome;
      } else if (c.especialidade) {
        nomePaciente = c.especialidade;
      } else {
        nomePaciente = 'Consulta';
      } 
    }

    let status = c.status || 'pendente';
    return {
      ...c,
      start,
      end: new Date(start.getTime() + 60 * 60 * 1000),  // Assume 1h duration for each event
      title: `${nomePaciente} (${status})`,
      status,
    };
  });

  const eventosPorDia: { [key: string]: typeof eventos } = {};
  eventos.forEach(ev => {
    if (ev.start) {
      const key = format(ev.start, 'yyyy-MM-dd');
      if (!eventosPorDia[key]) eventosPorDia[key] = [];
      eventosPorDia[key].push(ev);
    }
  });

  return { eventos, eventosPorDia };
}


  // Renderização do calendário customizado
  // Modal de detalhes
  const [modalConsulta, setModalConsulta] = useState<null | any>(null);
  // Estados para avaliação
  const [avaliacaoModalOpen, setAvaliacaoModalOpen] = useState(false);
  const [agendamentoParaAvaliar, setAgendamentoParaAvaliar] = useState<number | null>(null);
  const [avaliacoesExistentes, setAvaliacoesExistentes] = useState<any[]>([]);
  const [mostrarAvaliacoes, setMostrarAvaliacoes] = useState(false);

  // --- PADRÃO CONSULTAS_PSIQUIATRAS ---
  // Estados para modal de todas as consultas do dia
  const [showAllModal, setShowAllModal] = useState(false);
  const [allConsultasDia, setAllConsultasDia] = useState<any[]>([]);
  const [allConsultasDiaDate, setAllConsultasDiaDate] = useState<string>("");
  const [allModalPage, setAllModalPage] = useState(1);
  const ALL_MODAL_PER_PAGE = 5;
  const allModalTotalPages = Math.ceil(allConsultasDia.length / ALL_MODAL_PER_PAGE);
  const allModalPaginated = allConsultasDia.slice((allModalPage-1)*ALL_MODAL_PER_PAGE, allModalPage*ALL_MODAL_PER_PAGE);

  function renderCalendario(consultas: Consulta[], titulo: string) {
    const { eventos, eventosPorDia } = getEventosPorDia(consultas);
    let dateMatrix: (Date | null)[][] = [];
    let label = '';
    if (view === 'month') {
      dateMatrix = getMonthMatrix(calendarMonth);
      label = format(calendarMonth, "MMMM 'de' yyyy", { locale: ptBR });
    } else if (view === 'week') {
      dateMatrix = getWeekArray(selectedDate);
      const weekStart = dateMatrix[0][0] as Date;
      const weekEnd = dateMatrix[0][6] as Date;
      label = `${format(weekStart, "dd 'a' ")}${format(weekEnd, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    } else if (view === 'day') {
      dateMatrix = [[selectedDate]];
      label = format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold text-emerald-700 mb-6 text-center bg-gradient-to-r from-indigo-600 via-emerald-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-xl">{titulo}</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2 justify-center md:justify-start">
            <button onClick={() => setView('month')} className={`px-4 py-2 rounded-lg font-bold transition ${view === 'month' ? 'bg-emerald-600 text-white shadow' : 'bg-gray-100 text-emerald-700 hover:bg-emerald-50'}`}>Mês</button>
            <button onClick={() => setView('week')} className={`px-4 py-2 rounded-lg font-bold transition ${view === 'week' ? 'bg-emerald-600 text-white shadow' : 'bg-gray-100 text-emerald-700 hover:bg-emerald-50'}`}>Semana</button>
            <button onClick={() => setView('day')} className={`px-4 py-2 rounded-lg font-bold transition ${view === 'day' ? 'bg-emerald-600 text-white shadow' : 'bg-gray-100 text-emerald-700 hover:bg-emerald-50'}`}>Dia</button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button onClick={handlePrev} className="p-2 rounded-full hover:bg-emerald-100 transition"><ChevronLeftIcon className="w-6 h-6 text-emerald-600" /></button>
            <span className="text-2xl font-bold text-emerald-700 select-none">{label.charAt(0).toUpperCase() + label.slice(1)}</span>
            <button onClick={handleNext} className="p-2 rounded-full hover:bg-emerald-100 transition"><ChevronRightIcon className="w-6 h-6 text-emerald-600" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-emerald-700 font-semibold mb-2">
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(dia => (
            <div key={dia} className="py-2">{dia}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dateMatrix.map((week, i) => (
            week.map((day, j) => {
              const isToday = day && format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              const key = day ? format(day, 'yyyy-MM-dd') : `empty-${i}-${j}`;
              return (
                <div key={key} className={`min-h-[90px] rounded-xl p-1 md:p-2 flex flex-col items-stretch border border-transparent ${isToday ? 'bg-gradient-to-br from-emerald-100 to-indigo-100 border-emerald-300 shadow-lg' : day ? 'bg-gray-50 hover:bg-emerald-50 transition' : 'bg-transparent'}`}>
                  <div className={`text-right text-xs md:text-sm font-bold ${isToday ? 'text-emerald-700' : day ? 'text-gray-700' : 'text-gray-400'}`}>{day ? day.getDate() : ''}</div>
                  <div className="flex flex-col gap-1 mt-1">
                    {day && (() => {
                      const eventos = eventosPorDia[format(day, 'yyyy-MM-dd')] || [];
                      let maxToShow = view === 'month' ? 3 : view === 'week' ? 3 : eventos.length;
                      const toShow = eventos.slice(0, maxToShow);
                      const hiddenCount = eventos.length - maxToShow;
                      return (
                        <>
                          {toShow.map(ev => (
                            <button
                              key={ev.id}
                              onClick={() => setModalConsulta(ev)}
                              className={`w-full text-left px-2 py-1 rounded-lg font-semibold shadow-sm border-2 border-white truncate text-xs md:text-sm ${
                                ev.status === 'confirmado' ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white' : 
                                ev.status === 'pendente' ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900' : 
                                ev.status === 'cancelado' ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white' : 
                                ev.status === 'Concluida' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                                'bg-indigo-200 text-indigo-900'
                              }`}
                              title={ev.title}
                            >
                              <span className="truncate block">{ev.title}</span>
                            </button>
                          ))}
                          {hiddenCount > 0 && (
                            <button
                              className="w-full text-xs mt-1 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-200 transition"
                              onClick={() => {
                                setAllConsultasDia(eventos);
                                setAllConsultasDiaDate(format(day, 'dd/MM/yyyy'));
                                setAllModalPage(1);
                                setShowAllModal(true);
                              }}
                            >
                              +{hiddenCount}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          ))}
        </div>
        {eventos.length === 0 && (
          <div className="text-center text-gray-400 py-8">Nenhum evento neste período</div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-emerald-50 to-white flex flex-col items-center justify-start py-12 px-2 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-indigo-600 via-emerald-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-xl tracking-tight">Consultas Agendadas</h1>
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-100 p-2 md:p-10 ring-1 ring-emerald-100">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setTab('psicologo')}
            className={`px-6 py-2 rounded-xl font-bold transition text-lg shadow ${tab === 'psicologo' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-emerald-700 hover:bg-emerald-50'}`}
          >Consultas com Psicólogos</button>
          <button
            onClick={() => setTab('psiquiatra')}
            className={`px-6 py-2 rounded-xl font-bold transition text-lg shadow ${tab === 'psiquiatra' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-emerald-700 hover:bg-emerald-50'}`}
          >Consultas com Psiquiatras</button>
          <button
            onClick={() => setTab('paciente')}
            className={`px-6 py-2 rounded-xl font-bold transition text-lg shadow ${tab === 'paciente' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-emerald-700 hover:bg-emerald-50'}`}
          >Consultas de Pacientes</button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Carregando consultas...</div>
        ) : erro ? (
          <div className="text-center text-red-600">{erro}</div>
        ) : (
          <div className="flex flex-col items-center">
            {tab === 'psicologo' && renderCalendario(consultasPorPsicologo, 'Consultas com Psicólogos')}
            {tab === 'psiquiatra' && renderCalendario(consultasPorPsiquiatra, 'Consultas com Psiquiatras')}
            {tab === 'paciente' && renderCalendario(consultas, 'Consultas de Pacientes')}
          </div>
        )}
      </div>

      {/* Modal de todas as consultas do dia */}
      {showAllModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white/95 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto p-8 md:p-12 z-10 border border-emerald-200">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-emerald-500 to-cyan-400 bg-clip-text text-transparent text-center">Consultas do dia {allConsultasDiaDate}</h2>
              <div className="space-y-3">
                {allModalPaginated.map(ev => (
                  <div key={ev.id} className={`w-full px-4 py-3 rounded-lg shadow-sm border-2 border-white text-xs md:text-sm mb-2 ${
                    ev.status === 'confirmado' ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white' : 
                    ev.status === 'pendente' ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900' : 
                    ev.status === 'cancelado' ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white' : 
                    ev.status === 'Concluida' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                    'bg-indigo-200 text-indigo-900'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="font-bold text-base md:text-lg">{ev.paciente_nome || '-'}</div>
                        <div className="text-xs">Horário: {ev.start ? format(ev.start, 'HH:mm') : '--:--'}</div>
                        <div className="text-xs">Status: <span className={`${
                          ev.status === 'confirmado' ? 'text-emerald-100' : 
                          ev.status === 'pendente' ? 'text-yellow-900' : 
                          ev.status === 'cancelado' ? 'text-red-100' : 
                          ev.status === 'Concluida' ? 'text-blue-100' :
                          'text-indigo-900'
                        }`}>{ev.status}</span></div>
                      </div>
                      <button
                        onClick={() => { setShowAllModal(false); setModalConsulta(ev); }}
                        className="mt-2 md:mt-0 px-4 py-2 rounded-lg bg-white/80 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition"
                      >Ver detalhes</button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Paginação */}
              {allModalTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    className="px-3 py-1 rounded bg-emerald-100 text-emerald-800 font-bold disabled:opacity-50"
                    onClick={() => setAllModalPage(p => Math.max(1, p-1))}
                    disabled={allModalPage === 1}
                  >Anterior</button>
                  <span className="font-bold text-emerald-700">Página {allModalPage} de {allModalTotalPages}</span>
                  <button
                    className="px-3 py-1 rounded bg-emerald-100 text-emerald-800 font-bold disabled:opacity-50"
                    onClick={() => setAllModalPage(p => Math.min(allModalTotalPages, p+1))}
                    disabled={allModalPage === allModalTotalPages}
                  >Próxima</button>
                </div>
              )}
              <div className="flex justify-center mt-8">
                <button onClick={() => setShowAllModal(false)} className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de detalhes da consulta */}
      {modalConsulta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
            <button onClick={() => setModalConsulta(null)} className="absolute top-3 right-3 text-gray-400 hover:text-emerald-600 text-2xl font-bold">&times;</button>
            <h3 className="text-2xl font-bold mb-4 text-emerald-700">Detalhes da Consulta</h3>
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="font-semibold">Paciente:</span> {
                  modalConsulta.paciente_nome && modalConsulta.paciente_nome !== 'undefined'
                    ? modalConsulta.paciente_nome
                    : (modalConsulta.especialidade && modalConsulta.profissional?.nome)
                      ? `${modalConsulta.especialidade} - ${modalConsulta.profissional?.nome}`
                      : modalConsulta.profissional?.nome
                        ? modalConsulta.profissional.nome
                        : modalConsulta.especialidade || '-'
                }
              </div>
              <div><span className="font-semibold">Profissional:</span> {modalConsulta.profissional?.nome || '-'}</div>
              <div><span className="font-semibold">Especialidade:</span> {modalConsulta.especialidade || '-'}</div>
              <div><span className="font-semibold">Status:</span> <span className={`font-semibold ${
                modalConsulta.status === 'pendente' ? 'text-yellow-600' : 
                modalConsulta.status === 'confirmado' ? 'text-emerald-600' : 
                modalConsulta.status === 'Concluida' ? 'text-blue-600' : 
                'text-red-600'
              }`}>{modalConsulta.status || '-'}</span></div>
              <div><span className="font-semibold">Data/Hora:</span> {modalConsulta.start ? format(modalConsulta.start, "dd/MM/yyyy 'às' HH:mm") : '-'}</div>
              <div><span className="font-semibold">ID da Consulta:</span> {modalConsulta.id}</div>
            </div>
            
            {/* Botões de ação - Admin tem acesso completo */}
            <div className="flex flex-col gap-3 mt-6">
              {modalConsulta?.status !== 'confirmado' && modalConsulta?.status !== 'Concluida' && (
                <button 
                  onClick={handleConfirmar} 
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:from-emerald-600 hover:to-cyan-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  Confirmar Consulta
                </button>
              )}
              
              {modalConsulta?.status === 'confirmado' && (
                <button 
                  onClick={handleAlterarStatus} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Marcar como Concluída
                </button>
              )}
              
              {modalConsulta?.status !== 'cancelado' && modalConsulta?.status !== 'Concluida' && (
                <button 
                  onClick={handleCancelar} 
                  className="bg-gradient-to-r from-yellow-400 to-red-400 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:from-yellow-500 hover:to-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  Cancelar Consulta
                </button>
              )}
              
              {modalConsulta?.status === 'Concluida' && (
                <button 
                  onClick={() => handleAvaliar(modalConsulta.id)} 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:from-purple-600 hover:to-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  ⭐ Ver/Gerenciar Avaliações
                </button>
              )}
              
              {/* Informação para o admin */}
              <div className="text-xs text-gray-500 text-center mt-2">
                Como admin, você pode gerenciar o status de qualquer consulta
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Avaliações Existentes */}
      {mostrarAvaliacoes && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in">
            <button 
              onClick={() => setMostrarAvaliacoes(false)} 
              className="absolute top-3 right-3 text-gray-400 hover:text-emerald-600 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-emerald-700">Avaliações da Consulta</h3>
            
            {avaliacoesExistentes.length > 0 ? (
              <div className="space-y-4">
                {avaliacoesExistentes.map((av: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">
                        {av.tipo_avaliador === 'paciente' ? '👤 Paciente' : '👨‍⚕️ Profissional'}
                      </span>
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-lg mr-2">
                          {'★'.repeat(av.nota)}{'☆'.repeat(5 - av.nota)}
                        </span>
                        <span className="font-bold text-gray-700">{av.nota}/5</span>
                      </div>
                    </div>
                    {av.comentario && (
                      <p className="text-gray-700 italic">"{av.comentario}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Avaliado em: {new Date(av.data_criacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg mb-4">Nenhuma avaliação encontrada para esta consulta.</p>
                <p className="text-gray-500 text-sm">As avaliações aparecem aqui após serem feitas pelos pacientes e profissionais.</p>
              </div>
            )}
            
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => setMostrarAvaliacoes(false)} 
                className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Avaliação */}
      {agendamentoParaAvaliar && (
        <AvaliacaoModal
          isOpen={avaliacaoModalOpen}
          onClose={() => {
            setAvaliacaoModalOpen(false);
            setAgendamentoParaAvaliar(null);
          }}
          agendamentoId={agendamentoParaAvaliar}
          tipoAvaliador="profissional"
          onSuccess={handleAvaliacaoSuccess}
        />
      )}
    </div>
  );
}
