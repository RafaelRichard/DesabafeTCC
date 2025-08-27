// Arquivo: layout.tsx

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import Image from 'next/image';
import ClientOnlyHeader from './ClientOnlyHeader';  // Componente cliente separado

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Desabafe - Sua Plataforma de Saúde Mental Online",
  description: "Encontre psicólogos, psiquiatras e outros profissionais de saúde mental para cuidar do seu bem-estar emocional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${geist.variable} font-sans antialiased bg-background text-foreground`}>
        <ClientOnlyHeader />
        <main className="min-h-screen pt-16">{children}</main>
        {/* Rodapé */}
        <footer className="bg-gradient-to-br from-purple-800 via-purple-900 to-purple-700 text-white pt-14 pb-8 mt-12 border-t border-purple-700 shadow-inner">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10 md:gap-0 border-b border-purple-700 pb-10">
              <div className="mb-8 md:mb-0 flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <Image src="/img/TesteLogo.png" alt="Desabafe Logo" width={40} height={40} className="rounded-lg border-2 border-purple-300" />
                  <span className="text-2xl font-extrabold tracking-tight text-purple-100 drop-shadow">Desabafe</span>
                </div>
                <p className="text-purple-100/80 text-sm max-w-xs">
                  Sua plataforma de apoio emocional e saúde mental online.
                </p>
                <div className="flex gap-4 mt-4">
                  <a href="https://wa.me/5518996949369" target="_blank" rel="noopener" className="hover:text-purple-300 transition"><span className="text-2xl">📱</span></a>
                  <a href="mailto:suportedesabafe@gmail.com" className="hover:text-purple-200 transition"><span className="text-2xl">✉️</span></a>
                  <a href="https://instagram.com/" target="_blank" rel="noopener" className="hover:text-purple-400 transition"><span className="text-2xl">📸</span></a>
                </div>
              </div>
              <div className="mb-8 md:mb-0 flex-1 min-w-[160px]">
                <h3 className="text-lg font-semibold mb-4 text-purple-100">Serviços</h3>
                <ul className="space-y-2">
                  <li><Link href="/psiquiatria" className="text-purple-100/80 hover:text-white text-sm">Psiquiatria</Link></li>
                  <li><Link href="/psicologia" className="text-purple-100/80 hover:text-white text-sm">Psicologia</Link></li>
                </ul>
              </div>
              <div className="mb-8 md:mb-0 flex-1 min-w-[160px]">
                <h3 className="text-lg font-semibold mb-4 text-purple-100">Suporte</h3>
                <ul className="space-y-2">
                  <li><Link href="/contato" className="text-purple-100/80 hover:text-white text-sm">Contato</Link></li>
                </ul>
              </div>
              <div className="flex-1 min-w-[180px]">
                <h3 className="text-lg font-semibold mb-4 text-purple-100">Contato</h3>
                <ul className="space-y-2">
                  <li className="text-purple-100/80 text-sm flex items-center gap-2"><span className="text-lg">✉️</span>suportedesabafe@gmail.com</li>
                  <li className="text-purple-100/80 text-sm flex items-center gap-2"><span className="text-lg">📱</span>(18) 99694-9369</li>
                </ul>
              </div>
            </div>
            <div className="text-center text-purple-100/70 text-xs pt-8">
              <span className="font-bold text-purple-200">Desabafe</span> &copy; {new Date().getFullYear()} — Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
