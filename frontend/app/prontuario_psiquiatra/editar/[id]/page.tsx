"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBackendUrl } from '../../../utils/backend';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditarProntuario() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [prontuario, setProntuario] = useState<any>(null);
  const [texto, setTexto] = useState("");
  const [mensagemPaciente, setMensagemPaciente] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagemSalvar, setMensagemSalvar] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setMensagem("");
    fetch(`${getBackendUrl()}/api/prontuarios/${id}/`, {
      credentials: 'include',
    })
      .then(async (resp) => {
        const text = await resp.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          toast.error("Resposta do backend não é JSON: " + text);
          setLoading(false);
          return;
        }
        if (!resp.ok) {
          toast.error(data?.error || "Erro ao buscar prontuário");
          setLoading(false);
          return;
        }
        setProntuario(data);
        setTexto(data.texto || "");
        setMensagemPaciente(data.mensagem_paciente || "");
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Erro ao buscar prontuário: " + err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSalvar = async () => {
    setSalvando(true);
    setMensagemSalvar("");
    try {
      const resp = await fetch(`${getBackendUrl()}/api/prontuarios/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ texto, mensagem_paciente: mensagemPaciente }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Erro ao salvar prontuário");
      toast.success("Prontuário salvo com sucesso!", {
        onClose: () => router.push('/prontuario_psiquiatra'),
        autoClose: 2000
      });
    } catch (err: any) {
      toast.error("Erro ao salvar prontuário: " + (err.message || err), { autoClose: 4000 });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    toast.info("Carregando prontuário...", { autoClose: 1500 });
    return <div className="text-center text-blue-700 py-16 text-lg">Carregando prontuário...</div>;
  }
  if (mensagem) {
    toast.error(mensagem, { autoClose: 4000 });
    return <div className="text-center text-red-500 py-16 text-lg">{mensagem}</div>;
  }
  if (!prontuario) return null;

  const isCancelada = prontuario?.agendamento?.status === 'cancelado';
  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 py-14 px-6">
        <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-md border border-indigo-100 p-10 rounded-3xl shadow-2xl">
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-10">
            ✏️ Editar Prontuário
          </h1>

          <div className="flex justify-center mb-6">
            <a
              href="https://prescricaoeletronica.cfm.org.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow"
              title="Abrir Prescrição Eletrônica em nova aba"
            >
              Abrir Prescrição / Atestado (Prescrição Eletrônica)
            </a>
          </div>

          {isCancelada && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6 text-center font-semibold">
              Não é possível editar o prontuário de uma consulta cancelada.
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); if (!isCancelada) handleSalvar(); }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Paciente</label>
                <input
                  type="text"
                  value={prontuario.paciente.nome}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={prontuario.paciente.email}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={prontuario.paciente.telefone}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Data da Consulta</label>
                <input
                  type="text"
                  value={new Date(prontuario.agendamento.data_hora).toLocaleString()}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <input
                  type="text"
                  value={prontuario.agendamento.status}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observação</label>
                <input
                  type="text"
                  value={prontuario.agendamento.observacoes || '-'}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Texto do Prontuário (Privado, só o psiquiatra vê)</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={texto}
                onChange={e => setTexto(e.target.value)}
                disabled={salvando || isCancelada}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mensagem para o Paciente</label>
              <textarea
                className="w-full px-4 py-3 border border-green-300 rounded-xl shadow-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={mensagemPaciente}
                onChange={e => setMensagemPaciente(e.target.value)}
                disabled={salvando || isCancelada}
                placeholder="Escreva aqui uma mensagem que o paciente poderá ler."
              />
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/prontuario_psiquiatra')}
                className="w-full md:w-auto px-6 py-3 rounded-xl border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition"
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition shadow-md"
                disabled={salvando || isCancelada}
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
