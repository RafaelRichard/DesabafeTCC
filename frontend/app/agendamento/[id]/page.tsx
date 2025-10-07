'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useParams, useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBackendUrl } from '../../utils/backend';
import { loadStripe } from '@stripe/stripe-js';
import { formatDateTimeForBackend } from '../../utils/dateUtils';

interface Profissional {
  id: number;
  nome: string;
  crm?: string;
  crp?: string;
  especializacao?: string;
  email?: string;
  telefone?: string;
  valor_consulta?: number; // Adicionado campo para valor da consulta
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
}

export default function Agendamento() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [dataHora, setDataHora] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [usandoHorariosFixos, setUsandoHorariosFixos] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  // Buscar horários disponíveis ao mudar data/profissional
  useEffect(() => {
    async function fetchHorarios() {
      if (!profissional || !dataSelecionada) return;
      setLoadingHorarios(true);
      const tipo = profissional.crm ? 'psiquiatra' : 'psicologo';
      const dataStr = moment(dataSelecionada).format('YYYY-MM-DD');
      
      try {
        // Buscar horários disponíveis (nova API)
        const urlDisponiveis = `${getBackendUrl()}/api/horarios_disponiveis/?profissional_id=${profissional.id}&tipo=${tipo}&data=${dataStr}`;
        const resDisponiveis = await fetch(urlDisponiveis, { credentials: 'include' });
        
        if (resDisponiveis.ok) {
          const dataDisponiveis = await resDisponiveis.json();
          console.log('Horários disponíveis:', dataDisponiveis);
          setHorariosDisponiveis(dataDisponiveis.horarios_disponiveis || []);
          setUsandoHorariosFixos(dataDisponiveis.usando_horarios_fixos || false);
        } else {
          // Fallback para horários fixos se a API falhar
          setHorariosDisponiveis([]);
          setUsandoHorariosFixos(true);
        }

        // Continuar buscando horários ocupados para compatibilidade
        const urlOcupados = `${getBackendUrl()}/api/horarios_ocupados/?profissional_id=${profissional.id}&tipo=${tipo}&data=${dataStr}`;
        const resOcupados = await fetch(urlOcupados, { credentials: 'include' });
        if (resOcupados.ok) {
          const dataOcupados = await resOcupados.json();
          setHorariosOcupados(dataOcupados);
        } else {
          setHorariosOcupados([]);
        }
      } catch (err) {
        setHorariosOcupados([]);
        setHorariosDisponiveis([]);
        setUsandoHorariosFixos(true);
        console.error('Erro ao buscar horários:', err);
      } finally {
        setLoadingHorarios(false);
      }
    }
    fetchHorarios();
  }, [profissional, dataSelecionada]);
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<'pendente' | 'confirmado' | 'cancelado'>('pendente');
  const [linkConsulta, setLinkConsulta] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingPagamento, setLoadingPagamento] = useState(false);

  // Verifica login e carrega dados do usuário
  useEffect(() => {
    const verificarLogin = async () => {
      try {
        const response = await fetch(`${getBackendUrl()}/usuario_jwt/`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Usuário não autenticado');

        const data = await response.json();
        setUsuario(data);
      } catch (error) {
    toast.warning('Você precisa estar logado para agendar uma consulta.');
        router.push('/login');
      }
    };

    verificarLogin();
  }, []);

  // Busca o profissional
  useEffect(() => {
    async function fetchProfissional() {
      if (!id) return;
      setLoading(true);
      try {
        // Tenta buscar como psiquiatra
        let response = await fetch(`${getBackendUrl()}/api/psiquiatras/${id}/`);
        if (response.ok) {
          const data = await response.json();
          setProfissional(data);
        } else {
          // Se não encontrar, tenta buscar como psicólogo
          response = await fetch(`${getBackendUrl()}/api/psicologos/${id}/`);
          if (response.ok) {
            const data = await response.json();
            setProfissional(data);
          } else {
            setProfissional(null);
          }
        }
      } catch (error) {
        setProfissional(null);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfissional();
  }, [id]);

  // Gera link de consulta automaticamente
  // useEffect(() => {
  //   if (dataHora && profissional) {
  //     const link = `https://consulta-online.com/agendamento-${profissional.id}-${dataHora}`;
  //     setLinkConsulta(link);
  //   }
  // }, [dataHora, profissional]);

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario || !profissional) {
      toast.error('Dados insuficientes para agendamento.');
      return;
    }

    // Revalida o horário antes de enviar
    setLoadingHorarios(true);
    const tipo = profissional.crm ? 'psiquiatra' : 'psicologo';
    const dataStr = moment(dataSelecionada).format('YYYY-MM-DD');
    let horariosAtualizados: string[] = [];
    try {
      const res = await fetch(`/api/horarios_ocupados/?profissional_id=${profissional.id}&tipo=${tipo}&data=${dataStr}`);
      if (res.ok) {
        horariosAtualizados = await res.json();
      }
    } catch {}
    setLoadingHorarios(false);
    const slotEscolhido = moment(dataHora).format('HH:mm');
    if (horariosAtualizados.includes(slotEscolhido)) {
      toast.error('Este horário acabou de ser ocupado. Por favor, escolha outro.');
      // Atualiza a lista de horários ocupados na tela
      setHorariosOcupados(horariosAtualizados);
      setDataHora('');
      return;
    }

    // O backend espera: usuario, psiquiatra ou psicologo, data_hora, status, observacoes
    const agendamento = {
      usuario: usuario.id,
      ...(profissional.crm ? { psiquiatra: profissional.id } : { psicologo: profissional.id }),
      // CORREÇÃO: Usar utilitário para formatação consistente
      data_hora: formatDateTimeForBackend(dataHora),
      status,
      observacoes,
      // NÃO envie link_consulta - o backend irá gerar automaticamente com Jitsi Meet
    };

    try {
      const response = await fetch(`${getBackendUrl()}/api/agendamentos/criar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(agendamento),
      });

      if (!response.ok) throw new Error('Erro ao agendar consulta');
      const agendamentoCriado = await response.json();
      // Busca o agendamento pelo ID para pegar o link gerado
      if (agendamentoCriado && agendamentoCriado.id) {
        const res = await fetch(`${getBackendUrl()}/api/agendamentos/${agendamentoCriado.id}/`);
        if (res.ok) {
          const agendamentoDetalhado = await res.json();
          setLinkConsulta(agendamentoDetalhado.link_consulta || '');
        }
      }
      toast.success('Consulta agendada com sucesso!', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
      // Adiciona o horário escolhido à lista de ocupados localmente
      const novoHorario = moment(dataHora).format('HH:mm');
      setHorariosOcupados(prev => prev.includes(novoHorario) ? prev : [...prev, novoHorario]);
      // Não redireciona imediatamente, deixa o usuário ver o link
      // setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao agendar a consulta.', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  // Função para iniciar o pagamento Stripe
  // Corrigido: sempre cria o agendamento antes de chamar o pagamento
  const handlePagamento = async () => {
    if (!usuario || !profissional) {
      toast.error('Dados insuficientes para pagamento.', {
        position: 'top-center',
        autoClose: 4000,
      });
      return;
    }
    
    setLoadingPagamento(true);
    setLoadingHorarios(true);
    const tipo = profissional.crm ? 'psiquiatra' : 'psicologo';
    const dataStr = moment(dataSelecionada).format('YYYY-MM-DD');
    let horariosAtualizados: string[] = [];
    try {
      const res = await fetch(`/api/horarios_ocupados/?profissional_id=${profissional.id}&tipo=${tipo}&data=${dataStr}`);
      if (res.ok) {
        horariosAtualizados = await res.json();
      }
    } catch {}
    setLoadingHorarios(false);
    const slotEscolhido = moment(dataHora).format('HH:mm');
    if (horariosAtualizados.includes(slotEscolhido)) {
      toast.error('Este horário acabou de ser ocupado. Por favor, escolha outro.', {
        position: 'top-center',
        autoClose: 4000,
      });
      setHorariosOcupados(horariosAtualizados);
      setDataHora('');
      return;
    }
    // 1. Cria o agendamento pendente primeiro
    let agendamentoId = null;
    try {
      const agendamento = {
        usuario: usuario.id,
        ...(profissional.crm ? { psiquiatra: profissional.id } : { psicologo: profissional.id }),
        // CORREÇÃO: Usar utilitário para formatação consistente
        data_hora: formatDateTimeForBackend(dataHora),
        status: 'pendente',
        observacoes,
        // NÃO enviar link_consulta - o backend irá gerar automaticamente com Jitsi Meet
      };
      const response = await fetch(`${getBackendUrl()}/api/agendamentos/criar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(agendamento),
      });
  if (!response.ok) throw new Error('Erro ao criar agendamento antes do pagamento.');
  const agendamentoCriado = await response.json();
  agendamentoId = agendamentoCriado.id;
  // Adiciona o horário escolhido à lista de ocupados localmente
  const novoHorario = moment(dataHora).format('HH:mm');
  setHorariosOcupados(prev => prev.includes(novoHorario) ? prev : [...prev, novoHorario]);
    } catch (err) {
      setLoadingPagamento(false);
      toast.error('Erro ao criar agendamento antes do pagamento.', {
        position: 'top-center',
        autoClose: 4000,
      });
      return;
    }
    // 2. Só então chama o pagamento Stripe
    const valorConsulta = profissional.valor_consulta ? Number(profissional.valor_consulta) : 200;
    try {
      const res = await fetch(`${getBackendUrl()}/api/stripe/pagamento/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_produto: `Consulta com ${profissional.nome}`,
          preco: valorConsulta,
          profissional_id: profissional.id,
          usuario_id: usuario.id,
        }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setLoadingPagamento(false);
        toast.error(data.error || 'Erro ao criar pagamento Stripe.', {
          position: 'top-center',
          autoClose: 4000,
        });
      }
    } catch (err) {
      setLoadingPagamento(false);
      toast.error('Erro ao conectar com o servidor de pagamento.', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  if (loading) return <p className="text-center mt-10">Carregando profissional...</p>;
  if (!profissional) return <p className="text-center mt-10 text-red-500">Profissional não encontrado.</p>;
  if (!usuario) return null; // Espera carregar dados do usuário

  return (
    <>
      {/* Modal de Loading para Pagamento */}
      {loadingPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
            <p className="text-xl font-semibold text-gray-800">Direcionando para área de pagamento</p>
            <p className="text-sm text-gray-600">Aguarde um momento...</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto mt-20 p-8 bg-white rounded-lg shadow-xl">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">
        Agendar Consulta com {profissional.nome}
      </h1>

      {/* Informações do Médico */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informações do Médico(a)</h2>
        <p><strong>Nome:</strong> {profissional.nome || '-'}</p>
        {/* Exibe CRM apenas se houver */}
        {profissional.crm && (
          <p><strong>CRM:</strong> {profissional.crm}</p>
        )}
        {/* Exibe CRP apenas se houver */}
        {profissional.crp && (
          <p><strong>CRP:</strong> {profissional.crp}</p>
        )}
        <p><strong>Especialização:</strong> {profissional.especializacao || '-'}</p>
        {profissional.email && <p><strong>Email:</strong> {profissional.email}</p>}
        {profissional.telefone && <p><strong>Telefone:</strong> {profissional.telefone}</p>}
      </div>

      {/* Informações do Usuário */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informações do Paciente</h2>
        <p><strong>Nome:</strong> {usuario.nome || '-'}</p>
        <p><strong>Email:</strong> {usuario.email || '-'}</p>
        <p><strong>Telefone:</strong> {usuario.telefone || '-'}</p>
        {/* Se a API retornar CPF ou outros dados relevantes, exiba também: */}
        {usuario.cpf && <p><strong>CPF:</strong> {usuario.cpf}</p>}
      </div>

      {/* Formulário */}
      <form onSubmit={handleAgendar} className="space-y-8">
        {/* Data e Hora (Calendário) */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-2">Selecione o dia e horário</label>
          <input
            type="date"
            value={moment(dataSelecionada).format('YYYY-MM-DD')}
            onChange={e => setDataSelecionada(new Date(e.target.value + 'T00:00:00'))}
            className="w-60 border border-gray-300 p-2 rounded mb-4"
            min={moment().format('YYYY-MM-DD')}
          />
          <div style={{ height: 400 }}>
            {loadingHorarios ? (
              <div className="flex items-center justify-center h-40">
                <span className="text-indigo-600 font-semibold animate-pulse">Carregando horários disponíveis...</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {!usandoHorariosFixos && horariosDisponiveis.length > 0 ? (
                  // Renderiza horários cadastrados pelo profissional
                  horariosDisponiveis.map((horarioStr) => {
                    const slot = moment(dataSelecionada).set({
                      hour: parseInt(horarioStr.split(':')[0]),
                      minute: parseInt(horarioStr.split(':')[1]),
                      second: 0,
                      millisecond: 0
                    });
                    const slotFull = slot.format('YYYY-MM-DDTHH:mm');
                    const agora = moment();
                    const slotIsPast = slot.isBefore(agora);
                    const indisponivel = slotIsPast || loadingHorarios;
                    
                    return (
                      <button
                        key={horarioStr}
                        type="button"
                        disabled={indisponivel}
                        onClick={() => {
                          if (indisponivel) return;
                          setDataHora(slotFull);
                          toast.success('Horário selecionado: ' + slot.format('DD/MM/YYYY HH:mm'));
                        }}
                        className={`w-full py-2 rounded font-semibold border text-sm transition-all duration-150
                          ${indisponivel
                            ? 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed opacity-70'
                            : (dataHora === slotFull
                                ? 'bg-green-600 text-white border-green-700 shadow-lg scale-105'
                                : 'bg-white text-gray-800 border-gray-300 hover:bg-green-50 hover:border-green-400')}
                        `}
                        style={{ minWidth: 0 }}
                      >
                        {horarioStr}<br/>
                        {indisponivel ? 
                          <span className="text-xs font-normal">Indisponível</span> : 
                          <span className="text-xs font-normal text-green-700">Disponível</span>}
                      </button>
                    );
                  })
                ) : (
                  // Fallback para horários fixos (8h às 17h30)
                  Array.from({ length: 20 }, (_, i) => {
                    const hour = 8 + Math.floor(i / 2);
                    const minute = i % 2 === 0 ? 0 : 30;
                    const slot = moment(dataSelecionada).set({ hour, minute, second: 0, millisecond: 0 });
                    const slotStr = slot.format('HH:mm');
                    const slotFull = slot.format('YYYY-MM-DDTHH:mm');
                    const ocupado = horariosOcupados.some(h => slot.format('HH:mm') === h);
                    const agora = moment();
                    const slotIsPast = slot.isBefore(agora);
                    const indisponivel = ocupado || slotIsPast || loadingHorarios;
                    
                    return (
                      <button
                        key={slotStr}
                        type="button"
                        disabled={indisponivel}
                        onClick={() => {
                          if (indisponivel) return;
                          setDataHora(slotFull);
                          toast.success('Horário selecionado: ' + slot.format('DD/MM/YYYY HH:mm'));
                        }}
                        className={`w-full py-2 rounded font-semibold border text-sm transition-all duration-150
                          ${indisponivel
                            ? 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed opacity-70'
                            : (dataHora === slotFull
                                ? 'bg-green-600 text-white border-green-700 shadow-lg scale-105'
                                : 'bg-white text-gray-800 border-gray-300 hover:bg-green-50 hover:border-green-400')}
                        `}
                        style={{ minWidth: 0 }}
                      >
                        {slot.format('HH:mm')}<br/>
                        {indisponivel ? 
                          <span className="text-xs font-normal">Indisponível</span> : 
                          <span className="text-xs font-normal text-green-700">Disponível</span>}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
          {dataHora && (
            <div className="mt-2 text-green-700 font-semibold">Horário escolhido: {moment(dataHora).format('DD/MM/YYYY HH:mm')}</div>
          )}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Clique em um horário livre para selecionar</span>
            <span>Horários em vermelho estão ocupados</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Status do Agendamento</label>
          <select
            value={status}
            disabled
            className="w-full border border-gray-300 p-4 rounded-lg mt-2 bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            <option value="pendente">Pendente</option>
          </select>
        </div>

        {/* Link da Consulta */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Link para Consulta Online</label>
          <input
            type="url"
            value={linkConsulta}
            readOnly
            className="w-full border border-gray-300 p-4 rounded-lg mt-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Observações */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Observações (opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            rows={5}
          />
        </div>

        {/* Botão */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={handlePagamento}
            className={`px-10 py-4 rounded-lg focus:outline-none focus:ring-2 transition duration-300 mr-4 ${
              loadingPagamento 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-600'
            } text-white`}
            disabled={!dataHora || loadingHorarios || loadingPagamento || horariosOcupados.includes(moment(dataHora).format('HH:mm'))}
          >
            {loadingPagamento ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              'Agendar e Pagar Consulta'
            )}
          </button>
          {/* <button
            type="submit"
            className="bg-indigo-600 text-white px-10 py-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-300"
            disabled={!dataHora || loadingHorarios || horariosOcupados.includes(moment(dataHora).format('HH:mm'))}
          >
            Confirmar Agendamento (sem pagamento)
          </button> */}
        </div>
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
    </>
  );
}
