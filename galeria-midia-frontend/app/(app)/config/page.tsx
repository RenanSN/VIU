// app/(app)/config/page.tsx
'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient'; // Para alterar a senha
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import styles from './config.module.css';

export const dynamic = 'force-dynamic';

export default function ConfigPage() {
  const { user } = useAuth(); // Pega o usuário logado

  // Estado para o formulário de Perfil
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Estado para o formulário de Senha
  const [password, setPassword] = useState('');
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Efeito para buscar os dados de perfil atuais
  useEffect(() => {
    if (user) {
      // O email já temos do AuthContext
      setEmail(user.email || 'Email não encontrado');
      
      // Busca o nome na nossa API do Render
      apiClient.get('/api/profile')
        .then(response => {
          setFullName(response.data.full_name);
        })
        .catch(error => {
          if (error.response?.status === 404) {
            toast.error('Perfil não encontrado. Por favor, atualize seu nome.');
          } else {
            toast.error('Falha ao buscar perfil.');
          }
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    }
  }, [user]);

  // Manipulador para ATUALIZAR O NOME
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    
    try {
      // Chama nossa API do Render
      await apiClient.put('/api/profile', { fullName });
      toast.success('Nome atualizado com sucesso!');
    } catch (error: any) {
      toast.error(`Falha ao atualizar o nome: ${error.message}`);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Manipulador para ATUALIZAR A SENHA
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoadingPassword(true);
    try {
      // Chama a API do Supabase Auth diretamente
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      
      toast.success('Senha atualizada com sucesso!');
      setPassword(''); // Limpa o campo
    } catch (error: any) {
      toast.error(`Falha ao atualizar a senha: ${error.message}`);
    } finally {
      setIsLoadingPassword(false);
    }
  };


  return (
    <div>
      <h1 className={styles.title}>Configurações</h1>

      {/* Card 1: Perfil (Nome e Email) */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Perfil</h2>
        <form onSubmit={handleProfileUpdate} className={styles.form}>
          <div>
            <label className={styles.label} htmlFor="email">
              E-mail (não pode ser alterado)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              className={styles.input}
              disabled // Email não é editável
            />
          </div>
          <div>
            <label className={styles.label} htmlFor="fullName">
              Nome Completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.input}
              disabled={isLoadingProfile}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.button}
              disabled={isLoadingProfile}
            >
              {isLoadingProfile ? 'Salvando...' : 'Salvar Nome'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Card 2: Alterar Senha */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Alterar Senha</h2>
        <form onSubmit={handlePasswordUpdate} className={styles.form}>
          <div>
            <label className={styles.label} htmlFor="password">
              Nova Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              disabled={isLoadingPassword}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.button}
              disabled={isLoadingPassword}
            >
              {isLoadingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}