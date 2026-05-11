'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart, useCartHydrated } from '@/lib/cart';
import { montarMensagem, OpcaoFrete } from '@/lib/whatsapp';
import { DadosCheckout } from '@/lib/types';
import { cloudinaryUrl } from '@/lib/cloudinary-url';

const FORMAS_PAGAMENTO = ['PIX', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Boleto'];

// Máscara CEP: 00000-000
function mascaraCep(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

// Máscara telefone: (00) 00000-0000 ou (00) 0000-0000
function mascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2)  return d.length ? `(${d}` : '';
  if (d.length <= 6)  return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

interface CampoProps {
  label: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
  erro?: string;
}

function Campo({ label, obrigatorio, children, erro }: CampoProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{obrigatorio && <span className="text-blue-600 ml-0.5">*</span>}
      </label>
      {children}
      {erro && <p className="text-red-500 text-xs mt-1">{erro}</p>}
    </div>
  );
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-gray-300';

export default function CheckoutForm() {
  const hydrated = useCartHydrated();
  const { itens, total, limpar } = useCart();

  const [dados, setDados] = useState<DadosCheckout>({
    nome: '',
    telefone: '',
    endereco: '',
    cep: '',
    pagamento: 'PIX',
    observacoes: '',
  });
  const [erros, setErros]   = useState<Partial<DadosCheckout>>({});
  const [erroGeral, setErroGeral] = useState('');

  const [opcoesFrete, setOpcoesFrete]     = useState<OpcaoFrete[]>([]);
  const [freteCarregando, setFreteCarregando] = useState(false);
  const [erroFrete, setErroFrete]         = useState('');
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(null);

  function atualizar(campo: keyof DadosCheckout, valor: string) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: '' }));
    // Reseta frete ao trocar o CEP
    if (campo === 'cep') {
      setOpcoesFrete([]);
      setFreteSelecionado(null);
      setErroFrete('');
    }
  }

  async function calcularFrete() {
    const cepLimpo = dados.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setFreteCarregando(true);
    setErroFrete('');
    setOpcoesFrete([]);
    setFreteSelecionado(null);

    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cepDestino: cepLimpo, itens }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErroFrete(data.error ?? 'Erro ao calcular frete.');
        return;
      }

      if (!data.length) {
        setErroFrete('Nenhuma opção de frete disponível para este CEP.');
        return;
      }

      setOpcoesFrete(data);
      setFreteSelecionado(data[0]);
    } catch {
      setErroFrete('Não foi possível conectar ao serviço de frete.');
    } finally {
      setFreteCarregando(false);
    }
  }

  function validar(): boolean {
    const e: Partial<DadosCheckout> = {};
    if (!dados.nome.trim())      e.nome      = 'Informe seu nome completo.';
    if (!dados.telefone.trim())  e.telefone  = 'Informe um telefone para contato.';
    if (!dados.endereco.trim())  e.endereco  = 'Informe o endereço de entrega.';
    const cepLimpo = dados.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8)   e.cep       = 'CEP deve ter 8 dígitos.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErroGeral('');

    if (!validar()) return;

    const nomeLoja = process.env.NEXT_PUBLIC_NOME_LOJA ?? 'Quero Tudo';
    const { url, erro } = montarMensagem(itens, dados, nomeLoja, freteSelecionado ?? undefined);

    if (erro) {
      setErroGeral(erro);
      return;
    }

    limpar();
    window.open(url, '_blank');
  }

  // Skeleton de hidratação
  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4 max-w-lg">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-2" />
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
        ))}
        <div className="h-12 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // Carrinho vazio — redireciona com mensagem
  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <p className="text-gray-500 text-lg">Seu carrinho está vazio.</p>
        <p className="text-gray-400 text-sm">Adicione produtos antes de finalizar o pedido.</p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-10 items-start">

      {/* Formulário */}
      <form onSubmit={enviar} noValidate className="flex-1 w-full space-y-5">

        {erroGeral && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {erroGeral}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="text-base font-black text-gray-800 mb-3">Seus dados</legend>

          <Campo label="Nome completo" obrigatorio erro={erros.nome}>
            <input
              type="text"
              value={dados.nome}
              onChange={(e) => atualizar('nome', e.target.value)}
              placeholder="Ex.: João da Silva"
              autoComplete="name"
              className={inputCls}
            />
          </Campo>

          <Campo label="Telefone / WhatsApp" obrigatorio erro={erros.telefone}>
            <input
              type="tel"
              value={dados.telefone}
              onChange={(e) => atualizar('telefone', mascaraTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
              autoComplete="tel"
              inputMode="numeric"
              className={inputCls}
            />
          </Campo>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-base font-black text-gray-800 mb-3">Entrega</legend>

          <Campo label="Endereço completo" obrigatorio erro={erros.endereco}>
            <input
              type="text"
              value={dados.endereco}
              onChange={(e) => atualizar('endereco', e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              autoComplete="street-address"
              className={inputCls}
            />
          </Campo>

          <Campo label="CEP" obrigatorio erro={erros.cep}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dados.cep}
                onChange={(e) => atualizar('cep', mascaraCep(e.target.value))}
                placeholder="00000-000"
                autoComplete="postal-code"
                inputMode="numeric"
                className={`${inputCls} max-w-[160px]`}
              />
              <button
                type="button"
                onClick={calcularFrete}
                disabled={dados.cep.replace(/\D/g, '').length !== 8 || freteCarregando}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0"
              >
                {freteCarregando ? 'Calculando...' : 'Calcular frete'}
              </button>
            </div>

            {erroFrete && (
              <p className="text-red-500 text-xs mt-2">{erroFrete}</p>
            )}

            {opcoesFrete.length > 0 && (
              <div className="mt-3 space-y-2">
                {opcoesFrete.map((opcao) => (
                  <label
                    key={opcao.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                      freteSelecionado?.id === opcao.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="frete"
                        checked={freteSelecionado?.id === opcao.id}
                        onChange={() => setFreteSelecionado(opcao)}
                        className="accent-blue-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {opcao.company.name} {opcao.name}
                        </p>
                        <p className="text-xs text-gray-400">{opcao.delivery_time} dias úteis</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-blue-700 flex-shrink-0">
                      R$ {parseFloat(opcao.price).toFixed(2).replace('.', ',')}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Campo>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-base font-black text-gray-800 mb-3">Pagamento</legend>

          <Campo label="Forma de pagamento preferida" obrigatorio>
            <div className="flex flex-wrap gap-2">
              {FORMAS_PAGAMENTO.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => atualizar('pagamento', f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                    dados.pagamento === f
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Campo>

          <Campo label="Observações">
            <textarea
              value={dados.observacoes}
              onChange={(e) => atualizar('observacoes', e.target.value)}
              rows={3}
              placeholder="Ponto de referência, horário preferido para entrega, etc."
              className={inputCls}
            />
          </Campo>
        </fieldset>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-black py-4 rounded-xl transition-all text-base shadow-sm shadow-green-200"
        >
          {/* Ícone WhatsApp */}
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Enviar pedido pelo WhatsApp
        </button>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Ao clicar, o WhatsApp abrirá com o pedido formatado. O lojista confirmará disponibilidade e combinará o pagamento por lá.
        </p>
      </form>

      {/* Resumo lateral */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-24">
          <h2 className="font-black text-gray-800 mb-4">
            Resumo
            <span className="ml-2 text-sm font-semibold text-gray-400">
              ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
            </span>
          </h2>

          <ul className="space-y-3 mb-5">
            {itens.map(({ produto, quantidade }) => (
              <li key={produto.id} className="flex items-center gap-3">
                <img
                  src={cloudinaryUrl(produto.imagens[0] ?? '', 48, 48)}
                  alt={produto.nome}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-snug">{produto.nome}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{quantidade}× R$ {produto.preco.toFixed(2).replace('.', ',')}</p>
                </div>
                <p className="text-xs font-black text-gray-800 flex-shrink-0">
                  R$ {(produto.preco * quantidade).toFixed(2).replace('.', ',')}
                </p>
              </li>
            ))}
          </ul>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-700">
                R$ {total().toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Frete</span>
              <span className={`font-semibold ${freteSelecionado ? 'text-gray-700' : 'text-gray-300'}`}>
                {freteSelecionado
                  ? `R$ ${parseFloat(freteSelecionado.price).toFixed(2).replace('.', ',')}`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="font-black text-blue-700 text-lg">
                R$ {(total() + (freteSelecionado ? parseFloat(freteSelecionado.price) : 0)).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <Link
            href="/carrinho"
            className="mt-4 block text-center text-xs text-gray-400 hover:text-blue-600 transition"
          >
            ← Editar carrinho
          </Link>
        </div>
      </div>

    </div>
  );
}
