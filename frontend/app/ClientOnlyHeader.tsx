'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUsers, FiChevronDown } from 'react-icons/fi';
import { GiBrain } from 'react-icons/gi';

const ClientOnlyHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const roleLinkMap: Record<string, string> = {
    admin: '/area-admin',
    psiquiatra: '/area-do-psiquiatra',
    psicologo: '/area-do-psicologo',
    paciente: '/area-do-usuario',
  };

  const roleLabelMap: Record<string, string> = {
    admin: 'Área do Admin',
    psiquiatra: 'Área do Psiquiatra',
    psicologo: 'Área do Psicólogo',
    paciente: 'Área do Usuário',
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/usuario_jwt/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
          const data = await res.json();
          const role = data.role?.trim().toLowerCase();

          if (role && roleLinkMap[role]) {
            setUserRole(role);
            setIsLoggedIn(true);
          } else {
            console.warn('Role inválida ou não mapeada:', role);
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Erro ao verificar login:', err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();

    // 🔁 Atualiza o estado quando o login for alterado em outro lugar
    const handleAuthChange = () => {
      setLoading(true);
      checkLoginStatus();
    };

    window.addEventListener('authChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);


  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:8000/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setIsLoggedIn(false);
        setUserRole(null);
        router.push('/');
      } else {
        console.error('Erro ao fazer logout. Status:', res.status);
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  const renderAuthButtons = () => {
    if (loading) return null;

    if (isLoggedIn && userRole && roleLinkMap[userRole]) {
      return (
        <div className="flex items-center gap-3">
          <Link
            href={roleLinkMap[userRole]}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
          >
            {roleLabelMap[userRole]}
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Sair
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
        >
          Login
        </Link>
        <Link
          href="/cadastro_usuario"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
        >
          Cadastre-se
        </Link>
      </div>
    );
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <GiBrain size={40} className="text-purple-600" />
            <span className="text-xl font-semibold text-gray-900">DesabafeOnline</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/Sobre" className="text-sm text-gray-600 hover:text-purple-600 font-medium">
              Sobre Nós
            </Link>
            <Link href="/planos" className="text-sm text-gray-600 hover:text-purple-600 font-medium">
              Planos
            </Link>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-purple-600 font-medium" >
                <FiUsers />
                <span>Buscar Profissional</span>
                <FiChevronDown />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-2 bg-white shadow-md rounded-lg p-2 z-50">
                  <Link href="/psicologia" className="block px-4 py-2 text-sm hover:bg-purple-50 rounded" onClick={() => setDropdownOpen(false)}>
                    Psicólogos
                  </Link>
                  <Link href="/psiquiatria" className="block px-4 py-2 text-sm hover:bg-purple-50 rounded" onClick={() => setDropdownOpen(false)}>
                    Psiquiatras
                  </Link>
                </div>
              )}
            </div>

            {renderAuthButtons()}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default ClientOnlyHeader;
