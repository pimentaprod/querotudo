import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProdutoPorId, getProdutos } from '@/lib/airtable';
import ProductGallery from '@/components/produto/ProductGallery';
import AddToCartButton from '@/components/produto/AddToCartButton';
import ProductCard from '@/components/produto/ProductCard';

interface Props {
  params: Promise<{ id: string }>;
}

// Produtos novos não pré-gerados são renderizados sob demanda e cacheados
export const dynamicParams = true;

export async function generateStaticParams() {
  const produtos = await getProdutos();
  return produtos.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const produto = await getProdutoPorId(id);
  if (!produto) return {};

  const NOME_LOJA = process.env.NEXT_PUBLIC_NOME_LOJA ?? 'Quero Tudo';

  return {
    title: `${produto.nome} — ${NOME_LOJA}`,
    description: produto.descricao.slice(0, 155),
    openGraph: {
      title: produto.nome,
      description: produto.descricao.slice(0, 155),
      images: produto.imagens[0] ? [{ url: produto.imagens[0] }] : [],
      type: 'website',
    },
  };
}

export default async function ProdutoPage({ params }: Props) {
  const { id } = await params;

  // Busca produto e catálogo completo em paralelo
  const [produto, todosProdutos] = await Promise.all([
    getProdutoPorId(id),
    getProdutos(),
  ]);

  if (!produto) notFound();

  const relacionados = todosProdutos
    .filter((p) => p.categoria === produto.categoria && p.id !== produto.id)
    .slice(0, 4);

  const estoqueAlto    = produto.estoque > 10;
  const estoqueBaixo   = produto.estoque > 0 && produto.estoque <= 5;
  const estoqueMedio   = produto.estoque > 5 && produto.estoque <= 10;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-blue-600 transition">Início</Link>
        <span>›</span>
        <Link
          href={`/?categoria=${encodeURIComponent(produto.categoria)}`}
          className="hover:text-blue-600 transition"
        >
          {produto.categoria}
        </Link>
        <span>›</span>
        <span className="text-gray-600 line-clamp-1">{produto.nome}</span>
      </nav>

      {/* Grid principal */}
      <div className="grid md:grid-cols-2 gap-10 mb-16">

        {/* Galeria */}
        <ProductGallery imagens={produto.imagens} nome={produto.nome} />

        {/* Informações */}
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              {produto.categoria}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-1 leading-tight">
              {produto.nome}
            </h1>
          </div>

          {/* Preço */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-blue-700">
              R$ {produto.preco.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Indicador de estoque */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                estoqueAlto ? 'bg-green-500' : estoqueMedio ? 'bg-amber-400' : 'bg-red-400'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                estoqueAlto ? 'text-green-600' : estoqueMedio ? 'text-amber-600' : 'text-red-500'
              }`}
            >
              {estoqueAlto
                ? 'Em estoque'
                : estoqueMedio
                ? `Poucas unidades — apenas ${produto.estoque} disponíveis`
                : estoqueBaixo
                ? `Últimas ${produto.estoque} unidades!`
                : 'Indisponível'}
            </span>
          </div>

          {/* Descrição */}
          <p className="text-gray-600 leading-relaxed text-base">{produto.descricao}</p>

          <hr className="border-gray-100" />

          {/* Botão de adicionar */}
          <AddToCartButton produto={produto} />

          {/* Voltar ao catálogo */}
          <Link
            href="/#produtos"
            className="text-center text-sm text-gray-400 hover:text-blue-600 transition mt-1"
          >
            ← Continuar comprando
          </Link>
        </div>
      </div>

      {/* Produtos relacionados */}
      {relacionados.length > 0 && (
        <section>
          <h2 className="text-xl font-black text-gray-800 mb-5">
            Mais em {produto.categoria}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relacionados.map((p) => (
              <ProductCard key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
