"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBackendUrl } from '../utils/backend';

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

interface Psiquiatra {
  id: number;
  nome: string;
  email: string;
  crm: string;
  especialidade?: string;
  telefone?: string;
  enderecos?: Endereco[];
  mp_user_id?: string; // Mercado Pago user id
  mp_access_token?: string; // Mercado Pago access token
  foto?: string;
}

interface FormPsiquiatra extends Partial<Psiquiatra>, Partial<Endereco> {}

export default function PerfilPsiquiatra() {
  const [psiquiatra, setPsiquiatra] = useState<Psiquiatra | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await fetch(`${getBackendUrl()}/usuario_jwt/`, { credentials: "include" });
        if (!res.ok) throw new Error("Não autenticado");
        const user = await res.json();
        if (user.role !== "Psiquiatra") {
          router.push("/login");
          return;
        }

        const res2 = await fetch(`${getBackendUrl()}/api/users/${user.id}/`, {
          credentials: "include",
        });
        if (!res2.ok) throw new Error("Erro ao buscar dados do psiquiatra");
        const data = await res2.json();
        setPsiquiatra(data);
        setEnderecos(data.enderecos || []);
        const endereco = data.enderecos?.[0] || {};
        setForm({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone || '',
          crm: data.crm || '',
          especialidade: data.especialidade || '',
          valor_consulta: data.valor_consulta || '',
          foto: data.foto || '',
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
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [router]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
    toast.info('Modo de edição ativado.');
  };
  const handleCancel = () => {
    setEditando(false);
    toast.info('Edição cancelada.');
  };
  const handleSave = async () => {
    if (!psiquiatra) return;
    try {
      const res = await fetch(`${getBackendUrl()}/api/users/${psiquiatra.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erro ao salvar');

      const tipoNormalizado = (form.tipo || '').toLowerCase();
      const tipoValido = ["residencial", "comercial", "consultorio"].includes(tipoNormalizado)
        ? tipoNormalizado
        : "residencial";

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

      const enderecoRequest = enderecos.length
        ? fetch(`http://localhost:8000/api/enderecos_usuario/${psiquiatra.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(enderecoPayload),
          })
        : fetch(`http://localhost:8000/api/enderecos_usuario/${psiquiatra.id}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ ...enderecoPayload, usuario: psiquiatra.id }),
          });

      const resEndereco = await enderecoRequest;
      if (!resEndereco.ok) throw new Error('Erro ao salvar endereço');

      setPsiquiatra({ ...psiquiatra, ...form });
      setEditando(false);
      toast.success('Dados atualizados com sucesso!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar dados.');
    }
  };

  // Função para onboarding Mercado Pago
  // Eu envio o user_id como query param para o backend incluir no state do OAuth
  const handleMercadoPagoOnboarding = async () => {
    if (!psiquiatra) return;
    try {
      const res = await fetch(`${getBackendUrl()}/api/mercadopago/oauth/?user_id=${psiquiatra.id}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        toast.error(data.error || 'Erro ao iniciar onboarding Mercado Pago.');
      }
    } catch (err) {
      toast.error('Erro ao conectar com o Mercado Pago.');
    }
  };

  // Função para upload de nova foto
  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!psiquiatra || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('foto', file);
    setUploading(true);
    try {
      const res = await fetch(`${getBackendUrl()}/api/users/${psiquiatra.id}/`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error('Erro ao atualizar foto');
      // Atualiza o perfil após upload
      const res2 = await fetch(`${getBackendUrl()}/api/users/${psiquiatra.id}/`, { credentials: 'include' });
      const data = await res2.json();
      setPsiquiatra(data);
      toast.success('Foto atualizada com sucesso!');
    } catch (err) {
      toast.error('Erro ao atualizar foto.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (erro) return <div className="p-8 text-center text-red-600">{erro}</div>;
  if (!psiquiatra) return <div className="p-8 text-center">Usuário não encontrado.</div>;

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
          className="border border-indigo-300 rounded-lg px-3 py-2 w-full"
        />
      ) : (
        <span className="text-gray-900 min-h-[40px] flex items-center">{form[name] || '-'}</span>
      )}
    </div>
  );

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
          className="border border-indigo-300 rounded-lg px-3 py-2 w-full"
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
      <div className="flex justify-center mb-6 relative group">
        <img
          src={psiquiatra.foto ? `${getBackendUrl()}${psiquiatra.foto}` : "/img/logo.png"}
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
      <div className="flex flex-col md:flex-row md:gap-10 gap-6 mb-10">
        {/* Dados Pessoais */}
        <div className="flex-1 space-y-4 bg-indigo-50 rounded-xl p-6 shadow-sm border border-indigo-100">
          <h2 className="text-lg font-bold text-indigo-700 mb-2">Dados Pessoais</h2>
          {renderInputOrText('nome', 'Nome')}
          {renderInputOrText('email', 'Email', 'email')}
          {renderInputOrText('telefone', 'Telefone')}
        </div>
        {/* Dados Profissionais */}
        <div className="flex-1 space-y-4 bg-indigo-50 rounded-xl p-6 shadow-sm border border-indigo-100">
          <h2 className="text-lg font-bold text-indigo-700 mb-2">Dados Profissionais</h2>
          {renderInputOrText('crm', 'CRM')}
          {renderInputOrText('especialidade', 'Especialidade')}
          {renderInputOrText('valor_consulta', 'Valor da Consulta (R$)', 'number')}
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

      {/* Mercado Pago - status e ação */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {psiquiatra?.mp_user_id ? (
          <span className="px-4 py-2 rounded bg-green-100 text-green-700 font-semibold">Conta Mercado Pago ativa</span>
        ) : (
          <>
            <span className="px-4 py-2 rounded bg-yellow-100 text-yellow-700 font-semibold">Conta Mercado Pago pendente</span>
            <button
              onClick={handleMercadoPagoOnboarding}
              className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow"
            >
              Vincular Mercado Pago
            </button>
          </>
        )}
      </div>
    </div>
  );
}
