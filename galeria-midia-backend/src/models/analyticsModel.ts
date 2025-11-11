// src/models/analyticsModel.ts

import { supabase } from '../lib/supabaseClient';

/**
 * Inicia uma nova sessão de analytics.
 * @param shareCode O código do grupo sendo visualizado.
 * @param sessionIdText O ID de sessão único gerado pelo cliente.
 */
export const startSession = async (shareCode: string, sessionIdText: string) => {
  // 1. Encontra o 'group_id' a partir do 'shareCode'
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('share_code', shareCode)
    .single();

  if (groupError || !group) {
    throw new Error('Group not found for the provided share code.');
  }

  // 2. Insere a nova sessão
  const { data, error: sessionError } = await supabase
    .from('analytics_sessions')
    .insert({
      session_id_text: sessionIdText,
      group_id: group.id,
      start_time: new Date().toISOString(),
      // 'end_time' fica nulo por enquanto
    })
    .select()
    .single();

  if (sessionError) {
    console.error('Error starting analytics session:', sessionError.message);
    throw new Error(sessionError.message);
  }
  return { ...data, group_id: group.id };
};

/**
 * Encerra uma sessão de analytics (define o 'end_time').
 * @param sessionIdText O ID de sessão único gerado pelo cliente.
 */
export const endSession = async (sessionIdText: string) => {
  const { error } = await supabase
    .from('analytics_sessions')
    .update({ end_time: new Date().toISOString() })
    .eq('session_id_text', sessionIdText);
  
  if (error) {
    console.error('Error ending session:', error.message);
    // Não é um erro fatal, apenas logamos
  }
  return { message: 'Session ended.' };
};

/**
 * Registra eventos de visibilidade de mídia (os "pings" do frontend).
 * @param sessionIdText O ID da sessão.
 * @param events Um array de eventos de visibilidade.
 */
export const recordVisibilityEvents = async (
  sessionIdText: string,
  events: { media_id: number; visible_duration_ms: number }[],
) => {
  // 1. Verifica se a sessão existe (e não está encerrada)
  const { data: session, error: sessionError } = await supabase
    .from('analytics_sessions')
    .select('id')
    .eq('session_id_text', sessionIdText)
    .is('end_time', null) // Só registra se a sessão estiver ativa
    .single();
  
  if (sessionError || !session) {
    throw new Error('Active session not found.');
  }

  // 2. Formata os eventos para inserção em lote
  const eventsToInsert = events.map(event => ({
    session_id_text: sessionIdText,
    media_id: event.media_id,
    visible_duration_ms: event.visible_duration_ms,
  }));

  // 3. Insere todos os eventos de uma vez
  const { error: insertError } = await supabase
    .from('analytics_events')
    .insert(eventsToInsert);
  
  if (insertError) {
    console.error('Error recording analytics events:', insertError.message);
    throw new Error(insertError.message);
  }
  return { message: `${events.length} events recorded.` };
};

/**
 * Busca os dados agregados para o dashboard do usuário.
 * @param userId O ID do usuário logado (dono dos grupos).
 */
export const getDashboardData = async (userId: string) => {
  // 1. Sessões Ativas:
  // (Definimos "ativa" como iniciada nos últimos 5 minutos e não encerrada)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data: activeSessions, error: activeError } = await supabase
    .from('analytics_sessions')
    .select('id, groups!inner(owner_id)') // JOIN com groups
    .eq('groups.owner_id', userId) // Onde o dono é o usuário
    .is('end_time', null) // E a sessão não terminou
    .gte('start_time', fiveMinutesAgo); // E começou recentemente

  if (activeError) throw new Error(`Active sessions error: ${activeError.message}`);

  // 2. Tempo total de acesso por link (grupo)
  // Usamos uma RPC (Remote Procedure Call) no Supabase
  // para calcular a diferença de tempo (duration)
  const { data: timeByGroup, error: timeError } = await supabase
    .from('analytics_sessions')
    .select(`
      group_id,
      groups ( name ),
      duration_seconds:end_time,
      start_time
    `)
    .eq('groups.owner_id', userId) // A sintaxe 'groups.owner_id' falha aqui
    .not('end_time', 'is', null); // Onde a sessão terminou

  // TODO: A consulta acima precisa ser melhorada,
  // idealmente com uma 'view' ou 'rpc' no Supabase
  // para calcular o 'AVG(end_time - start_time)'.
  // Por enquanto, vamos focar no engajamento.

  // 3. Engajamento de Mídia (o mais importante)
  // (Soma o tempo de visibilidade por mídia)
  const { data: mediaEngagement, error: engagementError } = await supabase
    .from('analytics_events')
    .select(`
      media_id,
      media!inner ( file_name, groups!inner ( owner_id ) ),
      visible_duration_ms
    `)
    .eq('media.groups.owner_id', userId); // Filtra por dono

  if (engagementError) throw new Error(`Engagement error: ${engagementError.message}`);

  // 4. Processamento dos dados
  
  // Agrega o engajamento
  const engagementMap = new Map<number, { name: string; total_ms: number }>();
  if (mediaEngagement) {
    for (const event of mediaEngagement) {
      // @ts-ignore
      const mediaId = event.media_id;
      // @ts-ignore
      const mediaName = event.media.file_name;
      const duration = event.visible_duration_ms;

      const existing = engagementMap.get(mediaId) || { name: mediaName, total_ms: 0 };
      existing.total_ms += duration;
      engagementMap.set(mediaId, existing);
    }
  }

  return {
    active_sessions_count: activeSessions?.length || 0,
    media_engagement: Array.from(engagementMap.values()),
    // time_by_group: timeByGroup // Descomentar quando a consulta for refinada
  };
};