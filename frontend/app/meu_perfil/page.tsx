'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Endereco {
    id?: number;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    tipo: string;
}

interface Usuario {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    cpf: string;
    role: string;
    status: 'ativo' | 'inativo';
    crm?: string;
    crp?: string;
    enderecos?: Endereco[];
    foto?: string;
}

export default function MeuPerfil() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [form, setForm] = useState<Record<string, string>>({});
    const [enderecos, setEnderecos] = useState<Endereco[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [editando, setEditando] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const resUser = await fetch('http://localhost:8000/usuario_jwt/', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!resUser.ok) throw new Error('Não autenticado');

                const user = await resUser.json();

                const resPerfil = await fetch(`http://localhost:8000/api/users/${user.id}/`, {
                    credentials: 'include',
                });

                if (!resPerfil.ok) throw new Error('Erro ao buscar perfil');

                const perfil: Usuario = await resPerfil.json();
                setUsuario(perfil);
                setEnderecos(perfil.enderecos || []);

                const endereco = perfil.enderecos?.[0] || {} as Endereco;

                setForm({
                    nome: perfil.nome,
                    email: perfil.email,
                    telefone: perfil.telefone || '',
                    cpf: perfil.cpf,
                    logradouro: endereco.logradouro || '',
                    numero: endereco.numero || '',
                    complemento: endereco.complemento || '',
                    bairro: endereco.bairro || '',
                    cidade: endereco.cidade || '',
                    estado: endereco.estado || '',
                    cep: endereco.cep || '',
                    tipo: endereco.tipo || '',
                });
            } catch {
                setErro('Erro ao carregar dados do perfil.');
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();
    }, []);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Se for o campo CEP e estiver editando
        if (name === 'cep' && editando) {
            setForm((prev) => ({ ...prev, [name]: value }));
            const cep = value.replace(/\D/g, '');
            if (cep.length === 8) {
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    if (!data.erro) {
                        setForm((prev) => ({
                            ...prev,
                            logradouro: data.logradouro || '',
                            bairro: data.bairro || '',
                            cidade: data.localidade || '',
                            estado: data.uf || '',
                            cep: value,
                        }));
                    }
                } catch { }
            }
            return;
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEdit = () => {
        setEditando(true);
        toast.info('Modo de edição ativado. Altere os campos desejados e clique em Salvar.');
    };
    const handleCancel = () => {
        setEditando(false);
        toast.info('Edição cancelada. Nenhuma alteração foi salva.');
    };
    const handleSave = async () => {
        if (!usuario) return;
        try {
            // Atualiza dados do usuário
            const res = await fetch(`http://localhost:8000/api/users/${usuario.id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error('Erro ao salvar');

            // Normaliza o campo tipo para minúsculo antes de enviar
            const tipoNormalizado = (form.tipo || '').toLowerCase();
            let tipoValido = tipoNormalizado;
            if (!["residencial", "comercial", "consultorio"].includes(tipoNormalizado)) {
                // fallback para residencial se vier valor inválido
                tipoValido = "residencial";
            }

            // Atualiza ou cria endereço
            if (enderecos.length > 0) {
                // Atualiza o primeiro endereço existente
                const enderecoPayload = {
                    logradouro: form.logradouro,
                    numero: form.numero,
                    complemento: form.complemento,
                    bairro: form.bairro,
                    cidade: form.cidade,
                    estado: form.estado,
                    cep: form.cep,
                    tipo: tipoValido,
                };
                const resEndereco = await fetch(`http://localhost:8000/api/enderecos_usuario/${usuario.id}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(enderecoPayload),
                });
                if (!resEndereco.ok) throw new Error('Erro ao atualizar endereço');
            } else {
                // Cria novo endereço
                const enderecoPayload = {
                    usuario: usuario.id,
                    logradouro: form.logradouro,
                    numero: form.numero,
                    complemento: form.complemento,
                    bairro: form.bairro,
                    cidade: form.cidade,
                    estado: form.estado,
                    cep: form.cep,
                    tipo: tipoValido,
                };
                const resEndereco = await fetch(`http://localhost:8000/api/enderecos_usuario/${usuario.id}/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(enderecoPayload),
                });
                if (!resEndereco.ok) throw new Error('Erro ao salvar endereço');
            }
            setUsuario({ ...usuario, ...form });
            setEditando(false);
            toast.success('Dados atualizados com sucesso!');
        } catch (err: any) {
            toast.error(err?.message || 'Erro ao salvar dados.');
        }
    };

    // Função para upload de nova foto
    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!usuario || !e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('foto', file);
        setUploading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/users/${usuario.id}/`, {
                method: 'PUT',
                credentials: 'include',
                body: formData,
            });
            if (!res.ok) throw new Error('Erro ao atualizar foto');
            // Atualiza o perfil após upload
            const res2 = await fetch(`http://localhost:8000/api/users/${usuario.id}/`, { credentials: 'include' });
            const data = await res2.json();
            setUsuario(data);
            toast.success('Foto atualizada com sucesso!');
        } catch (err) {
            toast.error('Erro ao atualizar foto.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando...</div>;
    if (erro) return <div className="p-8 text-center text-red-600">{erro}</div>;
    if (!usuario) return <div className="p-8 text-center">Usuário não encontrado.</div>;

    const enderecoAtual = enderecos[0] || {} as Endereco;

    const renderInputOrText = (name: string, label: string, type = 'text') => (
        <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700" htmlFor={name}>{label}:</label>
            {editando ? (
                <input
                    id={name}
                    name={name}
                    value={form[name] || ''}
                    onChange={handleChange}
                    type={type}
                    placeholder={label}
                    className="border border-indigo-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400 transition"
                />
            ) : (
                <span className="text-gray-900 min-h-[40px] flex items-center">{form[name] || '-'}</span>
            )}
        </div>
    );

    // Novo renderizador para Estado e Tipo
    const renderSelectOrText = (name: string, label: string, options: { value: string, label: string }[], required = false) => (
        <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-700" htmlFor={name}>{label}:</label>
            {editando ? (
                <select
                    id={name}
                    name={name}
                    value={form[name] || ''}
                    onChange={handleChange}
                    required={required}
                    className="border border-indigo-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <span className="text-gray-900 min-h-[40px] flex items-center">{form[name] || '-'}</span>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-10 mt-12 border border-gray-200">
            <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-10 tracking-tight">Meu Perfil</h1>

            {usuario?.foto ? (
                <div className="flex justify-center mb-6 relative group">
                    <img
                        src={`http://localhost:8000${usuario.foto}`}
                        alt="Foto de perfil"
                        className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFotoChange}
                        disabled={uploading}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                        <span className="text-white font-bold">{uploading ? 'Enviando...' : 'Editar'}</span>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center mb-6 relative group">
                    <img
                        src="/img/logo.png"
                        alt="Foto padrão"
                        className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFotoChange}
                        disabled={uploading}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}>
                        <span className="text-white font-bold">{uploading ? 'Enviando...' : 'Editar'}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:gap-10 gap-6 mb-10">
                {/* Dados Pessoais */}
                <div className="flex-1 space-y-4 bg-indigo-50 rounded-xl p-6 shadow-sm border border-indigo-100">
                    <h2 className="text-lg font-bold text-indigo-700 mb-2">Dados Pessoais</h2>
                    {renderInputOrText('nome', 'Nome')}
                    {renderInputOrText('email', 'Email', 'email')}
                    {renderInputOrText('telefone', 'Telefone')}
                    {renderInputOrText('cpf', 'CPF')}
                </div>

                {/* Dados Sistêmico */}
                <div className="flex-1 space-y-4 bg-indigo-50 rounded-xl p-6 shadow-sm border border-indigo-100">
                    <h2 className="text-lg font-bold text-indigo-700 mb-2">Dados Sistêmico</h2>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Tipo:</span>
                        <span className="text-gray-900">{usuario.role}</span>
                    </div>
                    {usuario.crm && (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">CRM:</span>
                            <span className="text-gray-900">{usuario.crm}</span>
                        </div>
                    )}
                    {usuario.crp && (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">CRP:</span>
                            <span className="text-gray-900">{usuario.crp}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${usuario.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {usuario.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end mb-8">
                {!editando ? (
                    <button onClick={handleEdit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow">
                        Editar
                    </button>
                ) : (
                    <>
                        <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow mr-2">
                            Salvar
                        </button>
                        <button onClick={handleCancel} className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold shadow">
                            Cancelar
                        </button>
                    </>
                )}
            </div>

            {/* Endereço */}
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 mt-8 border-b pb-2">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    {renderInputOrText('cep', 'CEP')}
                    {renderInputOrText('logradouro', 'Logradouro')}
                    {renderInputOrText('numero', 'Número')}
                    {renderInputOrText('complemento', 'Complemento')}
                    {renderInputOrText('bairro', 'Bairro')}
                </div>
                <div className="space-y-2">
                    {renderInputOrText('cidade', 'Cidade')}
                    {renderSelectOrText('estado', 'Estado', [
                        { value: '', label: 'Selecione o estado' },
                        { value: 'AC', label: 'Acre' },
                        { value: 'AL', label: 'Alagoas' },
                        { value: 'AP', label: 'Amapá' },
                        { value: 'AM', label: 'Amazonas' },
                        { value: 'BA', label: 'Bahia' },
                        { value: 'CE', label: 'Ceará' },
                        { value: 'DF', label: 'Distrito Federal' },
                        { value: 'ES', label: 'Espírito Santo' },
                        { value: 'GO', label: 'Goiás' },
                        { value: 'MA', label: 'Maranhão' },
                        { value: 'MT', label: 'Mato Grosso' },
                        { value: 'MS', label: 'Mato Grosso do Sul' },
                        { value: 'MG', label: 'Minas Gerais' },
                        { value: 'PA', label: 'Pará' },
                        { value: 'PB', label: 'Paraíba' },
                        { value: 'PR', label: 'Paraná' },
                        { value: 'PE', label: 'Pernambuco' },
                        { value: 'PI', label: 'Piauí' },
                        { value: 'RJ', label: 'Rio de Janeiro' },
                        { value: 'RN', label: 'Rio Grande do Norte' },
                        { value: 'RS', label: 'Rio Grande do Sul' },
                        { value: 'RO', label: 'Rondônia' },
                        { value: 'RR', label: 'Roraima' },
                        { value: 'SC', label: 'Santa Catarina' },
                        { value: 'SP', label: 'São Paulo' },
                        { value: 'SE', label: 'Sergipe' },
                        { value: 'TO', label: 'Tocantins' },
                    ], true)}
                    {renderSelectOrText('tipo', 'Tipo de Endereço', [
                        { value: 'residencial', label: 'Residencial' },
                        { value: 'comercial', label: 'Comercial' },
                        { value: 'consultorio', label: 'Consultório' },
                    ])}
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}
