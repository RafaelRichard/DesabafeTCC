'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AgendamentoPage() {
  const searchParams = useSearchParams();
  const medicoId = searchParams.get('medico_id');
  const [dataHora, setDataHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [message, setMessage] = useState('');
  const [medico, setMedico] = useState<{ id: number, nome: string } | null>(null);

  useEffect(() => {
    // Mock: Aqui você poderia buscar os dados do médico real a partir do id
    const medicosFake = [
      { id: 1, nome: 'Dra. Mariana Oliveira' },
      { id: 2, nome: 'Dr. Rafael Costa' },
      { id: 3, nome: 'Dra. Paula Martins' },
    ];

    const medicoSelecionado = medicosFake.find(m => m.id.toString() === medicoId);
    setMedico(medicoSelecionado || null);
  }, [medicoId]);

  const handleAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      const userId = localStorage.getItem('user_id'); // certifique-se de salvar isso no login

      if (!token || !userId) {
        setMessage('Usuário não autenticado.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/agendamentos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuario_id: parseInt(userId),
          medico_id: parseInt(medicoId || ''),
          data_hora: dataHora,
          observacoes,
        }),
      });

      if (response.ok) {
        setMessage('Agendamento realizado com sucesso!');
        setDataHora('');
        setObservacoes('');
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Erro ao agendar.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erro ao se conectar com o servidor.');
    }
  };

  if (!medicoId || !medico) {
    return <div className="p-10 text-center text-red-500">Médico não encontrado ou ID inválido.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white shadow-xl rounded-lg p-10 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Agendar com {medico.nome}
        </h2>
        <form onSubmit={handleAgendamento} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-2">Data e Hora</label>
            <input
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-2">Observações (opcional)</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700"
          >
            Confirmar Agendamento
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
      </div>
    </div>
  );
}
