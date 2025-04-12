'use client';  // Marca o componente como sendo executado no lado do cliente

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';  // Importação correta do useRouter no Next.js 13+ (usando navigation)
import Link from 'next/link';

export default function AreaDoUsuario() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);  // Estado para controlar o carregamento
  const router = useRouter();  // useRouter agora pode ser usado aqui

  useEffect(() => {
    // Verifica a presença do token no localStorage
    const authToken = localStorage.getItem('auth_token');
    
    if (!authToken) {
      // Se não houver token, redireciona para a página de login
      router.push('/login');
      return;
    }

    // Se o token estiver presente, pode continuar a verificação
    const userRole = localStorage.getItem('user_role');
    const userEmail = localStorage.getItem('user_email'); 

    if (userRole && userEmail) {
      setIsLoggedIn(true);
      setRole(userRole);
      setUserName(userEmail); 
    } else {
      // Se o token estiver presente, mas não os dados necessários, redireciona para o login
      router.push('/login');
    }
    
    setLoading(false);  // Fim do carregamento
  }, [router]); // O useEffect depende do router

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');  // Corrigido para user_email
    setIsLoggedIn(false);
    setRole('');
    setUserName('');
    router.push('/login');  // Redireciona para a página de login após logout
  };

  if (loading) {
    return <p>Carregando...</p>;  // Exibe uma tela de carregamento até o estado do login ser verificado
  }

  return (
    <div className="pt-20 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-6">Área do Usuário</h1>
        {isLoggedIn && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-semibold text-indigo-600 mb-2">Seja Bem-vindo, {role} {userName}!</h2>
              <p className="text-lg text-gray-500">Ficamos feliz em ter você aqui com a gente!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Minhas Consultas</h3>
                <p className="text-gray-500">Aqui você pode consultar seus agendamentos.</p>
                <Link href="/consultas">
                  <button className="mt-4 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-300 w-full">
                    Ver Consultas
                  </button>
                </Link>
              </div>
              <div className="bg-indigo-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Meu Perfil</h3>
                <p className="text-gray-500">Visualize e edite suas informações pessoais.</p>
                <Link href="/perfil">
                  <button className="mt-4 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-300 w-full">
                    Ver Perfil
                  </button>
                </Link>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition duration-300 w-full"
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
