import type { Metadata } from 'next';
import { getProdutos } from '@/lib/airtable';
import Banner from '@/components/ui/Banner';
import FreteGratis from '@/components/ui/FreteGratis';
import CatalogSection from '@/components/produto/CatalogSection';
import PromoSection from '@/components/produto/PromoSection';

const NOME_LOJA = process.env.NEXT_PUBLIC_NOME_LOJA ?? 'Quero Tudo';

export const metadata: Metadata = {
  title: `${NOME_LOJA} — Catálogo`,
  description: `Navegue pelo catálogo de produtos do ${NOME_LOJA}. Monte seu carrinho e finalize o pedido direto pelo WhatsApp.`,
  openGraph: {
    title: `${NOME_LOJA} — Catálogo`,
    description: `Navegue pelo catálogo de produtos do ${NOME_LOJA}. Monte seu carrinho e finalize o pedido direto pelo WhatsApp.`,
    type: 'website',
  },
};

export default async function Home() {
  const produtos = await getProdutos();
  const destaques = produtos.filter((p) => p.destaque);
  const promocoes = produtos.filter((p) => p.promocao);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Banner destaques={destaques} />
      <FreteGratis />
      <PromoSection produtos={promocoes} />
      <section id="produtos">
        <CatalogSection produtos={produtos} />
      </section>
    </div>
  );
}
