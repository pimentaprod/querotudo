const CIDADES = ['Senhor do Bonfim/BA', 'Filadélfia/BA', 'Ponto Novo/BA', 'Itiúba/BA'];

export default function FreteGratis() {
  return (
    <div className="flex flex-col gap-2 mb-8">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-green-50 border border-green-200 rounded-2xl px-5 py-3.5 text-sm">
      <span className="text-green-700 font-black whitespace-nowrap">🚚 Frete grátis</span>
      <span className="text-green-600 hidden sm:inline">·</span>
      <span className="text-green-700">
        Entregamos sem custo de frete em{' '}
        {CIDADES.map((cidade, i) => (
          <span key={cidade}>
            <strong>{cidade}</strong>
            {i < CIDADES.length - 1 ? ', ' : ''}
          </span>
        ))}
        .
      </span>
      <span className="text-green-600 hidden sm:inline">·</span>
      <span className="text-green-700 font-semibold whitespace-nowrap">⏱ Entrega em até 24 horas</span>
    </div>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3.5 text-sm">
      <span className="text-blue-700 font-black whitespace-nowrap">💳 Parcelamento</span>
      <span className="text-blue-400 hidden sm:inline">·</span>
      <span className="text-blue-700">Compras acima de <strong>R$ 300,00</strong> podem ser divididas em até <strong>3 vezes</strong>.</span>
    </div>
    </div>
  );
}
