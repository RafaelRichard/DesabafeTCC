'use client';

import React, { useState } from 'react';
import { getBackendUrl } from '../utils/backend';

interface AvaliacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendamentoId: number;
  tipoAvaliador: 'paciente' | 'profissional';
  onSuccess?: () => void;
}

const AvaliacaoModal: React.FC<AvaliacaoModalProps> = ({
  isOpen,
  onClose,
  agendamentoId,
  tipoAvaliador,
  onSuccess
}) => {
  const [nota, setNota] = useState<number>(0);
  const [comentario, setComentario] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nota === 0) {
      setMessage({ type: 'error', text: 'Por favor, selecione uma nota de 1 a 5 estrelas' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${getBackendUrl()}/api/avaliacoes/criar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          agendamento: agendamentoId,
          tipo_avaliador: tipoAvaliador,
          nota: nota,
          comentario: comentario.trim() || null
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Avaliação enviada com sucesso!' });
        setNota(0);
        setComentario('');
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Erro ao enviar avaliação' });
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      setMessage({ type: 'error', text: 'Erro de conexão ao enviar avaliação' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-3xl transition-colors duration-150 ${
            i <= (hoveredStar || nota) 
              ? 'text-yellow-400 hover:text-yellow-500' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => setNota(i)}
          onMouseEnter={() => setHoveredStar(i)}
          onMouseLeave={() => setHoveredStar(0)}
          disabled={isSubmitting}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNota(0);
      setComentario('');
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {tipoAvaliador === 'paciente' ? 'Avaliar Atendimento' : 'Avaliar Consulta'}
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold disabled:opacity-50"
            >
              ×
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sistema de Estrelas */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Como você avalia {tipoAvaliador === 'paciente' ? 'o atendimento recebido' : 'a consulta realizada'}?
              </label>
              <div className="flex justify-center space-x-1 mb-2">
                {renderStars()}
              </div>
              <p className="text-sm text-gray-500">
                {nota > 0 && (
                  <span>
                    {nota === 1 && 'Muito insatisfeito'}
                    {nota === 2 && 'Insatisfeito'}
                    {nota === 3 && 'Neutro'}
                    {nota === 4 && 'Satisfeito'}
                    {nota === 5 && 'Muito satisfeito'}
                  </span>
                )}
                {nota === 0 && 'Clique nas estrelas para avaliar'}
              </p>
            </div>

            {/* Campo de Comentário */}
            <div>
              <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-2">
                Comentário (opcional)
              </label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder={`Conte-nos mais sobre ${tipoAvaliador === 'paciente' ? 'sua experiência com o atendimento' : 'como foi a consulta'}...`}
                maxLength={500}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comentario.length}/500 caracteres
              </p>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || nota === 0}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvaliacaoModal;