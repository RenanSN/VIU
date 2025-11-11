// app/tv/page.tsx
import { Suspense } from 'react';
import TvClientPage from './TvClientPage'; // O nosso componente antigo

// Um 'fallback' (tela de carregamento) simples
const Loading = () => {
  return (
    <div style={{
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--dark-background)',
      color: 'var(--dark-foreground)'
    }}>
      A carregar TV...
    </div>
  );
};

// Esta é a nova Page (agora um Server Component)
export default function TvPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TvClientPage />
    </Suspense>
  );
}