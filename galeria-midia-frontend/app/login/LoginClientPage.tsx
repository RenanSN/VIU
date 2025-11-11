// app/login/page.tsx
'use client'; 

import { useState, useEffect } from 'react'; // 1. Importa useEffect
import { supabase } from '@/lib/supabaseClient';
import apiClient from '@/lib/apiClient';
import { useRouter, useSearchParams } from 'next/navigation'; // 2. Importa useSearchParams
import { toast } from 'react-hot-toast';
import styles from './login.module.css';
import Link from 'next/link'; // 3. Importa Link


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // O estado que controla o modo
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook para ler a URL

  // 4. EFEITO PARA LER O PARÂMETRO DA URL
  useEffect(() => {
    // Checa se a URL é .../login?mode=register
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsSignUp(true); // Ativa o modo de cadastro
    }
  }, [searchParams]); // Roda quando os parâmetros da URL mudam

  // ... (a lógica handleSubmit e handleOAuthLogin continua a mesma) ...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      // --- LÓGICA DE CADASTRO ---
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (authError) throw authError;

        if (!authData.session) {
          toast.success('Cadastro realizado! Verifique seu e-mail para confirmar.');
          setIsSignUp(false); 
        } 
        else if (authData.session) {
          toast.success('Cadastro e login realizados!');
          
          await apiClient.post(
            '/api/auth/sync',
            { fullName },
            {
              headers: {
                Authorization: `Bearer ${authData.session.access_token}`,
              },
            }
          );
          
          router.push('/dashboard');
        }

      } catch (error: any) {
        toast.error(`Erro no cadastro: ${error.message}`);
      }
    } else {
      // --- LÓGICA DE LOGIN ---
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success('Login bem-sucedido!');
        router.push('/dashboard');

      } catch (error: any) {
        toast.error(`Erro no login: ${error.message}`);
      }
    }
    setIsLoading(false);
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <div className={styles.container}>
      {/* 5. CABEÇALHO ADICIONADO COM LINK PARA HOME */}
      <header className={styles.pageHeader}>
        <Link href="/">
          <img
            src="/assets/images/viu-logo-full.png"
            alt="VIU Logo"
            className={styles.logoImage}
          />
        </Link>
      </header>

      <div className={styles.card}>
        <h1 className={styles.title}>
          {isSignUp ? 'Criar Conta' : 'Acessar Galeria'}
        </h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignUp && (
            <div className="mb-4">
              <label htmlFor="fullName">Nome Completo</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? 'Carregando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
          </button>
        </form>
        
        <div className={styles.divider}>
          <span>OU</span>
        </div>
        
        <button
          onClick={() => handleOAuthLogin('google')}
          className={styles.oauthButton}
        >
          Entrar com Google
        </button>
        
        <p className={styles.toggleForm}>
          {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Faça login' : 'Cadastre-se'}
          </button>
        </p>
      </div>
    </div>
  );
}