'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUsers, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { GiBrain } from 'react-icons/gi';

const ClientOnlyHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
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
      }
    } catch (err) {}
  };

  const renderAuthButtons = (isMobile = false) => {
    if (loading) return null;
    if (isLoggedIn && userRole && roleLinkMap[userRole]) {
      return (
        <div className={`flex flex-col ${isMobile ? 'gap-2' : 'md:flex-row md:gap-3 gap-2'}`}>
          <Link
            href={roleLinkMap[userRole]}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium text-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            {roleLabelMap[userRole]}
          </Link>
          <button
            onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Sair
          </button>
        </div>
      );
    }
    return (
      <div className={`flex flex-col ${isMobile ? 'gap-2' : 'md:flex-row md:gap-3 gap-2'}`}>
        <Link
          href="/login"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium text-center"
          onClick={() => setMobileMenuOpen(false)}
        >
          Login
        </Link>
        <Link
          href="/cadastro_usuario"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium text-center"
          onClick={() => setMobileMenuOpen(false)}
        >
          Cadastre-se
        </Link>
      </div>
    );
  };

  return (
    <header className="fixed top-0 w-full bg-gradient-to-r from-white via-purple-50 to-white/90 backdrop-blur-md border-b border-purple-100 z-50 shadow-md">
      <nav className="container mx-auto px-4 sm:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <GiBrain size={38} className="text-purple-700 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-extrabold text-purple-800 tracking-tight group-hover:text-purple-600 transition-colors">DesabafeOnline</span>
          </Link>
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/Sobre" className="text-base text-gray-700 hover:text-purple-700 font-semibold transition-colors">Sobre Nós</Link>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 text-base text-gray-700 hover:text-purple-700 font-semibold focus:outline-none transition-colors"
              >
                <FiUsers />
                <span>Buscar Profissional</span>
                <FiChevronDown />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-2 bg-white shadow-lg rounded-xl p-2 z-50 min-w-[180px] border border-purple-100 animate-fade-in">
                  <Link href="/psicologia" className="block px-4 py-2 text-base hover:bg-purple-50 rounded transition-colors" onClick={() => setDropdownOpen(false)}>Psicólogos</Link>
                  <Link href="/psiquiatria" className="block px-4 py-2 text-base hover:bg-purple-50 rounded transition-colors" onClick={() => setDropdownOpen(false)}>Psiquiatras</Link>
                </div>
              )}
            </div>
            {renderAuthButtons()}
          </div>
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400" onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white/95 rounded-2xl shadow-lg p-6 flex flex-col gap-4 animate-fade-in border border-purple-100">
            <Link href="/Sobre" className="text-lg text-gray-800 hover:text-purple-700 font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>Sobre Nós</Link>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 text-lg text-gray-800 hover:text-purple-700 font-semibold w-full transition-colors"
              >
                <FiUsers />
                <span>Buscar Profissional</span>
                <FiChevronDown />
              </button>
              {dropdownOpen && (
                <div className="mt-2 bg-white shadow-lg rounded-xl p-2 z-50 min-w-[180px] border border-purple-100 animate-fade-in">
                  <Link href="/psicologia" className="block px-4 py-2 text-base hover:bg-purple-50 rounded transition-colors" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Psicólogos</Link>
                  <Link href="/psiquiatria" className="block px-4 py-2 text-base hover:bg-purple-50 rounded transition-colors" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>Psiquiatras</Link>
                </div>
              )}
            </div>
            {renderAuthButtons(true)}
          </div>
        )}
      </nav>
    </header>
  );
};

export default ClientOnlyHeader;
