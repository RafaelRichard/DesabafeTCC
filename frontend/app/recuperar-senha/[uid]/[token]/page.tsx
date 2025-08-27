"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";

interface Params {
  params: Promise<{ uid: string; token: string }>;
}

export default function RedefinirSenhaPage({ params }: Params) {
  const router = useRouter();
  const { uid, token } = use(params);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/resetar-senha/${uid}/${token}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess(true);
        setSuccess("Senha redefinida com sucesso! Você será redirecionado para o login em instantes.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.detail || "Erro ao redefinir senha.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-green-100 px-4">
      <div className="w-full max-w-md bg-white/90 shadow-xl rounded-2xl p-8 border border-indigo-100">
        <h1 className="text-2xl font-bold text-center text-indigo-700 mb-4">Redefinir Senha</h1>
        {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-center">{success}</div>}
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">{error}</div>}
        {!resetSuccess && (
          <form onSubmit={handleRedefinir} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
