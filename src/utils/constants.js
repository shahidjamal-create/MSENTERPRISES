export const BUSINESS = {
  name: 'MS ENTERPRISES',
  tagline: 'Mobile Service & Accessories',
  phone: '8088298447',
  phoneDisplay: '+91 80882 98447',
  phoneHref: 'tel:+918088298447',
  email: 'mohammedafiz447@gmail.com',
  emailHref: 'mailto:mohammedafiz447@gmail.com',
  whatsapp: 'https://wa.me/918088298447',
  address: {
    street: '73, HKP Road',
    area: 'Sulthangunta, Shivaji Nagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560051',
    full: '73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru, Karnataka 560051',
  },
  addressFull: '73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru, Karnataka 560051',
  googleMapsUrl: 'https://maps.google.com/?q=73,+HKP+Road,+Sulthangunta,+Shivaji+Nagar,+Bengaluru,+Karnataka+560051',
};

export const TOP_10_MODELS = [
  { id: 101, name: 'iPhone 16 Pro Max', brand: 'Apple', brand_id: 1, short_name: 'iPhone 16 Pro', image_url: '/images/models/iphone-16-pro.jpg' },
  { id: 105, name: 'iPhone 15', brand: 'Apple', brand_id: 1, short_name: 'iPhone 15', image_url: '/images/models/iphone-15.jpg' },
  { id: 106, name: 'iPhone 14', brand: 'Apple', brand_id: 1, short_name: 'iPhone 14', image_url: '/images/models/iphone-14.jpg' },
  { id: 201, name: 'Galaxy S24 Ultra', brand: 'Samsung', brand_id: 2, short_name: 'S24 Ultra', image_url: '/images/models/samsung-s24-ultra.jpg' },
  { id: 205, name: 'Galaxy S23 FE', brand: 'Samsung', brand_id: 2, short_name: 'Galaxy S23', image_url: '/images/models/samsung-s23.jpg' },
  { id: 203, name: 'Galaxy A55 5G', brand: 'Samsung', brand_id: 2, short_name: 'Galaxy A55', image_url: '/images/models/samsung-a55.jpg' },
  { id: 301, name: 'OnePlus 12', brand: 'OnePlus', brand_id: 3, short_name: 'OnePlus 12', image_url: '/images/models/oneplus-12.jpg' },
  { id: 303, name: 'OnePlus Nord CE 4', brand: 'OnePlus', brand_id: 3, short_name: 'Nord CE 4', image_url: '/images/models/oneplus-nord.jpg' },
  { id: 401, name: 'Redmi Note 13 Pro+', brand: 'Xiaomi', brand_id: 4, short_name: 'Redmi Note 13', image_url: '/images/models/redmi-note-13.jpg' },
  { id: 501, name: 'Vivo V30 Pro', brand: 'Vivo', brand_id: 5, short_name: 'Vivo V30', image_url: '/images/models/vivo-v30.jpg' },
];

export const PRODUCT_TYPE_LABELS = {
  tempered_glass: 'Tempered Glass',
  pouch: 'Mobile Pouch',
  accessory: 'Accessory',
};

export const GLASS_TYPES = ['2.5D', '3D', '5D', '9D', '11D', 'Full Glue', 'Privacy', 'Matte', 'UV', 'Ceramic', 'Hydrogel'];
export const POUCH_TYPES = ['Transparent', 'Silicone', 'Hard Back', 'Soft Back', 'Leather', 'Magnetic', 'Shockproof', 'Designer', 'Printed', 'Premium'];
export const ACCESSORY_TYPES = ['Power Bank', 'Mobile Battery', 'Magnetic Wireless Power Bank', 'Charger', 'Cable', 'Earphones', 'Headphones', 'Speaker', 'Car Mount', 'Memory Card', 'OTG Adapter'];
export const VARIANTS_BY_TYPE = { tempered_glass: GLASS_TYPES, pouch: POUCH_TYPES, accessory: ACCESSORY_TYPES };

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'refunded', 'failed'];
export const BOOKING_STATUSES = ['Pending', 'Accepted', 'Diagnosis', 'Waiting for Parts', 'Repair in Progress', 'Completed', 'Delivered', 'Cancelled'];

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  technician: 'Technician',
  inventory_staff: 'Inventory Staff',
  customer: 'Customer',
};
export const STAFF_ROLES = ['super_admin', 'admin', 'manager', 'technician', 'inventory_staff'];

// Mirror of the server permission map — used only to hide menu items.
// The API enforces the real rules.
export const PERMISSIONS = {
  dashboard: STAFF_ROLES,
  products: ['super_admin', 'admin', 'manager', 'inventory_staff'],
  catalog: ['super_admin', 'admin', 'manager'],
  bookings: ['super_admin', 'admin', 'manager', 'technician'],
  orders: ['super_admin', 'admin', 'manager'],
  customers: ['super_admin', 'admin', 'manager'],
  inventory: ['super_admin', 'admin', 'manager', 'inventory_staff'],
  suppliers: ['super_admin', 'admin', 'manager', 'inventory_staff'],
  staff: ['super_admin', 'admin'],
  emails: ['super_admin', 'admin'],
  enquiries: ['super_admin', 'admin', 'manager'],
  reports: ['super_admin', 'admin', 'manager'],
  settings: ['super_admin', 'admin'],
};
