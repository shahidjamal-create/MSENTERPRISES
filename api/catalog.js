// Public read-only catalogue endpoints.
import supabase from './db-client.js';
import { withApi, HttpError, check, notAllowed } from './_lib/http.js';
import { PRODUCT_SELECT, shapeProduct, isPubliclyVisible, needsCompatibility } from './_lib/products.js';
import { getSetting } from './_lib/email.js';

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

async function visibleProducts() {
  const rows = check(await supabase.from('products').select(PRODUCT_SELECT).eq('is_active', true));
  return rows.map(shapeProduct).filter(isPubliclyVisible);
}

function applyFilters(items, query) {
  const brandId = toInt(query.brand);
  const modelId = toInt(query.model);
  const categoryId = toInt(query.category);
  const term = String(query.q || '').trim().toLowerCase();

  return items.filter((p) => {
    if (query.type && p.product_type !== query.type) return false;
    if (categoryId && p.category_id !== categoryId) return false;
    if (query.variant && p.variant_type !== query.variant) return false;
    if (query.in_stock === '1' && p.stock <= 0) return false;
    if (query.featured === '1' && !p.is_featured) return false;
    if (modelId) {
      const fits = p.compatible_models.some((m) => m.id === modelId);
      const universal = !needsCompatibility(p.product_type) && p.is_universal;
      if (!fits && !universal) return false;
    } else if (brandId) {
      const matches = p.brand?.id === brandId || p.compatible_models.some((m) => m.brand_id === brandId);
      if (!matches) return false;
    }
    if (term) {
      const haystack = [p.name, p.sku, p.variant_type, p.category?.name, p.brand?.name, ...p.compatible_models.map((m) => m.name)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!term.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  });
}

const SORTERS = {
  newest: (a, b) => b.id - a.id,
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  discount: (a, b) => b.discount_percent - a.discount_percent,
};

async function publicSettings() {
  const [store, booking] = await Promise.all([
    getSetting('store', { shipping_fee: 49, free_shipping_above: 499, cod_enabled: true }),
    getSetting('booking', { time_slots: [], max_days_ahead: 30 }),
  ]);
  return {
    store: { ...store, online_payment_enabled: Boolean(process.env.RAZORPAY_KEY_ID) },
    booking,
  };
}

export default withApi(async (req, res) => {
  if (req.method !== 'GET') return notAllowed();
  const { r } = req.query;

  switch (r) {
    case 'home': {
      const [categories, brands, products, services, reviews] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('mobile_brands').select('*').eq('is_active', true).order('sort_order'),
        visibleProducts(),
        supabase.from('repair_services').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('reviews').select('id,customer_name,rating,comment,created_at').eq('is_approved', true).order('created_at', { ascending: false }).limit(6),
      ]);
      const featured = products.filter((p) => p.is_featured).sort(SORTERS.newest).slice(0, 8);
      return res.status(200).json({
        categories: check(categories),
        brands: check(brands),
        featured,
        services: check(services),
        reviews: check(reviews),
      });
    }
    case 'products': {
      const filtered = applyFilters(await visibleProducts(), req.query).sort(SORTERS[req.query.sort] || SORTERS.newest);
      const limit = Math.min(Math.max(toInt(req.query.limit) || 12, 1), 48);
      const pages = Math.max(Math.ceil(filtered.length / limit), 1);
      const page = Math.min(Math.max(toInt(req.query.page) || 1, 1), pages);
      return res.status(200).json({
        items: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        pages,
      });
    }
    case 'product': {
      const slug = String(req.query.slug || '');
      const row = check(await supabase.from('products').select(PRODUCT_SELECT).eq('slug', slug).maybeSingle());
      if (!row) throw new HttpError(404, 'Product not found.');
      const product = shapeProduct(row);
      if (!isPubliclyVisible(product)) throw new HttpError(404, 'This product is not available right now.');

      const brandIds = [...new Set(product.compatible_models.map((m) => m.brand_id))];
      const brands = brandIds.length
        ? check(await supabase.from('mobile_brands').select('id,name').in('id', brandIds))
        : [];
      const related = (await visibleProducts())
        .filter((p) => p.id !== product.id && p.category_id === product.category_id)
        .slice(0, 4);
      return res.status(200).json({ product, compatible_brands: brands, related });
    }
    case 'categories':
      return res.status(200).json(check(await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')));
    case 'brands':
      return res.status(200).json(check(await supabase.from('mobile_brands').select('*').eq('is_active', true).order('sort_order')));
    case 'models': {
      let query = supabase
        .from('mobile_models')
        .select('id,name,brand_id,release_year,mobile_brands(name)')
        .eq('is_active', true)
        .order('name');
      const brandId = toInt(req.query.brand_id);
      if (brandId) query = query.eq('brand_id', brandId);
      if (req.query.q) query = query.ilike('name', `%${String(req.query.q).slice(0, 40)}%`).limit(20);
      return res.status(200).json(check(await query));
    }
    case 'services':
      return res.status(200).json(check(await supabase.from('repair_services').select('*').eq('is_active', true).order('sort_order')));
    case 'settings':
      return res.status(200).json(await publicSettings());
    default:
      throw new HttpError(404, 'Unknown resource');
  }
});
