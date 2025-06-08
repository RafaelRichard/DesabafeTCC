'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Profissional {
  id: number;
  nome: string;
  crm?: string;
  crp?: string;
  especializacao?: string;
  email?: string;
  telefone?: string;
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
        const response = await fetch('http://localhost:8000/usuario_jwt/', {
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
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/psiquiatras/${id}/`);
        if (!response.ok) throw new Error('Erro ao buscar profissional');
        const data = await response.json();
        setProfissional(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfissional();
  }, [id]);

  // Gera link de consulta automaticamente
  useEffect(() => {
    if (dataHora && profissional) {
      const link = `https://consulta-online.com/agendamento-${profissional.id}-${dataHora}`;
      setLinkConsulta(link);
    }
  }, [dataHora, profissional]);

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario || !profissional) {
      toast.error('Dados insuficientes para agendamento.');
      return;
    }

    const agendamento = {
      usuario_id: usuario.id,
      medico_id: profissional.id,
      data_hora: dataHora,
      status,
      link_consulta: linkConsulta,
      observacoes,
      data_criacao: new Date().toISOString(),
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/agendamentos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(agendamento),
      });

      if (!response.ok) throw new Error('Erro ao agendar consulta');
      toast.success('Consulta agendada com sucesso!');
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao agendar a consulta.');
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
        <p><strong>CRM:</strong> {profissional.crm || '-'}</p>
        {/* Exibe CRP apenas se não for psiquiatra e houver crp */}
        {(!profissional.crm && profissional.crp) && (
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
            type="submit"
            className="bg-indigo-600 text-white px-10 py-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-300"
          >
            Confirmar Agendamento
          </button>
        </div>
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
