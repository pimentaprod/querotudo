import Link from 'next/link';

const NOME_LOJA = process.env.NEXT_PUBLIC_NOME_LOJA ?? 'Quero Tudo';
const WA_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '';

const LINKS_RAPIDOS = [
  { label: 'Início',    href: '/' },
  { label: 'Catálogo',  href: '/#produtos' },
  { label: 'Carrinho',  href: '/carrinho' },
  { label: 'Finalizar pedido', href: '/checkout' },
];

const PAGAMENTOS = ['PIX', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'Boleto'];

function IconWA() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Coluna 1 — Marca */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white text-xl font-black tracking-tight">{NOME_LOJA}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Catálogo digital com pedido pelo WhatsApp. Escolha seus produtos e fale diretamente com a loja.
            </p>
          </div>

          {/* Coluna 2 — Links rápidos */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Navegação</h3>
            <ul className="space-y-2">
              {LINKS_RAPIDOS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm hover:text-blue-400 transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 — Pagamentos e atendimento */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Pagamentos</h3>
            <ul className="space-y-1 mb-6">
              {PAGAMENTOS.map((p) => (
                <li key={p} className="text-sm">{p}</li>
              ))}
            </ul>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3">Atendimento</h3>
            <p className="text-sm">Seg – Sex: 8h às 18h</p>
            <p className="text-sm">Sábado: 8h às 13h</p>
          </div>

          {/* Coluna 4 — Contato */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Contato</h3>
            {WA_NUMERO ? (
              <a
                href={`https://wa.me/${WA_NUMERO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition font-medium mb-4"
              >
                <IconWA />
                Falar no WhatsApp
              </a>
            ) : (
              <p className="text-sm text-gray-600 mb-4">WhatsApp não configurado</p>
            )}
            <p className="text-xs leading-relaxed text-gray-600">
              Pedidos combinados diretamente com o vendedor. Sem intermediários.
            </p>
          </div>

        </div>
      </div>

      {/* Rodapé inferior */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} {NOME_LOJA}. Todos os direitos reservados.</p>
          <span className="flex items-center gap-1.5">
            Desenvolvido pela
            <a href="https://www.produtividados.com" target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/produtividados-logo.png" alt="ProdutiviDados" className="h-5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
