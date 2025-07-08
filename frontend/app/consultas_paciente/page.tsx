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
  profissional: any;
  status: string;
  observacao?: string;
  title: string;
  start: Date;
  end: Date;
  link_consulta?: string;
}

export default function ConsultasPaciente() {
  const [consultas, setConsultas] = useState<ConsultaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsulta, setSelectedConsulta] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const today = new Date();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

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
      // Busca o token JWT salvo no localStorage (ajuste a chave se necessário)
      const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
      console.log('Token JWT enviado:', token); // DEBUG
      const res = await fetch("http://localhost:8000/api/agendamentos_paciente/", {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 401 || res.status === 403) {
        toast.error('Sessão expirada. Faça login novamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        setConsultas([]);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Erro ao buscar consultas");
      const data = await res.json();
      console.log('Agendamentos recebidos:', data);
      const eventos = data.map((c: any) => {
        let start: Date | null = null;
        let end: Date | null = null;
        // Preferir data_iso se existir
        if (c.data_iso) {
          start = new Date(c.data_iso);
          end = new Date(start.getTime() + 60 * 60 * 1000);
        } else if (c.data && c.hora) {
          const dataHora = `${c.data}T${c.hora.length === 5 ? c.hora + ':00' : c.hora}`;
          start = new Date(dataHora);
          end = new Date(start.getTime() + 60 * 60 * 1000);
        }
        return {
          ...c,
          title: `${c.profissional?.nome || ''} (${c.status})`,
          start,
          end,
          link_consulta: c.link_consulta || '',
        };
      }).filter((ev: any) => {
        const valido = ev.start instanceof Date && !isNaN(ev.start) && ev.end instanceof Date && !isNaN(ev.end);
        return valido;
      });
      setConsultas(eventos);
    } catch (err) {
      toast.error('Erro ao buscar consultas. Faça login novamente.');
      setConsultas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultas();
  }, []);

  const fetchAgendamentoById = async (id: number) => {
    // Busca o token JWT salvo no localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    const res = await fetch(`http://localhost:8000/api/agendamentos/${id}/`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 401 || res.status === 403) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    if (!res.ok) throw new Error('Erro ao buscar agendamento');
    return await res.json();
  };

  const handleSelectEvent = (event: any) => {
    setSelectedConsulta(event);
    setModalOpen(true);
  };

  const handleCancelar = async () => {
    if (!selectedConsulta) return;
    try {
      const agendamentoCompleto = await fetchAgendamentoById(selectedConsulta.id);
      const atualizado = { ...agendamentoCompleto, status: 'cancelado' };
      const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
      const res = await fetch(`http://localhost:8000/api/agendamentos/${selectedConsulta.id}/atualizar/`, {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(atualizado),
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (!res.ok) throw new Error('Erro ao cancelar agendamento');
      toast.success('Agendamento cancelado!');
      setModalOpen(false);
      fetchConsultas();
    } catch (err: any) {
      if (err.message && err.message.includes('Sessão expirada')) {
        toast.error('Sessão expirada. Faça login novamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        toast.error('Erro ao cancelar agendamento.');
      }
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
                    Profissional
                    <span className="inline-block bg-emerald-200 text-emerald-700 text-xs px-2 py-1 rounded-full ml-2">ID: {selectedConsulta.profissional?.id}</span>
                  </div>
                  <div><b>Nome:</b> {selectedConsulta.profissional?.nome}</div>
                  <div><b>Email:</b> <a href={`mailto:${selectedConsulta.profissional?.email}`} className="text-blue-700 underline hover:text-blue-900 transition">{selectedConsulta.profissional?.email}</a></div>
                  <div><b>Telefone:</b> <a href={`tel:${selectedConsulta.profissional?.telefone}`} className="text-blue-700 underline hover:text-blue-900 transition">{selectedConsulta.profissional?.telefone}</a></div>
                  <div><b>Tipo:</b> {selectedConsulta.profissional?.role}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                  <div><b>Data:</b> {selectedConsulta.start ? formatDate(selectedConsulta.start, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }) : '-'}</div>
                  <div><b>Status:</b> <span className={`font-semibold ${selectedConsulta.status === 'pendente' ? 'text-yellow-600' : selectedConsulta.status === 'confirmado' ? 'text-emerald-600' : 'text-red-600'}`}>{selectedConsulta.status}</span></div>
                  {selectedConsulta.observacao && <div><b>Observação:</b> {selectedConsulta.observacao}</div>}
                  {selectedConsulta.link_consulta && (
                    <div>
                      <b>Link da Consulta:</b> <a href={selectedConsulta.link_consulta} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-900 transition">Acessar Consulta</a>
                      <div className="mt-4">
                        <iframe
                          src={selectedConsulta.link_consulta}
                          style={{ width: '100%', height: 400, border: 0, borderRadius: 12 }}
                          allow="camera; microphone; fullscreen; display-capture"
                          title="Jitsi Meet"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-4 mt-10 justify-center">
              {selectedConsulta?.status === 'pendente' && (
                <>
                  <button onClick={handleCancelar} className="bg-gradient-to-r from-yellow-400 to-red-400 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:from-yellow-500 hover:to-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400">Cancelar</button>
                </>
              )}
              <button onClick={() => setModalOpen(false)} className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-300">Fechar</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
