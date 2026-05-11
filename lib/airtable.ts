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
  };
}

async function fetchPagina(
  offset?: string
): Promise<{ records: AirtableRecord[]; offset?: string }> {
  const params = new URLSearchParams({ pageSize: '100' });
  if (offset) params.set('offset', offset);

  const res = await fetch(`${API_URL}?${params}`, {
    headers: { Authorization: `Bearer ${PAT}` },
    next: { revalidate: 60 },
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
    categoria: 'Geral',
    imagens,
    estoque: disponivel ? 99 : 0,
    ativo: disponivel,
    destaque: false,
    promocao: r.fields.Promoção === 'sim',
  };
}

export async function getProdutos(): Promise<Produto[]> {
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
}

export const getProdutoPorId = cache(async function getProdutoPorId(id: string): Promise<Produto | null> {
  if (modoMock) {
    return PRODUTOS_MOCK.find((p) => p.id === id) ?? null;
  }

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${PAT}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const r: AirtableRecord = await res.json();

    const imagens = await Promise.all(
      (r.fields.Foto ?? []).slice(0, 4).map((img) =>
        sincronizarImagem(img.url, r.id)
      )
    );

    return mapRecord(r, imagens);
  } catch {
    return null;
  }
});
