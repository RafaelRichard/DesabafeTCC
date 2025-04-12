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
        <footer className="bg-gray-900 text-white py-12 mt-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Sobre Nós</h3>
                <p className="text-gray-400 text-sm">
                  Sua plataforma de apoio emocional e saúde mental online.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Serviços</h3>
                <ul className="space-y-2">
                  <li><Link href="/psiquiatria" className="text-gray-400 hover:text-white text-sm">Psiquiatria</Link></li>
                  <li><Link href="/psicologia" className="text-gray-400 hover:text-white text-sm">Psicologia</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Suporte</h3>
                <ul className="space-y-2">
                  <li><Link href="/faq" className="text-gray-400 hover:text-white text-sm">FAQ</Link></li>
                  <li><Link href="/contato" className="text-gray-400 hover:text-white text-sm">Contato</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contato</h3>
                <ul className="space-y-2">
                  <li className="text-gray-400 text-sm">rafaelrichardalmeida@gmail.com</li>
                  <li className="text-gray-400 text-sm">(18) 99694-9369</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              © {new Date().getFullYear()} Desabafe. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
