'use client';

import { useState } from 'react';
import { Produto } from '@/lib/types';
import CategoryTabs from '@/components/ui/CategoryTabs';
import ProductGrid from '@/components/produto/ProductGrid';

interface Props {
  produtos: Produto[];
}

export default function CatalogSection({ produtos }: Props) {
  const categorias = [...new Set(produtos.map((p) => p.categoria))].sort();
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

  const filtrados =
    categoriaAtiva === 'Todos'
      ? produtos
      : produtos.filter((p) => p.categoria === categoriaAtiva);

  // Contagem por categoria para exibir nos chips
  const contagens: Record<string, number> = { Todos: produtos.length };
  for (const cat of categorias) {
    contagens[cat] = produtos.filter((p) => p.categoria === cat).length;
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-2xl font-black text-gray-800">Produtos</h2>
        <span className="text-sm text-gray-400">
          {filtrados.length} {filtrados.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <CategoryTabs
        categorias={categorias}
        ativa={categoriaAtiva}
        contagens={contagens}
        onChange={setCategoriaAtiva}
      />

      <div className="mt-6">
        <ProductGrid produtos={filtrados} />
      </div>
    </div>
  );
}
