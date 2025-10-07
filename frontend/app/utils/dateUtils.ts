/**
 * Utilitários para conversão consistente de datas e horários
 * entre backend e frontend, lidando corretamente com timezones
 */

/**
 * Converte uma resposta de agendamento do backend para um objeto Date válido
 * Prioriza data_hora_local (já convertido para timezone local no backend),
 * depois data_hora ISO, depois data_iso, e por último reconstrói de data+hora
 */
export function parseAgendamentoDateTime(agendamento: any): Date | null {
  // 1. PRIORIDADE MÁXIMA: data_hora_local (já vem convertido do backend)
  if (agendamento.data_hora_local) {
    const date = new Date(agendamento.data_hora_local);
    return isValidDate(date) ? date : null;
  }
  
  // 2. Priorizar data_hora ISO completo com timezone
  if (agendamento.data_hora) {
    const date = new Date(agendamento.data_hora);
    return isValidDate(date) ? date : null;
  }
  
  // 3. Fallback para data_iso (mesmo formato que data_hora)
  if (agendamento.data_iso) {
    const date = new Date(agendamento.data_iso);
    return isValidDate(date) ? date : null;
  }
  
  // 4. Último fallback - reconstruir de data + hora separados
  // ATENÇÃO: Este método pode ter problemas de timezone!
  if (agendamento.data && agendamento.hora) {
    const timeStr = agendamento.hora.length === 5 ? agendamento.hora + ':00' : agendamento.hora;
    const dateTimeStr = `${agendamento.data}T${timeStr}`;
    const date = new Date(dateTimeStr);
    return isValidDate(date) ? date : null;
  }
  
  return null;
}

/**
 * Verifica se uma data é válida
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Converte uma data local para ISO string para envio ao backend
 * Garante que a data seja enviada no formato correto
 */
export function formatDateTimeForBackend(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  if (!isValidDate(date)) {
    throw new Error('Data inválida fornecida para formatDateTimeForBackend');
  }
  
  return date.toISOString();
}

/**
 * Converte lista de agendamentos do backend para eventos de calendário
 * Padroniza o processamento em todas as páginas de consulta
 */
export function convertAgendamentosToEvents(agendamentos: any[], titleField: string = 'paciente'): any[] {
  return agendamentos.map((agendamento: any) => {
    const start = parseAgendamentoDateTime(agendamento);
    const end = start ? new Date(start.getTime() + 60 * 60 * 1000) : null;
    
    // Determina o nome para o título baseado no campo especificado
    let titleName = '';
    if (titleField === 'paciente' && agendamento.paciente?.nome) {
      titleName = agendamento.paciente.nome;
    } else if (titleField === 'profissional' && agendamento.profissional?.nome) {
      titleName = agendamento.profissional.nome;
    }
    
    return {
      ...agendamento,
      title: `${titleName} (${agendamento.status})`,
      start,
      end,
      link_consulta: agendamento.link_consulta || '',
    };
  }).filter((event: any) => {
    // Filtra apenas eventos com datas válidas
    return isValidDate(event.start) && isValidDate(event.end);
  });
}

/**
 * Formata uma data para exibição em prontuários e outras áreas
 * Usa o timezone local do navegador
 */
export function formatDateTimeForDisplay(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  if (!isValidDate(date)) {
    return 'Data inválida';
  }
  
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}