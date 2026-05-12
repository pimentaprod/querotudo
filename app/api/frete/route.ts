import { NextRequest, NextResponse } from 'next/server';
import { Produto } from '@/lib/types';
import { getAccessToken } from '@/lib/melhorenvio-token';

const MELHOR_ENVIO_URL = process.env.MELHOR_ENVIO_URL ?? 'https://sandbox.melhorenvio.com.br';
const CEP_ORIGEM = '48970000';

interface ItemCotacao {
  produto: Produto;
  quantidade: number;
}

export async function POST(req: NextRequest) {
  const { cepDestino, itens }: { cepDestino: string; itens: ItemCotacao[] } = await req.json();

  const cep = cepDestino.replace(/\D/g, '');
  if (cep.length !== 8) {
    return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
  }

  if (!itens?.length) {
    return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
  }

  const produtosComDimensoes = itens.filter(
    ({ produto: p }) => p.peso > 0 && p.altura > 0 && p.largura > 0 && p.comprimento > 0
  );

  if (!produtosComDimensoes.length) {
    return NextResponse.json({ error: 'Produtos sem dimensões cadastradas' }, { status: 422 });
  }

  // CEPs com frete grátis (entrega em 1 dia útil)
  const CEPS_FRETE_GRATIS = new Set(['48970000', '44775000', '48850000']);
  if (CEPS_FRETE_GRATIS.has(cep)) {
    return NextResponse.json([
      {
        id: 'frete-gratis',
        name: 'Entrega Grátis',
        price: '0.00',
        custom_price: '0.00',
        discount: '0.00',
        currency: 'R$',
        delivery_time: 1,
        delivery_range: { min: 1, max: 1 },
        company: { id: 0, name: 'Quero Tudo', picture: '' },
      },
    ]);
  }

  const token = await getAccessToken();

  const res = await fetch(`${MELHOR_ENVIO_URL}/api/v2/me/shipment/calculate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'QuerotTudo/1.0 (pimenta.ucsal@gmail.com)',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      from: { postal_code: CEP_ORIGEM },
      to: { postal_code: cep },
      products: produtosComDimensoes.map(({ produto: p, quantidade }) => ({
        id: p.id,
        width: p.largura,
        height: p.altura,
        length: p.comprimento,
        weight: p.peso,
        insurance_value: p.preco,
        quantity: quantidade,
      })),
      options: {
        receipt: false,
        own_hand: false,
      },
      // Filtra apenas serviços dos Correios (company_id 1 = Correios)
      services: '1,2', // PAC e SEDEX
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    return NextResponse.json({ error: 'Erro na API do Melhor Envio', detalhe: erro }, { status: res.status });
  }

  const opcoes = await res.json();

  // Remove transportadoras com erro (ex: peso acima do limite)
  const disponiveis = Array.isArray(opcoes)
    ? opcoes.filter((o: { error?: string }) => !o.error)
    : [];

  return NextResponse.json(disponiveis);
}
