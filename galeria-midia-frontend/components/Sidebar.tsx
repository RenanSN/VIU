// components/Sidebar.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, LogOut, X, BarChart2 } from 'lucide-react';

// 1. Importamos o CSS Module
import styles from './Sidebar.module.css';

type SidebarProps = {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
};

// Componente de link de navegação reutilizável
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  // 2. Lógica para aplicar a classe 'active'
  const linkClassName = `${styles.navLink} ${isActive ? styles.active : ''}`;

  return (
    <Link href={href} className={linkClassName}>
      {children}
    </Link>
  );
};

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const { signOut, user } = useAuth();
  
  const sidebarContent = (
    <div className={styles.sidebarContent}>
      <div className={styles.sidebarHeader}>
        <Link href="/dashboard" className={styles.logo}>
          Galeria
        </Link>
        <div className={styles.headerActions}>
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className={styles.closeButton}
          >
            <X size={24} />
          </button>
        </div>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li>
            <NavLink href="/dashboard">
              <Home size={20} /> Mídias (Grupos)
            </NavLink>
          </li>
          <li>
            <NavLink href="/analytics"> {/* ATUALIZEI A ROTA PARA O PROMPT 6 */}
              <BarChart2 size={20} /> Analytics
            </NavLink>
          </li>
          <li>
            <NavLink href="/config"> {/* ATUALIZEI A ROTA PARA O PROMPT 6 */}
              <Settings size={20} /> Configuração
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className={styles.sidebarFooter}>
        <div className={styles.profileInfo}>
          <div className={styles.profileEmail}>
            {user?.email}
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className={styles.logoutButton}
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </div>
  );

  // 3. Lógica de classes para mobile/desktop
  const mobileMenuClassName = `
    ${styles.sidebarMobile}
    ${isMobileOpen ? styles.mobileOpen : styles.mobileClosed}
  `;

  return (
    <>
      {/* 1. Sidebar de Desktop (Sempre visível, estático) */}
      <aside className={styles.sidebarDesktop}>
        {sidebarContent}
      </aside>

      {/* 2. Sidebar de Mobile (Overlay, controlado por estado) */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className={styles.overlay}
        />
      )}
      <aside className={mobileMenuClassName}>
        {sidebarContent}
      </aside>
    </>
  );
}