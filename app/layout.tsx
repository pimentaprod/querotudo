import type { Metadata, Viewport } from 'next';
import { Urbanist } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
});

const NOME_LOJA    = process.env.NEXT_PUBLIC_NOME_LOJA ?? 'Quero Tudo';
const DESCRICAO    = `Catálogo de produtos ${NOME_LOJA}. Escolha seus itens e finalize o pedido pelo WhatsApp. Rápido e sem complicação.`;

export const metadata: Metadata = {
  // metadataBase é obrigatório para OG images usarem URLs absolutas
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://querotudo.vercel.app'
  ),
  title: {
    default: NOME_LOJA,
    template: `%s — ${NOME_LOJA}`,
  },
  description: DESCRICAO,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: NOME_LOJA,
    description: DESCRICAO,
    siteName: NOME_LOJA,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: NOME_LOJA,
    description: DESCRICAO,
  },
};

export const viewport: Viewport = {
  themeColor: '#f97316', // laranja da marca
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${urbanist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-urbanist)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
