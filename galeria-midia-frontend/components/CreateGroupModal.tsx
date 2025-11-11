// components/CreateGroupModal.tsx
'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react'; // O HeadlessUI funciona sem Tailwind!
import apiClient from '@/lib/apiClient';
import { toast } from 'react-hot-toast';

// 1. Importamos o CSS Module
import styles from './CreateGroupModal.module.css';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
};

export default function CreateGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
}: ModalProps) {
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lógica de submit (inalterada)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;

    setIsLoading(true);
    try {
      await apiClient.post('/api/groups', { name: groupName });
      setGroupName('');
      onGroupCreated();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Aplicamos os estilos
  return (
    <Dialog open={isOpen} onClose={onClose} className={styles.dialog}>
      <div className={styles.overlay} aria-hidden="true" />
      
      <div className={styles.panelContainer}>
        <Dialog.Panel className={styles.panel}>
          <Dialog.Title className={styles.title}>
            Criar Novo Grupo
          </Dialog.Title>
          <Dialog.Description className={styles.description}>
            Dê um nome para o seu novo grupo de mídias.
          </Dialog.Description>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label htmlFor="groupName" className={styles.label}>
                Nome do Grupo
              </label>
              <input
                id="groupName"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={styles.input}
                placeholder="Ex: Mídias da TV da Loja"
              />
            </div>
            
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}