"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { format as formatDate } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

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

export default function ConsultasPsiquiatras() {
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
  const [selectedConsulta, setSelectedConsulta] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const today = new Date();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Gera matriz de dias do mês para o grid
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

  // Gera matriz de dias da semana para o grid
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

  // Eventos agrupados por dia
  const eventosPorDia: { [key: string]: ConsultaEvent[] } = {};
  consultas.forEach((ev: ConsultaEvent) => {
    if (ev.start) {
      const key = format(ev.start, 'yyyy-MM-dd');
      if (!eventosPorDia[key]) eventosPorDia[key] = [];
      eventosPorDia[key].push(ev);
    }
  });

  // Matriz de datas para renderização
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

  // Função para buscar novamente as consultas
  const fetchConsultas = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/agendamentos_profissional/", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao buscar consultas");
      const data = await res.json();
      const eventos = data.map((c: any) => {
        let start: Date | null = null;
        let end: Date | null = null;
        if (c.data && c.hora) {
          const dataHora = `${c.data}T${c.hora.length === 5 ? c.hora + ':00' : c.hora}`;
          start = new Date(dataHora);
          end = new Date(start.getTime() + 60 * 60 * 1000);
        }
        return {
          ...c,
          title: `${c.paciente?.nome || ''} (${c.status})`,
          start,
          end,
          link_consulta: c.link_consulta || '', // Usa sempre o valor do backend
        };
      }).filter((ev: any) => {
        const valido = ev.start instanceof Date && !isNaN(ev.start) && ev.end instanceof Date && !isNaN(ev.end);
        return valido;
      });
      setConsultas(eventos);
    } catch (err) {
      setConsultas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultas();
  }, []);

  // Função para buscar o agendamento completo
  const fetchAgendamentoById = async (id: number) => {
    const res = await fetch(`http://localhost:8000/api/agendamentos/${id}/`);
    if (!res.ok) throw new Error('Erro ao buscar agendamento');
    return await res.json();
  };

  // Função para abrir modal ao clicar no evento
  const handleSelectEvent = (event: any) => {
    setSelectedConsulta(event);
    setModalOpen(true);
  };

  // Função para confirmar agendamento
  const handleConfirmar = async () => {
    if (!selectedConsulta) return;
    try {
      const agendamentoCompleto = await fetchAgendamentoById(selectedConsulta.id);
      const atualizado = { ...agendamentoCompleto, status: 'confirmado' };
      const res = await fetch(`http://localhost:8000/api/agendamentos/${selectedConsulta.id}/atualizar/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(atualizado),
      });
      if (!res.ok) throw new Error('Erro ao confirmar agendamento');
      toast.success('Agendamento confirmado!');
      setModalOpen(false);
      fetchConsultas();
    } catch (err) {
      toast.error('Erro ao confirmar agendamento.');
    }
  };

  // Função para cancelar agendamento
  const handleCancelar = async () => {
    if (!selectedConsulta) return;
    try {
      const agendamentoCompleto = await fetchAgendamentoById(selectedConsulta.id);
      const atualizado = { ...agendamentoCompleto, status: 'cancelado' };
      const res = await fetch(`http://localhost:8000/api/agendamentos/${selectedConsulta.id}/atualizar/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(atualizado),
      });
      if (!res.ok) throw new Error('Erro ao cancelar agendamento');
      toast.success('Agendamento cancelado!');
      setModalOpen(false);
      fetchConsultas();
    } catch (err) {
      toast.error('Erro ao cancelar agendamento.');
    }
  };

  // Função para excluir agendamento
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-emerald-50 to-white flex flex-col items-center justify-start py-12 px-2 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-indigo-600 via-emerald-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-xl tracking-tight">Minhas Consultas</h1>
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
                    {day && eventosPorDia[format(day, 'yyyy-MM-dd')]?.map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => handleSelectEvent(ev)}
                        className={`truncate text-xs md:text-sm px-2 py-1 rounded-lg font-semibold shadow-sm border-2 border-white text-left ${ev.status === 'confirmado' ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white' : ev.status === 'pendente' ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900' : ev.status === 'cancelado' ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white' : 'bg-indigo-200 text-indigo-900'}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          ))}
        </div>
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
                  <div><b>Status:</b> <span className={`font-semibold ${selectedConsulta.status === 'pendente' ? 'text-yellow-600' : selectedConsulta.status === 'confirmado' ? 'text-emerald-600' : 'text-red-600'}`}>{selectedConsulta.status}</span></div>
                  {selectedConsulta.observacao && <div><b>Observação:</b> {selectedConsulta.observacao}</div>}
                  {selectedConsulta.link_consulta && <div><b>Link da Consulta:</b> <a href={selectedConsulta.link_consulta} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-900 transition">Acessar Consulta</a></div>}
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
              {selectedConsulta?.status === 'pendente' && (
                <>
                  <button onClick={handleConfirmar} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:from-emerald-600 hover:to-cyan-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400">Confirmar</button>
                  <button onClick={handleCancelar} className="bg-gradient-to-r from-yellow-400 to-red-400 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:from-yellow-500 hover:to-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400">Desmarcar</button>
                </>
              )}
              <button onClick={handleExcluir} className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:from-red-600 hover:to-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-400">Excluir</button>
              <button onClick={() => setModalOpen(false)} className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300">Fechar</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
