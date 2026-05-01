import { ItemCarrinho, DadosCheckout } from '@/lib/types';

// Limite de linhas de produto por pedido — ver CLAUDE.md para o porquê
export const LIMITE_ITENS = 20;

// Limite prático de caracteres na URL do WhatsApp (após encodeURIComponent)
const LIMITE_URL = 2000;

function removerAcentos(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function formatarPreco(valor: number): string {
  return valor.toFixed(2).replace('.', ',');
}

// Remove tudo que não é dígito — garante que (71) 9 9933-4515 vire 71999334515
function limparTelefone(tel: string): string {
  return tel.replace(/\D/g, '');
}

export function montarMensagem(
  itens: ItemCarrinho[],
  dados: DadosCheckout,
  nomeLoja: string
): { url: string; erro?: string } {
  if (itens.length === 0) {
    return { url: '', erro: 'Seu carrinho está vazio.' };
  }

  if (itens.length > LIMITE_ITENS) {
    return {
      url: '',
      erro: `Seu pedido tem ${itens.length} produtos diferentes. O limite por mensagem é ${LIMITE_ITENS}. Por favor, divida em dois pedidos.`,
    };
  }

  const loja      = removerAcentos(nomeLoja).toUpperCase();
  const nome      = removerAcentos(dados.nome);
  const endereco  = removerAcentos(dados.endereco);
  const pagamento = removerAcentos(dados.pagamento);
  const obs       = removerAcentos(dados.observacoes).trim();
  const telefone  = limparTelefone(dados.telefone);

  const linhasItens = itens
    .map((i) => {
      const nomeProd  = removerAcentos(i.produto.nome);
      const totalItem = i.produto.preco * i.quantidade;
      return `${i.quantidade}x ${nomeProd} - R$ ${formatarPreco(totalItem)}`;
    })
    .join('\n');

  const total = itens.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0);

  const partes = [
    `PEDIDO - ${loja}`,
    '',
    'CLIENTE',
    `Nome: ${nome}`,
    `Telefone: ${telefone}`,
    `Endereco: ${endereco}`,
    `CEP: ${dados.cep.replace(/\D/g, '')}`,
    '',
    'ITENS',
    linhasItens,
    '',
    `TOTAL: R$ ${formatarPreco(total)}`,
    '',
    `Pagamento: ${pagamento}`,
  ];

  // Adiciona observações só quando preenchidas
  if (obs) partes.push(`Observacoes: ${obs}`);

  const mensagem = partes.join('\n').trim();

  const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '';
  if (!numero) {
    return { url: '', erro: 'Número do WhatsApp não configurado. Entre em contato com a loja.' };
  }

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  if (url.length > LIMITE_URL) {
    return {
      url: '',
      erro: `A mensagem ficou muito longa (${url.length} caracteres). Reduza as observações ou divida o pedido.`,
    };
  }

  return { url };
}
