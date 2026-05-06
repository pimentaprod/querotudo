'use client';

import Link from 'next/link';
import { ItemCarrinho } from '@/lib/types';
import { useCart } from '@/lib/cart';
import { cloudinaryUrl } from '@/lib/cloudinary-url';

interface Props {
  item: ItemCarrinho;
}

export default function CartItem({ item }: Props) {
  const { alterarQuantidade, remover } = useCart();
  const { produto, quantidade } = item;
  const subtotal = produto.preco * quantidade;
  const noLimiteEstoque = quantidade >= produto.estoque;

  return (
    <div className="flex gap-4 py-5">
      {/* Foto linkando para a ficha do produto */}
      <Link href={`/produto/${produto.id}`} className="flex-shrink-0">
        <img
          src={cloudinaryUrl(produto.imagens[0] ?? '', 80, 80)}
          alt={produto.nome}
          className="w-20 h-20 rounded-xl object-cover border border-gray-100"
          loading="lazy"
        />
      </Link>

      {/* Info + controles */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/produto/${produto.id}`}
              className="font-semibold text-gray-800 hover:text-blue-700 transition line-clamp-2 leading-snug"
            >
              {produto.nome}
            </Link>
            <p className="text-xs text-gray-400 mt-0.5">{produto.categoria}</p>
          </div>
          {/* Subtotal — visível em sm+ */}
          <p className="hidden sm:block font-black text-gray-800 whitespace-nowrap text-base flex-shrink-0">
            R$ {subtotal.toFixed(2).replace('.', ',')}
          </p>
        </div>

        {/* Preço unitário + controles */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {/* Decrementa ou remove quando quantidade = 1 */}
            <button
              type="button"
              onClick={() => alterarQuantidade(produto.id, quantidade - 1)}
              aria-label="Diminuir quantidade"
              className="relative z-10 w-12 h-12 rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700 active:bg-gray-100 text-lg font-medium transition-colors flex items-center justify-center cursor-pointer"
            >
              −
            </button>
            <span className="w-7 text-center font-bold text-gray-800">{quantidade}</span>
            <button
              type="button"
              onClick={() => alterarQuantidade(produto.id, quantidade + 1)}
              aria-label="Aumentar quantidade"
              disabled={noLimiteEstoque}
              className="relative z-10 w-12 h-12 rounded-full border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700 active:bg-gray-100 text-lg font-medium transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              +
            </button>

            <span className="text-xs text-gray-400 ml-1">
              × R$ {produto.preco.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Lixeira */}
          <button
            type="button"
            onClick={() => remover(produto.id)}
            aria-label={`Remover ${produto.nome}`}
            className="relative z-10 text-gray-300 hover:text-red-500 transition p-1 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Subtotal mobile */}
        <p className="sm:hidden text-right font-black text-gray-800 text-sm mt-2">
          R$ {subtotal.toFixed(2).replace('.', ',')}
        </p>

        {/* Aviso de estoque no limite */}
        {noLimiteEstoque && (
          <p className="text-xs text-amber-600 mt-1.5">
            Máximo disponível em estoque atingido
          </p>
        )}
      </div>
    </div>
  );
}
