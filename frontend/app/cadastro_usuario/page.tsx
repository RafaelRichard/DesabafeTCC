'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastroUsuario() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        cpf: '',
        role: 'Paciente',
        crm: '',
        crp: '',
        status: 'ativo',
        // Endereço
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        tipo_endereco: 'residencial',
        // Campos extras para profissionais
        especialidade: '',
        valor_consulta: '',
        foto: '', // será ignorado, usaremos fotoFile
    });
    const [fotoFile, setFotoFile] = useState<File | null>(null); // Novo estado para arquivo
    const [message, setMessage] = useState('');
    const router = useRouter();

    // Função para obter o token CSRF
    const getCsrfToken = (): string | null => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='))
            ?.split('=')[1] || null;
    };

    // Função para validar o CPF
    const validateCPF = (cpf: string) => {
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        return cpfRegex.test(cpf);
    };

    // Função para lidar com as mudanças nos campos do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');

        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'foto') form.append(key, value);
        });
        if (fotoFile) form.append('foto', fotoFile);

        try {
            const response = await fetch('http://localhost:8000/cadastrar_usuario/', {
                method: 'POST',
                body: form,
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Cadastro realizado com sucesso!');
                router.push('/login');
            } else {
                setMessage(data.error || 'Erro ao realizar cadastro.');
            }
        } catch (error) {
            setMessage('Erro ao conectar com o servidor.');
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-20 flex items-center justify-center px-4">
            <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8 md:p-10">
                <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
                    Criar Conta
                </h1>

                {message && (
                    <div
                        className={`mb-6 p-3 rounded text-center text-white ${message.includes('Erro') ? 'bg-red-500' : 'bg-green-500'
                            }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuário</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="Paciente">Paciente</option>
                            <option value="Psiquiatra">Psiquiatra</option>
                            <option value="Psicologo">Psicólogo</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (opcional)</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    {formData.role === 'Psiquiatra' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CRM</label>
                            <input
                                type="text"
                                name="crm"
                                value={formData.crm}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    )}

                    {formData.role === 'Psicologo' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CRP</label>
                            <input
                                type="text"
                                name="crp"
                                value={formData.crp}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    {/* Campos de Endereço */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                        <input
                            type="text"
                            name="cep"
                            value={formData.cep}
                            onChange={async (e) => {
                                const cep = e.target.value;
                                setFormData({ ...formData, cep });
                                if (cep.length === 8 || cep.length === 9) {
                                    // Remove caracteres não numéricos
                                    const cleanCep = cep.replace(/\D/g, '');
                                    if (cleanCep.length === 8) {
                                        try {
                                            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                                            const data = await res.json();
                                            if (!data.erro) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    logradouro: data.logradouro || '',
                                                    bairro: data.bairro || '',
                                                    cidade: data.localidade || '',
                                                    estado: data.uf || '',
                                                    cep: cep,
                                                }));
                                            }
                                        } catch (err) {
                                            // Não faz nada se falhar
                                        }
                                    }
                                }
                            }}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                        <input
                            type="text"
                            name="logradouro"
                            value={formData.logradouro}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                            <input
                                type="text"
                                name="numero"
                                value={formData.numero}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                            <input
                                type="text"
                                name="complemento"
                                value={formData.complemento}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                        <input
                            type="text"
                            name="bairro"
                            value={formData.bairro}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input
                            type="text"
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="">Selecione o estado</option>
                            <option value="AC">Acre</option>
                            <option value="AL">Alagoas</option>
                            <option value="AP">Amapá</option>
                            <option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option>
                            <option value="CE">Ceará</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option>
                            <option value="MA">Maranhão</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Endereço</label>
                        <select
                            name="tipo_endereco"
                            value={formData.tipo_endereco}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="residencial">Residencial</option>
                            <option value="comercial">Comercial</option>
                            <option value="consultorio">Consultório</option>
                        </select>
                    </div>

                    {/* Campos extras para profissionais */}
                    {(formData.role === 'Psiquiatra' || formData.role === 'Psicologo') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                          <input
                            type="text"
                            name="especialidade"
                            value={formData.especialidade}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Consulta (R$)</label>
                          <input
                            type="number"
                            name="valor_consulta"
                            value={formData.valor_consulta}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Foto de Perfil</label>
                          <input
                            type="file"
                            name="foto"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setFotoFile(file);
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                      </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300"
                    >
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}