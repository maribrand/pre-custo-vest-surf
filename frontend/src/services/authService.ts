import { supabase } from './supabase';
import type { UserRole } from '../App';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Realiza login do usuário com email e senha
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Erro ao fazer login. Tente novamente.',
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || '',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer login',
    };
  }
}

/**
 * Registra um novo usuário
 */
export async function register(
  email: string,
  password: string,
  role: UserRole = 'rep'
): Promise<AuthResponse> {
  try {
    // Primeiro, cria o usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Erro ao criar conta. Tente novamente.',
      };
    }

    // O perfil será criado automaticamente via trigger ou manualmente após o registro
    // Por enquanto, retornamos sucesso e o perfil será criado no userProfilesService

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || '',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar conta',
    };
  }
}

/**
 * Realiza logout do usuário
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer logout',
    };
  }
}

/**
 * Obtém o usuário atual autenticado
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica se há uma sessão ativa
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.warn('Erro ao obter sessão:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Exceção ao obter sessão:', error);
    return null;
  }
}

/**
 * Escuta mudanças no estado de autenticação
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

