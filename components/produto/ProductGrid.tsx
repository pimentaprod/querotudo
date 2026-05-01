import { Produto } from '@/lib/types';
import ProductCard from '@/components/produto/ProductCard';

interface Props {
  produtos: Produto[];
}

export default function ProductGrid({ produtos }: Props) {
  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-4">📦</p>
        <p className="text-gray-500 font-medium">Nenhum produto nesta categoria.</p>
        <p className="text-gray-400 text-sm mt-1">Tente outra categoria ou veja todos os produtos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {produtos.map((p) => (
        <ProductCard key={p.id} produto={p} />
      ))}
    </div>
  );
}
