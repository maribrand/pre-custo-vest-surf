import { useAuthContext } from '../contexts/AuthContext';
import { login, register, logout } from '../services/authService';
import { createUserProfile } from '../services/userProfilesService';
import type { UserRole } from '../App';

export function useAuth() {
  const context = useAuthContext();

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    return result;
  };

  const handleRegister = async (
    email: string,
    password: string,
    role: UserRole = 'rep'
  ) => {
    // Primeiro registra o usuário
    const authResult = await register(email, password, role);
    
    if (authResult.success && authResult.user) {
      // Depois cria o perfil
      const profileResult = await createUserProfile(authResult.user.id, role);
      
      if (!profileResult.success) {
        // Se falhar ao criar perfil, ainda retorna sucesso do registro
        // mas o perfil será criado quando o usuário fizer login
        console.warn('Erro ao criar perfil após registro:', profileResult.error);
      }
    }
    
    return authResult;
  };

  const handleLogout = async () => {
    const result = await logout();
    return result;
  };

  return {
    ...context,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}

