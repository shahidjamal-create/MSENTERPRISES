import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, ClipboardList, Headset, Mail, MapPin, MessageCircle, Phone, SearchCheck, ShieldCheck, Smartphone, Sparkles, Star, Wrench,
} from 'lucide-react';
import { catalogApi } from '../services/api';
import { useAsync } from '../hooks/useAsync';
import ModelPicker from '../components/ModelPicker';
import ProductGrid, { ProductGridSkeleton } from '../components/ProductGrid';
import { SectionHeading } from '../components/PageHeader';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import Modal from '../components/ui/Modal';
import ReviewForm from '../components/ReviewForm';
import { BUSINESS, TOP_10_MODELS } from '../utils/constants';
import { categoryIcon, categoryLink, serviceIcon } from '../utils/icons';
import { formatDate, formatPrice } from '../utils/format';

const WHY_US = [
  { icon: SearchCheck, title: 'Compatibility checked', text: 'Glass and pouches are listed only for phone models we have verified, so you buy the right fit.' },
  { icon: ClipboardList, title: 'Clear repair updates', text: 'Every repair gets a booking ID. Track each stage online, from diagnosis to delivery.' },
  { icon: BadgeCheck, title: 'Honest pricing', text: 'You see MRP, selling price and the discount up front. Repair estimates are shared before work starts.' },
  { icon: Headset, title: 'Talk to us directly', text: 'Call, WhatsApp or email the store. No call centres — you speak with the people doing the work.' },
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 py-10 sm:py-16 md:py-20 border-b border-slate-200/60">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="container-page relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-xs backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#0071E3]">MS ENTERPRISES</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600">Shivaji Nagar, Bengaluru</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
            Precision Mobile Service. <span className="text-[#0071E3]">Perfect Fit</span> Accessories.
          </h1>

          <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
            Certified smartphone repairs for Apple, Samsung, OnePlus & more. Explore 100% genuine model-verified tempered glass, silicone pouches, 65W GaN chargers, and cables.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-[#005bb5] hover:shadow-lg active:scale-95"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/book-repair"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-[#0071E3] active:scale-95"
            >
              <Wrench className="h-4 w-4 text-[#0071E3]" />
              <span>Book a Repair</span>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-200/70 pt-6">
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">45 Mins</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Express Screen & Battery</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">100% Tested</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">OEM Grade Spares</p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">90 Days</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Service Warranty</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
            <img
              src="/images/hero-repair.jpg"
              alt="Technician repairing a smartphone"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Floating Glass Tracking Card */}
          <Link
            to="/track-repair"
            className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:right-6 sm:max-w-xs flex items-center justify-between gap-3.5 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#0071E3]/40 hover:shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0071E3]">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900">Track Live Repair</span>
                <span className="block text-[11px] text-slate-500">Enter your MSR booking ID</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#0071E3] shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ModelFinder() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState({ brandId: '', modelId: '' });
  const go = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selection.brandId) params.set('brand', selection.brandId);
    if (selection.modelId) params.set('model', selection.modelId);
    navigate(`/shop?${params}`);
  };
  return (
    <section className="container-page -mt-4 sm:-mt-6 relative z-20">
      <form
        onSubmit={go}
        className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur-md grid items-end gap-4 md:grid-cols-[1.1fr_2fr_auto]"
      >
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071E3]">Compatibility Guarantee</span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">Find accessories for your exact phone</h2>
          <p className="text-xs text-slate-500">Select brand & model to see guaranteed fitting items.</p>
        </div>
        <ModelPicker brandId={selection.brandId} modelId={selection.modelId} onChange={setSelection} />
        <button
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0071E3] active:scale-95 disabled:opacity-40 disabled:pointer-events-none w-full md:w-auto h-10 flex items-center justify-center"
          disabled={!selection.brandId}
        >
          Show products
        </button>
      </form>
    </section>
  );
}

function Reviews({ reviews }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="container-page mt-16">
      <SectionHeading eyebrow="Customer reviews" title="What customers say" action={<button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>Write a review</button>} />
      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews published yet" message="Visited the store or bought from us? Share your experience — reviews appear after the store approves them." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="card p-5">
              <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-line'}`} />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-ink">“{r.comment}”</blockquote>
              <figcaption className="mt-3 text-xs text-muted">
                <span className="font-semibold text-ink">{r.customer_name}</span> · {formatDate(r.created_at)}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <Modal open={open} title="Write a review" onClose={() => setOpen(false)} size="sm">
        <ReviewForm onDone={() => setOpen(false)} />
      </Modal>
    </section>
  );
}

export default function Home() {
  const { data, loading, error, reload } = useAsync(() => catalogApi.home(), []);

  return (
    <>
      <Hero />
      <ModelFinder />

      {error && (
        <div className="container-page mt-12">
          <ErrorState message={error} onRetry={reload} />
        </div>
      )}

      <section className="container-page mt-12 sm:mt-18">
        <SectionHeading eyebrow="Catalog Essentials" title="Browse by category" action={<Link to="/shop" className="text-xs sm:text-sm font-semibold text-[#0071E3] hover:underline">View all →</Link>} />
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-24 sm:h-28 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(data?.categories || []).map((c) => {
              const Icon = categoryIcon(c.slug);
              return (
                <Link
                  key={c.id}
                  to={categoryLink(c)}
                  className="group flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#0071E3]/40 hover:shadow-[0_12px_28px_rgba(0,113,227,0.08)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-[#0071E3] transition-colors group-hover:bg-blue-50 group-hover:scale-110 duration-200">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#0071E3] transition-colors">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Brand Showcase with Real Images */}
      <section className="container-page mt-12 sm:mt-16">
        <SectionHeading
          eyebrow="Device Ecosystem"
          title="Choose your phone brand"
          action={
            <Link to="/shop" className="text-xs sm:text-sm font-semibold text-[#0071E3] hover:underline">
              View all models →
            </Link>
          }
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {(data?.brands || []).map((b) => (
            <Link
              key={b.id}
              to={`/shop?brand=${b.id}`}
              className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
            >
              <div className="relative aspect-square w-full max-w-[70px] overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center p-1.5">
                {b.image_url ? (
                  <img
                    src={b.image_url}
                    alt={b.name}
                    loading="lazy"
                    className="h-full w-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <Smartphone className="h-6 w-6 text-[#0071E3]" />
                )}
              </div>
              <span className="mt-2 text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-[#0071E3] line-clamp-1 transition-colors">
                {b.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {b.models_count ? `${b.models_count}+ models` : 'Verified fit'}
              </span>
            </Link>
          ))}
          {loading &&
            Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            ))}
        </div>
      </section>

      {/* 10 Popular Phone Models Showcase */}
      <section className="container-page mt-12 sm:mt-18">
        <SectionHeading
          eyebrow="Curated Lineup"
          title="Popular Phone Models We Support"
          action={
            <Link to="/shop" className="text-xs sm:text-sm font-semibold text-[#0071E3] hover:underline">
              Explore 25+ models →
            </Link>
          }
        />
        <div className="grid grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {TOP_10_MODELS.map((m) => (
            <Link
              key={m.id}
              to={`/shop?model=${m.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 flex items-center justify-center">
                {m.image_url ? (
                  <img
                    src={m.image_url}
                    alt={m.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <Smartphone className="h-12 w-12 text-slate-300" />
                )}
                <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/85 backdrop-blur-md px-2 py-0.5 text-[9.5px] font-bold text-white shadow-xs">
                  {m.brand_name || 'Smartphone'}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <h3 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-[#0071E3] line-clamp-1 transition-colors">
                  {m.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">Glass, covers & repairs</p>
                <div className="mt-auto pt-3 flex items-center justify-between text-xs font-semibold text-[#0071E3]">
                  <span>Shop products</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-page mt-12 sm:mt-18">
        <SectionHeading
          eyebrow="Top Recommendations"
          title="Popular picks in store"
          action={
            <Link to="/shop" className="text-xs sm:text-sm font-semibold text-[#0071E3] hover:underline">
              Shop all products →
            </Link>
          }
        />
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : data?.featured?.length ? (
          <ProductGrid products={data.featured} />
        ) : (
          !error && <EmptyState title="No featured products yet" message="Featured items will appear here once the store marks them." />
        )}
      </section>

      {/* Modern Repair Services Showcase */}
      <section className="mt-14 sm:mt-20 bg-gradient-to-b from-slate-50/70 via-slate-100/40 to-slate-50/70 py-12 sm:py-16 border-y border-slate-200/60">
        <div className="container-page">
          <SectionHeading
            eyebrow="Hardware & Diagnostic Lab"
            title="Professional Mobile Repair Services"
            action={
              <Link to="/services" className="text-xs sm:text-sm font-semibold text-[#0071E3] hover:underline">
                View all services →
              </Link>
            }
          />
          <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {(data?.services || []).slice(0, 6).map((s) => {
              const Icon = serviceIcon(s.slug);
              return (
                <div
                  key={s.id}
                  className="group flex gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#0071E3]/40 hover:shadow-[0_12px_28px_rgba(0,113,227,0.06)]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white transition-colors group-hover:bg-[#0071E3]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex flex-col">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0071E3] transition-colors">
                      {s.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed font-normal">
                      {s.description}
                    </p>
                    <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-extrabold text-slate-900">
                        {s.price_from != null ? `From ${formatPrice(s.price_from)}` : 'Quote on diagnosis'}
                      </span>
                      <Link
                        to={`/book-repair?service=${s.id}`}
                        className="inline-flex items-center gap-1 font-bold text-[#0071E3] hover:underline"
                      >
                        Book slot →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose MS ENTERPRISES */}
      <section className="container-page mt-14 sm:mt-20">
        <SectionHeading eyebrow="Service Standards" title="Why customers trust MS ENTERPRISES" />
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-6">
          {WHY_US.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0071E3]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm sm:text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-500 font-normal">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {!loading && <Reviews reviews={data?.reviews || []} />}

      {/* Modern High-End Store Support & Location Card */}
      <section className="container-page mt-14 sm:mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 md:p-12 text-white shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Direct Store Support
              </span>
              <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                Have a question or need a quick repair quote?
              </h2>
              <p className="mt-2.5 max-w-lg text-xs sm:text-sm leading-relaxed text-slate-300 font-normal">
                Call or WhatsApp our technicians in Shivaji Nagar directly. Get honest estimates, check accessory stock, or book priority repair pickup.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="rounded-full bg-[#0071E3] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-[#005bb5] active:scale-95"
                >
                  Send an enquiry
                </Link>
                <a
                  href={BUSINESS.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="grid gap-2.5 text-xs sm:text-sm">
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center gap-3.5 rounded-2xl bg-white/5 p-3.5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <Phone className="h-5 w-5 text-[#0071E3] shrink-0" />
                <span>
                  <span className="block text-[10.5px] font-medium text-slate-400">Direct Call</span>
                  <span className="font-bold text-white">{BUSINESS.phone}</span>
                </span>
              </a>
              <a
                href={BUSINESS.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3.5 rounded-2xl bg-white/5 p-3.5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <MessageCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  <span className="block text-[10.5px] font-medium text-slate-400">WhatsApp Help</span>
                  <span className="font-bold text-white">Chat with Shivaji Nagar Store</span>
                </span>
              </a>
              <a
                href={BUSINESS.emailHref}
                className="flex items-center gap-3.5 rounded-2xl bg-white/5 p-3.5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <Mail className="h-5 w-5 text-[#0071E3] shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[10.5px] font-medium text-slate-400">Store Email</span>
                  <span className="break-all font-bold text-white">{BUSINESS.email}</span>
                </span>
              </a>
              <a
                href={BUSINESS.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3.5 rounded-2xl bg-white/5 p-3.5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <MapPin className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="min-w-0">
                  <span className="block text-[10.5px] font-medium text-slate-400">Store Address</span>
                  <span className="leading-snug text-slate-200">{BUSINESS.addressFull}</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
