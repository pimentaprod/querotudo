// Pure URL helper — sem dependências Node.js, seguro para Client Components
export function cloudinaryUrl(baseUrl: string, width: number, height?: number): string {
  if (!baseUrl) return '';
  return baseUrl.replace(
    '/image/upload/',
    `/image/upload/w_${width}${height ? `,h_${height}` : ''},c_fill,q_auto,f_auto/`
  );
}
