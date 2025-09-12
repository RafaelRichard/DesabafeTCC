"use client";

import { useEffect, useState } from "react";

function getBackendUrl() {
  // Ajuste conforme sua configuração real
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
}

export default function ProntuarioPacienteListagem() {
  const [prontuarios, setProntuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");


  // Agrupa por status do agendamento
  const grouped = prontuarios.reduce<Record<string, any[]>>((acc, p) => {
    const status = p.agendamento.status || 'Desconhecido';
    if (!acc[status]) acc[status] = [];
    acc[status].push(p);
    return acc;
  }, {});
  const statuses = Object.keys(grouped);
  const COLORS = ['#6366f1', '#22c55e', '#f59e42', '#e11d48', '#7c3aed', '#0ea5e9'];
  const stats = statuses.map((status, idx) => ({
    status,
    count: grouped[status].length,
    color: COLORS[idx % COLORS.length]
  }));
  const [activeStatus, setActiveStatus] = useState<string | null>(statuses[0] || null);

  useEffect(() => {
    const fetchProntuarios = async () => {
      setLoading(true);
      setMensagem("");
      try {
        const resp = await fetch(`${getBackendUrl()}/api/prontuarios/`, {
          credentials: "include",
        });
        const text = await resp.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          setMensagem("Resposta do backend não é JSON: " + text);
          setLoading(false);
          return;
        }
        if (!resp.ok) {
          throw new Error(data?.error || resp.status);
        }
        setProntuarios(data);
        if (!Array.isArray(data) || data.length === 0) {
          setMensagem("Nenhum prontuário retornado pelo backend.");
        }
      } catch (error: any) {
        setMensagem("Erro ao carregar prontuários: " + (error?.message || String(error)));
      } finally {
        setLoading(false);
      }
    };
    fetchProntuarios();
  }, []);

  useEffect(() => {
    if (statuses.length > 0) {
      setActiveStatus((prev) => (prev && statuses.includes(prev) ? prev : statuses[0]));
    } else {
      setActiveStatus(null);
    }
  }, [statuses]);

  if (loading) {
    return <p className="text-center text-lg text-blue-700 mt-20">Carregando prontuários...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-12">
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8 tracking-tight drop-shadow-lg">Meus Prontuários</h1>

      {/* Gráfico de barras estatístico */}
      {prontuarios.length > 0 && (
        <div className="flex flex-col items-center mb-10 bg-white/80 border border-blue-200 rounded-2xl shadow-lg px-8 py-8 max-w-2xl mx-auto">
          <span className="text-xl font-bold text-blue-700 mb-4 tracking-tight">Distribuição por Status</span>
          <svg width={360} height={Math.max(1, stats.length) * 48 + 20} viewBox={`0 0 360 ${Math.max(1, stats.length) * 48 + 20}`} className="mx-auto">
            {stats.map((slice, i) => {
              const barWidth = (slice.count / Math.max(...stats.map(s => s.count), 1)) * 220;
              const y = 20 + i * 48;
              return (
                <g key={slice.status}>
                  <text x={10} y={y + 16} fontSize={16} fontWeight={700} fill="#333" alignmentBaseline="middle">{slice.status}</text>
                  <rect x={110} y={y} width={barWidth} height={32} rx={10} fill={slice.color} />
                  <text x={120 + barWidth} y={y + 16} fontSize={16} fontWeight={700} fill="#333" alignmentBaseline="middle">{slice.count}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Tabs */}
      {statuses.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mb-10 bg-white/70 border border-blue-100 rounded-xl shadow px-4 py-4">
          {statuses.map((status, idx) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-6 py-2.5 rounded-full font-semibold border backdrop-blur-md shadow-md transition
                ${activeStatus === status
                  ? 'bg-blue-700 text-white border-blue-700 scale-105'
                  : 'bg-white/60 text-blue-700 border-blue-300 hover:bg-blue-100'
                }`}
            >
              {status} <span className="ml-2 inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-bold">{grouped[status].length}</span>
            </button>
          ))}
        </div>
      )}

      {mensagem && (
        <div className="bg-red-100 text-red-800 rounded p-3 text-center font-semibold shadow mb-4 max-w-2xl mx-auto">
          {mensagem}
        </div>
      )}

      {activeStatus && grouped[activeStatus] && grouped[activeStatus].length > 0 ? (
        <div>
          <h2 className="text-3xl font-semibold text-center text-blue-700 mb-8 capitalize drop-shadow-lg">
            {activeStatus}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {grouped[activeStatus].map((prontuario) => (
              <div
                key={prontuario.id}
                className="bg-white/95 border border-blue-300 rounded-3xl shadow-2xl p-7 backdrop-blur-md transition-all hover:scale-[1.05] hover:shadow-blue-400 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow bg-blue-100 text-blue-800">{prontuario.agendamento.status}</span>
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    <p><span className="font-medium text-blue-700">Motivo/Observação:</span> {prontuario.agendamento.observacoes || '-'}</p>
                    <p><span className="font-medium text-blue-700">Data:</span> {new Date(prontuario.agendamento.data_hora).toLocaleString()}</p>
                  </div>
                  {prontuario.mensagem_paciente && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <span className="block text-green-700 font-semibold mb-1">Mensagem do Psiquiatra:</span>
                      <span className="text-green-900 whitespace-pre-line">{prontuario.mensagem_paciente}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Nenhum prontuário encontrado.</p>
      )}
    </div>
  );
}
