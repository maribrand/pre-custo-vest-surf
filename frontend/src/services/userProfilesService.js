import { supabase } from './supabase';
/**
 * Cria um perfil de usuário após o registro
 */
export async function createUserProfile(userId, role = 'rep') {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .insert({
            user_id: userId,
            role,
            is_approved: false, // Sempre começa como não aprovado
        })
            .select()
            .single();
        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
        return {
            success: true,
            profile: data,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido ao criar perfil',
        };
    }
}
/**
 * Busca o perfil do usuário atual
 */
export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error) {
            // Se não encontrar, retorna null sem erro (usuário pode não ter perfil ainda)
            if (error.code === 'PGRST116') {
                return {
                    success: true,
                    profile: undefined,
                };
            }
            return {
                success: false,
                error: error.message,
            };
        }
        return {
            success: true,
            profile: data,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar perfil',
        };
    }
}
/**
 * Lista todos os perfis de usuário (apenas para admin)
 * Nota: Os emails não são retornados diretamente por questões de segurança.
 * Para obter emails, seria necessário criar uma função RPC no Supabase ou usar
 * a API de administração do Supabase (que requer service_role key).
 */
export async function getAllUserProfiles() {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
        // Retorna os perfis sem email (email será mostrado como user_id se necessário)
        // Para obter emails, seria necessário criar uma função RPC no Supabase
        const profilesWithEmail = (data || []).map((profile) => ({
            ...profile,
            email: undefined, // Email não disponível via cliente Supabase por segurança
        }));
        return {
            success: true,
            profiles: profilesWithEmail,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido ao listar perfis',
        };
    }
}
/**
 * Atualiza o perfil de um usuário (apenas admin pode fazer isso)
 */
export async function updateUserProfile(profileId, updates) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
            .eq('id', profileId)
            .select()
            .single();
        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }
        return {
            success: true,
            profile: data,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar perfil',
        };
    }
}
/**
 * Aprova um usuário e atribui um perfil (função auxiliar para admin)
 */
export async function approveUser(profileId, role) {
    return updateUserProfile(profileId, {
        is_approved: true,
        role,
    });
}
/**
 * Busca perfis de usuários com seus emails (usando função RPC ou query alternativa)
 * Como não temos acesso admin direto, vamos usar uma abordagem diferente
 */
export async function getUserProfilesWithEmails() {
    try {
        // Primeiro, busca os perfis
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (profilesError) {
            return {
                success: false,
                error: profilesError.message,
            };
        }
        // Para obter emails, precisamos fazer uma query que retorne também os dados do auth.users
        // Como não temos acesso direto ao auth.users via RLS, vamos retornar os perfis
        // e o email será buscado no frontend através do contexto de autenticação quando disponível
        // ou através de uma função RPC no Supabase (que precisaria ser criada)
        return {
            success: true,
            profiles: profiles || [],
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar perfis',
        };
    }
}
