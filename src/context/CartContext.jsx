import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'ms_cart';
const WISHLIST_KEY = 'ms_wishlist';

const load = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const snapshot = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  price: Number(p.price),
  mrp: Number(p.mrp),
  image_url: p.image_url,
  stock: p.stock,
  variant_type: p.variant_type,
});

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load(CART_KEY));
  const [wishlist, setWishlist] = useState(() => load(WISHLIST_KEY));

  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)), [wishlist]);

  const value = useMemo(() => {
    const addItem = (product, quantity = 1) => {
      if (product.stock <= 0) return { ok: false, message: 'This item is out of stock.' };
      const existing = items.find((i) => i.id === product.id);
      const nextQty = Math.min((existing?.quantity || 0) + quantity, product.stock, 20);
      if (existing && existing.quantity >= Math.min(product.stock, 20)) {
        return { ok: false, message: `You already have the maximum available quantity (${existing.quantity}) in your cart.` };
      }
      setItems((prev) =>
        existing
          ? prev.map((i) => (i.id === product.id ? { ...i, ...snapshot(product), quantity: nextQty } : i))
          : [...prev, { ...snapshot(product), quantity: nextQty }]
      );
      return { ok: true, message: `${product.name} added to cart.` };
    };

    return {
      items,
      wishlist,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addItem,
      updateQuantity: (id, quantity) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || 20, 20)) } : i))),
      removeItem: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      clearCart: () => setItems([]),
      inWishlist: (id) => wishlist.some((w) => w.id === id),
      toggleWishlist: (product) =>
        setWishlist((prev) => (prev.some((w) => w.id === product.id) ? prev.filter((w) => w.id !== product.id) : [...prev, snapshot(product)])),
    };
  }, [items, wishlist]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
