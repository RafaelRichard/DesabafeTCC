"use client";

import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "pt-BR": ptBR,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

interface ConsultaEvent extends Event {
  paciente: string;
  status: string;
  observacao?: string;
}

export default function ConsultasPsicologos() {
  const [consultas, setConsultas] = useState<ConsultaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/agendamentos_profissional/", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erro ao buscar consultas");
        const data = await res.json();
        // Transforma para eventos do calendário
        const eventos = data.map((c: any) => ({
          title: `${c.paciente} (${c.status})`,
          start: new Date(`${c.data}T${c.hora}`),
          end: new Date(`${c.data}T${c.hora}`),
          paciente: c.paciente,
          status: c.status,
          observacao: c.observacao,
        }));
        setConsultas(eventos);
      } catch (err) {
        setConsultas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultas();
  }, []);

  // Handlers para navegação e mudança de visualização
  const handleNavigate = (newDate: Date) => setDate(newDate);
  const handleView = (newView: string) => setView(newView);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-700 tracking-tight drop-shadow-lg">Minhas Consultas</h1>
      <div className="backdrop-blur-xl bg-white/70 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 rounded-3xl shadow-2xl border border-indigo-100 p-2 md:p-10 overflow-x-auto ring-1 ring-indigo-100">
        {loading ? (
          <div className="text-center text-lg text-indigo-400 py-24 font-semibold animate-pulse">Carregando...</div>
        ) : (
          <div style={{ minWidth: 700 }}>
            <Calendar
              localizer={localizer}
              culture="pt-BR"
              events={consultas}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 680, background: 'transparent', borderRadius: 32, fontFamily: 'inherit', width: '100%', boxShadow: '0 8px 32px 0 rgba(99,102,241,0.12)' }}
              messages={{
                next: "Próximo",
                previous: "Anterior",
                today: "Hoje",
                month: "Mês",
                week: "Semana",
                day: "Dia",
                agenda: "Agenda",
                date: "Data",
                time: "Hora",
                event: "Consulta",
                noEventsInRange: "Nenhuma consulta neste período.",
              }}
              tooltipAccessor={(event: any) => `${event.paciente} - ${event.status}${event.observacao ? ' - ' + event.observacao : ''}`}
              eventPropGetter={(event: any) => {
                let bg = 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)';
                let glow = '0 0 16px 2px #6366f1cc';
                let icon = '\u25CF';
                if (event.status === 'confirmado') {
                  bg = 'linear-gradient(90deg, #16a34a 0%, #22d3ee 100%)';
                  glow = '0 0 16px 2px #16a34acc';
                  icon = '\u2714';
                }
                if (event.status === 'cancelado') {
                  bg = 'linear-gradient(90deg, #dc2626 0%, #f43f5e 100%)';
                  glow = '0 0 16px 2px #dc2626cc';
                  icon = '\u2716';
                }
                if (event.status === 'pendente') {
                  bg = 'linear-gradient(90deg, #f59e42 0%, #fbbf24 100%)';
                  glow = '0 0 16px 2px #f59e42cc';
                  icon = '\u23F3';
                }
                return {
                  style: {
                    background: bg,
                    color: '#fff',
                    borderRadius: '16px',
                    border: 'none',
                    padding: '8px 18px 8px 36px',
                    fontWeight: 700,
                    fontSize: '1.08rem',
                    boxShadow: glow,
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 8px rgba(0,0,0,0.10)',
                    position: 'relative',
                  },
                  className: `event-status-icon-${event.status}`
                }
              }}
              components={{
                event: ({ event }: any) => (
                  <span style={{ position: 'relative', paddingLeft: 0 }}>
                    <span style={{
                      position: 'absolute',
                      left: -22,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 18,
                      opacity: 0.85,
                      filter: 'drop-shadow(0 0 6px #fff8)'
                    }}>
                      {event.status === 'confirmado' && <span title="Confirmado">✔️</span>}
                      {event.status === 'cancelado' && <span title="Cancelado">✖️</span>}
                      {event.status === 'pendente' && <span title="Pendente">⏳</span>}
                      {(!['confirmado','cancelado','pendente'].includes(event.status)) && <span>●</span>}
                    </span>
                    {event.title}
                  </span>
                )
              }}
              className="rounded-3xl shadow-2xl border border-indigo-100 calendar-futuristic"
              view={view}
              date={date}
              onNavigate={handleNavigate}
              onView={handleView}
            />
          </div>
        )}
      </div>
    </div>
  );
}
