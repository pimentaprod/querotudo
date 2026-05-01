import Link from 'next/link';
import { Produto } from '@/lib/types';
import { cloudinaryUrl } from '@/lib/cloudinary-url';

interface Props {
  produto: Produto;
}

export default function ProductCard({ produto }: Props) {
  const imgUrl = produto.imagens[0]
    ? cloudinaryUrl(produto.imagens[0], 400, 400)
    : 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Sem+foto';

  return (
    <Link
      href={`/produto/${produto.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Imagem */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={imgUrl}
          alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {produto.destaque && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Destaque
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
          {produto.categoria}
        </span>
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
          {produto.nome}
        </h3>
        <p className="text-gray-400 text-xs line-clamp-1 flex-1">
          {produto.descricao}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-blue-700 font-black text-base">
            R${' '}
            <span>{produto.preco.toFixed(2).replace('.', ',')}</span>
          </p>
          <span className="text-xs text-gray-400 group-hover:text-blue-600 transition font-medium">
            Ver →
          </span>
        </div>
      </div>
    </Link>
  );
}
