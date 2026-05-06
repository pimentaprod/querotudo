import Link from 'next/link';
import { Produto } from '@/lib/types';
import { cloudinaryUrl } from '@/lib/cloudinary-url';

interface Props {
  destaques: Produto[];
}

const NOME_LOJA = process.env.NEXT_PUBLIC_NOME_LOJA ?? 'Quero Tudo';

export default function Banner({ destaques }: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl mb-10 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700"
      aria-label="Banner principal"
    >
      {/* Círculos decorativos */}
      <span
        className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-blue-400/30 pointer-events-none"
        style={{ animation: 'banner-float 7s ease-in-out infinite' }}
      />
      <span
        className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-blue-800/40 pointer-events-none"
        style={{ animation: 'banner-float 9s ease-in-out infinite reverse' }}
      />
      <style>{`
        @keyframes banner-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(12px, -16px) scale(1.06); }
          66%       { transform: translate(-8px, 10px) scale(0.95); }
        }
      `}</style>

      <div className="relative z-10 px-6 py-10 md:py-14 flex flex-col md:flex-row items-center gap-8">

        {/* Texto */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">
            Catálogo digital
          </p>
          <h1 className="text-white text-3xl md:text-5xl font-black leading-tight mb-4">
            {NOME_LOJA}
          </h1>
          <p className="text-blue-100 text-base md:text-lg mb-8 max-w-md">
            Escolha os seus produtos e finalize o pedido pelo WhatsApp. Rápido, simples e sem complicação.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link
              href="#produtos"
              className="bg-white text-blue-600 font-bold px-6 py-3 rounded-full hover:bg-blue-50 transition text-sm shadow-md"
            >
              Ver catálogo
            </Link>
            <Link
              href="/carrinho"
              className="border-2 border-white/60 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition text-sm"
            >
              Meu carrinho
            </Link>
          </div>
        </div>

        {/* Destaques */}
        {destaques.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide flex-shrink-0 max-w-full md:max-w-xs" style={{ touchAction: 'pan-x' }}>
            {destaques.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/produto/${p.id}`}
                className="flex-shrink-0 w-28 text-center group"
              >
                <div className="w-28 h-28 rounded-2xl overflow-hidden mb-2 ring-2 ring-white/30 group-hover:ring-white/70 transition">
                  <img
                    src={cloudinaryUrl(p.imagens[0] ?? '', 112, 112)}
                    alt={p.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs text-white font-medium line-clamp-2 leading-tight">{p.nome}</p>
                <p className="text-xs text-blue-200 font-bold mt-0.5">
                  R$ {p.preco.toFixed(2).replace('.', ',')}
                </p>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
