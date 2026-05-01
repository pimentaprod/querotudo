import type { Metadata } from 'next';
import CartPageClient from '@/components/carrinho/CartPageClient';

const NOME_LOJA = process.env.NEXT_PUBLIC_NOME_LOJA ?? 'Quero Tudo';

export const metadata: Metadata = {
  title: `Carrinho — ${NOME_LOJA}`,
};

export default function CarrinhoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-800 mb-8">Meu carrinho</h1>
      <CartPageClient />
    </div>
  );
}
