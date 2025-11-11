// app/login/page.tsx
import { Suspense } from 'react';
import LoginClientPage from './LoginClientPage'; // O nosso componente antigo

// Um 'fallback' (tela de carregamento) simples
const Loading = () => {
  return (
    <div style={{
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      A carregar...
    </div>
  );
};

// Esta é a nova Page (agora um Server Component)
export default function LoginPage() {
  return (
    // O Vercel agora fica feliz, pois o
    // componente que usa 'useSearchParams'
    // está dentro de um Suspense.
    <Suspense fallback={<Loading />}>
      <LoginClientPage />
    </Suspense>
  );
}