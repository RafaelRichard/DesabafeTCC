'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUsers } from 'react-icons/fi'; // Importando o ícone de usuários
import { GiBrain } from 'react-icons/gi'; // Importando o ícone do cérebro detalhado

// Função para decodificar o JWT
const decodeJwt = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
};

const ClientOnlyHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para verificar se o usuário está logado
  const [userRole, setUserRole] = useState<string | null>(null); // Estado para armazenar a role do usuário
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento do estado de login

  useEffect(() => {
    // Função para verificar e atualizar o estado de autenticação
    const checkAuthStatus = () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const decodedToken = decodeJwt(token);
        setIsLoggedIn(true);
        setUserRole(decodedToken.role); // Armazenando a role do usuário
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
      setLoading(false); // Quando terminar de verificar o login, definimos o estado de loading como false
    };

    // Inicializa a checagem de autenticação
    checkAuthStatus();

    // Adiciona um listener para mudanças no localStorage (detectar alterações no localStorage)
    const handleStorageChange = () => {
      checkAuthStatus(); // Verifica novamente se o estado de login mudou
    };

    window.addEventListener('storage', handleStorageChange);

    // Limpeza do listener ao desmontar o componente
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Caso ainda esteja carregando o estado de login, não renderiza o menu
  if (loading) {
    return null; // Ou você pode retornar um componente de carregamento, se preferir
  }

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {/* Substituindo a imagem da logo por um ícone de cérebro mais detalhado */}
            <GiBrain size={40} className="text-purple-600" />
            <span className="text-xl font-semibold text-gray-900">DesabafeOnline</span>
          </Link>

          {/* Menu de navegação (desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            {[ 
              ['Psiquiatria', '/psiquiatria'],
              ['Psicologia', '/psicologia'],
              ['Sobre Nós', '/Sobre'],
            ].map(([title, url]) => (
              <Link
                key={url}
                href={url}
                className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm font-medium"
              >
                {title}
              </Link>
            ))}

            {/* Link para Gerenciar Usuários */}
            {isLoggedIn && userRole && (
              <Link
                href={userRole === 'admin' ? '/admin/area-admin' : '/admin/area-do-usuario'} // Direciona para a página baseada na role
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                <FiUsers size={20} />
                <span>Área do {userRole === 'admin' ? 'Admin' : 'Usuário'}</span> {/* Exibe a role do usuário */}
              </Link>
            )}

            {/* Se o usuário estiver logado, exibe o ícone de usuário */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Menu Hamburguer (mobile) */}
          <div className="md:hidden">
            <input type="checkbox" id="menu-toggle" className="hidden peer" />
            <label htmlFor="menu-toggle" className="text-gray-600 hover:text-purple-600 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <div className="peer-checked:block hidden absolute top-16 right-0 w-full bg-white border-t border-gray-100 shadow-md p-4">
              <div className="space-y-4">
                {[ 
                  ['Psiquiatria', '/psiquiatria'],
                  ['Psicologia', '/psicologia'],
                  ['Sobre Nós', '/Sobre'],
                ].map(([title, url]) => (
                  <Link
                    key={url}
                    href={url}
                    className="block text-gray-600 hover:text-purple-600 text-sm font-medium"
                  >
                    {title}
                  </Link>
                ))}

                {/* Link para Gerenciar Usuários */}
                {isLoggedIn && userRole && (
                  <Link
                    href={userRole === 'admin' ? '/admin/area-admin' : '/admin/area-do-usuario'} // Direciona para a página baseada na role
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    <FiUsers size={20} />
                    <span>Área do {userRole === 'admin' ? 'Admin' : 'Usuário'}</span> {/* Exibe a role do usuário */}
                  </Link>
                )}

                {/* Se o usuário estiver logado, exibe o ícone de usuário */}
                {isLoggedIn ? (
                  <div className="flex items-center space-x-2">
        
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default ClientOnlyHeader;
