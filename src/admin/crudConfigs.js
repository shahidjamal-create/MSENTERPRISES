import { formatPrice } from '../utils/format';
import { PRODUCT_TYPE_LABELS } from '../utils/constants';

const TYPE_OPTIONS = () => Object.entries(PRODUCT_TYPE_LABELS);
const brandOptions = (lookups) => (lookups.brands || []).map((b) => [String(b.id), b.name]);

export const CATEGORIES = {
  resource: 'categories',
  title: 'Categories',
  singular: 'Category',
  description: 'Product categories shown in the store. Each category belongs to one product type.',
  searchKeys: ['name', 'slug'],
  defaults: { name: '', kind: 'accessory', description: '', sort_order: 0, is_active: true },
  columns: [
    { label: 'Name', key: 'name' },
    { label: 'Type', render: (r) => PRODUCT_TYPE_LABELS[r.kind] },
    { label: 'Slug', key: 'slug' },
    { label: 'Order', key: 'sort_order' },
  ],
  fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'kind', label: 'Product type', type: 'select', required: true, options: TYPE_OPTIONS },
    { name: 'description', label: 'Description', type: 'textarea', wide: true },
    { name: 'sort_order', label: 'Sort order', type: 'number' },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ],
};

export const BRANDS = {
  resource: 'brands',
  title: 'Brands',
  singular: 'Brand',
  description: 'Mobile phone brands used for model selection and compatibility.',
  searchKeys: ['name'],
  defaults: { name: '', sort_order: 0, is_active: true },
  columns: [
    { label: 'Brand', key: 'name' },
    { label: 'Slug', key: 'slug' },
    { label: 'Order', key: 'sort_order' },
  ],
  fields: [
    { name: 'name', label: 'Brand name', required: true },
    { name: 'sort_order', label: 'Sort order', type: 'number' },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ],
};

export const MODELS = {
  resource: 'models',
  title: 'Models',
  singular: 'Model',
  description: 'Phone models customers can choose. Compatibility is assigned from each product form.',
  searchKeys: ['name'],
  lookups: ['brands'],
  filter: { key: 'brand_id', label: 'brand', options: brandOptions },
  defaults: { brand_id: '', name: '', release_year: '', is_active: true },
  columns: [
    { label: 'Model', key: 'name' },
    { label: 'Brand', render: (r) => r.mobile_brands?.name || '—' },
    { label: 'Year', render: (r) => r.release_year || '—' },
  ],
  fields: [
    { name: 'brand_id', label: 'Brand', type: 'select', required: true, options: brandOptions },
    { name: 'name', label: 'Model name', required: true },
    { name: 'release_year', label: 'Release year', type: 'number' },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ],
};

export const SUPPLIERS = {
  resource: 'suppliers',
  title: 'Suppliers',
  singular: 'Supplier',
  description: 'Vendors you purchase stock from. Link them to products and stock-in entries.',
  searchKeys: ['name', 'contact_person', 'phone', 'email'],
  showActive: false,
  defaults: { name: '', contact_person: '', phone: '', email: '', address: '', gstin: '', notes: '' },
  columns: [
    { label: 'Supplier', key: 'name' },
    { label: 'Contact', render: (r) => r.contact_person || '—' },
    { label: 'Phone', render: (r) => r.phone || '—' },
    { label: 'Email', render: (r) => r.email || '—' },
    { label: 'GSTIN', render: (r) => r.gstin || '—' },
  ],
  fields: [
    { name: 'name', label: 'Supplier name', required: true },
    { name: 'contact_person', label: 'Contact person' },
    { name: 'phone', label: 'Phone' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'gstin', label: 'GSTIN' },
    { name: 'address', label: 'Address', type: 'textarea', wide: true },
    { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
  ],
};

export const SERVICES = {
  resource: 'services',
  title: 'Repair Services',
  singular: 'Service',
  description: 'Services customers can book. Starting prices are shown on the website.',
  searchKeys: ['name'],
  defaults: { name: '', description: '', price_from: '', duration: '', sort_order: 0, is_active: true },
  columns: [
    { label: 'Service', key: 'name' },
    { label: 'From', render: (r) => (r.price_from != null ? formatPrice(r.price_from) : '—') },
    { label: 'Duration', render: (r) => r.duration || '—' },
    { label: 'Order', key: 'sort_order' },
  ],
  fields: [
    { name: 'name', label: 'Service name', required: true },
    { name: 'price_from', label: 'Starting price (₹)', type: 'number' },
    { name: 'duration', label: 'Typical duration', hint: 'e.g. 1–2 hours' },
    { name: 'sort_order', label: 'Sort order', type: 'number' },
    { name: 'description', label: 'Description', type: 'textarea', wide: true },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ],
};
