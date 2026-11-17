import {
  BatteryCharging, Cable, Camera, Car, Cpu, Droplets, Headphones, MemoryStick, Mic, Package, Plug, PlugZap,
  RefreshCw, ShieldCheck, Signal, Smartphone, Speaker, Usb, Volume2, Wrench,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'tempered-glass': ShieldCheck,
  'mobile-pouches': Smartphone,
  chargers: PlugZap,
  'usb-cables': Cable,
  'power-banks': BatteryCharging,
  earphones: Headphones,
  headphones: Headphones,
  'bluetooth-speakers': Speaker,
  'otg-connectors': Usb,
  'mobile-holders': Car,
  'memory-cards': MemoryStick,
  adapters: Plug,
};

const SERVICE_ICONS = {
  'display-replacement': Smartphone,
  'battery-replacement': BatteryCharging,
  'charging-port-repair': PlugZap,
  'speaker-repair': Volume2,
  'microphone-repair': Mic,
  'camera-repair': Camera,
  'motherboard-repair': Cpu,
  'software-issues': RefreshCw,
  'network-issues': Signal,
  'water-damage-inspection': Droplets,
  'general-service': Wrench,
};

export const categoryIcon = (slug) => CATEGORY_ICONS[slug] || Package;
export const serviceIcon = (slug) => SERVICE_ICONS[slug] || Wrench;

export function categoryLink(category) {
  if (category.kind === 'tempered_glass') return '/tempered-glass';
  if (category.kind === 'pouch') return '/pouches';
  return `/accessories?category=${category.id}`;
}
