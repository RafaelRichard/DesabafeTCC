'use client';

import { useEffect, useState } from 'react';
import { getBackendUrl } from '../utils/backend';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AvaliacoesList from '../components/AvaliacoesList';

interface Psiquiatra {
  id: number;
  nome: string;
  email: string;
  crm: string;
  especialidade?: string;
  foto?: string; // Adiciona campo foto
  valor_consulta?: number;
}

export default function Psiquiatria() {
  const [psiquiatras, setPsiquiatras] = useState<Psiquiatra[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
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
      toast.info('Verificando login, aguarde...');
      return;
    }

    if (!isLoggedIn) {
      toast.warning('Você precisa estar logado para agendar uma consulta.');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    router.push(`/agendamento/${psiquiatraId}`);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
                  {psiquiatras
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((psiquiatra) => (
                  <div
                    key={psiquiatra.id}
                    className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition duration-300 p-4 sm:p-6 flex flex-col items-center text-center h-full justify-between"
                    style={{ minHeight: 380 }}
                  >
                    <img
                      src={psiquiatra.foto ? `${getBackendUrl()}/${psiquiatra.foto}` : "/img/logo.png"}
                      alt={`Foto de ${psiquiatra.nome}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover mb-3 sm:mb-4 border-2 border-indigo-100"
                    />
                    <h3 className="text-lg sm:text-xl font-semibold text-indigo-600">{psiquiatra.nome}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{psiquiatra.especialidade || 'Especialista em saúde mental'}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">CRM: {psiquiatra.crm || 'Não informado'}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Valor da consulta:</p>
                      <p className="text-sm sm:text-base lg:text-lg text-indigo-700 font-bold mt-2">{psiquiatra.valor_consulta ? Number(psiquiatra.valor_consulta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado'}</p>
                    
                    {/* Avaliações Resumidas */}
                    <div className="mt-3 w-full">
                      <AvaliacoesList 
                        profissionalId={psiquiatra.id} 
                        showTitle={false} 
                        maxAvaliacoes={0} // Só mostra estatísticas
                      />
                    </div>
                    
                    <div className="flex-grow" />
                    <button
                      onClick={() => handleAgendarConsulta(psiquiatra.id)}
                      className="mt-4 sm:mt-6 bg-indigo-600 text-white px-4 sm:px-5 py-2 rounded-full hover:bg-indigo-700 transition duration-300 text-xs sm:text-sm font-medium w-full"
                      style={{ marginTop: 'auto' }}
                    >
                      Agendar Consulta
                    </button>
                  </div>
                ))}
                </div>

                {/* Pagination controls */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-2 sm:px-3 py-1 bg-white border rounded-md hover:bg-gray-100 text-sm"
                    disabled={page === 1}
                  >
                    Anterior
                  </button>

                  {Array.from({ length: Math.max(1, Math.ceil(psiquiatras.length / pageSize)) }, (_, i) => i + 1).map((pnum) => (
                    <button
                      key={pnum}
                      onClick={() => setPage(pnum)}
                      className={`px-2 sm:px-3 py-1 rounded-md text-sm ${pnum === page ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-gray-100'}`}
                    >
                      {pnum}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(p => Math.min(Math.ceil(psiquiatras.length / pageSize), p + 1))}
                    className="px-2 sm:px-3 py-1 bg-white border rounded-md hover:bg-gray-100 text-sm"
                    disabled={page >= Math.ceil(psiquiatras.length / pageSize)}
                  >
                    Próximo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
