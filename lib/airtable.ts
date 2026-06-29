import 'server-only';
import { cache } from 'react';
import { Produto } from '@/lib/types';
import { sincronizarImagem } from '@/lib/cloudinary';
import { PRODUTOS_MOCK } from '@/lib/mocks';

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? '';
const PAT = process.env.AIRTABLE_PAT ?? '';
const TABLE = process.env.AIRTABLE_TABLE ?? 'Catálogo de Produtos';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;

const modoMock = !BASE_ID || !PAT;

interface AirtableRecord {
  id: string;
  fields: {
    Nome?: string;
    Descrição?: string;
    Preço?: number;
    Foto?: { url: string }[];
    Disponibilidade?: string;
    Promoção?: string;
    Categoria?: string;
    Peso?: number;
    Altura?: number;
    Largura?: number;
    Comprimento?: number;
  };
}

async function fetchPagina(
  offset?: string
): Promise<{ records: AirtableRecord[]; offset?: string }> {
  const params = new URLSearchParams({ pageSize: '100' });
  if (offset) params.set('offset', offset);

  const res = await fetch(`${API_URL}?${params}`, {
    headers: { Authorization: `Bearer ${PAT}` },
    next: { revalidate: 600 },
  });

  if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
  return res.json();
}

function mapRecord(r: AirtableRecord, imagens: string[]): Produto {
  const disponivel = r.fields.Disponibilidade === 'Disponível';
  return {
    id: r.id,
    nome: r.fields.Nome ?? '',
    descricao: r.fields.Descrição ?? '',
    preco: r.fields.Preço ?? 0,
    categoria: r.fields.Categoria ?? 'Geral',
    imagens,
    estoque: disponivel ? 99 : 0,
    ativo: disponivel,
    destaque: false,
    promocao: r.fields.Promoção === 'sim',
    peso: r.fields.Peso ?? 0,
    altura: r.fields.Altura ?? 0,
    largura: r.fields.Largura ?? 0,
    comprimento: r.fields.Comprimento ?? 0,
  };
}

export const getProdutos = cache(async function getProdutos(): Promise<Produto[]> {
  if (modoMock) return PRODUTOS_MOCK;

  const todos: AirtableRecord[] = [];
  let offset: string | undefined;

  try {
    do {
      const pagina = await fetchPagina(offset);
      todos.push(...pagina.records);
      offset = pagina.offset;
    } while (offset);
  } catch {
    // Airtable indisponível — retorna mocks para não quebrar a página
    return PRODUTOS_MOCK;
  }

  const produtos = await Promise.all(
    todos
      .filter((r) => r.fields.Disponibilidade === 'Disponível')
      .map(async (r): Promise<Produto> => {
        const imagens = await Promise.all(
          (r.fields.Foto ?? []).slice(0, 4).map((img) =>
            sincronizarImagem(img.url, r.id)
          )
        );
        return mapRecord(r, imagens);
      })
  );

  return produtos;
});

// Reaproveita a lista de getProdutos() (uma única chamada à API, com fallback
// para mocks) em vez de buscar o registro por ID — evita 404 quando a home
// está em contingência e reduz o consumo da API do Airtable.
export const getProdutoPorId = cache(async function getProdutoPorId(id: string): Promise<Produto | null> {
  const produtos = await getProdutos();
  return produtos.find((p) => p.id === id) ?? null;
});
