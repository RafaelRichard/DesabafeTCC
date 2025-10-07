// Função para estornar pagamento de um agendamento
export async function refundAgendamentoStripe(agendamentoId: number) {
  const url = `${getBackendUrl()}/api/stripe/estorno/${agendamentoId}/`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao estornar pagamento');
  }
  return resp.json();
}
// Centraliza a URL base do backend para facilitar troca entre localhost e ngrok

// Tente usar variável de ambiente NEXT_PUBLIC_BACKEND_URL, senão use localhost
export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    // Permite sobrescrever via localStorage para testes rápidos
    const localOverride = window.localStorage.getItem('backend_url');
    if (localOverride) return localOverride;
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
}

/**
 * Formata data e hora corretamente, priorizando data_hora_local do backend
 * @param dataHora - String ISO da data/hora (preferir data_hora_local se disponível)
 * @returns String formatada "DD/MM/YYYY às HH:MM"
 */
export function formatarDataHora(dataHora: string | undefined | null): string {
  if (!dataHora) return '-';
  
  try {
    const data = new Date(dataHora);
    
    // Verifica se a data é válida
    if (isNaN(data.getTime())) return '-';
    
    // Usa toLocaleString com timezone de São Paulo para garantir consistência
    return data.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', ' às');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
}

// Exemplo de uso:

