import type { Metadata } from 'next';
import CheckoutForm from '@/components/checkout/CheckoutForm';

const NOME_LOJA = process.env.NEXT_PUBLIC_NOME_LOJA ?? 'Quero Tudo';

export const metadata: Metadata = {
  title: `Finalizar pedido — ${NOME_LOJA}`,
};

export default function CheckoutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800">Finalizar pedido</h1>
        <p className="text-gray-400 text-sm mt-1">
          Preencha seus dados e envie o pedido pelo WhatsApp. O lojista confirmará em seguida.
        </p>
      </div>
      <CheckoutForm />
    </div>
  );
}
