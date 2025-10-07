'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { getBackendUrl } from '../utils/backend';

interface Avaliacao {
  id: number;
  nota: number;
  comentario: string;
  data_criacao: string;
  avaliador_nome: string;
  avaliador_foto: string | null;
  profissional_nome: string;
  profissional_foto: string | null;
  profissional_tipo: string;
  tipo_avaliador_display: string;
}

const AvaliacoesCarrossel: React.FC = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvaliacoesMelhores();
  }, []);

  // Auto-rotation - funciona sempre que houver avaliações
  useEffect(() => {
    if (avaliacoes.length > 0) {
      const cardsPerView = Math.min(avaliacoes.length, 3);
      const maxIndex = Math.max(0, Math.ceil(avaliacoes.length / cardsPerView) - 1);
      
      // Se houver mais de uma "página" de cards, ativa o autoplay
      if (maxIndex > 0) {
        const interval = setInterval(() => {
          setCurrentIndex((prevIndex) => 
            prevIndex >= maxIndex ? 0 : prevIndex + 1
          );
        }, 5000); // Mudei para 5 segundos (mais dinâmico)

        return () => clearInterval(interval);
      }
    }
  }, [avaliacoes.length]);

  const fetchAvaliacoesMelhores = async () => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/avaliacoes/melhores/`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AvaliacoesCarrossel] Dados recebidos da API:', data);
        // Filtrar apenas avaliações com nota >= 4 e que tenham comentário
        const avaliacoesFiltradas = data.filter((av: Avaliacao) => 
          av.nota >= 4 && av.comentario && av.comentario.trim().length > 0
        );
        console.log('[AvaliacoesCarrossel] Avaliações filtradas:', avaliacoesFiltradas);
        setAvaliacoes(avaliacoesFiltradas);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, Math.ceil(avaliacoes.length / 3) - 1);
    setCurrentIndex((prevIndex) => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    const maxIndex = Math.max(0, Math.ceil(avaliacoes.length / 3) - 1);
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
  };

  const renderStars = (nota: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-xl transition-all duration-300 ${
          index < nota 
            ? 'text-yellow-400 drop-shadow-md transform scale-110' 
            : 'text-gray-300'
        }`}
      >
        ⭐
      </span>
    ));
  };

  const formatData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (avaliacoes.length === 0) {
    return null; // Não mostra nada se não há avaliações
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4">
      {/* Carrossel com múltiplos cards visíveis */}
      <div className="overflow-hidden rounded-3xl">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / Math.min(avaliacoes.length, 3))}%)` }}
        >
          {avaliacoes.map((avaliacao) => (
            <div
              key={avaliacao.id}
              className={`flex-shrink-0 px-3 ${
                avaliacoes.length === 1 ? 'w-full' : 
                avaliacoes.length === 2 ? 'w-1/2' : 'w-1/3'
              }`}
            >
              <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 border-purple-300 hover:border-purple-500 transform hover:-translate-y-1 h-full">
                {/* Badge do tipo de profissional - seguindo o padrão do sistema */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    avaliacao.profissional_tipo === 'Psiquiatra' 
                      ? 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-200' 
                      : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    <span className="text-base">{avaliacao.profissional_tipo === 'Psiquiatra' ? '🧠' : '🗣️'}</span>
                    <span>{avaliacao.profissional_tipo}</span>
                  </span>
                </div>

                {/* Conteúdo do card */}
                <div className="pt-2">
                  {/* Foto do profissional em DESTAQUE no topo com as estrelas */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      {avaliacao.profissional_foto ? (
                        <img
                          src={`http://localhost:8000${avaliacao.profissional_foto}`}
                          alt={avaliacao.profissional_nome}
                          className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-purple-300 ring-4 ring-purple-100"
                          onError={(e) => {
                            console.log('[AvaliacoesCarrossel] Erro ao carregar foto do profissional. URL:', `http://localhost:8000${avaliacao.profissional_foto}`);
                            // Fallback para inicial se a imagem falhar
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-xl border-4 border-purple-300 ring-4 ring-purple-100">
                          {avaliacao.profissional_nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-gray-800 text-base mb-1">
                      Dr(a). {avaliacao.profissional_nome}
                    </p>
                    {/* Estrelas logo abaixo do nome do profissional */}
                    <div className="flex justify-center space-x-1 mb-4">
                      {renderStars(avaliacao.nota)}
                    </div>
                  </div>

                  {/* Comentário - mais limpo e elegante */}
                  <div className="relative mb-6 min-h-[100px]">
                    <blockquote className="text-gray-700 text-sm md:text-base leading-relaxed text-center italic">
                      "{avaliacao.comentario}"
                    </blockquote>
                  </div>

                  {/* Divisor elegante */}
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300 rounded-full mx-auto mb-4"></div>

                  {/* Avatar e informações do PACIENTE que avaliou */}
                  <div className="flex items-center justify-center space-x-3">
                    {/* Foto do avaliador (paciente) */}
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {avaliacao.avaliador_foto ? (
                        <img
                          src={`http://localhost:8000${avaliacao.avaliador_foto}`}
                          alt={avaliacao.avaliador_nome}
                          className="absolute inset-0 w-10 h-10 rounded-full object-cover shadow-md border-2 border-gray-200"
                          onError={(e) => {
                            console.log('[AvaliacoesCarrossel] Erro ao carregar foto:', avaliacao.avaliador_foto);
                            // Fallback para inicial se a imagem falhar
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${avaliacao.avaliador_foto ? 'absolute inset-0' : ''}`}
                      >
                        {avaliacao.avaliador_nome.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 text-sm">
                        {avaliacao.avaliador_nome}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatData(avaliacao.data_criacao)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ícone decorativo no canto inferior */}
                <div className="absolute bottom-4 right-4 text-purple-200 text-4xl opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  💜
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegação - alinhados com o padrão do sistema */}
      {avaliacoes.length > 3 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white hover:bg-purple-50 text-purple-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-purple-200 z-10"
            aria-label="Avaliação anterior"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white hover:bg-purple-50 text-purple-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-purple-200 z-10"
            aria-label="Próxima avaliação"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicadores - seguindo o padrão do sistema */}
      {avaliacoes.length > 3 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.ceil(avaliacoes.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 w-8 shadow-md'
                  : 'bg-gray-300 hover:bg-purple-300 w-2'
              }`}
              aria-label={`Ir para grupo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AvaliacoesCarrossel;