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
  const [linkAtestado, setLinkAtestado] = useState("");
  const [linkReceita, setLinkReceita] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [baixandoAtestado, setBaixandoAtestado] = useState(false);
  const [baixandoReceita, setBaixandoReceita] = useState(false);
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

  const handleBaixarPdf = async (link: string, tipo: 'atestado' | 'receita') => {
    if (!link.trim()) {
      toast.error(`Link do ${tipo} não pode estar vazio`);
      return;
    }

    // Validação básica de URL
    try {
      new URL(link);
    } catch {
      toast.error(`Link do ${tipo} inválido`);
      return;
    }

    // Define qual estado de loading usar
    const setBaixando = tipo === 'atestado' ? setBaixandoAtestado : setBaixandoReceita;
    
    setBaixando(true);
    try {
      const resp = await fetch(`${getBackendUrl()}/api/prontuarios/${id}/baixar-pdf/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          link_pdf: link, 
          tipo: tipo 
        }),
      });

      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data?.error || `Erro ao baixar ${tipo}`);
      }

      toast.success(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} baixado e salvo com sucesso!`);
      
      // Limpar o campo após sucesso
      if (tipo === 'atestado') {
        setLinkAtestado("");
      } else {
        setLinkReceita("");
      }

      // Atualizar prontuário sem reload - buscar dados atualizados
      const respProntuario = await fetch(`${getBackendUrl()}/api/prontuarios/${id}/`, {
        credentials: 'include',
      });
      
      if (respProntuario.ok) {
        const prontuarioAtualizado = await respProntuario.json();
        setProntuario(prontuarioAtualizado);
      }
      
    } catch (err: any) {
      toast.error(`Erro ao baixar ${tipo}: ` + (err.message || err));
    } finally {
      setBaixando(false);
    }
  };

  const handleEnviarEmail = async () => {
    if (!prontuario.mensagem_paciente && !prontuario.atestado_pdf && !prontuario.receita_pdf) {
      toast.error("Não há conteúdo para enviar (mensagem ou documentos)");
      return;
    }

    setEnviandoEmail(true);
    try {
      const resp = await fetch(`${getBackendUrl()}/api/prontuarios/${id}/enviar-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data?.error || "Erro ao enviar email");
      }

      toast.success(`Email enviado com sucesso para ${data.destinatario}!`, {
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
        <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-md border border-indigo-100 p-10 rounded-3xl shadow-2xl">
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

            {/* Seção de Anexos de PDF */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">📄 Anexar Documentos PDF</h3>
              <p className="text-sm text-blue-600 mb-4">
                Cole os links dos PDFs gerados pela Prescrição Eletrônica. Os arquivos serão baixados automaticamente e salvos com segurança.
              </p>
              
              {/* Link do Atestado */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Link do Atestado (PDF)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkAtestado}
                    onChange={e => setLinkAtestado(e.target.value)}
                    className="flex-1 px-4 py-3 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://prescricaoeletronica.cfm.org.br/..."
                    disabled={baixandoAtestado || baixandoReceita || isCancelada || enviandoEmail}
                  />
                  <button
                    type="button"
                    onClick={() => handleBaixarPdf(linkAtestado, 'atestado')}
                    disabled={baixandoAtestado || baixandoReceita || !linkAtestado.trim() || isCancelada || enviandoEmail}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    {baixandoAtestado ? "Baixando..." : "Baixar"}
                  </button>
                </div>
              </div>

              {/* Link da Receita */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Link da Receita (PDF)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkReceita}
                    onChange={e => setLinkReceita(e.target.value)}
                    className="flex-1 px-4 py-3 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://prescricaoeletronica.cfm.org.br/..."
                    disabled={baixandoAtestado || baixandoReceita || isCancelada || enviandoEmail}
                  />
                  <button
                    type="button"
                    onClick={() => handleBaixarPdf(linkReceita, 'receita')}
                    disabled={baixandoAtestado || baixandoReceita || !linkReceita.trim() || isCancelada || enviandoEmail}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    {baixandoReceita ? "Baixando..." : "Baixar"}
                  </button>
                </div>
              </div>

              {/* Arquivos já salvos */}
              {(prontuario.atestado_pdf || prontuario.receita_pdf) && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-2">📁 Documentos Salvos:</h4>
                  <div className="space-y-2">
                    {prontuario.atestado_pdf && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-700">✅ Atestado</span>
                        <a
                          href={`${getBackendUrl()}${prontuario.atestado_pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Visualizar
                        </a>
                      </div>
                    )}
                    {prontuario.receita_pdf && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-700">✅ Receita</span>
                        <a
                          href={`${getBackendUrl()}${prontuario.receita_pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Visualizar
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botão para enviar por email */}
            {(prontuario.mensagem_paciente || prontuario.atestado_pdf || prontuario.receita_pdf) && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-3">📧 Enviar para o Paciente</h4>
                <p className="text-sm text-green-700 mb-4">
                  Envie a mensagem e os documentos salvos diretamente para o email do paciente ({prontuario.paciente.email}).
                </p>
                <button
                  type="button"
                  onClick={handleEnviarEmail}
                  disabled={enviandoEmail || isCancelada}
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
                  {prontuario.mensagem_paciente && "✓ Mensagem será incluída"} {prontuario.mensagem_paciente && (prontuario.atestado_pdf || prontuario.receita_pdf) && " • "}
                  {prontuario.atestado_pdf && "✓ Atestado anexado"} {prontuario.atestado_pdf && prontuario.receita_pdf && " • "}
                  {prontuario.receita_pdf && "✓ Receita anexada"}
                </p>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/prontuario_psiquiatra')}
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
