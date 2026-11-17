import { useEffect, useState } from 'react';
import { catalogApi } from '../services/api';

let cached = null;
let pending = null;

const FALLBACK = {
  store: { shipping_fee: 49, free_shipping_above: 499, cod_enabled: true, online_payment_enabled: false },
  booking: { time_slots: [], max_days_ahead: 30 },
};

export function usePublicSettings() {
  const [settings, setSettings] = useState(cached);
  useEffect(() => {
    if (cached) return;
    pending = pending || catalogApi.settings();
    pending
      .then((data) => {
        cached = data;
        setSettings(data);
      })
      .catch(() => {
        pending = null;
        setSettings(FALLBACK);
      });
  }, []);
  return settings;
}

export function shippingFor(subtotal, settings) {
  const store = settings?.store || FALLBACK.store;
  if (subtotal <= 0) return 0;
  return subtotal >= Number(store.free_shipping_above) ? 0 : Number(store.shipping_fee);
}
