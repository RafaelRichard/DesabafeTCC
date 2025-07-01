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

// Exemplo de uso:
// fetch(`${getBackendUrl()}/api/mercadopago/pagamento/`, ...)
