import 'server-only';

const BASE_ID  = process.env.AIRTABLE_BASE_ID ?? '';
const PAT      = process.env.AIRTABLE_PAT ?? '';
const TABLE    = 'Configurações';
const API_URL  = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;

const ME_URL         = process.env.MELHOR_ENVIO_URL ?? 'https://sandbox.melhorenvio.com.br';
const ME_CLIENT_ID   = process.env.MELHOR_ENVIO_CLIENT_ID ?? '';
const ME_CLIENT_SECRET = process.env.MELHOR_ENVIO_CLIENT_SECRET ?? '';

// IDs fixos dos registros na tabela Configurações
const REC_ACCESS  = 'recWZGq0SNcsY1Pt1';
const REC_REFRESH = 'recyc5OYcJAqocWpR';
const REC_EXPIRES = 'recQoeW3hP8PaMm9c';

// Renova com 1 dia de antecedência
const MARGEM_SEGUNDOS = 86400;

async function lerRegistro(recordId: string): Promise<string> {
  const res = await fetch(`${API_URL}/${recordId}`, {
    headers: { Authorization: `Bearer ${PAT}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Airtable leitura falhou: ${res.status}`);
  const data = await res.json();
  return data.fields?.Valor ?? '';
}

async function salvarRegistro(recordId: string, valor: string): Promise<void> {
  const res = await fetch(`${API_URL}/${recordId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: { Valor: valor } }),
  });
  if (!res.ok) throw new Error(`Airtable gravação falhou: ${res.status}`);
}

async function renovarToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch(`${ME_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: ME_CLIENT_ID,
      client_secret: ME_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const erro = await res.text();
    throw new Error(`Renovação de token falhou: ${erro}`);
  }

  return res.json();
}

export async function getAccessToken(): Promise<string> {
  const [accessToken, refreshToken, expiresAtStr] = await Promise.all([
    lerRegistro(REC_ACCESS),
    lerRegistro(REC_REFRESH),
    lerRegistro(REC_EXPIRES),
  ]);

  const expiresAt = parseInt(expiresAtStr, 10);
  const agora     = Math.floor(Date.now() / 1000);
  const expirado  = agora >= expiresAt - MARGEM_SEGUNDOS;

  if (!expirado) return accessToken;

  // Token expirado ou prestes a expirar — renova automaticamente
  const novo = await renovarToken(refreshToken);
  const novoExpiresAt = agora + novo.expires_in;

  await Promise.all([
    salvarRegistro(REC_ACCESS,  novo.access_token),
    salvarRegistro(REC_REFRESH, novo.refresh_token),
    salvarRegistro(REC_EXPIRES, String(novoExpiresAt)),
  ]);

  return novo.access_token;
}
