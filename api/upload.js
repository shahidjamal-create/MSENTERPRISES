import supabase from './db-client.js';
import { withApi, HttpError, readBody, notAllowed } from './_lib/http.js';
import { requirePermission } from './_lib/auth.js';
import { slugify } from './_lib/validate.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 3 * 1024 * 1024;

export default withApi(async (req, res) => {
  if (req.method !== 'POST') return notAllowed();
  await requirePermission(req, 'products');

  const { fileName, fileBase64, contentType } = readBody(req);
  if (!ALLOWED.includes(contentType)) throw new HttpError(400, 'Only JPG, PNG or WEBP images are allowed.');
  if (typeof fileBase64 !== 'string' || !fileBase64) throw new HttpError(400, 'No image data received.');

  const buffer = Buffer.from(fileBase64, 'base64');
  if (buffer.length > MAX_BYTES) throw new HttpError(400, 'Image must be smaller than 3 MB.');

  const ext = contentType.split('/')[1].replace('jpeg', 'jpg');
  const base = slugify(String(fileName || 'product').replace(/\.[^.]+$/, '')).slice(0, 40) || 'product';
  const path = `products/${Date.now()}-${base}.${ext}`;

  const { error } = await supabase.storage.from('product-images').upload(path, buffer, { contentType, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return res.status(200).json({ url: data.publicUrl });
});
