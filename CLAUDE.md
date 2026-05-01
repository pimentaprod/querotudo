# CLAUDE.md — Quero Tudo

## 1. Resumo

Catálogo digital com carrinho integrado ao WhatsApp: o comprador navega, monta o carrinho e é redirecionado ao WhatsApp da loja com o pedido já formatado. Sem gateway de pagamento; o lojista fecha a venda manualmente.

---

## 2. Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 |
| Linguagem | TypeScript | ^5 |
| Estilo | Tailwind CSS | ^4 |
| Estado carrinho | Zustand (+ persist middleware) | ^5 |
| Imagens CDN | Cloudinary SDK v2 | ^2 |
| Dados | Airtable REST API | ^0.12 |
| Fonte | Urbanist (Google Fonts) | — |
| Hospedagem | Vercel (hobby) | — |

> Versões exatas em `package.json`.

---

## 3. Variáveis de ambiente

Nunca commitar valores — use `.env.local` localmente e o dashboard da Vercel em produção.
Veja `.env.local.example` para o template completo.

```
# Airtable (server-only — nunca expor ao cliente)
AIRTABLE_BASE_ID          # ID da base (começa com app...)
AIRTABLE_PAT              # Personal Access Token (começa com pat...)
AIRTABLE_TABLE            # Nome da tabela (padrão: "Product Catalog")

# Cloudinary (server-only — nunca expor ao cliente)
CLOUDINARY_CLOUD_NAME     # Nome do cloud no Cloudinary
CLOUDINARY_API_KEY        # API Key do Cloudinary
CLOUDINARY_API_SECRET     # API Secret do Cloudinary

# Públicas (prefixo NEXT_PUBLIC_ → bundled no cliente)
NEXT_PUBLIC_WHATSAPP_NUMERO   # Número com DDI sem espaços (ex.: 5571999334515)
NEXT_PUBLIC_NOME_LOJA         # Nome da loja exibido na UI
NEXT_PUBLIC_SITE_URL          # URL pública do site (ex.: https://querotudo.vercel.app)
                              # Usada como metadataBase para OG tags

# Segurança
REVALIDATE_SECRET         # Token para o webhook POST /api/revalidate
                          # Gere com: openssl rand -hex 32
```

**Modo mock (desenvolvimento offline):**  
Se `AIRTABLE_BASE_ID` ou `AIRTABLE_PAT` estiverem ausentes, `getProdutos()` retorna automaticamente os produtos de `lib/mocks.ts`. Nenhuma credencial externa é necessária para rodar localmente.

---

## 4. Modelo de dados Airtable

**Base:** `Catalogo - QueroTudo`  
**Tabela:** `Product Catalog`

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `nome` | Single line text | Obrigatório |
| `descricao` | Long text | Descrição longa do produto |
| `preco` | Number (decimal, 2 casas) | Em reais |
| `categoria` | Single select | Gera os chips de navegação dinamicamente |
| `imagens` | Attachment | Até 4 imagens; a primeira é a principal |
| `estoque` | Number (integer) | 0 oculta da listagem |
| `ativo` | Checkbox | Permite ocultar sem zerar estoque |
| `destaque` | Checkbox | Exibe no banner da home |

Produto aparece no catálogo somente quando `ativo == true && estoque > 0`.

---

## 5. Convenções de código

- **Imports:** absolutos com `@/` (mapeado para a raiz do projeto).
- **Ordem dos imports:** 1) React/Next, 2) libs externas, 3) `@/lib/*`, 4) `@/components/*`.
- **Nomenclatura:**
  - Componentes: `PascalCase` → `ProductCard.tsx`
  - Funções e hooks: `camelCase` → `getProdutos()`, `useCart()`
  - Arquivos de rota: `kebab-case` de pasta → `app/produto/[id]/page.tsx`
- **TypeScript:** `strict: true`. Zero `any` implícito.
- **Comentários:** apenas quando o **porquê** não for óbvio. Sem blocos multi-linha.
- **CSS:** somente Tailwind utility classes. Sem CSS-in-JS.
- **Logs:** nenhum `console.log` em produção.
- **Server-only:** `lib/airtable.ts` e `lib/cloudinary.ts` têm `import 'server-only'` — o TypeScript/Next.js erro se forem importados em Client Components.
- **Hidratação Zustand:** usar sempre `useCartHydrated()` de `lib/cart.ts` antes de renderizar dados do carrinho. Nunca `useEffect(() => setState(true), [])` — viola `react-hooks/set-state-in-effect`.

---

## 6. Decisões arquiteturais

### Por que Airtable e não banco próprio?
O lojista edita produtos numa interface visual conhecida (planilha). Elimina a necessidade de construir um painel admin, que não faz parte do escopo e exigiria autenticação, CRUD, etc.

### Por que Cloudinary e não `next/image`?
- URLs de imagem da Airtable **expiram em horas** — não podem ser usadas como source permanente.
- `next/image` consome as Image Optimizations limitadas do plano Hobby da Vercel.
- Cloudinary oferece transformações on-demand via URL (resize, crop, format) no plano free, com CDN global e URLs permanentes.

### Por que `<img>` em vez de `next/image`?
Exatamente pelo mesmo motivo acima: evitar o consumo de cotas de otimização da Vercel. Usamos `<img>` apontando diretamente para URLs Cloudinary já otimizadas via parâmetros na URL.

### Por que limite de 20 itens no carrinho?
A URL do WhatsApp tem limite prático de ~2.000 caracteres após URL encoding. Com acentos portugueses custando 6 chars cada e quebras de linha 3 chars, 20 itens com nomes médios chegam perto do limite. Acima disso a URL pode ser truncada silenciosamente em alguns clientes WhatsApp.

### Por que ASCII puro na mensagem do WhatsApp?
- Emojis = 12 chars após encoding; acentos = 6 chars; bullets = 9 chars.
- Remover acentos e caracteres decorativos reduz em ~40% o tamanho da URL.
- Garante compatibilidade com todos os clientes WhatsApp (web, mobile, desktop).

### Por que ISR de 60s em vez de SSR ou SSG puro?
- **SSR puro:** chama a Airtable a cada request → lento e pode atingir rate limit.
- **SSG puro:** exige rebuild no deploy para cada atualização de produto.
- **ISR 60s:** combina o melhor dos dois — resposta rápida (cache) e atualização frequente sem rebuild. O webhook `POST /api/revalidate` permite invalidação imediata quando necessário.

### Por que `cloudinaryUrl` em `lib/cloudinary-url.ts` separado?
O SDK do Cloudinary (`lib/cloudinary.ts`) usa `fs` do Node.js e não pode ser importado em Client Components. O helper puro de URL não tem dependências Node.js e pode ser usado em qualquer contexto.

---

## 7. Como rodar localmente

**Pré-requisitos:**
- Node.js 20+
- (Opcional) Conta na Airtable com a base e tabela configuradas
- (Opcional) Conta no Cloudinary (plano free)

**Sem credenciais (modo mock):**
```bash
npm install
npm run dev
# Acesse http://localhost:3000
# O site carrega com 12 produtos de exemplo de lib/mocks.ts
```

**Com credenciais reais:**
```bash
npm install
cp .env.local.example .env.local
# Edite .env.local com suas credenciais reais
npm run dev
```

---

## 8. Como fazer deploy na Vercel

### Pré-requisitos
- Conta na [Vercel](https://vercel.com) (plano Hobby é gratuito)
- Repositório Git (GitHub, GitLab ou Bitbucket) com o código

### Passo 1 — Subir o código para o Git
```bash
# Na pasta quero-tudo/
git init
git add .
git commit -m "feat: catálogo Quero Tudo — versão inicial"
# Crie um repositório no GitHub e siga as instruções para fazer push
git remote add origin https://github.com/seu-usuario/quero-tudo.git
git push -u origin main
```

### Passo 2 — Conectar à Vercel
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"** e selecione o repositório criado
3. Em **Framework Preset** confirme que está em **Next.js**
4. **NÃO clique em Deploy ainda** — configure as variáveis primeiro

### Passo 3 — Configurar variáveis de ambiente
Na tela de import (ou depois em **Settings → Environment Variables**), adicione **todas** as variáveis abaixo:

| Variável | Onde obter |
|---|---|
| `AIRTABLE_BASE_ID` | Airtable → API docs da base (URL contém o ID) |
| `AIRTABLE_PAT` | Airtable → Account → Personal Access Tokens |
| `AIRTABLE_TABLE` | Exatamente `Product Catalog` (com espaço) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary → Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary → Settings → Access Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary → Settings → Access Keys |
| `NEXT_PUBLIC_WHATSAPP_NUMERO` | Número da loja com DDI, sem espaços (ex.: `5571999334515`) |
| `NEXT_PUBLIC_NOME_LOJA` | `Quero Tudo` |
| `NEXT_PUBLIC_SITE_URL` | URL que a Vercel vai gerar (ex.: `https://quero-tudo.vercel.app`) ou domínio próprio |
| `REVALIDATE_SECRET` | Gere com `openssl rand -hex 32` no terminal |

> **Importante:** `AIRTABLE_PAT`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` devem ter o ambiente **Production** marcado. As variáveis `NEXT_PUBLIC_*` devem ter **Production + Preview + Development**.

### Passo 4 — Deploy
Clique em **Deploy**. O primeiro build leva ~2 minutos. Ao final a Vercel exibe a URL do projeto.

### Passo 5 — Domínio personalizado (opcional)
1. **Settings → Domains → Add**
2. Digite o domínio (ex.: `querotudo.com.br`)
3. Siga as instruções para apontar o DNS:
   - **Registro A:** `76.76.21.21`  
   - **Registro CNAME:** `cname.vercel-dns.com` (para subdomínios)
4. Aguarde a propagação DNS (até 48h) e o certificado TLS é emitido automaticamente
5. Atualize `NEXT_PUBLIC_SITE_URL` com o domínio final para corrigir as OG tags

### Passo 6 — Webhook de revalidação (ISR sob demanda)
Para o catálogo atualizar imediatamente quando o lojista editar um produto na Airtable:

1. Na Airtable, abra a base → **Automations → Create automation**
2. **Trigger:** "When a record is updated"
3. **Action:** "Run a script" → código abaixo:

```javascript
const response = await fetch('https://SEU-DOMINIO.vercel.app/api/revalidate', {
  method: 'POST',
  headers: {
    'x-revalidate-secret': 'SEU_REVALIDATE_SECRET'
  }
});
console.log(await response.json());
```

> Sem esse webhook o ISR de 60s já mantém o site razoavelmente atualizado.

---

## 9. Pontos de atenção / armadilhas conhecidas

| # | Armadilha | Solução |
|---|---|---|
| 1 | URLs de imagem da Airtable expiram em horas | Sempre sincronize via `sincronizarImagem()` antes de servir |
| 2 | Encoding da URL do WhatsApp estourado | Máx 20 itens; ASCII puro; sem emojis nem acentos |
| 3 | `CLOUDINARY_API_SECRET` é server-only | Nunca usar em Client Components ou `NEXT_PUBLIC_*` |
| 4 | `AIRTABLE_PAT` é server-only | Idem acima |
| 5 | Imagens muito grandes travam o upload pro Cloudinary | Limite orientado ao lojista: JPG/PNG/WebP, máx 5 MB |
| 6 | Airtable retorna máx 100 registros por chamada | `getProdutos()` já pagina com `offset` |
| 7 | Hidratação Zustand causa mismatch no SSR | Usar `useCartHydrated()` — nunca `setMounted` direto em `useEffect` |
| 8 | SDK Cloudinary importa `fs` — não funciona no cliente | Importar `sincronizarImagem` só de `lib/cloudinary.ts` (server-only); helper de URL em `lib/cloudinary-url.ts` |
| 9 | `metadataBase` ausente → OG images com URL relativa | Sempre definir `NEXT_PUBLIC_SITE_URL` no deploy |
| 10 | `useCart.persist.hasHydrated()` chamado no SSR | Guard `typeof window === 'undefined'` em `useCartHydrated()` |
| 11 | `WhatsAppButton` visível no checkout | Componente lê `usePathname()` e retorna `null` em `/checkout` |

---

## 10. Comandos frequentes

```bash
npm run dev       # Servidor de desenvolvimento (http://localhost:3000)
npm run build     # Build de produção
npm run start     # Servir o build de produção localmente
npm run lint      # ESLint
```

---

## 11. O que NÃO fazer

- **Não usar `next/image`** para fotos de produto — consome Image Optimizations da Vercel.
- **Não adicionar gateway de pagamento** — o fluxo encerra no WhatsApp.
- **Não criar painel admin** — o lojista gerencia via interface da Airtable.
- **Não expor `AIRTABLE_PAT` ou `CLOUDINARY_API_SECRET`** no bundle do cliente.
- **Não usar banco de dados próprio** (Postgres, Mongo etc.) — a Airtable é o único storage.
- **Não instalar bibliotecas de e-commerce** (Medusa, Shopify SDK etc.).
- **Não adicionar emojis ou acentos** na mensagem do WhatsApp.
- **Não remover a paginação** do `getProdutos()` — a Airtable limita a 100 registros por chamada.
- **Não chamar `setMounted(true)` direto em `useEffect`** — viola `react-hooks/set-state-in-effect`; usar `useCartHydrated()`.
- **Não importar `lib/cloudinary.ts` em Client Components** — o SDK usa `fs` do Node.js.
