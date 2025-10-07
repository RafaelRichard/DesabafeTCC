"use client";

"use client";



import { useEffect, useState } from "react";
import { getBackendUrl, formatarDataHora } from '../utils/backend';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


interface Paciente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  status: string;
  role: string;
}

interface Agendamento {
  id: number;
  data_hora: string;
  data_hora_local?: string;
  status: string;
  link_consulta: string;
  observacoes: string;
  data_criacao: string;
  usuario: number;
  usuario_nome: string;
  psiquiatra: number | null;
  psiquiatra_nome: string | null;
  psicologo: number | null;
  psicologo_nome: string | null;
}


interface Prontuario {
  id: number;
  agendamento: Agendamento;
  paciente: Paciente;
  texto: string;
  data_criacao: string;
  data_atualizacao: string;
}

function BarChartSVG({ data }: { data: { status: string; count: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const barHeight = 32;
  const chartHeight = data.length * (barHeight + 16) + 20;
  return (
    <svg width={360} height={chartHeight} viewBox={`0 0 360 ${chartHeight}`} className="mx-auto">
      {data.map((slice, i) => {
        const barWidth = (slice.count / max) * 220;
        const y = 20 + i * (barHeight + 16);
        return (
          <g key={slice.status}>
            {/* Status text, vertically centered and further left */}
            <text x={10} y={y + barHeight / 2 + 6} fontSize={16} fontWeight={700} fill="#333" alignmentBaseline="middle">{slice.status}</text>
            {/* Bar */}
            <rect x={110} y={y} width={barWidth} height={barHeight} rx={10} fill={slice.color} />
            {/* Count text, vertically centered at end of bar */}
            <text x={120 + barWidth} y={y + barHeight / 2 + 6} fontSize={16} fontWeight={700} fill="#333" alignmentBaseline="middle">{slice.count}</text>
          </g>
        );
      })}
    </svg>
  );
}




export default function ProntuarioPsicologo() {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verificarAutenticacaoEBuscarProntuarios = async () => {
      setLoading(true);
      setMensagem("");
      try {
        // 1. Verifica se o usuário está autenticado e pega os dados do usuário
        const usuarioResp = await fetch(`${getBackendUrl()}/usuario_jwt/`, {
          credentials: 'include',
        });
        if (!usuarioResp.ok) {
          router.push("/login");
          return;
        }
        const usuarioData = await usuarioResp.json();
        if (usuarioData.role === "Psicologo") {
          setIsLoggedIn(true);
          setUserName(usuarioData.nome || usuarioData.email);
          setFoto(usuarioData.foto || null);
        } else {
          router.push("/login");
          return;
        }
        // 2. Busca os prontuários autenticado (cookie HttpOnly)
        const prontuariosResp = await fetch(`${getBackendUrl()}/api/prontuarios/`, {
          credentials: 'include',
        });
        const text = await prontuariosResp.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          setMensagem("Resposta do backend não é JSON: " + text);
          return;
        }
        if (!prontuariosResp.ok) {
          throw new Error("Erro ao buscar prontuários: " + (data?.detail || prontuariosResp.status));
        }
        setProntuarios(data);
        if (!Array.isArray(data) || data.length === 0) {
          setMensagem("Nenhum prontuário retornado pelo backend.");
        } else {
          // Set initial tab to first status found
          setActiveStatus(data[0]?.agendamento?.status || null);
        }
      } catch (error: any) {
        setMensagem("Erro ao carregar prontuários: " + (error.message || error));
      } finally {
        setLoading(false);
      }
    };
    verificarAutenticacaoEBuscarProntuarios();
  }, [router]);

  // Agrupa por status do agendamento
  const grouped = prontuarios.reduce<Record<string, Prontuario[]>>((acc, p) => {
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

  if (loading) {
    return <p className="text-center text-lg text-blue-700 mt-20">Carregando prontuários...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-12">
      <div className="flex flex-col items-center mb-8">
        {foto ? (
          <img
            src={foto ? `${getBackendUrl()}/${foto}` : "/img/logo.png"}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full object-cover border-4 border-white mb-2 shadow"
          />
        ) : (
          <img
            src="/img/logo.png"
            alt="Foto padrão"
            className="w-24 h-24 rounded-full object-cover border-4 border-white mb-2 shadow"
          />
        )}
        <h2 className="text-2xl font-semibold text-blue-800 mt-2">{userName && `Psicólogo: ${userName}`}</h2>
      </div>
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8 tracking-tight drop-shadow-lg">Meus Prontuários</h1>

      {/* Gráfico de barras estatístico */}
      <div className="flex flex-col items-center mb-10 bg-white/80 border border-blue-200 rounded-2xl shadow-lg px-8 py-8 max-w-2xl mx-auto">
        <span className="text-xl font-bold text-blue-700 mb-4 tracking-tight">Distribuição por Status</span>
        <BarChartSVG data={stats} />
      </div>

      {/* Tabs */}
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

      {/* Lista por Aba */}
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
                  <h3 className="text-xl font-extrabold text-blue-800 mb-2 tracking-tight drop-shadow-lg">{prontuario.paciente.nome}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium text-blue-600">Email:</span> {prontuario.paciente.email}</p>
                    <p><span className="font-medium text-blue-600">CPF:</span> {prontuario.paciente.cpf}</p>
                    <p><span className="font-medium text-blue-600">Telefone:</span> {prontuario.paciente.telefone}</p>
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    <p><span className="font-medium text-blue-700">Motivo/Observação:</span> {prontuario.agendamento.observacoes || '-'}</p>
                    <p><span className="font-medium text-blue-700">Data:</span> {formatarDataHora(prontuario.agendamento.data_hora_local || prontuario.agendamento.data_hora)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-blue-100 pt-4 mt-4">
                  <Link href={`/prontuario_psicologo/editar/${prontuario.id}`} legacyBehavior>
                    <a className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-1 drop-shadow">
                      <span>✏️</span> Editar
                    </a>
                  </Link>
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