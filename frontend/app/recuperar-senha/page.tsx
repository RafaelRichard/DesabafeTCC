// 'use client';
// import { useState } from 'react';

// export default function RecuperarSenha() {
//   const [email, setEmail] = useState('');
//   const [mensagem, setMensagem] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMensagem('');

//     try {
//       const response = await fetch('http://localhost:8000/recuperar-senha/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();
//       setMensagem(data.detail || 'Verifique seu e-mail.');
//     } catch {
//       setMensagem('Erro ao enviar solicitação.');
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
//         <h2 className="text-2xl font-bold mb-4 text-center">Recuperar Senha</h2>

//         {mensagem && (
//           <p className="mb-4 text-sm text-center text-indigo-600">{mensagem}</p>
//         )}

//         <div className="mb-4">
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
//             required
//           />
//         </div>

//         <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300">
//           Enviar Instruções
//         </button>
//       </form>
//     </div>
//   );
// }
