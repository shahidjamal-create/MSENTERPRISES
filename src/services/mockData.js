// Fallback mock data and simulated API handlers for offline/local development
// when Supabase or serverless backend is not configured.

export const MOCK_BRANDS = [
  { id: 1, name: 'Apple', slug: 'apple', sort_order: 1, is_active: true, image_url: '/images/models/brand-apple.jpg', models_count: 7 },
  { id: 2, name: 'Samsung', slug: 'samsung', sort_order: 2, is_active: true, image_url: '/images/models/brand-samsung.jpg', models_count: 5 },
  { id: 3, name: 'OnePlus', slug: 'oneplus', sort_order: 3, is_active: true, image_url: '/images/models/brand-oneplus.jpg', models_count: 4 },
  { id: 4, name: 'Xiaomi / Redmi', slug: 'xiaomi', sort_order: 4, is_active: true, image_url: '/images/models/brand-xiaomi.jpg', models_count: 3 },
  { id: 5, name: 'Vivo', slug: 'vivo', sort_order: 5, is_active: true, image_url: '/images/models/vivo-v30.jpg', models_count: 2 },
  { id: 6, name: 'Oppo', slug: 'oppo', sort_order: 6, is_active: true, image_url: '/images/models/oneplus-nord.jpg', models_count: 2 },
  { id: 7, name: 'Realme', slug: 'realme', sort_order: 7, is_active: true, image_url: '/images/models/realme-12.jpg', models_count: 2 },
  { id: 8, name: 'Google Pixel', slug: 'google', sort_order: 8, is_active: true, image_url: '/images/models/pixel-8.jpg', models_count: 3 },
];

export const MOCK_MODELS = [
  { id: 101, name: 'iPhone 16 Pro Max', brand_id: 1, release_year: 2024, is_active: true, image_url: '/images/models/iphone-16-pro.jpg', mobile_brands: { name: 'Apple' } },
  { id: 102, name: 'iPhone 16 Pro', brand_id: 1, release_year: 2024, is_active: true, image_url: '/images/models/iphone-16-pro.jpg', mobile_brands: { name: 'Apple' } },
  { id: 103, name: 'iPhone 16', brand_id: 1, release_year: 2024, is_active: true, image_url: '/images/models/iphone-15.jpg', mobile_brands: { name: 'Apple' } },
  { id: 104, name: 'iPhone 15 Pro Max', brand_id: 1, release_year: 2023, is_active: true, image_url: '/images/models/iphone-15.jpg', mobile_brands: { name: 'Apple' } },
  { id: 105, name: 'iPhone 15', brand_id: 1, release_year: 2023, is_active: true, image_url: '/images/models/iphone-15.jpg', mobile_brands: { name: 'Apple' } },
  { id: 106, name: 'iPhone 14', brand_id: 1, release_year: 2022, is_active: true, image_url: '/images/models/iphone-14.jpg', mobile_brands: { name: 'Apple' } },
  { id: 107, name: 'iPhone 13', brand_id: 1, release_year: 2021, is_active: true, image_url: '/images/models/iphone-14.jpg', mobile_brands: { name: 'Apple' } },

  { id: 201, name: 'Galaxy S24 Ultra', brand_id: 2, release_year: 2024, is_active: true, image_url: '/images/models/samsung-s24-ultra.jpg', mobile_brands: { name: 'Samsung' } },
  { id: 202, name: 'Galaxy S24', brand_id: 2, release_year: 2024, is_active: true, image_url: '/images/models/samsung-s24-ultra.jpg', mobile_brands: { name: 'Samsung' } },
  { id: 203, name: 'Galaxy A55 5G', brand_id: 2, release_year: 2024, is_active: true, image_url: '/images/models/samsung-a55.jpg', mobile_brands: { name: 'Samsung' } },
  { id: 204, name: 'Galaxy M14 5G', brand_id: 2, release_year: 2023, is_active: true, image_url: '/images/models/samsung-a55.jpg', mobile_brands: { name: 'Samsung' } },
  { id: 205, name: 'Galaxy S23 FE', brand_id: 2, release_year: 2023, is_active: true, image_url: '/images/models/samsung-s23.jpg', mobile_brands: { name: 'Samsung' } },

  { id: 301, name: 'OnePlus 12', brand_id: 3, release_year: 2024, is_active: true, image_url: '/images/models/oneplus-12.jpg', mobile_brands: { name: 'OnePlus' } },
  { id: 302, name: 'OnePlus 12R', brand_id: 3, release_year: 2024, is_active: true, image_url: '/images/models/oneplus-12.jpg', mobile_brands: { name: 'OnePlus' } },
  { id: 303, name: 'OnePlus Nord CE 4', brand_id: 3, release_year: 2024, is_active: true, image_url: '/images/models/oneplus-nord.jpg', mobile_brands: { name: 'OnePlus' } },
  { id: 304, name: 'OnePlus 11', brand_id: 3, release_year: 2023, is_active: true, image_url: '/images/models/oneplus-12.jpg', mobile_brands: { name: 'OnePlus' } },

  { id: 401, name: 'Redmi Note 13 Pro+', brand_id: 4, release_year: 2024, is_active: true, image_url: '/images/models/redmi-note-13.jpg', mobile_brands: { name: 'Xiaomi / Redmi' } },
  { id: 402, name: 'Redmi Note 13', brand_id: 4, release_year: 2024, is_active: true, image_url: '/images/models/redmi-note-13.jpg', mobile_brands: { name: 'Xiaomi / Redmi' } },
  { id: 403, name: 'Xiaomi 14', brand_id: 4, release_year: 2024, is_active: true, image_url: '/images/models/redmi-note-13.jpg', mobile_brands: { name: 'Xiaomi / Redmi' } },

  { id: 501, name: 'Vivo V30 Pro', brand_id: 5, release_year: 2024, is_active: true, image_url: '/images/models/vivo-v30.jpg', mobile_brands: { name: 'Vivo' } },
  { id: 502, name: 'Vivo T3 5G', brand_id: 5, release_year: 2024, is_active: true, image_url: '/images/models/vivo-v30.jpg', mobile_brands: { name: 'Vivo' } },

  { id: 601, name: 'Oppo Reno 11 Pro', brand_id: 6, release_year: 2024, is_active: true, image_url: '/images/models/oneplus-nord.jpg', mobile_brands: { name: 'Oppo' } },
  { id: 602, name: 'Oppo F25 Pro', brand_id: 6, release_year: 2024, is_active: true, image_url: '/images/models/oneplus-nord.jpg', mobile_brands: { name: 'Oppo' } },

  { id: 701, name: 'Realme 12 Pro+', brand_id: 7, release_year: 2024, is_active: true, image_url: '/images/models/realme-12.jpg', mobile_brands: { name: 'Realme' } },
  { id: 702, name: 'Realme Narzo 70', brand_id: 7, release_year: 2024, is_active: true, image_url: '/images/models/realme-12.jpg', mobile_brands: { name: 'Realme' } },

  { id: 801, name: 'Pixel 8 Pro', brand_id: 8, release_year: 2023, is_active: true, image_url: '/images/models/pixel-8.jpg', mobile_brands: { name: 'Google' } },
  { id: 802, name: 'Pixel 8', brand_id: 8, release_year: 2023, is_active: true, image_url: '/images/models/pixel-8.jpg', mobile_brands: { name: 'Google' } },
  { id: 803, name: 'Pixel 7a', brand_id: 8, release_year: 2023, is_active: true, image_url: '/images/models/pixel-8.jpg', mobile_brands: { name: 'Google' } },
];

export const MOCK_CATEGORIES = [
  { id: 1, name: 'Tempered Glass', slug: 'tempered-glass', kind: 'tempered_glass', is_active: true, sort_order: 1 },
  { id: 2, name: 'Mobile Pouches', slug: 'pouches', kind: 'pouch', is_active: true, sort_order: 2 },
  { id: 3, name: 'Chargers & Adapters', slug: 'chargers', kind: 'accessory', is_active: true, sort_order: 3 },
  { id: 4, name: 'Fast Charging Cables', slug: 'cables', kind: 'accessory', is_active: true, sort_order: 4 },
  { id: 5, name: 'Audio & Earphones', slug: 'audio', kind: 'accessory', is_active: true, sort_order: 5 },
  { id: 6, name: 'Power Banks & Batteries', slug: 'power-banks', kind: 'accessory', is_active: true, sort_order: 6 },
  { id: 7, name: 'Car Holders & Mounts', slug: 'holders', kind: 'accessory', is_active: true, sort_order: 7 },
  { id: 8, name: 'Memory Cards & OTG', slug: 'storage', kind: 'accessory', is_active: true, sort_order: 8 },
];

export const MOCK_SERVICES = [
  { id: 1, name: 'Screen & Display Replacement', slug: 'screen-replacement', description: 'Original and OEM quality displays with touch testing and warranty.', price_from: 1499, duration: '45 mins', is_active: true, sort_order: 1 },
  { id: 2, name: 'Battery Replacement', slug: 'battery-replacement', description: 'High-capacity, tested battery cells to restore all-day battery life.', price_from: 899, duration: '30 mins', is_active: true, sort_order: 2 },
  { id: 3, name: 'Charging Port Repair', slug: 'charging-port', description: 'Fix loose ports, slow charging, or unrecognised cable issues.', price_from: 499, duration: '30 mins', is_active: true, sort_order: 3 },
  { id: 4, name: 'Camera & Lens Repair', slug: 'camera-repair', description: 'Cracked lens glass replacement and camera sensor autofocus repairs.', price_from: 799, duration: '45 mins', is_active: true, sort_order: 4 },
  { id: 5, name: 'Back Glass & Body Housing', slug: 'back-glass', description: 'Laser back glass removal and factory-grade frame restoration.', price_from: 999, duration: '1 hour', is_active: true, sort_order: 5 },
  { id: 6, name: 'Water Damage Diagnosis', slug: 'water-damage', description: 'Ultrasonic board cleaning, corrosion removal, and IC revival.', price_from: 599, duration: '1-2 hours', is_active: true, sort_order: 6 },
];

export const MOCK_REVIEWS = [
  { id: 1, customer_name: 'Rahul Sharma', rating: 5, comment: 'Replaced the shattered screen on my Galaxy S23 in 40 minutes. Original quality and very polite staff!', created_at: '2026-11-05T10:30:00Z' },
  { id: 2, customer_name: 'Priya Nair', rating: 5, comment: 'Got 11D tempered glass and a matte case for my iPhone 15. Perfect fit with zero bubbles.', created_at: '2026-11-04T14:15:00Z' },
  { id: 3, customer_name: 'Syed Hafeez', rating: 5, comment: 'Best mobile repair shop in Bangalore. Transparent pricing and gave repair estimate beforehand.', created_at: '2026-11-02T16:00:00Z' },
  { id: 4, customer_name: 'Ananya Reddy', rating: 5, comment: 'Quick battery replacement for my OnePlus 11. Battery life is back to brand new.', created_at: '2026-10-28T11:45:00Z' },
];

const allPhoneModels = MOCK_MODELS.map((m) => ({ id: m.id, name: m.name, brand_id: m.brand_id }));
const iphoneModels = MOCK_MODELS.filter((m) => m.brand_id === 1).map((m) => ({ id: m.id, name: m.name, brand_id: m.brand_id }));
const samsungModels = MOCK_MODELS.filter((m) => m.brand_id === 2).map((m) => ({ id: m.id, name: m.name, brand_id: m.brand_id }));

export const TOP_10_MODELS = [
  { id: 101, name: 'iPhone 16 Pro Max', brand_name: 'Apple', brand_id: 1, short_name: 'iPhone 16 Pro', image_url: '/images/models/iphone-16-pro.jpg' },
  { id: 105, name: 'iPhone 15', brand_name: 'Apple', brand_id: 1, short_name: 'iPhone 15', image_url: '/images/models/iphone-15.jpg' },
  { id: 106, name: 'iPhone 14', brand_name: 'Apple', brand_id: 1, short_name: 'iPhone 14', image_url: '/images/models/iphone-14.jpg' },
  { id: 201, name: 'Galaxy S24 Ultra', brand_name: 'Samsung', brand_id: 2, short_name: 'S24 Ultra', image_url: '/images/models/samsung-s24-ultra.jpg' },
  { id: 205, name: 'Galaxy S23 FE', brand_name: 'Samsung', brand_id: 2, short_name: 'Galaxy S23', image_url: '/images/models/samsung-s23.jpg' },
  { id: 203, name: 'Galaxy A55 5G', brand_name: 'Samsung', brand_id: 2, short_name: 'Galaxy A55', image_url: '/images/models/samsung-a55.jpg' },
  { id: 301, name: 'OnePlus 12', brand_name: 'OnePlus', brand_id: 3, short_name: 'OnePlus 12', image_url: '/images/models/oneplus-12.jpg' },
  { id: 303, name: 'OnePlus Nord CE 4', brand_name: 'OnePlus', brand_id: 3, short_name: 'Nord CE 4', image_url: '/images/models/oneplus-nord.jpg' },
  { id: 401, name: 'Redmi Note 13 Pro+', brand_name: 'Xiaomi / Redmi', brand_id: 4, short_name: 'Redmi Note 13', image_url: '/images/models/redmi-note-13.jpg' },
  { id: 501, name: 'Vivo V30 Pro', brand_name: 'Vivo', brand_id: 5, short_name: 'Vivo V30', image_url: '/images/models/vivo-v30.jpg' },
];

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: '11D Edge-to-Edge Tempered Glass Screen Protector',
    slug: '11d-edge-to-edge-tempered-glass',
    sku: 'TG-11D-001',
    product_type: 'tempered_glass',
    variant_type: '11D Full Cover',
    category_id: 1,
    category: { id: 1, name: 'Tempered Glass', slug: 'tempered-glass' },
    brand_id: 1,
    brand: { id: 1, name: 'Apple' },
    compatible_models: iphoneModels,
    mrp: 499,
    price: 199,
    discount_percent: 60,
    stock: 45,
    low_stock_threshold: 5,
    image_url: '/images/products/glass-11d.jpg',
    description: 'Ultra-clear 11D tempered glass protector with 9H hardness, oleophobic coating against smudges, and curved edge coverage.',
    is_active: true,
    is_featured: true,
    is_universal: false,
  },
  {
    id: 2,
    name: 'Matte Anti-Glare Privacy Tempered Glass',
    slug: 'matte-anti-glare-privacy-tempered-glass',
    sku: 'TG-PRIV-002',
    product_type: 'tempered_glass',
    variant_type: 'Privacy / Matte',
    category_id: 1,
    category: { id: 1, name: 'Tempered Glass', slug: 'tempered-glass' },
    brand_id: 2,
    brand: { id: 2, name: 'Samsung' },
    compatible_models: samsungModels,
    mrp: 699,
    price: 299,
    discount_percent: 57,
    stock: 30,
    low_stock_threshold: 5,
    image_url: '/images/products/glass-privacy.jpg',
    description: 'Two-way privacy filter prevents shoulder surfing in public while offering a silky smooth matte finish for gaming.',
    is_active: true,
    is_featured: true,
    is_universal: false,
  },
  {
    id: 3,
    name: 'UV Curved Liquid Glue Tempered Glass',
    slug: 'uv-curved-liquid-tempered-glass',
    sku: 'TG-UV-003',
    product_type: 'tempered_glass',
    variant_type: 'UV Liquid',
    category_id: 1,
    category: { id: 1, name: 'Tempered Glass', slug: 'tempered-glass' },
    brand_id: 2,
    brand: { id: 2, name: 'Samsung' },
    compatible_models: [samsungModels[0], samsungModels[1]],
    mrp: 999,
    price: 449,
    discount_percent: 55,
    stock: 20,
    low_stock_threshold: 4,
    image_url: '/images/products/glass-uv.jpg',
    description: 'Designed for curved displays. High optical liquid dispersion technology cures with UV light for seamless touch sensitivity.',
    is_active: true,
    is_featured: false,
    is_universal: false,
  },
  {
    id: 4,
    name: 'Ceramic Flexible Unbreakable Screen Guard',
    slug: 'ceramic-flexible-unbreakable-screen-guard',
    sku: 'TG-CER-004',
    product_type: 'tempered_glass',
    variant_type: 'Ceramic',
    category_id: 1,
    category: { id: 1, name: 'Tempered Glass', slug: 'tempered-glass' },
    brand_id: 1,
    brand: { id: 1, name: 'Apple' },
    compatible_models: allPhoneModels,
    mrp: 399,
    price: 149,
    discount_percent: 63,
    stock: 60,
    low_stock_threshold: 10,
    image_url: '/images/products/glass-ceramic.jpg',
    description: 'Flexible hybrid ceramic film that never cracks, chips, or shatters on impacts.',
    is_active: true,
    is_featured: false,
    is_universal: false,
  },
  {
    id: 5,
    name: 'Clear Shockproof Hybrid Armor Case with Camera Ring',
    slug: 'clear-shockproof-hybrid-armor-case',
    sku: 'PC-CLR-001',
    product_type: 'pouch',
    variant_type: 'Shockproof / Hybrid',
    category_id: 2,
    category: { id: 2, name: 'Mobile Pouches', slug: 'pouches' },
    brand_id: 1,
    brand: { id: 1, name: 'Apple' },
    compatible_models: iphoneModels,
    mrp: 599,
    price: 249,
    discount_percent: 58,
    stock: 35,
    low_stock_threshold: 5,
    image_url: '/images/products/case-armor.jpg',
    description: 'Crystal-clear anti-yellowing back panel with shock-absorbing TPU bumpers and raised camera bezel protection.',
    is_active: true,
    is_featured: true,
    is_universal: false,
  },
  {
    id: 6,
    name: 'Vintage Leather Wallet Flip Cover with Card Slot',
    slug: 'vintage-leather-wallet-flip-cover',
    sku: 'PC-LTH-002',
    product_type: 'pouch',
    variant_type: 'Leather Flip',
    category_id: 2,
    category: { id: 2, name: 'Mobile Pouches', slug: 'pouches' },
    brand_id: 2,
    brand: { id: 2, name: 'Samsung' },
    compatible_models: samsungModels,
    mrp: 899,
    price: 399,
    discount_percent: 56,
    stock: 18,
    low_stock_threshold: 4,
    image_url: '/images/products/pouch-leather.jpg',
    description: 'Crafted from premium PU leather with inner card slots, cash pocket, and magnetic clasp with kickstand support.',
    is_active: true,
    is_featured: true,
    is_universal: false,
  },
  {
    id: 7,
    name: 'Liquid Silicone Soft Touch Protective Cover',
    slug: 'liquid-silicone-protective-cover',
    sku: 'PC-SIL-003',
    product_type: 'pouch',
    variant_type: 'Liquid Silicone',
    category_id: 2,
    category: { id: 2, name: 'Mobile Pouches', slug: 'pouches' },
    brand_id: 1,
    brand: { id: 1, name: 'Apple' },
    compatible_models: iphoneModels,
    mrp: 499,
    price: 199,
    discount_percent: 60,
    stock: 50,
    low_stock_threshold: 5,
    image_url: '/images/products/case-silicone.jpg',
    description: 'Silky smooth soft-touch exterior with microfiber cloth lining inside to prevent back scratches.',
    is_active: true,
    is_featured: false,
    is_universal: false,
  },
  {
    id: 8,
    name: 'Magnetic Slim Matte Case with Ring Stand',
    slug: 'magnetic-slim-matte-case',
    sku: 'PC-MAG-004',
    product_type: 'pouch',
    variant_type: 'Magnetic / Stand',
    category_id: 2,
    category: { id: 2, name: 'Mobile Pouches', slug: 'pouches' },
    brand_id: 3,
    brand: { id: 3, name: 'OnePlus' },
    compatible_models: allPhoneModels,
    mrp: 699,
    price: 299,
    discount_percent: 57,
    stock: 25,
    low_stock_threshold: 5,
    image_url: '/images/products/case-magnetic-ring.jpg',
    description: 'Built-in metal ring stand rotates 360° and works with magnetic car mounts.',
    is_active: true,
    is_featured: false,
    is_universal: false,
  },
  {
    id: 9,
    name: '65W GaN Fast Charger with Dual Type-C & USB-A',
    slug: '65w-gan-fast-charger',
    sku: 'ACC-CHG-001',
    product_type: 'accessory',
    variant_type: 'Charger',
    category_id: 3,
    category: { id: 3, name: 'Chargers & Adapters', slug: 'chargers' },
    mrp: 2499,
    price: 1299,
    discount_percent: 48,
    stock: 22,
    low_stock_threshold: 5,
    image_url: '/images/products/charger.jpg',
    description: 'Compact Gallium Nitride (GaN) fast charger capable of charging phones, tablets, and laptops simultaneously.',
    is_active: true,
    is_featured: true,
    is_universal: true,
    compatible_models: [],
  },
  {
    id: 10,
    name: 'Braided 100W Type-C to Type-C Fast Charging Cable (1.5m)',
    slug: '100w-braided-type-c-cable',
    sku: 'ACC-CBL-002',
    product_type: 'accessory',
    variant_type: 'Cable',
    category_id: 4,
    category: { id: 4, name: 'Fast Charging Cables', slug: 'cables' },
    mrp: 699,
    price: 299,
    discount_percent: 57,
    stock: 40,
    low_stock_threshold: 8,
    image_url: '/images/products/cable.jpg',
    description: 'Military-grade nylon braided 100W fast cable with E-marker smart chip and 480Mbps data transfer speed.',
    is_active: true,
    is_featured: true,
    is_universal: true,
    compatible_models: [],
  },
  {
    id: 11,
    name: '20,000mAh Power Delivery Fast Charging Power Bank',
    slug: '20000mah-fast-charging-power-bank',
    sku: 'ACC-PB-003',
    product_type: 'accessory',
    variant_type: 'Power Bank',
    category_id: 6,
    category: { id: 6, name: 'Power Banks & Batteries', slug: 'power-banks' },
    mrp: 2999,
    price: 1599,
    discount_percent: 47,
    stock: 15,
    low_stock_threshold: 3,
    image_url: '/images/products/powerbank.jpg',
    description: 'High capacity 20,000mAh lithium-polymer power bank with 22.5W QC3.0 + PD bidirectional fast charging.',
    is_active: true,
    is_featured: true,
    is_universal: true,
    compatible_models: [],
  },
  {
    id: 12,
    name: 'In-Ear Type-C Bass Earphones with Mic & Remote',
    slug: 'in-ear-type-c-bass-earphones',
    sku: 'ACC-EAR-004',
    product_type: 'accessory',
    variant_type: 'Earphones',
    category_id: 5,
    category: { id: 5, name: 'Audio & Earphones', slug: 'audio' },
    mrp: 799,
    price: 349,
    discount_percent: 56,
    stock: 30,
    low_stock_threshold: 5,
    image_url: '/images/products/earphones.jpg',
    description: 'High-resolution digital DAC chipset ensures punchy bass, clear vocals, and noise-isolated audio with in-line microphone.',
    is_active: true,
    is_featured: false,
    is_universal: true,
    compatible_models: [],
  },
  {
    id: 13,
    name: 'Wireless Over-Ear ANC Bluetooth Headphones',
    slug: 'wireless-over-ear-anc-headphones',
    sku: 'ACC-HP-005',
    product_type: 'accessory',
    variant_type: 'Headphones',
    category_id: 5,
    category: { id: 5, name: 'Audio & Earphones', slug: 'audio' },
    mrp: 4499,
    price: 2199,
    discount_percent: 51,
    stock: 12,
    low_stock_threshold: 2,
    image_url: '/images/products/headphones.jpg',
    description: 'Active Noise Cancellation (ANC) with 40mm dynamic neodymium drivers, 40 hours battery life, and comfortable memory foam earcups.',
    is_active: true,
    is_featured: true,
    is_universal: true,
    compatible_models: [],
  },
  {
    id: 14,
    name: 'Portable Waterproof Wireless Bluetooth Speaker',
    slug: 'portable-waterproof-bluetooth-speaker',
    sku: 'ACC-SPK-006',
    product_type: 'accessory',
    variant_type: 'Speaker',
    category_id: 5,
    category: { id: 5, name: 'Audio & Earphones', slug: 'audio' },
    mrp: 1999,
    price: 999,
    discount_percent: 50,
    stock: 20,
    low_stock_threshold: 4,
    image_url: '/images/products/speaker.jpg',
    description: 'IPX7 waterproof rated compact Bluetooth speaker with 360-degree room-filling sound and 12-hour continuous playtime.',
    is_active: true,
    is_featured: false,
    is_universal: true,
    compatible_models: [],
  },
  {
    id: 15,
    name: '360° Rotatable Car Air Vent Phone Holder Mount',
    slug: 'car-air-vent-phone-holder',
    sku: 'ACC-HLD-007',
    product_type: 'accessory',
    variant_type: 'Car Mount',
    category_id: 7,
    category: { id: 7, name: 'Car Holders & Mounts', slug: 'holders' },
    mrp: 599,
    price: 249,
    discount_percent: 58,
    stock: 28,
    low_stock_threshold: 5,
    image_url: '/images/products/holder.jpg',
    description: 'Gravity auto-lock mechanism holds your phone securely on bumpy roads with one-hand insertion and release.',
    is_active: true,
    is_featured: false,
    is_universal: true,
    compatible_models: [],
  },
  {
    id: 16,
    name: '128GB High Speed Class 10 MicroSD Memory Card',
    slug: '128gb-high-speed-microsd-card',
    sku: 'ACC-MEM-008',
    product_type: 'accessory',
    variant_type: 'Memory Card',
    category_id: 8,
    category: { id: 8, name: 'Memory Cards & OTG', slug: 'storage' },
    mrp: 1299,
    price: 699,
    discount_percent: 46,
    stock: 25,
    low_stock_threshold: 5,
    image_url: '/images/products/memorycard.jpg',
    description: 'Class 10 U3 V30 microSD card with up to 100MB/s read speeds, suitable for 4K video recording and app storage.',
    is_active: true,
    is_featured: false,
    is_universal: true,
    compatible_models: [],
  },
  {
    id: 17,
    name: 'High Speed Metal USB 3.0 to Type-C OTG Adapter',
    slug: 'usb-3-to-type-c-otg-adapter',
    sku: 'ACC-OTG-009',
    product_type: 'accessory',
    variant_type: 'OTG Adapter',
    category_id: 8,
    category: { id: 8, name: 'Memory Cards & OTG', slug: 'storage' },
    mrp: 249,
    price: 99,
    discount_percent: 60,
    stock: 65,
    low_stock_threshold: 10,
    image_url: '/images/products/otg.jpg',
    description: 'Zinc alloy mini adapter allows connecting USB pen drives, keyboards, and mice directly to Android and iPhone 15/16.',
    is_active: true,
    is_featured: true,
    is_universal: true,
    compatible_models: TOP_10_MODELS,
  },
  {
    id: 18,
    name: '10,000mAh MagSafe Magnetic Wireless Fast Charging Power Bank',
    slug: '10000mah-magsafe-magnetic-wireless-power-bank',
    sku: 'ACC-PB-018',
    product_type: 'accessory',
    variant_type: 'Magnetic Wireless Power Bank',
    category_id: 6,
    category: { id: 6, name: 'Power Banks & Batteries', slug: 'power-banks' },
    mrp: 2999,
    price: 1499,
    discount_percent: 50,
    stock: 28,
    low_stock_threshold: 5,
    image_url: '/images/products/powerbank-magnetic.jpg',
    description: '15W Qi fast wireless charging with snap-on MagSafe magnets and 20W Type-C bidirectional Power Delivery port. Strong magnetic absorption holds phone firmly during charging.',
    is_active: true,
    is_featured: true,
    is_universal: true,
    compatible_models: TOP_10_MODELS,
  },
  {
    id: 19,
    name: 'Ultra-Slim 10,000mAh Dual Port Fast Charging Power Bank',
    slug: 'ultra-slim-10000mah-dual-port-power-bank',
    sku: 'ACC-PB-019',
    product_type: 'accessory',
    variant_type: 'Power Bank',
    category_id: 6,
    category: { id: 6, name: 'Power Banks & Batteries', slug: 'power-banks' },
    mrp: 1499,
    price: 799,
    discount_percent: 47,
    stock: 35,
    low_stock_threshold: 8,
    image_url: '/images/products/powerbank-slim.jpg',
    description: 'Pocket-friendly lightweight design with anti-slip texture. Dual 2.4A USB outputs allow charging two phones simultaneously with multi-level surge protection.',
    is_active: true,
    is_featured: false,
    is_universal: true,
    compatible_models: TOP_10_MODELS,
  },
  {
    id: 20,
    name: 'iPhone High-Capacity Zero-Cycle Replacement Battery',
    slug: 'iphone-high-capacity-replacement-battery',
    sku: 'BAT-IPH-020',
    product_type: 'accessory',
    variant_type: 'Mobile Battery',
    category_id: 6,
    category: { id: 6, name: 'Power Banks & Batteries', slug: 'power-banks' },
    brand_id: 1,
    brand: { id: 1, name: 'Apple' },
    mrp: 2499,
    price: 1199,
    discount_percent: 52,
    stock: 22,
    low_stock_threshold: 5,
    image_url: '/images/products/battery-iphone.jpg',
    description: 'Brand new 0-cycle lithium-ion replacement battery with Texas Instruments battery management chip. Restores 100% battery health with over-voltage, temperature, and short-circuit protection.',
    is_active: true,
    is_featured: true,
    is_universal: false,
    compatible_models: [allPhoneModels[0], allPhoneModels[1], allPhoneModels[2]],
  },
  {
    id: 21,
    name: 'Samsung Galaxy 5000mAh High-Density Replacement Battery',
    slug: 'samsung-galaxy-5000mah-replacement-battery',
    sku: 'BAT-SAM-021',
    product_type: 'accessory',
    variant_type: 'Mobile Battery',
    category_id: 6,
    category: { id: 6, name: 'Power Banks & Batteries', slug: 'power-banks' },
    brand_id: 2,
    brand: { id: 2, name: 'Samsung' },
    mrp: 1999,
    price: 899,
    discount_percent: 55,
    stock: 30,
    low_stock_threshold: 6,
    image_url: '/images/products/battery-samsung.jpg',
    description: 'Grade A+ lithium-ion battery cell with 5000mAh rated capacity. Tested for 800+ recharge cycles with pure cobalt cathode for extended screen-on time.',
    is_active: true,
    is_featured: false,
    is_universal: false,
    compatible_models: [allPhoneModels[3], allPhoneModels[4], allPhoneModels[5]],
  },
  {
    id: 22,
    name: 'Universal High-Grade Mobile Battery Cell with IC Protection',
    slug: 'universal-high-grade-mobile-battery-cell',
    sku: 'BAT-UNI-022',
    product_type: 'accessory',
    variant_type: 'Mobile Battery',
    category_id: 6,
    category: { id: 6, name: 'Power Banks & Batteries', slug: 'power-banks' },
    mrp: 1499,
    price: 649,
    discount_percent: 57,
    stock: 40,
    low_stock_threshold: 10,
    image_url: '/images/products/battery-universal.jpg',
    description: 'High-performance replacement battery cell with smart dual-IC protection circuit against overcharge, deep discharge, and overheating. Compatible with major Android devices.',
    is_active: true,
    is_featured: false,
    is_universal: true,
    compatible_models: TOP_10_MODELS,
  },
];

export const MOCK_PRODUCTS = INITIAL_PRODUCTS.map(p => ({ ...p }));
export const mockProducts = MOCK_PRODUCTS;

export const MOCK_SETTINGS = {
  store: {
    shipping_fee: 49,
    free_shipping_above: 499,
    cod_enabled: true,
    online_payment_enabled: false,
  },
  email: {
    business_recipient: 'mohammedafiz447@gmail.com',
    sender_name: 'MS ENTERPRISES',
    notify_enquiry: true,
    notify_booking: true,
    notify_order: true,
  },
  booking: {
    time_slots: [
      '10:00 AM - 12:00 PM',
      '12:00 PM - 02:00 PM',
      '02:00 PM - 04:00 PM',
      '04:00 PM - 06:00 PM',
      '06:00 PM - 08:30 PM',
    ],
    max_days_ahead: 30,
  },
  environment: {
    smtp_configured: false,
    payment_gateway_configured: false,
  },
};

// In-memory / localStorage simulation for full backend persistence
const STORAGE_PRODUCTS_KEY = 'ms_mock_products';
const STORAGE_ORDERS_KEY = 'ms_mock_orders';
const STORAGE_BOOKINGS_KEY = 'ms_mock_bookings';
const STORAGE_SETTINGS_KEY = 'ms_mock_settings';
const STORAGE_MOVEMENTS_KEY = 'ms_mock_movements';
const STORAGE_CATEGORIES_KEY = 'ms_mock_categories';
const STORAGE_BRANDS_KEY = 'ms_mock_brands';
const STORAGE_MODELS_KEY = 'ms_mock_models';
const STORAGE_SUPPLIERS_KEY = 'ms_mock_suppliers';
const STORAGE_CUSTOMERS_KEY = 'ms_mock_customers';
const STORAGE_ENQUIRIES_KEY = 'ms_mock_enquiries';
const STORAGE_STAFF_KEY = 'ms_mock_staff';
const STORAGE_SERVICES_KEY = 'ms_mock_services';
const STORAGE_REVIEWS_KEY = 'ms_mock_reviews';
const STORAGE_EMAILS_KEY = 'ms_mock_emails';

// Sync in-memory products array with storage on initialization
export function getMockProducts() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_PRODUCTS_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically sync latest canonical image_urls and categories for default mock products
        const canonicalMap = new Map(INITIAL_PRODUCTS.map(p => [p.id, p]));
        let modified = false;

        parsed.forEach(p => {
          const canon = canonicalMap.get(p.id);
          if (canon) {
            // If stored image_url is pointing to an old or outdated image path, sync to canonical
            if (canon.image_url && p.image_url !== canon.image_url) {
              p.image_url = canon.image_url;
              modified = true;
            }
            if (canon.category && (!p.category || p.category.name !== canon.category.name)) {
              p.category = canon.category;
              p.category_id = canon.category_id;
              modified = true;
            }
          }
        });

        // Ensure newly introduced products (such as Power Banks & Batteries 18-22) are present
        const parsedIds = new Set(parsed.map(p => p.id));
        INITIAL_PRODUCTS.forEach(canon => {
          if (!parsedIds.has(canon.id)) {
            parsed.push({ ...canon });
            modified = true;
          }
        });

        if (modified && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(parsed));
          } catch {}
        }

        // Keep in-memory MOCK_PRODUCTS aligned
        MOCK_PRODUCTS.length = 0;
        MOCK_PRODUCTS.push(...parsed);
        return MOCK_PRODUCTS;
      }
    }
  } catch {}

  // If no valid localStorage found or empty, initialize cleanly from INITIAL_PRODUCTS
  MOCK_PRODUCTS.length = 0;
  MOCK_PRODUCTS.push(...INITIAL_PRODUCTS.map(p => ({ ...p })));
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(MOCK_PRODUCTS));
    }
  } catch {}
  return MOCK_PRODUCTS;
}

function persistProducts(list) {
  if (list !== MOCK_PRODUCTS) {
    MOCK_PRODUCTS.length = 0;
    MOCK_PRODUCTS.push(...list);
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(MOCK_PRODUCTS));
    }
  } catch {}
}

export function saveMockProduct(data) {
  const products = [...getMockProducts()];
  const maxId = products.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0);
  const nextId = maxId + 1;
  const slug = (data.name || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + nextId;

  // Resolve category and brand lookups
  const category = MOCK_CATEGORIES.find((c) => String(c.id) === String(data.category_id)) || {
    id: data.category_id,
    name: 'Accessories',
  };
  const brand = MOCK_BRANDS.find((b) => String(b.id) === String(data.brand_id)) || null;

  // Resolve compatible models
  let compatibleModels = [];
  if (Array.isArray(data.model_ids) && data.model_ids.length > 0) {
    const allModels = getMockModels();
    compatibleModels = allModels.filter((m) => data.model_ids.map(String).includes(String(m.id)));
  }

  const mrp = Number(data.mrp) || Number(data.price) || 299;
  const price = Number(data.price) || 199;
  const discount_percent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const newProduct = {
    id: nextId,
    name: data.name,
    slug,
    sku: data.sku || `SKU-${nextId}`,
    product_type: data.product_type || 'accessory',
    variant_type: data.variant_type || '',
    category_id: Number(data.category_id) || 1,
    category,
    brand_id: data.brand_id ? Number(data.brand_id) : null,
    brand,
    mrp,
    price,
    discount_percent,
    stock: Number(data.stock) || 0,
    low_stock_threshold: Number(data.low_stock_threshold) || 5,
    image_url: data.image_url || '/images/products/case-armor.jpg',
    description: data.description || '',
    is_active: data.is_active !== false,
    is_featured: Boolean(data.is_featured),
    is_universal: Boolean(data.is_universal),
    compatible_models: compatibleModels,
    created_at: new Date().toISOString(),
  };

  products.unshift(newProduct);
  persistProducts(products);

  // Log opening stock movement if stock > 0
  if (newProduct.stock > 0) {
    recordStockMovement({
      product_id: newProduct.id,
      movement_type: 'in',
      quantity: newProduct.stock,
      reference: 'Opening stock',
      note: 'Initial product stock creation',
    });
  }

  return newProduct;
}

export function updateMockProduct(data) {
  const products = [...getMockProducts()];
  const idx = products.findIndex((p) => String(p.id) === String(data.id));
  if (idx === -1) return null;

  const existing = products[idx];

  // If this is a toggle action (e.g. is_active or is_featured)
  if (data.toggle && data.value !== undefined) {
    existing[data.toggle] = data.value;
    products[idx] = existing;
    persistProducts(products);
    return existing;
  }

  // Resolve compatible models if model_ids passed
  let compatibleModels = existing.compatible_models;
  if (Array.isArray(data.model_ids)) {
    const allModels = getMockModels();
    compatibleModels = allModels.filter((m) => data.model_ids.map(String).includes(String(m.id)));
  }

  const mrp = data.mrp !== undefined ? Number(data.mrp) : existing.mrp;
  const price = data.price !== undefined ? Number(data.price) : existing.price;
  const discount_percent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const updated = {
    ...existing,
    ...data,
    id: existing.id,
    mrp,
    price,
    discount_percent,
    compatible_models: compatibleModels,
    updated_at: new Date().toISOString(),
  };

  products[idx] = updated;
  persistProducts(products);
  return updated;
}

export function deleteMockProduct(id) {
  const products = getMockProducts().filter((p) => String(p.id) !== String(id));
  persistProducts(products);
  return { success: true };
}

export function getMockOrders() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_ORDERS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveMockOrder(orderData) {
  const orders = getMockOrders();
  const id = 'ord_' + Math.random().toString(36).slice(2, 9);
  const orderNumber = 'MSO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const products = getMockProducts();
  const subtotal = orderData.items.reduce((sum, item) => {
    const p = products.find((x) => String(x.id) === String(item.product_id));
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);
  const currentSettings = getMockSettings();
  const shippingFee = subtotal >= currentSettings.store.free_shipping_above ? 0 : currentSettings.store.shipping_fee;
  const total = subtotal + shippingFee;

  // Deduct purchased quantity from inventory
  orderData.items.forEach((item) => {
    const p = products.find((x) => String(x.id) === String(item.product_id));
    if (p && p.stock !== undefined) {
      p.stock = Math.max(0, p.stock - item.quantity);
      recordStockMovement({
        product_id: p.id,
        movement_type: 'out',
        quantity: item.quantity,
        reference: orderNumber,
        note: `Order ${orderNumber} placed`,
      });
    }
  });
  persistProducts(products);

  const newOrder = {
    id,
    order_number: orderNumber,
    customer_name: orderData.shipping?.full_name || 'Valued Customer',
    phone: orderData.shipping?.phone || '8088298447',
    email: orderData.shipping?.email || 'customer@example.com',
    address: orderData.shipping?.address || '73, HKP Road, Bengaluru',
    city: orderData.shipping?.city || 'Bengaluru',
    pincode: orderData.shipping?.pincode || '560051',
    status: 'pending',
    payment_status: orderData.payment_method === 'cod' ? 'pending' : 'paid',
    payment_method: orderData.payment_method || 'cod',
    subtotal,
    shipping_fee: shippingFee,
    total,
    created_at: new Date().toISOString(),
    order_items: orderData.items.map((i) => {
      const p = products.find((x) => String(x.id) === String(i.product_id)) || {};
      return {
        id: 'item_' + Math.random().toString(36).slice(2, 7),
        product_name: p.name || 'Mobile Accessory',
        sku: p.sku || 'ACC-001',
        price: p.price || 199,
        quantity: i.quantity,
        line_total: (p.price || 199) * i.quantity,
      };
    }),
    status_history: [
      { status: 'pending', at: new Date().toISOString(), note: 'Order placed via website.' },
    ],
  };

  orders.unshift(newOrder);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    }
  } catch {}
  return newOrder;
}

export function updateMockOrder(id, { status, payment_status, note }) {
  const orders = getMockOrders();
  const idx = orders.findIndex((o) => o.id === id || o.order_number === id);
  if (idx === -1) return null;

  const order = orders[idx];
  const oldStatus = order.status;

  if (status) order.status = status;
  if (payment_status) order.payment_status = payment_status;

  // Add history event
  if (note || (status && status !== oldStatus)) {
    order.status_history = order.status_history || [];
    order.status_history.push({
      status: status || oldStatus,
      at: new Date().toISOString(),
      note: note || `Order updated to ${status}.`,
    });
  }

  // If cancelled and wasn't cancelled before, restore stock
  if (status === 'cancelled' && oldStatus !== 'cancelled') {
    const products = getMockProducts();
    (order.order_items || []).forEach((item) => {
      const p = products.find((x) => x.sku === item.sku || x.name === item.product_name);
      if (p) {
        p.stock += item.quantity;
        recordStockMovement({
          product_id: p.id,
          movement_type: 'in',
          quantity: item.quantity,
          reference: order.order_number,
          note: `Order ${order.order_number} cancelled - returned to stock`,
        });
      }
    });
    persistProducts(products);
  }

  orders[idx] = order;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    }
  } catch {}
  return order;
}

export function cancelMockOrder(id) {
  return updateMockOrder(id, { status: 'cancelled', note: 'Order cancelled by customer.' });
}

export function getMockBookings() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_BOOKINGS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'bk_sample1',
      booking_code: 'MSR-AB12CD',
      customer_name: 'Imran Khan',
      phone: '9876543210',
      email: 'imran@example.com',
      brand_name: 'Samsung',
      model_name: 'Galaxy S23',
      service_name: 'Screen & Display Replacement',
      appointment_date: '2026-11-12',
      preferred_time: '12:00 PM - 02:00 PM',
      status: 'Diagnosis',
      estimated_cost: 3499,
      technician_name: 'Arun Kumar',
      issue: 'Dropped phone on road. Glass cracked, display flickers with green lines.',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      status_history: [
        { status: 'Booked', at: new Date(Date.now() - 86400000).toISOString(), note: 'Repair booked online.' },
        { status: 'Received', at: new Date(Date.now() - 43200000).toISOString(), note: 'Device received at store.' },
        { status: 'Diagnosis', at: new Date(Date.now() - 21600000).toISOString(), note: 'Technician opened device for inspection.' },
      ],
    },
  ];
}

export function saveMockBooking(bookingData) {
  const bookings = getMockBookings();
  const code = 'MSR-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const newBooking = {
    id: 'bk_' + Math.random().toString(36).slice(2, 9),
    booking_code: code,
    customer_name: bookingData.customer_name || 'Customer',
    phone: bookingData.phone,
    email: bookingData.email,
    brand_name: bookingData.brand_name || 'Smartphone',
    model_name: bookingData.model_name || 'Universal',
    service_name: bookingData.service_name || (getMockServices().find((s) => String(s.id) === String(bookingData.service_id)) || {}).name || 'Mobile Repair',
    appointment_date: bookingData.appointment_date,
    preferred_time: bookingData.preferred_time,
    status: 'Booked',
    estimated_cost: null,
    technician_name: null,
    issue: bookingData.issue,
    created_at: new Date().toISOString(),
    status_history: [
      { status: 'Booked', at: new Date().toISOString(), note: 'Repair booked online.' },
    ],
  };

  bookings.unshift(newBooking);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
    }
  } catch {}
  return newBooking;
}

export function updateMockBooking(id, { status, technician_id, estimated_cost, admin_notes, note }) {
  const bookings = getMockBookings();
  const idx = bookings.findIndex((b) => b.id === id || b.booking_code === id);
  if (idx === -1) return null;

  const booking = bookings[idx];
  const oldStatus = booking.status;

  if (status) booking.status = status;
  if (technician_id !== undefined) {
    booking.technician_id = technician_id;
    booking.technician_name = technician_id === 'tech_1' ? 'Arun Kumar' : technician_id === 'tech_2' ? 'Imran Khan' : technician_id || null;
  }
  if (estimated_cost !== undefined && estimated_cost !== '') booking.estimated_cost = Number(estimated_cost);
  if (admin_notes !== undefined) booking.admin_notes = admin_notes;

  if (note || (status && status !== oldStatus)) {
    booking.status_history = booking.status_history || [];
    booking.status_history.push({
      status: status || oldStatus,
      at: new Date().toISOString(),
      note: note || `Booking status changed to ${status}.`,
    });
  }

  bookings[idx] = booking;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
    }
  } catch {}
  return booking;
}

export function getMockSettings() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_SETTINGS_KEY) : null;
    if (raw) return { ...MOCK_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return MOCK_SETTINGS;
}

export function updateMockSettings(key, value) {
  const settings = getMockSettings();
  settings[key] = { ...(settings[key] || {}), ...value };
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    }
  } catch {}
  return settings;
}

export function recordStockMovement(data) {
  const movements = getMockMovements();
  const newMovement = {
    id: 'mov_' + Math.random().toString(36).slice(2, 9),
    created_at: new Date().toISOString(),
    ...data,
  };
  movements.unshift(newMovement);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(movements.slice(0, 100)));
    }
  } catch {}
  return newMovement;
}

export function getMockMovements() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_MOVEMENTS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

// Simple CRUD helpers for Categories, Brands, Models, Suppliers
export function getMockCategories() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_CATEGORIES_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_CATEGORIES;
}

export function saveMockCategory(cat) {
  const list = [...getMockCategories()];
  const id = list.reduce((m, c) => Math.max(m, c.id), 0) + 1;
  const newCat = { ...cat, id };
  list.push(newCat);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(list)); } catch {}
  return newCat;
}

export function updateMockCategory(cat) {
  const list = getMockCategories().map((c) => (c.id === cat.id ? { ...c, ...cat } : c));
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(list)); } catch {}
  return cat;
}

export function deleteMockCategory(id) {
  const list = getMockCategories().filter((c) => c.id !== id);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(list)); } catch {}
  return { success: true };
}

export function getMockBrands() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_BRANDS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_BRANDS;
}

export function saveMockBrand(b) {
  const list = [...getMockBrands()];
  const id = list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
  const newBrand = { ...b, id };
  list.push(newBrand);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_BRANDS_KEY, JSON.stringify(list)); } catch {}
  return newBrand;
}

export function updateMockBrand(b) {
  const list = getMockBrands().map((x) => (x.id === b.id ? { ...x, ...b } : x));
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_BRANDS_KEY, JSON.stringify(list)); } catch {}
  return b;
}

export function deleteMockBrand(id) {
  const list = getMockBrands().filter((x) => x.id !== id);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_BRANDS_KEY, JSON.stringify(list)); } catch {}
  return { success: true };
}

export function getMockModels() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_MODELS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_MODELS;
}

export function saveMockModel(m) {
  const list = [...getMockModels()];
  const id = list.reduce((max, x) => Math.max(max, x.id), 0) + 1;
  const brand = getMockBrands().find((b) => String(b.id) === String(m.brand_id));
  const newModel = { ...m, id, mobile_brands: brand ? { id: brand.id, name: brand.name } : null };
  list.push(newModel);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_MODELS_KEY, JSON.stringify(list)); } catch {}
  return newModel;
}

export function updateMockModel(m) {
  const list = getMockModels().map((x) => (x.id === m.id ? { ...x, ...m } : x));
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_MODELS_KEY, JSON.stringify(list)); } catch {}
  return m;
}

export function deleteMockModel(id) {
  const list = getMockModels().filter((x) => x.id !== id);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_MODELS_KEY, JSON.stringify(list)); } catch {}
  return { success: true };
}

export function getMockEnquiries() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_ENQUIRIES_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 1,
      recipient: 'mohammedafiz447@gmail.com',
      subject: 'Screen replacement quote for iPhone 15',
      name: 'Karthik',
      email: 'karthik@example.com',
      phone: '9845012345',
      message: 'Need urgent screen replacement for iPhone 15 Pro.',
      status: 'new',
      created_at: new Date().toISOString(),
    },
  ];
}

export function saveMockEnquiry(data) {
  const list = getMockEnquiries();
  const newEnquiry = {
    id: 'enq_' + Math.random().toString(36).slice(2, 9),
    recipient: 'mohammedafiz447@gmail.com',
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    subject: data.subject,
    message: data.message,
    status: 'new',
    created_at: new Date().toISOString(),
  };
  list.unshift(newEnquiry);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(list));
    }
  } catch {}
  return newEnquiry;
}

export function updateMockEnquiry(id, updates) {
  const list = getMockEnquiries().map((e) => (e.id === id ? { ...e, ...updates } : e));
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(list));
    }
  } catch {}
  return { success: true };
}

// Suppliers CRUD
export function getMockSuppliers() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_SUPPLIERS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: 1, name: 'Bangalore Mobile Spares Wholesale', contact_person: 'Ramesh Patel', phone: '9845012345', email: 'spares.blr@gmail.com', address: 'SP Road, Bangalore', gstin: '29ABCDE1234F1Z5' },
    { id: 2, name: 'National Accessories Distribution', contact_person: 'Suresh Kumar', phone: '9845098765', email: 'sales@nationalacc.com', address: 'Shivaji Nagar, Bangalore', gstin: '29FGHIJ5678K1Z2' },
  ];
}

export function saveMockSupplier(s) {
  const list = [...getMockSuppliers()];
  const id = list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
  const newSupplier = { ...s, id };
  list.push(newSupplier);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(list)); } catch {}
  return newSupplier;
}

export function updateMockSupplier(s) {
  const list = getMockSuppliers().map((x) => (x.id === s.id ? { ...x, ...s } : x));
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(list)); } catch {}
  return s;
}

export function deleteMockSupplier(id) {
  const list = getMockSuppliers().filter((x) => x.id !== id);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(list)); } catch {}
  return { success: true };
}

// Services CRUD
export function getMockServices() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_SERVICES_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_SERVICES;
}

export function saveMockService(s) {
  const list = [...getMockServices()];
  const id = list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
  const newService = { ...s, id, slug: s.slug || (s.name || 'service').toLowerCase().replace(/[^a-z0-9]+/g, '-') };
  list.push(newService);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(list)); } catch {}
  return newService;
}

export function updateMockService(s) {
  const list = getMockServices().map((x) => (x.id === s.id ? { ...x, ...s } : x));
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(list)); } catch {}
  return s;
}

export function deleteMockService(id) {
  const list = getMockServices().filter((x) => x.id !== id);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(list)); } catch {}
  return { success: true };
}

// Customers CRUD
export function getMockCustomers() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_CUSTOMERS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: 'c1', full_name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', city: 'Bengaluru', order_count: 3, total_spent: 2490, is_active: true, created_at: '2026-10-15T10:00:00Z' },
    { id: 'c2', full_name: 'Priya Nair', email: 'priya@example.com', phone: '9876543211', city: 'Bengaluru', order_count: 2, total_spent: 1298, is_active: true, created_at: '2026-10-20T14:30:00Z' },
    { id: 'c3', full_name: 'Syed Hafeez', email: 'hafeez@example.com', phone: '9876543212', city: 'Bengaluru', order_count: 4, total_spent: 4580, is_active: true, created_at: '2026-10-25T11:00:00Z' },
  ];
}

export function saveMockCustomer(c) {
  const list = [...getMockCustomers()];
  const id = 'c_' + Date.now();
  const newCust = { id, order_count: 0, total_spent: 0, is_active: true, created_at: new Date().toISOString(), ...c };
  list.unshift(newCust);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(list)); } catch {}
  return newCust;
}

export function updateMockCustomer(c) {
  const list = getMockCustomers().map((x) => (x.id === c.id ? { ...x, ...c } : x));
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(list)); } catch {}
  return c;
}

export function deleteMockCustomer(id) {
  const list = getMockCustomers().filter((x) => x.id !== id);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(list)); } catch {}
  return { success: true };
}

// Staff CRUD
export function getMockStaff() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_STAFF_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: 'staff_1', full_name: 'Mohammed Afiz (Owner)', email: 'mohammedafiz447@gmail.com', phone: '8088298447', role: 'super_admin', is_active: true, created_at: '2026-01-01' },
    { id: 'staff_2', full_name: 'Store Manager', email: 'manager@msenterprises.com', phone: '8088298448', role: 'manager', is_active: true, created_at: '2026-01-01' },
    { id: 'staff_3', full_name: 'Arun Kumar (Lead Technician)', email: 'arun@msenterprises.com', phone: '8088298449', role: 'technician', is_active: true, created_at: '2026-01-15' },
  ];
}

export function saveMockStaff(s) {
  const list = [...getMockStaff()];
  const id = 'staff_' + Date.now();
  const newStaff = { id, is_active: true, created_at: new Date().toISOString(), ...s };
  list.push(newStaff);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(list)); } catch {}
  return newStaff;
}

export function updateMockStaff(s) {
  const list = getMockStaff().map((x) => (x.id === s.id ? { ...x, ...s } : x));
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(list)); } catch {}
  return s;
}

export function deleteMockStaff(id) {
  const list = getMockStaff().filter((x) => x.id !== id);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(list)); } catch {}
  return { success: true };
}

// Reviews CRUD
export function getMockReviews() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_REVIEWS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_REVIEWS;
}

export function saveMockReview(r) {
  const list = [...getMockReviews()];
  const id = list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
  const newRev = { ...r, id, is_approved: true, created_at: new Date().toISOString() };
  list.unshift(newRev);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(list)); } catch {}
  return newRev;
}

export function updateMockReview(r) {
  const list = getMockReviews().map((x) => (x.id === r.id ? { ...x, ...r } : x));
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(list)); } catch {}
  return r;
}

export function deleteMockReview(id) {
  const list = getMockReviews().filter((x) => x.id !== id);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(list)); } catch {}
  return { success: true };
}

// Email Logs simulation
export function getMockEmailLogs() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_EMAILS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: 1, to_email: 'mohammedafiz447@gmail.com', subject: 'New Order Received', template_key: 'order_business', status: 'sent', attempts: 1, created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 2, to_email: 'mohammedafiz447@gmail.com', subject: 'Repair Booking Confirmed', template_key: 'booking_business', status: 'sent', attempts: 1, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, to_email: 'mohammedafiz447@gmail.com', subject: 'New Customer Enquiry', template_key: 'enquiry_business', status: 'sent', attempts: 1, created_at: new Date(Date.now() - 7200000).toISOString() },
  ];
}

export function logMockEmail(data) {
  const list = getMockEmailLogs();
  const id = list.length + 1;
  const newLog = {
    id,
    to_email: data.to || data.to_email || 'mohammedafiz447@gmail.com',
    subject: data.subject || 'Store Notification',
    template_key: data.template || 'general',
    status: 'sent',
    attempts: 1,
    created_at: new Date().toISOString(),
  };
  list.unshift(newLog);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_EMAILS_KEY, JSON.stringify(list.slice(0, 100))); } catch {}
  return newLog;
}


