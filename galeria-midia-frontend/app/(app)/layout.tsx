// app/(app)/layout.tsx
'use client'; 

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';

// 1. Importamos o CSS Module para este layout
import styles from './layout.module.css';

// Um componente de 'Carregando'
const LoadingScreen = () => (
  <div className={styles.loadingScreen}>
    <p>Carregando sua sessão...</p>
    {/* Você pode adicionar um spinner de CSS aqui no futuro */}
  </div>
);

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Efeito de Proteção de Rota (lógica inalterada)
  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/login'); 
    }
  }, [isLoading, session, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (session) {
    return (
      // 2. Aplicamos os estilos do CSS Module
      <div className={styles.appContainer}>
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          setIsMobileOpen={setIsMobileMenuOpen} 
        />
        
        <main className={styles.mainContent}>
          {/* Header (só em mobile, para o botão hambúrguer) */}
          <header className={styles.mobileHeader}>
            <h1 className={styles.mobileTitle}>Galeria</h1>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className={styles.menuButton}
            >
              <Menu size={24} />
            </button>
          </header>
          
          {/* O conteúdo da página (ex: /dashboard) */}
          <div className={styles.pageContent}>
            {children}
          </div>
        </main>
      </div>
    );
  }

  return <LoadingScreen />;
}