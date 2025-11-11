// app/tv/page.tsx
'use client'; 

import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/lib/apiClient'; 
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';
import styles from './tv.module.css';
import Link from 'next/link';

// ==================================================
// CONFIGURAÇÃO DO SLIDESHOW
const SLIDE_DURATION_MS = 10000; // 10 segundos
// ==================================================

interface Media {
  id: number;
  file_name: string;
  file_type: string;
  storage_path: string;
}
interface GroupDetails {
  id: number;
  name: string;
  media: Media[];
}


export default function TvPage() {
  // Estado do formulário
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado do slideshow
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  
  // Refs para Analytics
  const sessionIdRef = useRef<string | null>(null);
  const currentMediaIdRef = useRef<number | null>(null);
  
  const searchParams = useSearchParams();

  // Função para buscar o grupo (lógica do formulário)
  const fetchGroup = useCallback(async (shareCode: string) => {
    if (!shareCode) return;
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.get(`/api/view/${shareCode}`);
      const groupData: GroupDetails = response.data;
      
      if (groupData.media.length === 0) {
        setError('Este grupo não contém mídias.');
        setGroup(null);
        return;
      }

      setGroup(groupData);
      setCurrentItemIndex(0); 
      
      // Inicia a sessão de analytics (agora é async)
      await startAnalyticsSession(shareCode, groupData);

    } catch (err: any) {
      setError('Código de grupo inválido ou não encontrado.');
      setGroup(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // startAnalyticsSession será definida abaixo

  // Efeito que checa a URL (ex: /tv?code=...)
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setCode(codeFromUrl); 
      fetchGroup(codeFromUrl);
    }
  }, [searchParams, fetchGroup]);

  // Manipulador do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroup(code);
  };
  
  // Função para pegar a URL pública da mídia
  const getPublicUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('media_files').getPublicUrl(storagePath);
    return data.publicUrl;
  };

  // LÓGICA DO SLIDESHOW
  const goToNextSlide = useCallback(() => {
    if (!group) return;
    setCurrentItemIndex((prevIndex) => (prevIndex + 1) % group.media.length);
  }, [group]);

  useEffect(() => {
    if (!group || group.media.length <= 1) return;
    
    const currentMedia = group.media[currentItemIndex];
    const isVideo = currentMedia.file_type.startsWith('video');

    if (!isVideo) {
      const timer = setTimeout(goToNextSlide, SLIDE_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [currentItemIndex, group, goToNextSlide]);


  // LÓGICA DE COLETA DE ANALYTICS
  
  // Efeito que envia o "ping" QUANDO o slide muda
  useEffect(() => {
    if (!group || !sessionIdRef.current) return; // Não roda se a sessão não começou
    
    const newMediaId = group.media[currentItemIndex].id;
    currentMediaIdRef.current = newMediaId;
    sendAnalyticsPing();

  }, [currentItemIndex, group]);

  // Função que envia o "ping" de visibilidade
  const sendAnalyticsPing = () => {
    const currentMediaId = currentMediaIdRef.current;
    const sessionId = sessionIdRef.current;

    if (!currentMediaId || !sessionId) return;
    
    const payload = {
      sessionId: sessionId,
      events: [{
        media_id: currentMediaId,
        visible_duration_ms: SLIDE_DURATION_MS, 
      }]
    };

    apiClient.post('/api/analytics/events', payload).catch(err => {
      // Se o erro 500 acontecer de novo, veremos aqui
      console.error("Erro no ping de analytics:", err); 
    });
  };

  // =================================================================
  // CORREÇÃO DA "RACE CONDITION" ESTÁ AQUI
  // =================================================================
  const startAnalyticsSession = async (shareCode: string, groupData: GroupDetails) => { // 1. Adiciona 'async'
    const newSessionId = crypto.randomUUID();
    sessionIdRef.current = newSessionId;
    
    try {
      // 2. AVISA E ESPERA (await)
      await apiClient.post('/api/analytics/start', {
        shareCode: shareCode,
        sessionId: newSessionId,
      });

      // 3. SÓ DEPOIS que a sessão foi criada,
      // envia o primeiro ping.
      const firstMediaId = groupData.media[0].id;
      if (firstMediaId) {
        currentMediaIdRef.current = firstMediaId;
        sendAnalyticsPing();
      }

    } catch (err) {
      console.error("Falha ao iniciar a sessão de analytics:", err);
    }
    
    // Configura o "end session"
    const handleBeforeUnload = () => {
      const endPayload = JSON.stringify({ sessionId: sessionIdRef.current });
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/end`,
        endPayload
      );
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Limpeza
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  };

  // RENDERIZAÇÃO (Formulário)
  if (!group) {
    return (
      <div className={styles.formContainer}>

        <header className={styles.pageHeader}>
          <Link href="/">
            <img
              src="/assets/images/viu-logo-full.png"
              alt="VIU Logo"
              className={styles.logoImage}
            />
          </Link>
        </header>

        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>Acessar Galeria de Mídia</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={styles.input}
              placeholder="Código do Grupo"
              maxLength={8}
            />
            <button
              type="submit"
              disabled={isLoading || code.length < 8}
              className={styles.submitButton}
            >
              {isLoading ? 'Carregando...' : 'Acessar'}
            </button>
            {error && <p className={styles.errorText}>{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  // RENDERIZAÇÃO (Slideshow)
  return (
    <div className={styles.slideshowContainer}>
      {group.media.map((item, index) => {
        const url = getPublicUrl(item.storage_path);
        const isVideo = item.file_type.startsWith('video');
        const isActive = index === currentItemIndex;

        return (
          <div
            key={item.id}
            className={`${styles.slide} ${isActive ? styles.slideActive : ''}`}
          >
            {isVideo ? (
              <video
                src={url}
                className={styles.media}
                autoPlay
                muted
                playsInline
                onEnded={goToNextSlide}
              />
            ) : (
              <img
                src={url}
                alt={item.file_name}
                className={styles.media}
              />
            )}
          </div>
        );
      })}
      <div className={styles.mediaName}>
        {group.media[currentItemIndex].file_name}
      </div>
    </div>
  );
}