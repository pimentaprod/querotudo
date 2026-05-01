'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart, useCartHydrated } from '@/lib/cart';
import CartItem from '@/components/carrinho/CartItem';

// Limite vindo do briefing — refletido também em lib/whatsapp.ts
const LIMITE_ITENS = 20;

function SkeletonItem() {
  return (
    <div className="flex gap-4 py-5 animate-pulse">
      <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-8 bg-gray-100 rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}

export default function CartPageClient() {
  // Guard de hidratação — localStorage só existe no browser
  const hydrated = useCartHydrated();

  const { itens, total, limpar } = useCart();
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);

  const totalItens    = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const totalProdutos = itens.length;
  const acimaDolimite = totalItens > LIMITE_ITENS;

  function handleLimpar() {
    if (!confirmarLimpeza) {
      setConfirmarLimpeza(true);
      // Auto-cancela a confirmação após 3s sem ação
      setTimeout(() => setConfirmarLimpeza(false), 3000);
      return;
    }
    limpar();
    setConfirmarLimpeza(false);
  }

  // Skeleton enquanto o store hidrata do localStorage
  if (!hydrated) {
    return (
      <div className="divide-y divide-gray-100">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p className="text-gray-700 font-semibold text-lg">Seu carrinho está vazio</p>
          <p className="text-gray-400 text-sm mt-1">Adicione produtos para continuar</p>
        </div>
        <Link
          href="/"
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* Lista de itens */}
      <div className="flex-1 w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 divide-y divide-gray-100">
          {itens.map((item) => (
            <CartItem key={item.produto.id} item={item} />
          ))}
        </div>

        {/* Limpar carrinho */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleLimpar}
            className={`text-sm font-medium transition px-3 py-1.5 rounded-lg ${
              confirmarLimpeza
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            {confirmarLimpeza ? 'Confirmar limpeza?' : 'Limpar carrinho'}
          </button>
        </div>
      </div>

      {/* Painel de resumo — sticky em desktop */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-24">
          <h2 className="font-black text-gray-800 text-lg mb-5">Resumo do pedido</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>{totalProdutos} {totalProdutos === 1 ? 'produto' : 'produtos'}</span>
              <span>{totalItens} {totalItens === 1 ? 'unidade' : 'unidades'}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-700 border-t pt-3">
              <span>Subtotal</span>
              <span>R$ {total().toFixed(2).replace('.', ',')}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Frete e forma de pagamento combinados pelo WhatsApp com o vendedor.
            </p>
          </div>

          {/* Alerta de limite */}
          {acimaDolimite && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 leading-relaxed">
              <strong>Atenção:</strong> seu pedido tem {totalItens} itens. O limite por mensagem é {LIMITE_ITENS}. Divida em dois pedidos para continuar.
            </div>
          )}

          <Link
            href="/checkout"
            className={`mt-5 block w-full text-center font-bold py-3.5 rounded-xl transition text-base ${
              acimaDolimite
                ? 'bg-gray-200 text-gray-400 pointer-events-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200'
            }`}
            aria-disabled={acimaDolimite}
          >
            Finalizar pedido →
          </Link>

          <Link
            href="/"
            className="mt-3 block text-center text-sm text-gray-400 hover:text-blue-600 transition"
          >
            ← Continuar comprando
          </Link>
        </div>
      </div>

    </div>
  );
}
