'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getBackendUrl } from '../utils/backend';

interface AvaliacaoFormProps {
  agendamentoId: number;
  tipoAvaliador: 'paciente' | 'profissional';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AvaliacaoForm: React.FC<AvaliacaoFormProps> = ({
  agendamentoId,
  tipoAvaliador,
  onSuccess,
  onCancel
}) => {
  const [nota, setNota] = useState<number>(0);
  const [comentario, setComentario] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nota === 0) {
      toast.error('Por favor, selecione uma nota de 1 a 5 estrelas');
      return;
    }

    setIsSubmitting(true);

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
        toast.success('Avaliação enviada com sucesso!');
        setNota(0);
        setComentario('');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        console.error('Erro ao enviar avaliação:', errorData);
        
        // Mostra erros específicos do serializer
        if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (typeof errorData === 'object') {
          // Se há múltiplos erros, mostra o primeiro encontrado
          const firstError = Object.values(errorData)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          toast.error('Erro ao enviar avaliação');
        }
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Erro de conexão ao enviar avaliação');
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
        {tipoAvaliador === 'paciente' ? 'Avaliar Atendimento' : 'Avaliar Consulta'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sistema de Estrelas */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Cancelar
            </button>
          )}
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
  );
};

export default AvaliacaoForm;