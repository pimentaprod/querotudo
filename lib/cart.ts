import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Produto, ItemCarrinho } from '@/lib/types';

interface CartStore {
  itens: ItemCarrinho[];
  adicionar: (produto: Produto, quantidade?: number) => void;
  remover: (produtoId: string) => void;
  alterarQuantidade: (produtoId: string, quantidade: number) => void;
  limpar: () => void;
  total: () => number;
  quantidadeItens: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      itens: [],

      adicionar: (produto, quantidade = 1) => {
        set((state) => {
          const existente = state.itens.find((i) => i.produto.id === produto.id);
          if (existente) {
            return {
              itens: state.itens.map((i) =>
                i.produto.id === produto.id
                  ? { ...i, quantidade: i.quantidade + quantidade }
                  : i
              ),
            };
          }
          return { itens: [...state.itens, { produto, quantidade }] };
        });
      },

      remover: (produtoId) => {
        set((state) => ({
          itens: state.itens.filter((i) => i.produto.id !== produtoId),
        }));
      },

      alterarQuantidade: (produtoId, quantidade) => {
        if (quantidade <= 0) {
          get().remover(produtoId);
          return;
        }
        set((state) => ({
          itens: state.itens.map((i) =>
            i.produto.id === produtoId ? { ...i, quantidade } : i
          ),
        }));
      },

      limpar: () => set({ itens: [] }),

      total: () =>
        get().itens.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0),

      quantidadeItens: () =>
        get().itens.reduce((acc, i) => acc + i.quantidade, 0),
    }),
    { name: 'quero-tudo-cart' }
  )
);

/**
 * Retorna true assim que o Zustand terminar de reidratar do localStorage.
 * setState está dentro de um callback (onFinishHydration), não no corpo do
 * efeito — padrão aceito pela regra react-hooks/set-state-in-effect.
 */
/**
 * Retorna true assim que o Zustand terminar de reidratar do localStorage.
 * Durante SSR retorna false imediatamente (localStorage não existe no servidor).
 * setState está dentro do callback onFinishHydration, não no corpo do efeito —
 * padrão aceito pela regra react-hooks/set-state-in-effect.
 */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => {
    // No servidor localStorage não existe — persist ainda não inicializou
    if (typeof window === 'undefined') return false;
    return useCart.persist.hasHydrated();
  });

  useEffect(() => {
    if (useCart.persist.hasHydrated()) return;
    const unsubscribe = useCart.persist.onFinishHydration(() => setHydrated(true));
    return unsubscribe;
  }, []);

  return hydrated;
}
