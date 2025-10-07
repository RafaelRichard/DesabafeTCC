"use client";

import { useEffect, useState } from "react";
import { refundAgendamentoStripe } from "../utils/backend";
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { format as formatDate, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import AvaliacaoModal from '../components/AvaliacaoModal';
import { convertAgendamentosToEvents } from '../utils/dateUtils';

interface ConsultaEvent {
  id: number;
  paciente: any;
  status: string;
  observacao?: string;
  title: string;
  start: Date;
  end: Date;
  link_consulta?: string;
}

export default function ConsultasPsicologos() {
  // Exibe toast de sucesso/erro após redirecionamento do pagamento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      if (status === 'sucesso') {
        toast.success('Pagamento realizado com sucesso!');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (status === 'erro') {
        toast.error('Ocorreu um erro no pagamento. Tente novamente.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);
  const [consultas, setConsultas] = useState<ConsultaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Estados para avaliação
  const [avaliacaoModalOpen, setAvaliacaoModalOpen] = useState(false);
  const [agendamentoParaAvaliar, setAgendamentoParaAvaliar] = useState<number | null>(null);
  const [consultasAvaliaveis, setConsultasAvaliaveis] = useState<Set<number>>(new Set());
  
  const today = new Date();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  // Modal para mostrar todas as consultas do dia
  const [showAllModal, setShowAllModal] = useState(false);
  const [allConsultasDia, setAllConsultasDia] = useState<ConsultaEvent[]>([]);
  const [allConsultasDiaDate, setAllConsultasDiaDate] = useState<string>("");
  // Paginação para o modal de todas as consultas do dia
  const [allModalPage, setAllModalPage] = useState(1);
  const ALL_MODAL_PER_PAGE = 5;
  const allModalTotalPages = Math.ceil(allConsultasDia.length / ALL_MODAL_PER_PAGE);
  const allModalPaginated = allConsultasDia.slice((allModalPage-1)*ALL_MODAL_PER_PAGE, allModalPage*ALL_MODAL_PER_PAGE);

  // Função para obter a classe CSS baseada no status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmado':
        return 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white';
      case 'pendente':
        return 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900';
      case 'cancelado':
        return 'bg-gradient-to-r from-red-400 to-pink-400 text-white';
      case 'Concluida':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      default:
        return 'bg-indigo-200 text-indigo-900';
    }
  };

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

  const eventosPorDia: { [key: string]: ConsultaEvent[] } = {};
  consultas.forEach((ev: ConsultaEvent) => {
    if (ev.start) {
      const key = format(ev.start, 'yyyy-MM-dd');
      if (!eventosPorDia[key]) eventosPorDia[key] = [];
      eventosPorDia[key].push(ev);
    }
  });

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

  const fetchConsultas = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/agendamentos_profissional/?tipo=psicologo", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao buscar consultas");
      const data = await res.json();
      
      // CORREÇÃO: Usar utilitário padronizado para conversão
      const eventos = convertAgendamentosToEvents(data, 'paciente');
      setConsultas(eventos);
      
      // Verificar quais consultas concluídas podem ser avaliadas
      const concluidas = eventos.filter(ev => ev.status === 'Concluida');
      if (concluidas.length > 0) {
        verificarConsultasAvaliaveis(concluidas.map(c => c.id));
      } else {
        setConsultasAvaliaveis(new Set());
      }
    } catch (err) {
      setConsultas([]);
      setConsultasAvaliaveis(new Set());
    } finally {
      setLoading(false);
    }
  };

  const verificarConsultasAvaliaveis = async (ids: number[]) => {
    const avaliaveis = new Set<number>();
    
    // Verificar em paralelo todas as consultas concluídas
    const promessas = ids.map(async (id) => {
      try {
        const response = await fetch(`http://localhost:8000/api/avaliacoes/pode-avaliar/${id}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.pode_avaliar) {
            avaliaveis.add(id);
          }
        }
      } catch (error) {
        console.error(`Erro ao verificar se pode avaliar consulta ${id}:`, error);
      }
    });
    
    await Promise.all(promessas);
    setConsultasAvaliaveis(avaliaveis);
  };

  useEffect(() => {
    fetchConsultas();
  }, []);

  const fetchAgendamentoById = async (id: number) => {
    const res = await fetch(`http://localhost:8000/api/agendamentos/${id}/`);
    if (!res.ok) throw new Error('Erro ao buscar agendamento');
    return await res.json();
  };

  const handleSelectEvent = (event: any) => {
    setSelectedConsulta(event);
    setModalOpen(true);
  };

  const handleConfirmar = async () => {
    await handleAlterarStatus('confirmado', 'Agendamento confirmado!');
  };

  // Função genérica para alterar status
  const handleAlterarStatus = async (novoStatus: string, mensagemSucesso: string) => {
    if (!selectedConsulta) return;
    try {
      const agendamentoCompleto = await fetchAgendamentoById(selectedConsulta.id);
      const atualizado = { ...agendamentoCompleto, status: novoStatus };
      const res = await fetch(`http://localhost:8000/api/agendamentos/${selectedConsulta.id}/atualizar/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(atualizado),
      });
      if (!res.ok) throw new Error('Erro ao atualizar agendamento');
      toast.success(mensagemSucesso);
      setModalOpen(false);
      fetchConsultas();
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Erro ao atualizar agendamento');
    }
  };

  const handleCancelar = async () => {
    if (!selectedConsulta) return;
    setCancelando(true);
    try {
      await refundAgendamentoStripe(selectedConsulta.id);
      toast.success('Estorno realizado e agendamento cancelado!');
      setModalOpen(false);
      fetchConsultas();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cancelar/estornar agendamento.');
    } finally {
      setCancelando(false);
    }
  };

  const handleExcluir = async () => {
    if (!selectedConsulta) return;
    try {
      const res = await fetch(`http://localhost:8000/api/agendamentos/${selectedConsulta.id}/deletar/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok && res.status !== 204) throw new Error('Erro ao excluir agendamento');
      toast.success('Agendamento excluído!');
      setModalOpen(false);
      fetchConsultas();
    } catch (err) {
      toast.error('Erro ao excluir agendamento.');
    }
  };

  // Funções para avaliação
  const handleAvaliar = (agendamentoId: number) => {
    // Fechar o modal de detalhes da consulta
    setModalOpen(false);
    setSelectedConsulta(null);
    
    // Abrir modal de avaliação diretamente (já verificamos antes)
    setAgendamentoParaAvaliar(agendamentoId);
    setAvaliacaoModalOpen(true);
  };

  const handleAvaliacaoSuccess = () => {
    toast.success('Avaliação enviada com sucesso!');
    setAvaliacaoModalOpen(false);
    setAgendamentoParaAvaliar(null);
    fetchConsultas();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-emerald-50 to-white flex flex-col items-center justify-start py-12 px-2 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-indigo-600 via-emerald-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-xl tracking-tight">Minhas Consultas (Psicólogos)</h1>
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-100 p-2 md:p-10 ring-1 ring-emerald-100">
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
                      if (view === 'month') {
                        const maxToShow = 2;
                        const toShow = eventos.slice(0, maxToShow);
                        const hiddenCount = eventos.length - maxToShow;
                        return (
                          <>
                            {toShow.map(ev => (
                              <button
                                key={ev.id}
                                onClick={() => handleSelectEvent(ev)}
                                className={`w-full text-left px-2 py-1 rounded-lg font-semibold shadow-sm border-2 border-white truncate text-xs md:text-sm ${getStatusColor(ev.status)}`}
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
                      } else if (view === 'week') {
                        const maxToShow = 3;
                        const toShow = eventos.slice(0, maxToShow);
                        const hiddenCount = eventos.length - maxToShow;
                        return (
                          <>
                            {toShow.map(ev => (
                              <button
                                key={ev.id}
                                onClick={() => handleSelectEvent(ev)}
                                className={`w-full text-left px-2 py-1 rounded-lg font-semibold shadow-sm border-2 border-white truncate text-xs md:text-sm ${
                                  ev.status === 'confirmado' ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white' : 
                                  ev.status === 'pendente' ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900' : 
                                  ev.status === 'cancelado' ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white' : 
                                  ev.status === 'Concluida' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                                  'bg-indigo-200 text-indigo-900'
                                }`}
                                title={ev.title}
                                style={{ minHeight: 32 }}
                              >
                                <span className="block truncate">
                                  <span className="font-bold">{ev.start ? format(ev.start, 'HH:mm') : '--:--'}</span> - {ev.paciente?.nome || ''}
                                  <span className={`ml-2 text-xs font-semibold ${
                                    ev.status === 'confirmado' ? 'text-emerald-900' : 
                                    ev.status === 'pendente' ? 'text-yellow-700' : 
                                    ev.status === 'cancelado' ? 'text-red-700' : 
                                    ev.status === 'Concluida' ? 'text-blue-700' :
                                    'text-indigo-900'
                                  }`}>({ev.status})</span>
                                </span>
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
                      } else if (view === 'day') {
                        return eventos.map(ev => (
                          <button
                            key={ev.id}
                            onClick={() => handleSelectEvent(ev)}
                            className={`w-full text-left px-2 py-1 rounded-lg font-semibold shadow-sm border-2 border-white text-sm md:text-base ${ev.status === 'confirmado' ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white' : ev.status === 'pendente' ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900' : ev.status === 'cancelado' ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white' : 'bg-indigo-200 text-indigo-900'}`}
                            title={ev.title}
                          >
                            <div className="text-left space-y-1">
                              <div className="font-bold text-emerald-800">{ev.paciente?.nome || ''}</div>
                              <div className="text-xs text-gray-700">Horário: {ev.start ? format(ev.start, 'HH:mm') : '--:--'}</div>
                              <div className="text-xs font-semibold">
                                Status: <span className={`${ev.status === 'confirmado' ? 'text-emerald-700' : ev.status === 'pendente' ? 'text-yellow-700' : ev.status === 'cancelado' ? 'text-red-700' : 'text-indigo-900'}`}>{ev.status}</span>
                              </div>
                              {ev.observacao && <div className="text-xs text-gray-600">Obs: {ev.observacao}</div>}
                              {ev.link_consulta && ev.status !== 'cancelado' && (
                                <a href={ev.link_consulta} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline hover:text-blue-900">Acessar Consulta</a>
                              )}
                            </div>
                          </button>
                        ));
                      }
                      return null;
                    })()}
                  </div>
                </div>
              );
            })
          ))}
        </div>
      {/* Modal para mostrar todas as consultas do dia */}
      <Dialog open={showAllModal} onClose={() => setShowAllModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Panel className="relative bg-white/95 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto p-8 md:p-12 z-10 border border-emerald-200">
            <Dialog.Title as="h2" className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-emerald-500 to-cyan-400 bg-clip-text text-transparent text-center">Consultas do dia {allConsultasDiaDate}</Dialog.Title>
            <div className="space-y-3">
              {allModalPaginated.map(ev => (
                <div key={ev.id} className={`w-full px-4 py-3 rounded-lg shadow-sm border-2 border-white text-xs md:text-sm mb-2 ${ev.status === 'confirmado' ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white' : ev.status === 'pendente' ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900' : ev.status === 'cancelado' ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white' : 'bg-indigo-200 text-indigo-900'}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-bold text-base md:text-lg">{ev.paciente?.nome || ''}</div>
                      <div className="text-xs">Horário: {ev.start ? format(ev.start, 'HH:mm') : '--:--'}</div>
                      <div className="text-xs">Status: <span className={`${ev.status === 'confirmado' ? 'text-emerald-100' : ev.status === 'pendente' ? 'text-yellow-900' : ev.status === 'cancelado' ? 'text-red-100' : 'text-indigo-900'}`}>{ev.status}</span></div>
                      {ev.observacao && <div className="text-xs">Obs: {ev.observacao}</div>}
                      {ev.link_consulta && ev.status !== 'cancelado' && (
                        <a href={ev.link_consulta} target="_blank" rel="noopener noreferrer" className="text-xs underline hover:text-blue-200">Acessar Consulta</a>
                      )}
                    </div>
                    <button
                      onClick={() => { setShowAllModal(false); handleSelectEvent(ev); }}
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
          </Dialog.Panel>
        </div>
      </Dialog>
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 animate-pulse">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-emerald-500 font-semibold">Carregando...</span>
          </div>
        )}
      </div>
      {/* Modal de detalhes do agendamento */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-2 sm:px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Panel className="relative bg-white/95 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto p-8 md:p-12 z-10 border border-emerald-200">
            <Dialog.Title as="h2" className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-emerald-500 to-cyan-400 bg-clip-text text-transparent text-center">Detalhes do Agendamento</Dialog.Title>
            {selectedConsulta && (
              <div className="space-y-4 text-lg">
                <div className="bg-emerald-50 rounded-xl p-4 shadow-sm border border-emerald-100">
                  <div className="font-bold text-emerald-800 text-xl mb-2 flex items-center gap-2">
                    Paciente
                    <span className="inline-block bg-emerald-200 text-emerald-700 text-xs px-2 py-1 rounded-full ml-2">ID: {selectedConsulta.paciente?.id}</span>
                  </div>
                  <div><b>Nome:</b> {selectedConsulta.paciente?.nome}</div>
                  <div><b>Email:</b> <a href={`mailto:${selectedConsulta.paciente?.email}`} className="text-blue-700 underline hover:text-blue-900 transition">{selectedConsulta.paciente?.email}</a></div>
                  <div><b>Telefone:</b> <a href={`tel:${selectedConsulta.paciente?.telefone}`} className="text-blue-700 underline hover:text-blue-900 transition">{selectedConsulta.paciente?.telefone}</a></div>
                  <div><b>Status:</b> {selectedConsulta.paciente?.status}</div>
                  <div><b>Tipo:</b> {selectedConsulta.paciente?.role}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                  <div><b>Data:</b> {selectedConsulta.start ? formatDate(selectedConsulta.start, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }) : '-'}</div>
                  <div><b>Status:</b> <span className={`font-semibold ${
                    selectedConsulta.status === 'pendente' ? 'text-yellow-600' : 
                    selectedConsulta.status === 'confirmado' ? 'text-emerald-600' : 
                    selectedConsulta.status === 'Concluida' ? 'text-blue-600' : 
                    'text-red-600'
                  }`}>{selectedConsulta.status}</span></div>
                  {selectedConsulta.observacao && <div><b>Observação:</b> {selectedConsulta.observacao}</div>}
                  {/* Removido link duplicado, mantido bloco abaixo que trata status cancelado */}
                {selectedConsulta.link_consulta && (
                  <div>
                    <b>Link da Consulta:</b>{' '}
                    {selectedConsulta.status === 'cancelado' ? (
                      <span className="text-gray-400 cursor-not-allowed" title="Consulta cancelada - link desabilitado">Acessar Consulta (cancelada)</span>
                    ) : (
                      <a href={selectedConsulta.link_consulta} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-900 transition">Acessar Consulta</a>
                    )}
                  </div>
                )}
                </div>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-4 mt-10 justify-center">
              {(selectedConsulta?.status === 'pendente' || selectedConsulta?.status === 'paga') && (
                <>
                  <button onClick={handleConfirmar} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:from-emerald-600 hover:to-cyan-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400">Confirmar</button>
                  <button 
                    onClick={handleCancelar} 
                    disabled={cancelando}
                    className="bg-gradient-to-r from-yellow-400 to-red-400 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:from-yellow-500 hover:to-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {cancelando ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Desmarcando...
                      </>
                    ) : (
                      'Desmarcar'
                    )}
                  </button>
                </>
              )}
              {selectedConsulta?.status === 'confirmado' && (
                <button 
                  onClick={() => handleAlterarStatus('Concluida', 'Consulta marcada como concluída!')} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Marcar como Concluída
                </button>
              )}
              {selectedConsulta?.status === 'Concluida' && consultasAvaliaveis.has(selectedConsulta.id) && (
                <button 
                  onClick={() => handleAvaliar(selectedConsulta.id)} 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:from-purple-600 hover:to-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  ⭐ Avaliar Paciente
                </button>
              )}
              {selectedConsulta?.status === 'cancelado' && (
                <button onClick={handleExcluir} className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:from-red-600 hover:to-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-400">Excluir</button>
              )}
              <button onClick={() => setModalOpen(false)} className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300">Fechar</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

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
