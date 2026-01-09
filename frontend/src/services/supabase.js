import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Debug: verifica se as variáveis estão sendo lidas (apenas em desenvolvimento)
if (import.meta.env.DEV) {
    console.log('🔍 Verificando variáveis de ambiente:');
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');
}
// Cria o cliente mesmo sem variáveis (para evitar erro de inicialização)
// Os serviços verificarão se está configurado antes de usar
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');
// Função auxiliar para verificar se está configurado
export function isSupabaseConfigured() {
    const configured = !!(supabaseUrl && supabaseAnonKey);
    if (import.meta.env.DEV && !configured) {
        console.warn('⚠️ Supabase não configurado. Verifique o arquivo .env.local');
    }
    return configured;
}
// Função para obter mensagem de erro de configuração
export function getConfigurationError() {
    if (!supabaseUrl && !supabaseAnonKey) {
        return 'Variáveis de ambiente do Supabase não configuradas. Crie o arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY';
    }
    if (!supabaseUrl) {
        return 'VITE_SUPABASE_URL não configurada no arquivo .env.local';
    }
    if (!supabaseAnonKey) {
        return 'VITE_SUPABASE_ANON_KEY não configurada no arquivo .env.local';
    }
    return null;
}
