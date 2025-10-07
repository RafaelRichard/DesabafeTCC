'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBackendUrl } from '../utils/backend';

interface HorarioTrabalho {
  id?: number;
  dia_semana: number;
  dia_semana_nome?: string;
  horario_inicio: string;
  horario_fim: string;
  ativo: boolean;
}

interface Usuario {
  id: number;
  nome: string;
  role: string;
}

const DIAS_SEMANA = [
  { id: 0, nome: 'Segunda-feira' },
  { id: 1, nome: 'Terça-feira' },
  { id: 2, nome: 'Quarta-feira' },
  { id: 3, nome: 'Quinta-feira' },
  { id: 4, nome: 'Sexta-feira' },
  { id: 5, nome: 'Sábado' },
  { id: 6, nome: 'Domingo' },
];

export default function HorariosTrabalho() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [horarios, setHorarios] = useState<HorarioTrabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Inicializa com um horário padrão para cada dia
  const inicializarHorarios = () => {
    return DIAS_SEMANA.map(dia => ({
      dia_semana: dia.id,
      dia_semana_nome: dia.nome,
      horario_inicio: '08:00',
      horario_fim: '17:00',
      ativo: false
    }));
  };

  useEffect(() => {
    verificarAutenticacao();
    carregarHorarios();
  }, []);

  const verificarAutenticacao = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/usuario_jwt/`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const userData = await res.json();
        if (userData.role !== 'Psiquiatra' && userData.role !== 'Psicologo') {
          toast.error('Acesso negado. Apenas profissionais podem acessar esta página.');
          router.push('/');
          return;
        }
        setUsuario(userData);
      } else {
        toast.error('Usuário não autenticado.');
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      toast.error('Erro ao verificar autenticação.');
      router.push('/login');
    }
  };

  const carregarHorarios = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/horarios-trabalho/`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.length === 0) {
          // Se não tem horários cadastrados, inicializa com padrão
          setHorarios(inicializarHorarios());
        } else {
          // Combina horários existentes com dias que não têm horário
          const horariosExistentes = data;
          const todosHorarios = DIAS_SEMANA.map(dia => {
            const horarioExistente = horariosExistentes.find((h: HorarioTrabalho) => h.dia_semana === dia.id);
            return horarioExistente || {
              dia_semana: dia.id,
              dia_semana_nome: dia.nome,
              horario_inicio: '08:00',
              horario_fim: '17:00',
              ativo: false
            };
          });
          setHorarios(todosHorarios);
        }
      } else {
        toast.error('Erro ao carregar horários de trabalho.');
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      toast.error('Erro ao carregar horários de trabalho.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarHorario = (diaIndex: number, campo: keyof HorarioTrabalho, valor: any) => {
    const novosHorarios = [...horarios];
    novosHorarios[diaIndex] = {
      ...novosHorarios[diaIndex],
      [campo]: valor
    };
    setHorarios(novosHorarios);
  };

  const salvarHorarios = async () => {
    setSaving(true);
    try {
      // Filtra apenas os horários ativos para enviar
      const horariosAtivos = horarios.filter(h => h.ativo);

      const res = await fetch(`${getBackendUrl()}/api/horarios-trabalho/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          horarios: horariosAtivos
        }),
      });

      if (res.ok) {
        toast.success('Horários de trabalho salvos com sucesso!');
        carregarHorarios(); // Recarrega para obter os IDs dos novos registros
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Erro ao salvar horários de trabalho.');
      }
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      toast.error('Erro ao salvar horários de trabalho.');
    } finally {
      setSaving(false);
    }
  };

  const validarHorarios = () => {
    const horariosAtivos = horarios.filter(h => h.ativo);
    
    for (const horario of horariosAtivos) {
      if (horario.horario_inicio >= horario.horario_fim) {
        toast.error(`${horario.dia_semana_nome}: Horário de início deve ser anterior ao horário de fim.`);
        return false;
      }
    }
    
    if (horariosAtivos.length === 0) {
      toast.error('Selecione pelo menos um dia da semana para trabalhar.');
      return false;
    }
    
    return true;
  };

  const handleSalvar = () => {
    if (validarHorarios()) {
      salvarHorarios();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-indigo-600 text-white">
            <h1 className="text-2xl font-bold">Meus Horários de Trabalho</h1>
            <p className="text-indigo-100 mt-1">
              Configure os dias e horários em que você atende pacientes
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {horarios.map((horario, index) => (
                <div key={horario.dia_semana} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={horario.ativo}
                        onChange={(e) => atualizarHorario(index, 'ativo', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-lg font-medium text-gray-900">
                        {DIAS_SEMANA[horario.dia_semana].nome}
                      </label>
                    </div>
                  </div>

                  {horario.ativo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Horário de Início
                        </label>
                        <input
                          type="time"
                          value={horario.horario_inicio}
                          onChange={(e) => atualizarHorario(index, 'horario_inicio', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Horário de Fim
                        </label>
                        <input
                          type="time"
                          value={horario.horario_fim}
                          onChange={(e) => atualizarHorario(index, 'horario_fim', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleSalvar}
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : 'Salvar Horários'}
              </button>
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Informações importantes</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Os horários são divididos em slots de 30 minutos</li>
                  <li>Marque apenas os dias em que você realmente atende</li>
                  <li>Os pacientes só poderão agendar nos horários que você configurar</li>
                  <li>Você pode alterar seus horários a qualquer momento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}