"use client";

import { useEffect, useState } from "react";
import { getBackendUrl } from "../utils/backend";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiFileText } from "react-icons/fi";

interface Paciente {
  nome: string;
  idade: number;
  email: string;
  telefone: string;
  cpf: string;
}

interface ProntuarioResumo {
  id: number;
  data: string;
  paciente: Paciente;
  motivo: string;
  status: string;
}

export default function ProntuarioListagem() {
  const [prontuarios, setProntuarios] = useState<ProntuarioResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchProntuarios() {
      setLoading(true);
      try {
        // Substitua a URL pelo endpoint real da sua API
        const response = await fetch("http://localhost:8000/api/prontuarios/");
        if (!response.ok) throw new Error("Erro ao buscar prontuários");
        const data = await response.json();
        setProntuarios(data);
      } catch (err) {
        setMensagem("Erro ao carregar prontuários.");
      } finally {
        setLoading(false);
      }
    }
    fetchProntuarios();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-blue-700 text-lg">Carregando prontuários...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-800 text-center mb-8">Meus Prontuários</h1>
        {mensagem && (
          <div className="bg-red-100 text-red-800 rounded p-3 text-center font-semibold shadow mb-4">
            {mensagem}
          </div>
        )}
        {prontuarios.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum prontuário encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prontuarios.map((prontuario) => (
              <div key={prontuario.id} className="bg-indigo-100 rounded-xl shadow p-6 flex flex-col justify-between hover:shadow-lg transition">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText className="text-indigo-600" size={22} />
                  <span className="font-semibold text-indigo-700">{prontuario.data}</span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Paciente:</span> {prontuario.paciente.nome}
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Motivo:</span> {prontuario.motivo}
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Status:</span> {prontuario.status}
                </div>
                <Link href={`/prontuario_psiquiatra/${prontuario.id}`} className="mt-4 w-full block">
                  <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all">
                    Acessar Prontuário
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
