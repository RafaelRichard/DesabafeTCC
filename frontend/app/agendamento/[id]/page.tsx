'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBackendUrl } from '../../utils/backend';

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
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<'pendente' | 'confirmado' | 'cancelado'>('pendente');
  const [linkConsulta, setLinkConsulta] = useState('');
  const [loading, setLoading] = useState(true);

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
        toast.error('Você precisa estar logado para acessar esta página.');
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

    // O backend espera: usuario, psiquiatra, data_hora, status, observacoes
    const agendamento = {
      usuario: usuario.id, // campo correto para paciente
      psiquiatra: profissional.id, // campo correto para profissional (psiquiatra ou psicologo)
      data_hora: dataHora,
      status,
      observacoes,
      // NÃO envie link_consulta, o backend irá gerar
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
      toast.success('Consulta agendada com sucesso!');
      // Não redireciona imediatamente, deixa o usuário ver o link
      // setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao agendar a consulta.');
    }
  };

  // Função para iniciar o pagamento Mercado Pago
  const handlePagamento = async () => {
    if (!usuario || !profissional) {
      toast.error('Dados insuficientes para pagamento.');
      return;
    }
    const valorConsulta = profissional.valor_consulta ? Number(profissional.valor_consulta) : 200;
    try {
      const res = await fetch(`${getBackendUrl()}/api/mercadopago/pagamento/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_produto: `Consulta com ${profissional.nome}`,
          preco: valorConsulta,
          quantidade: 1,
          profissional_id: profissional.id,
        }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        // Salva o agendamento no backend antes de redirecionar para o pagamento
        const agendamento = {
          usuario: usuario.id,
          psiquiatra: profissional.id,
          data_hora: dataHora,
          status: 'pendente',
          observacoes,
          link_consulta: linkConsulta,
        };
        await fetch(`${getBackendUrl()}/api/agendamentos/criar/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(agendamento),
        });
        window.location.href = data.checkout_url;
      } else {
        toast.error(data.error || 'Erro ao criar pagamento Mercado Pago.');
      }
    } catch (err) {
      toast.error('Erro ao conectar com o servidor de pagamento.');
    }
  };

  if (loading) return <p className="text-center mt-10">Carregando profissional...</p>;
  if (!profissional) return <p className="text-center mt-10 text-red-500">Profissional não encontrado.</p>;
  if (!usuario) return null; // Espera carregar dados do usuário

  return (
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
        {/* Data e Hora */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Data e Hora</label>
          <input
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            required
            className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Status do Agendamento</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full border border-gray-300 p-4 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200"
          >
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
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
            className="bg-green-600 text-white px-10 py-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-300 mr-4"
          >
            Agendar e Pagar Consulta
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-10 py-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-300"
          >
            Confirmar Agendamento (sem pagamento)
          </button>
        </div>
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
