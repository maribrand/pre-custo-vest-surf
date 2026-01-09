import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { getSession, onAuthStateChange } from '../services/authService';
import { getUserProfile, createUserProfile } from '../services/userProfilesService';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const loadUserProfile = async (userId) => {
        try {
            console.log('🔵 Carregando perfil para usuário:', userId);
            const result = await getUserProfile(userId);
            if (result.success && result.profile) {
                console.log('✅ Perfil carregado:', result.profile);
                setProfile(result.profile);
                return true;
            }
            else if (result.success && !result.profile) {
                console.log('🔵 Perfil não encontrado, criando novo...');
                const createResult = await createUserProfile(userId, 'rep');
                if (createResult.success && createResult.profile) {
                    console.log('✅ Perfil criado:', createResult.profile);
                    setProfile(createResult.profile);
                    return true;
                }
                else {
                    console.warn('⚠️ Não foi possível criar perfil:', createResult.error);
                }
            }
            else {
                console.warn('⚠️ Erro ao buscar perfil:', result.error);
            }
            return false;
        }
        catch (error) {
            console.error('❌ Erro ao carregar perfil:', error);
            return false;
        }
    };
    const refreshProfile = async () => {
        if (user) {
            await loadUserProfile(user.id);
        }
    };
    useEffect(() => {
        let mounted = true;
        let loadingFinished = false;
        console.log('🔵 AuthContext: Iniciando inicialização...');
        // Timeout de segurança ABSOLUTO - sempre termina o loading
        const absoluteTimeout = setTimeout(() => {
            if (mounted && !loadingFinished) {
                console.warn('⚠️ TIMEOUT ABSOLUTO: Forçando finalização do loading após 5 segundos');
                setLoading(false);
                loadingFinished = true;
            }
        }, 5000);
        // Carrega estado inicial
        const initializeAuth = async () => {
            try {
                console.log('🔵 AuthContext: Chamando getSession()...');
                // Timeout mais curto para getSession
                const sessionPromise = getSession();
                const sessionTimeout = new Promise((resolve) => setTimeout(() => {
                    console.warn('⚠️ Timeout no getSession() após 2 segundos');
                    resolve(null);
                }, 2000));
                const session = await Promise.race([sessionPromise, sessionTimeout]);
                console.log('🔵 AuthContext: getSession() retornou:', session ? 'Sessão encontrada' : 'Sem sessão');
                if (session?.user && mounted) {
                    console.log('🔵 AuthContext: Usuário encontrado:', session.user.email);
                    setUser({
                        id: session.user.id,
                        email: session.user.email || null,
                    });
                    // Carrega perfil com timeout
                    console.log('🔵 AuthContext: Carregando perfil...');
                    const profilePromise = loadUserProfile(session.user.id);
                    const profileTimeout = new Promise((resolve) => setTimeout(() => {
                        console.warn('⚠️ Timeout ao carregar perfil após 2 segundos');
                        resolve(null);
                    }, 2000));
                    await Promise.race([profilePromise, profileTimeout]);
                }
                else {
                    console.log('🔵 AuthContext: Nenhuma sessão ativa');
                }
            }
            catch (error) {
                console.error('❌ Erro ao inicializar autenticação:', error);
            }
            finally {
                if (mounted && !loadingFinished) {
                    console.log('✅ AuthContext: Finalizando loading da autenticação');
                    clearTimeout(absoluteTimeout);
                    setLoading(false);
                    loadingFinished = true;
                }
            }
        };
        initializeAuth();
        // Escuta mudanças no estado de autenticação
        let subscription = null;
        try {
            const { data } = onAuthStateChange(async (event, session) => {
                if (!mounted)
                    return;
                console.log('🔵 AuthContext: Evento de autenticação:', event);
                if (event === 'SIGNED_IN' && session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || null,
                    });
                    await loadUserProfile(session.user.id).catch((err) => {
                        console.error('Erro ao carregar perfil no SIGNED_IN:', err);
                    });
                    if (mounted && !loadingFinished) {
                        setLoading(false);
                        loadingFinished = true;
                    }
                }
                else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    if (mounted && !loadingFinished) {
                        setLoading(false);
                        loadingFinished = true;
                    }
                }
                else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || null,
                    });
                    await loadUserProfile(session.user.id).catch((err) => {
                        console.error('Erro ao carregar perfil no TOKEN_REFRESHED:', err);
                    });
                }
            });
            subscription = data.subscription;
        }
        catch (error) {
            console.error('Erro ao configurar listener de autenticação:', error);
        }
        return () => {
            console.log('🔵 AuthContext: Cleanup');
            mounted = false;
            clearTimeout(absoluteTimeout);
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);
    // Polling automático para verificar atualizações do perfil quando não aprovado
    useEffect(() => {
        if (!user) {
            return; // Não faz polling se não tem usuário
        }
        // Se já está aprovado, não precisa fazer polling
        if (profile?.is_approved) {
            return;
        }
        console.log('🔵 AuthContext: Iniciando polling para verificar aprovação...');
        // Verifica atualizações a cada 10 segundos
        const pollingInterval = setInterval(async () => {
            if (user) {
                console.log('🔄 Verificando atualização do perfil...');
                try {
                    const result = await getUserProfile(user.id);
                    if (result.success && result.profile) {
                        setProfile(result.profile);
                        // Se foi aprovado, o intervalo será limpo automaticamente no próximo render
                    }
                }
                catch (error) {
                    console.error('❌ Erro ao verificar atualização do perfil:', error);
                }
            }
        }, 10000); // 10 segundos
        return () => {
            console.log('🔵 AuthContext: Parando polling');
            clearInterval(pollingInterval);
        };
    }, [user?.id, profile?.is_approved]); // Usa user.id e profile.is_approved como dependências estáveis
    const isAuthenticated = !!user;
    const isApproved = profile?.is_approved ?? false;
    const userRole = profile?.role;
    // Admin tem acesso a todas as páginas
    const canAccessAdmin = isApproved && userRole === 'admin';
    const canAccessPCP = isApproved && (userRole === 'admin' || userRole === 'pcp');
    const canAccessRep = isApproved && (userRole === 'admin' || userRole === 'rep');
    const value = {
        user,
        profile,
        loading,
        isAuthenticated,
        isApproved,
        canAccessAdmin,
        canAccessPCP,
        canAccessRep,
        refreshProfile,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
    }
    return context;
}
