// src/utils/generators.ts

import { customAlphabet } from 'nanoid';

/**
 * Gera um código de compartilhamento (share_code) único.
 * * Usamos 'nanoid' para criar um código legível,
 * alfanumérico e com 8 caracteres.
 * * Ex: "4k8sNqP2"
 */
export const generateShareCode = () => {
  // Define o alfabeto que queremos usar (números e letras maiúsculas/minúsculas)
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  
  // Configura o nanoid para usar esse alfabeto e ter 8 caracteres
  const nanoid = customAlphabet(alphabet, 8);
  
  return nanoid();
};