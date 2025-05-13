'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ResetarSenha() {
const { uid, token } = useParams() as { uid: string; token: string };


    const router = useRouter();

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mensagem, setMensagem] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensagem('');

        if (!uid || !token) {
            setMensagem('Link inválido ou incompleto.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setMensagem('As senhas não coincidem.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/redefinir-senha/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, token, nova_senha: novaSenha }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Senha redefinida com sucesso!');
                router.push('/login');
            } else {
                setMensagem(data.detail || 'Erro ao redefinir senha.');
            }
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            setMensagem('Erro de conexão com o servidor.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleReset} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4 text-center">Redefinir Senha</h2>

                {mensagem && (
                    <p className="text-sm text-red-600 text-center mb-4">{mensagem}</p>
                )}

                <input
                    type="password"
                    placeholder="Nova senha"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded"
                    required
                />

                <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition duration-300"
                >
                    Redefinir Senha
                </button>
            </form>
        </div>
    );
}
