'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiUsers } from 'react-icons/fi'; // Importando o ícone de usuários
import { GiBrain } from 'react-icons/gi'; // Importando o ícone do cérebro detalhado
import { useRouter } from 'next/navigation'; // Importando o hook do Next.js para redirecionamento

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
  const [mounted, setMounted] = useState(false); // Estado para verificar se o componente foi montado no cliente
  const router = useRouter(); // Hook do Next.js para redirecionamento

  useEffect(() => {
    // Isso assegura que o router só será usado no lado do cliente
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
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
    }
  }, [mounted]);

  // Função para fazer o logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token'); // Remover o token de autenticação do localStorage
    setIsLoggedIn(false); // Atualizar o estado para indicar que o usuário não está mais logado
    setUserRole(null); // Limpar a role
    router.push('/'); // Redireciona para a página inicial após o logout
  };

  // Caso ainda esteja carregando o estado de login, não renderiza o menu
  if (loading || !mounted) {
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

            {/* Links personalizados com base na role */}
            {isLoggedIn && userRole && (
              <>
                {userRole.toLowerCase() === 'admin' && (
                  <Link
                    href="/area-admin"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    <FiUsers size={20} />
                    <span>Área do Admin</span>
                  </Link>
                )}

                {userRole.toLowerCase() === 'psiquiatra' && (
                  <Link
                    href="/psiquiatras"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    <FiUsers size={20} />
                    <span>Área do Psiquiatra</span>
                  </Link>
                )}

                {userRole.toLowerCase() === 'psicologo' && (
                  <Link
                    href="/psicologos"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    <FiUsers size={20} />
                    <span>Área do Psicólogo</span>
                  </Link>
                )}

                {userRole.toLowerCase() === 'usuario' && (
                  <Link
                    href="/area-do-usuario"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    <FiUsers size={20} />
                    <span>Área do Usuário</span>
                  </Link>
                )}
              </>
            )}

            {/* Botão de Sair */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
              >
                Sair
              </button>
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

                {/* Links personalizados com base na role */}
                {isLoggedIn && userRole && (
                  <>
                    {userRole.toLowerCase() === 'admin' && (
                      <Link
                        href="/area-admin"
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                      >
                        <FiUsers size={20} />
                        <span>Área do Admin</span>
                      </Link>
                    )}

                    {userRole.toLowerCase() === 'psiquiatra' && (
                      <Link
                        href="/area-psiquiatra"
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                      >
                        <FiUsers size={20} />
                        <span>Área do Psiquiatra</span>
                      </Link>
                    )}

                    {userRole.toLowerCase() === 'psicologo' && (
                      <Link
                        href="/area-psicologo"
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                      >
                        <FiUsers size={20} />
                        <span>Área do Psicólogo</span>
                      </Link>
                    )}

                    {userRole.toLowerCase() === 'usuario' && (
                      <Link
                        href="/area-do-usuario"
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                      >
                        <FiUsers size={20} />
                        <span>Área do Usuário</span>
                      </Link>
                    )}
                  </>
                )}

                {/* Botão de Sair */}
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Sair
                  </button>
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
