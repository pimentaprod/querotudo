import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const credenciaisPresentes =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

/**
 * Faz upload da imagem da Airtable pro Cloudinary e retorna a URL permanente.
 * Em dev sem credenciais, devolve a URL original como fallback.
 */
export async function sincronizarImagem(airtableUrl: string, productId: string): Promise<string> {
  if (!credenciaisPresentes) return airtableUrl;

  try {
    const result = await cloudinary.uploader.upload(airtableUrl, {
      public_id: `produtos/${productId}`,
      overwrite: true,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });
    return result.secure_url;
  } catch {
    // Falha silenciosa: devolve a URL original para não quebrar a listagem
    return airtableUrl;
  }
}
