// contexts/AuthContext.tsx
'use client'; // Contextos React precisam ser Componentes de Cliente

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Nosso cliente Supabase
import { Session, User } from '@supabase/supabase-js';

// 1. Definimos o tipo de dados que nosso contexto irá prover
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => void;
};

// 2. Criamos o Contexto React
//    (O '!' é uma garantia ao TypeScript de que vamos prover um valor)
const AuthContext = createContext<AuthContextType>(null!);

// 3. Criamos o "Provedor" (AuthProvider)
//    Este é o componente que vai "envolver" nossa aplicação
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa carregando
  const router = useRouter();

  // Função para fazer o logout
  const signOut = async () => {
    await supabase.auth.signOut();
    // O onAuthStateChange abaixo cuidará de limpar os estados
    router.push('/login'); // Redireciona para o login
  };

  // O "coração" do nosso contexto:
  // O useEffect vai rodar UMA VEZ quando o componente montar
  useEffect(() => {
    setIsLoading(true);

    // 1. Tenta pegar a sessão inicial (caso o usuário já esteja logado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Ouve por MUDANÇAS no estado de autenticação
    //    (Login, Logout, Token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event); // 'SIGNED_IN', 'SIGNED_OUT'
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // 3. Função de "limpeza": remove o "ouvinte" quando o
    //    componente for desmontado (para evitar vazamento de memória)
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 4. Os "valores" que o contexto vai prover para
  //    todos os componentes filhos (nossa app inteira)
  const value = {
    session,
    user,
    isLoading,
    signOut,
  };

  // Renderiza os 'children' (o resto da app) dentro do Provedor
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 5. Criamos um "Hook" customizado (useAuth)
//    Isso facilita o uso do contexto em outros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};