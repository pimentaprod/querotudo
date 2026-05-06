'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart, useCartHydrated } from '@/lib/cart';
import { Produto } from '@/lib/types';

interface Props {
  produto: Produto;
}

type Estado = 'idle' | 'adicionado';

export default function AddToCartButton({ produto }: Props) {
  const hydrated = useCartHydrated();
  const [quantidade, setQuantidade] = useState(1);
  const [estado, setEstado] = useState<Estado>('idle');
  const adicionar = useCart((s) => s.adicionar);
  const itens = useCart((s) => s.itens);

  const jaNoCarrinho = hydrated ? itens.find((i) => i.produto.id === produto.id) : undefined;
  const qtdNoCarrinho = jaNoCarrinho?.quantidade ?? 0;
  const semEstoque = hydrated && qtdNoCarrinho >= produto.estoque;

  function incrementar() {
    if (qtdNoCarrinho + quantidade < produto.estoque) {
      setQuantidade((q) => q + 1);
    }
  }

  function decrementar() {
    setQuantidade((q) => Math.max(1, q - 1));
  }

  function handleAdd() {
    adicionar(produto, quantidade);
    setEstado('adicionado');
    setQuantidade(1);
    setTimeout(() => setEstado('idle'), 2500);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Contador de quantidade */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrementar}
          disabled={quantidade <= 1}
          aria-label="Diminuir quantidade"
          className="relative z-10 w-12 h-12 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40 text-xl font-medium transition-colors cursor-pointer"
        >
          −
        </button>
        <span className="w-8 text-center font-bold text-gray-800 text-lg">{quantidade}</span>
        <button
          type="button"
          onClick={incrementar}
          disabled={semEstoque}
          aria-label="Aumentar quantidade"
          className="relative z-10 w-12 h-12 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40 text-xl font-medium transition-colors cursor-pointer"
        >
          +
        </button>
        {produto.estoque <= 5 && (
          <span className="text-xs text-amber-600 font-medium ml-1">
            Apenas {produto.estoque} em estoque
          </span>
        )}
      </div>

      {/* Botão principal */}
      {semEstoque ? (
        <p className="text-center text-sm text-red-500 font-medium py-3 border border-red-200 rounded-xl bg-red-50">
          Você já tem o máximo disponível no carrinho
        </p>
      ) : estado === 'adicionado' ? (
        <div className="flex flex-col gap-2">
          <div className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Adicionado ao carrinho!
          </div>
          <Link href="/carrinho" className="w-full text-center border border-blue-400 text-blue-600 font-semibold py-2.5 rounded-xl hover:bg-blue-50 transition text-sm">
            Ir ao carrinho →
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          className="relative z-10 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-colors text-base shadow-sm shadow-blue-200 cursor-pointer"
        >
          Adicionar ao carrinho
        </button>
      )}

      {/* Quantity already in cart */}
      {qtdNoCarrinho > 0 && estado === 'idle' && (
        <p className="text-xs text-center text-gray-400">
          {qtdNoCarrinho} {qtdNoCarrinho === 1 ? 'unidade' : 'unidades'} já no seu{' '}
          <Link href="/carrinho" className="text-blue-600 hover:underline font-medium">carrinho</Link>
        </p>
      )}
    </div>
  );
}
