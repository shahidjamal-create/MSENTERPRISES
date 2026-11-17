import supabase from '../db-client.js';
import { HttpError } from './http.js';

// Optimistic-concurrency stock update: only writes if stock hasn't changed
// since we read it, so two simultaneous orders can't oversell.
export async function changeStock(productId, { delta = null, exact = null }) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', productId)
      .maybeSingle();
    if (error) throw error;
    if (!product) throw new HttpError(404, 'Product not found.');

    const next = exact != null ? exact : product.stock + delta;
    if (next < 0) {
      throw new HttpError(409, `Not enough stock for "${product.name}". Available: ${product.stock}.`);
    }
    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({ stock: next })
      .eq('id', productId)
      .eq('stock', product.stock)
      .select('id');
    if (updateError) throw updateError;
    if (updated?.length) return { name: product.name, before: product.stock, after: next };
  }
  throw new HttpError(409, 'Stock changed while processing. Please try again.');
}

export async function logMovement(entry) {
  const { error } = await supabase.from('stock_movements').insert({
    product_id: entry.product_id,
    movement_type: entry.movement_type,
    quantity: entry.quantity,
    stock_after: entry.stock_after,
    supplier_id: entry.supplier_id || null,
    reference: entry.reference || '',
    note: entry.note || '',
    created_by: entry.created_by || '',
  });
  if (error) console.error('Stock movement log failed:', error);
}
