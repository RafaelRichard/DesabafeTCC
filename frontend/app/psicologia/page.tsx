'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Psicologo {
  id: number;
  nome: string;
  email?: string;
  crp?: string;
  especialidade?: string;
  valor_consulta?: number;
}

export default function Psicologia() {
  const router = useRouter();
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(true);

  useEffect(() => {
    const fetchPsicologos = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/psicologos/', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao buscar psicólogos');
        const data = await response.json();
        setPsicologos(data);
      } catch (error) {
        console.error('Erro ao buscar psicólogos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPsicologos();
  }, []);

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

  const handleAgendarSessao = (psicologoId: number) => {
    if (isLoadingLogin) {
      toast.info('Verificando login, aguarde...');
      return;
    }
    if (!isLoggedIn) {
      toast.warning('Você precisa estar logado para agendar uma consulta.');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    router.push(`/agendamento/${psicologoId}`);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-center text-indigo-700 mb-6">
            Psicologia Online
          </h1>
          <p className="text-center text-lg text-gray-600 mb-12">
            Encontre os melhores psicólogos e agende sua consulta online com segurança e conforto.
          </p>
          <div className="bg-white p-8 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Lista de Psicólogos
            </h2>
            {loading ? (
              <div className="text-center text-gray-500">Carregando psicólogos...</div>
            ) : psicologos.length === 0 ? (
              <div className="text-center text-gray-500">Nenhum psicólogo encontrado.</div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">
                  {psicologos
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((psicologo) => (
                      <div
                        key={psicologo.id}
                        className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition duration-300 p-6 flex flex-col items-center text-center"
                      >
                        <img
                          src="/img/logo.png"
                          alt={`Foto de ${psicologo.nome}`}
                          className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-indigo-100"
                        />
                        <h3 className="text-xl font-semibold text-indigo-600">{psicologo.nome}</h3>
                        <p className="text-gray-600">{psicologo.especialidade || 'Especialista em saúde mental'}</p>
                        <p className="text-gray-500 text-sm mt-1">CRP: {psicologo.crp || 'Não informado'}</p>
                          <p className="text-indigo-700 font-bold text-lg mt-2">{psicologo.valor_consulta ? Number(psicologo.valor_consulta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Valor não informado'}</p>
                        <button
                          onClick={() => handleAgendarSessao(psicologo.id)}
                          className="mt-6 bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition duration-300 text-sm font-medium"
                        >
                          Agendar Consulta
                        </button>
                      </div>
                    ))}
                </div>

                {/* Pagination controls */}
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-white border rounded-md hover:bg-gray-100"
                    disabled={page === 1}
                  >
                    Anterior
                  </button>

                  {Array.from({ length: Math.max(1, Math.ceil(psicologos.length / pageSize)) }, (_, i) => i + 1).map((pnum) => (
                    <button
                      key={pnum}
                      onClick={() => setPage(pnum)}
                      className={`px-3 py-1 rounded-md ${pnum === page ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-gray-100'}`}
                    >
                      {pnum}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(p => Math.min(Math.ceil(psicologos.length / pageSize), p + 1))}
                    className="px-3 py-1 bg-white border rounded-md hover:bg-gray-100"
                    disabled={page >= Math.ceil(psicologos.length / pageSize)}>
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
