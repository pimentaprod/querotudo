'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Produto } from '@/lib/types';
import { cloudinaryUrl } from '@/lib/cloudinary-url';

interface Props {
  produtos: Produto[];
}

function PromoCard({ produto }: { produto: Produto }) {
  const imgUrl = produto.imagens[0]
    ? cloudinaryUrl(produto.imagens[0], 280, 280)
    : 'https://placehold.co/280x280/f3f4f6/9ca3af?text=Sem+foto';

  return (
    <Link
      href={`/produto/${produto.id}`}
      className="group flex-shrink-0 w-40 flex flex-col bg-white rounded-xl overflow-hidden border border-red-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={imgUrl}
          alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
          Promo
        </span>
      </div>
      <div className="flex flex-col p-2 gap-0.5">
        <h3 className="font-semibold text-gray-800 text-xs leading-snug line-clamp-2">
          {produto.nome}
        </h3>
        <p className="text-blue-700 font-black text-sm mt-1">
          R$ {produto.preco.toFixed(2).replace('.', ',')}
        </p>
      </div>
    </Link>
  );
}

/* largura de cada card + gap = 160px + 12px = 172px */
const CARD_W = 172;

export default function PromoSection({ produtos }: Props) {
  const [paused, setPaused] = useState(false);

  if (produtos.length === 0) return null;

  /* duplica para loop contínuo */
  const itens = [...produtos, ...produtos];
  const trackW = produtos.length * CARD_W;
  const duration = produtos.length * 3; /* ~3s por card */

  return (
    <section className="mb-10">
      <style>{`
        @keyframes promo-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-${trackW}px); }
        }
      `}</style>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔥</span>
        <h2 className="text-xl font-black text-gray-800">Promoções do Dia</h2>
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {produtos.length}
        </span>
      </div>

      <div
        className="overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onTouchCancel={() => setPaused(false)}
      >
        <div
          className="flex gap-3 pb-2"
          style={{
            width: 'max-content',
            animation: `promo-scroll ${duration}s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {itens.map((p, i) => (
            <PromoCard key={`${p.id}-${i}`} produto={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
