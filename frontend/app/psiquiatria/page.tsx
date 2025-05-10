'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Psiquiatra {
  id: number;
  nome: string;
  email: string;
  crm: string;
  especialidade?: string;
}

export default function Psiquiatria() {
  const [psiquiatras, setPsiquiatras] = useState<Psiquiatra[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPsiquiatras() {
      try {
        const response = await fetch('http://localhost:8000/api/psiquiatras/');
        if (!response.ok) throw new Error('Erro ao buscar psiquiatras');
        const data = await response.json();
        setPsiquiatras(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchPsiquiatras();
  }, []);


function handleAgendarConsulta(psiquiatraId: number) {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('user_id');

  console.log('Token JWT lido do localStorage:', token);

  if (!token || !userId) {
    alert('Você precisa estar logado para agendar uma consulta.');
    router.push('/login');
    return;
  }

  router.push(`/agendamento/${psiquiatraId}`);
}




  return (
    <div className="pt-20 bg-gray-50 min-h-screen flex justify-center">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-12">Psiquiatria Online</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <h2 className="text-2xl font-semibold text-center text-gray-700">Encontre seu Psiquiatra</h2>
          <p className="text-gray-600 text-center mb-6">
            Consulte com os melhores psiquiatras do Brasil de forma online e segura.
          </p>

          {loading ? (
            <p className="text-center text-gray-500">Carregando médicos...</p>
          ) : (
            <div className="space-y-6">
              {psiquiatras.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum psiquiatra encontrado.</p>
              ) : (
                psiquiatras.map((medico) => (
                  <div
                    key={medico.id}
                    className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-6"
                  >
                    <img
                      src="/img/logo.png"
                      alt={`Foto de ${medico.nome}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-indigo-600 mb-2">{medico.nome}</h3>
                      <p className="text-gray-600 mb-2">
                        {medico.especialidade || 'Especialista em saúde mental'}
                      </p>
                      <p className="text-gray-500 text-sm">CRM: {medico.crm || 'Não informado'}</p>
                      <button
                        onClick={() => handleAgendarConsulta(medico.id)}
                        className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition duration-300 mt-4"
                      >
                        Agendar Consulta
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
