'use client';

import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '../utils/backend';

interface Avaliacao {
  id: number;
  nota: number;
  comentario: string;
  data_criacao: string;
  avaliador_nome: string;
  data_consulta: string;
}

interface EstatisticasAvaliacoes {
  media_avaliacoes: number;
  total_avaliacoes: number;
}

interface AvaliacoesListProps {
  profissionalId: number;
  showTitle?: boolean;
  maxAvaliacoes?: number;
}

const AvaliacoesList: React.FC<AvaliacoesListProps> = ({ 
  profissionalId, 
  showTitle = true,
  maxAvaliacoes
}) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasAvaliacoes>({
    media_avaliacoes: 0,
    total_avaliacoes: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvaliacoes();
  }, [profissionalId]);

  const fetchAvaliacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getBackendUrl()}/api/avaliacoes/profissional/${profissionalId}/`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        let avaliacoesData = data.avaliacoes || [];
        
        // Limita o número de avaliações se especificado
        if (maxAvaliacoes && maxAvaliacoes > 0) {
          avaliacoesData = avaliacoesData.slice(0, maxAvaliacoes);
        }
        
        setAvaliacoes(avaliacoesData);
        setEstatisticas(data.estatisticas || { media_avaliacoes: 0, total_avaliacoes: 0 });
      } else {
        setError('Erro ao carregar avaliações');
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (nota: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < nota ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando avaliações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Avaliações dos Pacientes
          </h3>
        </div>
      )}
      
      {/* Estatísticas sempre visíveis */}
      {estatisticas.total_avaliacoes > 0 ? (
        <div className={`${showTitle ? '' : 'text-center'}`}>
          <div className="flex items-center justify-center space-x-2">
            {renderStars(Math.round(estatisticas.media_avaliacoes))}
            <span className="text-sm font-medium text-gray-700">
              {estatisticas.media_avaliacoes.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({estatisticas.total_avaliacoes})
            </span>
          </div>
        </div>
      ) : !showTitle ? (
        <div className="text-center">
          <span className="text-xs text-gray-500">Sem avaliações</span>
        </div>
      ) : (
        <p className="text-gray-600">Ainda não há avaliações para este profissional.</p>
      )}

      {/* Lista de avaliações (apenas se maxAvaliacoes > 0 ou não definido) */}
      {(maxAvaliacoes === undefined || maxAvaliacoes > 0) && avaliacoes.length > 0 && (
        <div className="space-y-4">
          {avaliacoes.map((avaliacao) => (
            <div key={avaliacao.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  {renderStars(avaliacao.nota)}
                  <span className="ml-2 font-medium text-gray-700">
                    {avaliacao.avaliador_nome}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatarData(avaliacao.data_criacao)}
                </span>
              </div>
              
              {avaliacao.comentario && (
                <p className="text-gray-700 mt-2 leading-relaxed">
                  "{avaliacao.comentario}"
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Consulta realizada em {formatarData(avaliacao.data_consulta)}
              </p>
            </div>
          ))}
          
          {maxAvaliacoes && estatisticas.total_avaliacoes > maxAvaliacoes && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Mostrando {maxAvaliacoes} de {estatisticas.total_avaliacoes} avaliações
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mensagem quando não há avaliações (apenas com título) */}
      {showTitle && avaliacoes.length === 0 && estatisticas.total_avaliacoes === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Este profissional ainda não possui avaliações.</p>
          <p className="text-sm mt-1">
            As avaliações aparecerão aqui após as consultas serem concluídas.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvaliacoesList;