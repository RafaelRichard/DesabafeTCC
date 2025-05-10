'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Profissional {
  id: number;
  nome: string;
  crm?: string;
  crp?: string;
}

export default function Agendamento() {
  const params = useParams();
  const id = params?.id as string;
  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [dataHora, setDataHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(true);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      setUsuarioId(Number(userId));
    } else {
      alert('Você precisa estar logado para acessar esta página.');
      router.push('/login');
    }
  }, []);

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

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioId) {
      alert('Usuário não autenticado');
      return;
    }

    const agendamento = {
      usuario_id: usuarioId,
      profissional_id: Number(id),
      data_hora: dataHora,
      status: 'pendente',
      observacoes,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/agendamentos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento),
      });

      if (!response.ok) throw new Error('Erro ao agendar consulta');

      alert('Consulta agendada com sucesso!');
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao agendar a consulta.');
    }
  };

  if (loading) return <p className="text-center mt-10">Carregando profissional...</p>;

  if (!profissional) return <p className="text-center mt-10 text-red-500">Profissional não encontrado.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-indigo-600 mb-6">
        Agendar Consulta com {profissional.nome}
      </h1>
      <form onSubmit={handleAgendar} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Data e Hora</label>
          <input
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Observações (opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Confirmar Agendamento
        </button>
      </form>
    </div>
  );
}
