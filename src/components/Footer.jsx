import { Link, useLocation } from 'react-router-dom';
import { Clock, Heart, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles, Star, Wrench, Zap } from 'lucide-react';
import Logo from './Logo';
import { BUSINESS } from '../utils/constants';

const COLUMNS = [
  {
    title: 'Shop Categories',
    links: [
      ['All Products', '/shop'],
      ['Tempered Glass', '/tempered-glass'],
      ['Mobile Pouches', '/pouches'],
      ['Power Banks & Batteries', '/power-banks'],
      ['All Accessories', '/accessories'],
      ['My Wishlist', '/wishlist'],
    ],
  },
  {
    title: 'Repair Services',
    links: [
      ['Screen Replacement', '/services'],
      ['Battery Replacement', '/services'],
      ['Charging Port Fix', '/services'],
      ['Book a Repair Slot', '/book-repair'],
      ['Track Live Repair', '/track-repair'],
    ],
  },
  {
    title: 'MS Enterprises',
    links: [
      ['About Our Store', '/about'],
      ['Contact Us', '/contact'],
      ['Customer Account', '/account'],
      ['Order History', '/account/orders'],
      ['Staff Portal', '/admin/login'],
    ],
  },
];

export default function Footer() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  // 1. CLEAN MODERN LIGHT & GLASS FOOTER (Exclusively for Home page as requested)
  if (isHome) {
    return (
      <footer className="no-print mt-18 border-t border-slate-200/90 bg-gradient-to-b from-slate-50/90 via-white to-slate-100/70 text-slate-800">
        {/* Top Experience & Store Hours Banner */}
        <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md py-6 sm:py-8">
          <div className="container-page grid gap-5 md:grid-cols-3 items-center">
            {/* Store Hours Card */}
            <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0071E3]">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Store Working Hours</span>
                </div>
                <p className="mt-1 text-xs text-slate-700 font-semibold">
                  Mon – Sat: <span className="font-bold text-slate-900">10:00 AM – 9:30 PM</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Sunday: <span className="font-semibold text-slate-700">11:00 AM – 8:30 PM</span> (Open All 7 Days)
                </p>
              </div>
            </div>

            {/* Shivaji Nagar Store Badge */}
            <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-900">4.9 / 5.0</span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-900 line-clamp-1">
                  Shivaji Nagar Flagship Store
                </p>
                <a
                  href={BUSINESS.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-[#0071E3] hover:underline flex items-center gap-0.5 mt-0.5"
                >
                  <span>Get directions on Google Maps</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* WhatsApp Live Chat Card */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Instant Help on WhatsApp</p>
                  <p className="text-[11px] text-slate-600">Technicians reply in ~5 mins</p>
                </div>
              </div>
              <a
                href={BUSINESS.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Chat Now
              </a>
            </div>
          </div>
        </div>

        {/* 4 Trust Badges Row */}
        <div className="border-b border-slate-200/70 py-6">
          <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/60 border border-slate-200/60">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#0071E3] font-bold text-sm">⚡</span>
              <div>
                <p className="font-bold text-slate-900 text-xs">45-Min Express Service</p>
                <p className="text-[11px] text-slate-500">Same-day fast turnaround</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/60 border border-slate-200/60">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm">🛡️</span>
              <div>
                <p className="font-bold text-slate-900 text-xs">90-Day Warranty</p>
                <p className="text-[11px] text-slate-500">100% genuine spares tested</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/60 border border-slate-200/60">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">📱</span>
              <div>
                <p className="font-bold text-slate-900 text-xs">Model-Verified Fit</p>
                <p className="text-[11px] text-slate-500">Glass & pouches guaranteed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/60 border border-slate-200/60">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold text-sm">📍</span>
              <div>
                <p className="font-bold text-slate-900 text-xs">Shivaji Nagar Store</p>
                <p className="text-[11px] text-slate-500">Walk-in pickup & assistance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Information */}
        <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light={false} />
            <p className="mt-4 max-w-sm text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
              MS ENTERPRISES is your neighborhood specialist for smartphone repairs, verified screen guards, protective pouches, and certified charging accessories in Shivaji Nagar, Bengaluru.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href={BUSINESS.phoneHref} className="flex items-center gap-2.5 text-slate-700 hover:text-[#0071E3] font-semibold transition-colors">
                  <Phone className="h-4 w-4 text-[#0071E3] shrink-0" />
                  <span>{BUSINESS.phoneDisplay || BUSINESS.phone}</span>
                </a>
              </li>
              <li>
                <a href={BUSINESS.emailHref} className="flex items-center gap-2.5 break-all text-slate-700 hover:text-[#0071E3] font-medium transition-colors">
                  <Mail className="h-4 w-4 shrink-0 text-[#0071E3]" />
                  <span>{BUSINESS.email}</span>
                </a>
              </li>
              <li>
                <a href={BUSINESS.googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 text-slate-700 hover:text-[#0071E3] transition-colors">
                  <MapPin className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  <span className="leading-snug text-xs text-slate-600">{BUSINESS.addressFull}</span>
                </a>
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200/60 inline-block">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
                {col.links.map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-slate-600 hover:text-[#0071E3] font-medium transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal & Safety Bar */}
        <div className="border-t border-slate-200/80 bg-white/90 py-5">
          <div className="container-page flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">
              © {new Date().getFullYear()} <strong className="text-slate-800">MS ENTERPRISES</strong>. All rights reserved. 73, HKP Road, Sulthangunta, Shivaji Nagar, Bengaluru 560051.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <Link to="/about" className="hover:text-[#0071E3] transition-colors">About</Link>
              <Link to="/contact" className="hover:text-[#0071E3] transition-colors">Contact</Link>
              <Link to="/admin/login" className="hover:text-[#0071E3] transition-colors">Staff Login</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // 2. SLEEK OBSIDIAN FOOTER (For all other catalog/services/account pages)
  return (
    <footer className="no-print mt-20 bg-slate-950 text-white border-t border-slate-800/80">
      <div className="border-b border-white/5 py-8">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-[#0071E3] font-bold text-sm">⚡</span>
            <div>
              <p className="font-bold text-white">45-Min Express Service</p>
              <p className="text-[11px] text-slate-500">Same-day turnaround</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-emerald-400 font-bold text-sm">🛡️</span>
            <div>
              <p className="font-bold text-white">90-Day Warranty</p>
              <p className="text-[11px] text-slate-500">Quality guaranteed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-blue-400 font-bold text-sm">📦</span>
            <div>
              <p className="font-bold text-white">Model-Verified Fit</p>
              <p className="text-[11px] text-slate-500">Guaranteed compatibility</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-amber-400 font-bold text-sm">📍</span>
            <div>
              <p className="font-bold text-white">Shivaji Nagar, BLR</p>
              <p className="text-[11px] text-slate-500">Trusted offline store</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400 font-normal">
            Precision smartphone repairs, verified screen guards, silicone pouches, and GaN charging accessories — handled with technical excellence.
          </p>
          <ul className="mt-6 space-y-3 text-xs sm:text-sm">
            <li>
              <a href={BUSINESS.phoneHref} className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-[#0071E3] shrink-0" /> {BUSINESS.phoneDisplay || BUSINESS.phone}
              </a>
            </li>
            <li>
              <a href={BUSINESS.emailHref} className="flex items-center gap-2.5 break-all text-slate-300 hover:text-white transition-colors">
                <Mail className="h-4 w-4 shrink-0 text-[#0071E3]" /> {BUSINESS.email}
              </a>
            </li>
            <li>
              <a href={BUSINESS.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors">
                <MessageCircle className="h-4 w-4 text-emerald-400 shrink-0" /> Chat on WhatsApp Support
              </a>
            </li>
            <li>
              <a href={BUSINESS.googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 text-slate-300 hover:text-white transition-colors">
                <MapPin className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span className="leading-snug text-xs sm:text-[13px]">{BUSINESS.addressFull}</span>
              </a>
            </li>
          </ul>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
              {col.links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 bg-slate-950/80">
        <div className="container-page flex flex-col gap-2.5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MS ENTERPRISES. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
            <Link to="/admin/login" className="hover:text-slate-300 transition-colors">Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
