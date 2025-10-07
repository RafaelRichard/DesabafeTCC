"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBackendUrl, formatarDataHora } from '../../../utils/backend';
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
  const [enviandoEmail, setEnviandoEmail] = useState(false);
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

  const handleEnviarEmail = async () => {
    const mensagemAtual = mensagemPaciente.trim();
    const textoAtual = texto.trim();
    
    if (!mensagemAtual && !textoAtual) {
      toast.error("Não há conteúdo para enviar. Preencha a mensagem para o paciente ou o texto do prontuário.");
      return;
    }

    // Salvar primeiro para garantir que os dados estão atualizados
    if (mensagemAtual !== (prontuario?.mensagem_paciente || "") || textoAtual !== (prontuario?.texto || "")) {
      toast.info("Salvando alterações antes de enviar...");
      try {
        const respSalvar = await fetch(`${getBackendUrl()}/api/prontuarios/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ texto: textoAtual, mensagem_paciente: mensagemAtual }),
        });
        
        if (!respSalvar.ok) {
          const errorData = await respSalvar.json();
          throw new Error(errorData?.error || "Erro ao salvar antes de enviar");
        }
      } catch (err: any) {
        toast.error("Erro ao salvar alterações: " + (err.message || err));
        return;
      }
    }

    setEnviandoEmail(true);
    try {
      const body = {
        mensagem_paciente: mensagemAtual,
        texto: textoAtual,
      };

      console.log("Enviando email com dados:", body); // Log para debug

      const resp = await fetch(`${getBackendUrl()}/api/prontuarios/${id}/enviar-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.error || "Erro ao enviar email");
      }

      toast.success(`Email enviado com sucesso para ${data.destinatario || prontuario.paciente.email}!`, {
        autoClose: 4000
      });

    } catch (err: any) {
      toast.error(`Erro ao enviar email: ` + (err.message || err));
    } finally {
      setEnviandoEmail(false);
    }
  };

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
        onClose: () => router.push('/prontuario_psicologo'),
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
        <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md border border-indigo-100 p-10 rounded-3xl shadow-2xl">
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-10">
            ✏️ Editar Prontuário Psicológico
          </h1>

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
                  value={formatarDataHora(prontuario.agendamento.data_hora_local || prontuario.agendamento.data_hora)}
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Texto do Prontuário (Privado, só o psicólogo vê)</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={texto}
                onChange={e => setTexto(e.target.value)}
                disabled={salvando || isCancelada || enviandoEmail}
                placeholder="Registre suas observações psicológicas, evolução do paciente, técnicas utilizadas, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mensagem para o Paciente</label>
              <textarea
                className="w-full px-4 py-3 border border-green-300 rounded-xl shadow-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                value={mensagemPaciente}
                onChange={e => setMensagemPaciente(e.target.value)}
                disabled={salvando || isCancelada || enviandoEmail}
                placeholder="Escreva aqui orientações, feedback ou mensagens que o paciente poderá ler."
              />
            </div>

            {/* Botão para enviar por email */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h4 className="font-semibold text-green-800 mb-3">📧 Enviar para o Paciente</h4>
              <p className="text-sm text-green-700 mb-4">
                Envie as orientações e mensagens diretamente para o email do paciente ({prontuario.paciente.email}).
              </p>
              {!(mensagemPaciente || texto) && (
                <p className="text-sm text-yellow-700 mb-4 bg-yellow-100 p-2 rounded">
                  ⚠️ Preencha pelo menos uma "Mensagem para o Paciente" ou "Texto do Prontuário" para enviar por email.
                </p>
              )}
              <button
                type="button"
                onClick={handleEnviarEmail}
                disabled={enviandoEmail || isCancelada || !(mensagemPaciente || texto)}
                className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {enviandoEmail ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    📧 Enviar por Email
                  </>
                )}
              </button>
              <p className="text-xs text-green-600 mt-2">
                {mensagemPaciente && "✓ Mensagem será incluída"}
                {mensagemPaciente && texto && " • "}
                {texto && "✓ Orientações psicológicas serão incluídas"}
                {!(mensagemPaciente || texto) && "Preencha os campos acima para enviar"}
              </p>
            </div>

            {/* Informações sobre psicólogos */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">ℹ️ Informações Profissionais</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>• Relatórios Psicológicos:</strong> Como psicólogo(a), você pode elaborar relatórios e pareceres técnicos.</p>
                <p><strong>• Sigilo Profissional:</strong> Mantenha sempre a confidencialidade conforme o Código de Ética.</p>
                <p><strong>• Orientações:</strong> Use a mensagem para o paciente para dar feedback e orientações.</p>
                <p><strong>• Documentação:</strong> Registre adequadamente as sessões e evolução do tratamento.</p>
                <p><strong>• Restrições:</strong> Psicólogos não prescrevem medicamentos nem emitem atestados médicos.</p>
              </div>
            </div>


            <div className="flex flex-col md:flex-row justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/prontuario_psicologo')}
                className="w-full md:w-auto px-6 py-3 rounded-xl border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition"
                disabled={salvando || enviandoEmail}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition shadow-md"
                disabled={salvando || isCancelada || enviandoEmail}
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