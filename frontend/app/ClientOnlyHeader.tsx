'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUsers, FiChevronDown } from 'react-icons/fi';
import { GiBrain } from 'react-icons/gi';

const decodeJwt = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );
  return JSON.parse(jsonPayload);
};

const ClientOnlyHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const decodedToken = decodeJwt(token);
        setIsLoggedIn(true);
        setUserRole(decodedToken.role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
      setLoading(false);
    }
  }, [mounted]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/');
  };

  if (loading || !mounted) return null;

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <GiBrain size={40} className="text-purple-600" />
            <span className="text-xl font-semibold text-gray-900">DesabafeOnline</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/Sobre" className="text-sm text-gray-600 hover:text-purple-600 font-medium">Sobre Nós</Link>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-purple-600 font-medium"
              >
                <FiUsers />
                <span>Buscar Profissional</span>
                <FiChevronDown />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-2 bg-white shadow-md rounded-lg p-2 z-50">
                  <Link href="/psicologia" className="block px-4 py-2 text-sm hover:bg-purple-50 rounded">Psicólogos</Link>
                  <Link href="/psiquiatria" className="block px-4 py-2 text-sm hover:bg-purple-50 rounded">Psiquiatras</Link>
                </div>
              )}
            </div>

            {/* Role-based Navigation */}
            {isLoggedIn && userRole && (
              <>
                {userRole.toLowerCase() === 'admin' && <Link href="/area-admin" className="text-sm font-medium text-gray-600 hover:text-purple-600">Área do Admin</Link>}
                {userRole.toLowerCase() === 'psiquiatra' && <Link href="/area-do-psiquiatra" className="text-sm font-medium text-gray-600 hover:text-purple-600">Área do Psiquiatra</Link>}
                {userRole.toLowerCase() === 'psicologo' && <Link href="/area-do-psicologo" className="text-sm font-medium text-gray-600 hover:text-purple-600">Área do Psicólogo</Link>}
                {userRole.toLowerCase() === 'usuario' && <Link href="/area-do-usuario" className="text-sm font-medium text-gray-600 hover:text-purple-600">Área do Usuário</Link>}
              </>
            )}

            {/* Auth Buttons */}
            {!isLoggedIn && (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  Login
                </Link>

                <Link
                  href="/cadastro_usuario"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Cadastre-se
                </Link>
              </>
            )}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Sair
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <input type="checkbox" id="menu-toggle" className="hidden peer" />
            <label htmlFor="menu-toggle" className="text-gray-600 hover:text-purple-600 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>

            <div className="peer-checked:block hidden absolute top-16 right-0 w-full bg-white border-t border-gray-100 shadow-md p-4">
              <div className="space-y-4">
                <Link href="/psiquiatria" className="block text-sm text-gray-600 hover:text-purple-600 font-medium">Psiquiatria</Link>
                <Link href="/psicologia" className="block text-sm text-gray-600 hover:text-purple-600 font-medium">Psicologia</Link>
                <Link href="/Sobre" className="block text-sm text-gray-600 hover:text-purple-600 font-medium">Sobre Nós</Link>

                {/* Role links */}
                {isLoggedIn && userRole && (
                  <>
                    {userRole.toLowerCase() === 'admin' && <Link href="/area-admin" className="block p-2 rounded-lg hover:bg-indigo-700 text-sm text-gray-700">Área do Admin</Link>}
                    {userRole.toLowerCase() === 'psiquiatra' && <Link href="/area-psiquiatra" className="block p-2 rounded-lg hover:bg-indigo-700 text-sm text-gray-700">Área do Psiquiatra</Link>}
                    {userRole.toLowerCase() === 'psicologo' && <Link href="/area-psicologo" className="block p-2 rounded-lg hover:bg-indigo-700 text-sm text-gray-700">Área do Psicólogo</Link>}
                    {userRole.toLowerCase() === 'usuario' && <Link href="/area-do-usuario" className="block p-2 rounded-lg hover:bg-indigo-700 text-sm text-gray-700">Área do Usuário</Link>}
                  </>
                )}

                {/* Mobile auth buttons */}
                {!isLoggedIn && (
                  <>
                    <Link href="/cadastro_usuario" className="block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium">Cadastre-se</Link>
                    <Link href="/login" className="block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">Login</Link>
                  </>
                )}
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Sair
                  </button>
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
