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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/usuario_jwt/', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const userData = await res.json();
          setIsLoggedIn(!!userData.email);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsLoadingLogin(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchPsiquiatras = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/psiquiatras/', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Erro ao buscar psiquiatras');
        const data = await response.json();
        setPsiquiatras(data);
      } catch (error) {
        console.error('❌ Erro ao buscar psiquiatras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPsiquiatras();
  }, []);

  const handleAgendarConsulta = (psiquiatraId: number) => {
    if (isLoadingLogin) {
      alert('Verificando login, aguarde...');
      return;
    }

    if (!isLoggedIn) {
      alert('Você precisa estar logado para agendar uma consulta.');
      router.push('/login');
      return;
    }

    router.push(`/agendamento/${psiquiatraId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-center text-indigo-700 mb-6">
          Psiquiatria Online
        </h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          Encontre os melhores especialistas em saúde mental e agende sua consulta online com segurança e conforto.
        </p>

        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Lista de Psiquiatras
          </h2>

          {loading ? (
            <div className="text-center text-gray-500">Carregando médicos...</div>
          ) : psiquiatras.length === 0 ? (
            <div className="text-center text-gray-500">Nenhum psiquiatra encontrado.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {psiquiatras.map((psiquiatra) => (
                <div
                  key={psiquiatra.id}
                  className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition duration-300 p-6 flex flex-col items-center text-center"
                >
                  <img
                    src="/img/logo.png"
                    alt={`Foto de ${psiquiatra.nome}`}
                    className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-indigo-100"
                  />
                  <h3 className="text-xl font-semibold text-indigo-600">{psiquiatra.nome}</h3>
                  <p className="text-gray-600">{psiquiatra.especialidade || 'Especialista em saúde mental'}</p>
                  <p className="text-gray-500 text-sm mt-1">CRM: {psiquiatra.crm || 'Não informado'}</p>

                  <button
                    onClick={() => handleAgendarConsulta(psiquiatra.id)}
                    className="mt-6 bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition duration-300 text-sm font-medium"
                  >
                    Agendar Consulta
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
