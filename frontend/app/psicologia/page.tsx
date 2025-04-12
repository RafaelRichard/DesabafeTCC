'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

export default function Psicologia() {
  const router = useRouter();

  const handleAgendarSessao = (medicoId: number) => {
    router.push(`/agendamento?medico_id=${medicoId}`);
  };

  return (
    <div className="pt-20 bg-gray-50 min-h-screen flex justify-center">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-12">Psicologia Online</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <h2 className="text-2xl font-semibold text-center text-gray-700">Encontre seu Psicólogo</h2>
          <p className="text-gray-600 text-center mb-6">
            Conecte-se com psicólogos especializados em diversas áreas da saúde mental de forma online e segura.
          </p>

          {/* Lista de psicólogos */}
          <div className="space-y-6">
            {/* Psicólogo 1 */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-6">
              <img 
                src="/img/logo.png"
                alt="Dra. Mariana Oliveira" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Dra. Mariana Oliveira</h3>
                <p className="text-gray-600 mb-2">Especialista em terapia cognitivo-comportamental e transtornos de ansiedade.</p>
                <p className="text-gray-500 text-sm">CRP: 12345-SP</p>
                <button
                  className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition duration-300 mt-4"
                  onClick={() => handleAgendarSessao(1)} // Passando o ID do médico
                >
                  Agendar Sessão
                </button>
              </div>
            </div>

            {/* Psicólogo 2 */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-6">
              <img 
                src="/img/cerebro.jpg"
                alt="Dr. Rafael Costa" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Dr. Rafael Costa</h3>
                <p className="text-gray-600 mb-2">Especialista em psicoterapia de casal e orientação para adultos.</p>
                <p className="text-gray-500 text-sm">CRP: 98765-RJ</p>
                <button
                  className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition duration-300 mt-4"
                  onClick={() => handleAgendarSessao(2)} // Passando o ID do médico
                >
                  Agendar Sessão
                </button>
              </div>
            </div>

            {/* Psicólogo 3 */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center space-x-6">
              <img 
                src="/img/ligacoes.jpg"
                alt="Dra. Paula Martins" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Dra. Paula Martins</h3>
                <p className="text-gray-600 mb-2">Especialista em psicologia infantil e apoio psicológico familiar.</p>
                <p className="text-gray-500 text-sm">CRP: 54321-MG</p>
                <button
                  className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition duration-300 mt-4"
                  onClick={() => handleAgendarSessao(3)} // Passando o ID do médico
                >
                  Agendar Sessão
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
