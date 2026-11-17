import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { BUSINESS } from '../utils/constants';

const OFFERINGS = [
  'Smartphone repairs — display, battery, charging port, camera, speaker, microphone, motherboard, software and network issues',
  'Tempered glass from 2.5D to 11D, privacy, matte, UV, ceramic and hydrogel guards',
  'Mobile pouches — transparent, silicone, leather, magnetic, shockproof and designer cases',
  'Chargers, cables, power banks, earphones, headphones, speakers, memory cards and adapters',
];

export default function About() {
  return (
    <>
      <PageHeader title="About MS ENTERPRISES" description="A local mobile repair and accessories store focused on doing the job right." crumbs={[['About']]} />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-2 lg:items-center">
        <img src="/images/store.jpg" alt="Phones and accessories on display" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        <div>
          <h2 className="text-xl font-bold text-navy md:text-2xl">Repairs and accessories under one roof</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            MS ENTERPRISES helps customers keep their phones working and protected. Bring in a phone that needs fixing, or pick up
            the right screen guard, cover or charger — we check compatibility with your exact model before you buy.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Every repair is logged with a booking ID so you can follow its progress online, and we share an estimate before starting
            work on your device.
          </p>
          <ul className="mt-6 space-y-3">
            {OFFERINGS.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-ink">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" /> {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-line bg-surface/70 p-4 text-xs sm:text-sm text-ink">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-5 w-5 text-brand shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-navy">Visit Our Store in Bengaluru</p>
                <p className="mt-0.5 text-muted">{BUSINESS.addressFull}</p>
                <a href={BUSINESS.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center text-xs font-semibold text-brand hover:underline">
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/book-repair" className="btn btn-primary">
              Book a Repair
            </Link>
            <a href={BUSINESS.phoneHref} className="btn btn-outline">
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
