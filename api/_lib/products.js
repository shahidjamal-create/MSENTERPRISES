export const PRODUCT_SELECT =
  '*, categories(id,name,slug,kind), mobile_brands(id,name,slug), product_compatibility(model_id, verified, mobile_models(id,name,brand_id))';

export const PRODUCT_TYPES = ['tempered_glass', 'pouch', 'accessory'];

// Glass and pouches must be mapped to verified models before they are sold.
export const needsCompatibility = (type) => type === 'tempered_glass' || type === 'pouch';

export function shapeProduct(row) {
  const { product_compatibility: compat = [], categories, mobile_brands: brand, ...rest } = row;
  const compatibleModels = compat
    .filter((c) => c.verified && c.mobile_models)
    .map((c) => ({ id: c.mobile_models.id, name: c.mobile_models.name, brand_id: c.mobile_models.brand_id }));
  const mrp = Number(row.mrp);
  const price = Number(row.price);
  return {
    ...rest,
    mrp,
    price,
    category: categories || null,
    brand: brand || null,
    compatible_models: compatibleModels,
    discount_percent: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
  };
}

// Public visibility rule: active, and glass/pouch only when verified compatibility exists.
export const isPubliclyVisible = (p) =>
  p.is_active && (!needsCompatibility(p.product_type) || p.compatible_models.length > 0);
