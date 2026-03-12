"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type Listing = {
  id: number;
  brand: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  city: string;
  bodyType: string;
  color: string;
  paintDamageInfo?: any;
  tramerHasRecord: boolean;
  tramerAmount: number | null;
  heavyDamage: boolean;
  images: { url: string }[];
};

const kaportaParts = [
  'Sol Ön Çamurluk',
  'Sağ Ön Çamurluk',
  'Sol Ön Kapı',
  'Sağ Ön Kapı',
  'Sol Arka Kapı',
  'Sağ Arka Kapı',
  'Sol Arka Çamurluk',
  'Sağ Arka Çamurluk',
  'Motor Kaputu',
  'Bagaj',
  'Tavan',
  'Ön Tampon',
  'Arka Tampon'
] as const;

const shasiLabels = ['Sol Ön Şasi', 'Sağ Ön Şasi', 'Sol Arka Şasi', 'Sağ Arka Şasi'] as const;

const kaportaStatusLabels: Record<number, string> = {
  1: 'Orijinal',
  2: 'Lokal Boyalı',
  3: 'Boyalı',
  4: 'Değişen'
};

const kaportaStatusBadge: Record<number, string> = {
  1: 'bg-slate-100 text-slate-800',
  2: 'bg-amber-100 text-amber-800',
  3: 'bg-blue-100 text-blue-800',
  4: 'bg-red-100 text-red-800'
};

const CALL_PHONE_DISPLAY = '+90 532 208 48 37';
const CALL_PHONE_TEL = 'tel:+905322084837';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const [data, setData] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [callOpen, setCallOpen] = useState(false);
  const [callForm, setCallForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    topic: 'İlan Hakkında Bilgi',
    message: ''
  });
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [callSending, setCallSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) {
        router.push('/araba-al');
        return;
      }
      const { listing } = await res.json();
      setData(listing);
      setActiveImage(0);
      setLoading(false);
    };
    if (id) load();
  }, [id, router]);

  // popup açıkken scroll kilidi
  useEffect(() => {
    if (!callOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [callOpen]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-16">
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-8">Yükleniyor...</div>
        <Footer />
      </main>
    );
  }

  if (!data) return null;

  const pd = (data as any).paintDamageInfo ?? null;

  const normalizePhone = (raw: string) => {
    let d = raw.replace(/\D/g, '');
    if (!d) return '';
    if (d.startsWith('0')) d = '90' + d.slice(1);
    if (!d.startsWith('90')) d = '90' + d;
    return d.slice(0, 12);
  };

  const handleSendCallMe = async () => {
    setCallStatus(null);
    const phoneDigits = normalizePhone(callForm.phone);
    if (!callForm.firstName.trim() || !callForm.lastName.trim()) {
      setCallStatus('Lütfen ad ve soyad giriniz.');
      return;
    }
    if (phoneDigits.length !== 12 || !phoneDigits.startsWith('90')) {
      setCallStatus('Telefon geçersiz (+90 ve 10 hane olmalı).');
      return;
    }
    if (callForm.email && !/^\S+@\S+\.\S+$/.test(callForm.email)) {
      setCallStatus('E-posta geçersiz.');
      return;
    }

    setCallSending(true);
    try {
      const res = await fetch('/api/send-callme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'listing-callme',
          listingId: data.id,
          listingTitle: `${data.brand} ${data.model} (${data.year})`,
          listingPrice: data.price,
          listingCity: data.city,
          contact: {
            firstName: callForm.firstName,
            lastName: callForm.lastName,
            phone: phoneDigits,
            email: callForm.email || null
          },
          topic: callForm.topic,
          message: callForm.message || null,
          createdAt: new Date().toISOString()
        })
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out?.success) {
        setCallStatus(out?.error || 'Gönderilemedi.');
        setCallSending(false);
        return;
      }
      setCallStatus('Gönderildi! En kısa sürede sizi arayacağız.');
      setCallSending(false);
      window.setTimeout(() => {
        setCallOpen(false);
        setCallStatus(null);
      }, 900);
    } catch {
      setCallStatus('Gönderilemedi.');
      setCallSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-16">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div>
          <p className="text-sm text-slate-500 cursor-pointer" onClick={() => router.push('/araba-al')}>
            ← İlanlara dön
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            {data.brand} {data.model} ({data.year})
          </h1>
          <p className="text-xl font-semibold text-primary mt-2">{data.price.toLocaleString('tr-TR')} ₺</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Galeri + detay blokları */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={
                    data.images?.[activeImage]?.url ??
                    data.images?.[0]?.url ??
                    '/images/otosipsak-hero-banner-araba-degerleme.webp'
                  }
                  alt={`${data.brand} ${data.model}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {data.images?.length > 1 ? (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {data.images.map((img, i) => {
                    const active = i === activeImage;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`overflow-hidden rounded-lg border ${active ? 'border-primary' : 'border-slate-200'}`}
                        aria-label={`Fotoğraf ${i + 1}`}
                      >
                        <img src={img.url} alt="" className="h-16 w-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Öne Çıkan Bilgiler</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div>Model Yılı</div>
                <div className="font-semibold text-right">{data.year}</div>
                <div>Kilometre</div>
                <div className="font-semibold text-right">{data.mileage.toLocaleString('tr-TR')} km</div>
                <div>Yakıt</div>
                <div className="font-semibold text-right">{data.fuelType}</div>
                <div>Vites</div>
                <div className="font-semibold text-right">{data.transmission}</div>
                <div>Şehir</div>
                <div className="font-semibold text-right">{data.city}</div>
                <div>Kasa Tipi</div>
                <div className="font-semibold text-right">{data.bodyType}</div>
                <div>Renk</div>
                <div className="font-semibold text-right">{data.color}</div>
                <div>Tramer</div>
                <div className="font-semibold text-right">
                  {data.tramerHasRecord ? `Var${data.tramerAmount ? ` (${data.tramerAmount.toLocaleString('tr-TR')} ₺)` : ''}` : 'Yok'}
                </div>
                <div>Ağır Hasar</div>
                <div className="font-semibold text-right">{data.heavyDamage ? 'Var' : 'Yok'}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Kaporta Ekspertiz</h3>
              {!pd ? (
                <p className="mt-3 text-sm text-slate-600">Bu ilan için kaporta bilgisi henüz eklenmemiş.</p>
              ) : (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <div className="grid grid-cols-[1.4fr_0.6fr] bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                    <div>Parça Adı</div>
                    <div className="text-right">Durum</div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {kaportaParts.map((part) => {
                      const raw = Number(pd?.[part] ?? 0);
                      const label = kaportaStatusLabels[raw] ?? '—';
                      const badge = kaportaStatusBadge[raw] ?? 'bg-slate-100 text-slate-700';
                      return (
                        <div key={part} className="grid grid-cols-[1.4fr_0.6fr] items-center px-3 py-2 text-sm">
                          <div className="font-medium text-slate-800">{part}</div>
                          <div className="text-right">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${badge}`}>
                              {label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {pd ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-sm font-semibold text-slate-900">Panel / Şasi İşlemleri</div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {shasiLabels.map((lbl) => {
                      const key = `shasi-${lbl}`;
                      const val = String(pd?.[key] ?? '');
                      const text = val === 'var' ? 'İşlem Var' : val === 'yok' ? 'İşlem Yok' : '—';
                      return (
                        <div key={key} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <div className="text-xs font-semibold text-slate-800">{lbl}</div>
                          <div className="text-xs font-semibold text-slate-700">{text}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Sağ CTA */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-600">Bu ilan hakkında</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">Hemen iletişime geçin</div>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCallStatus(null);
                    setCallOpen(true);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Sizi Arayalım
                </button>
                <a
                  href={CALL_PHONE_TEL}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                >
                  Hemen Ara ({CALL_PHONE_DISPLAY})
                </a>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Formu doldurun, ekibimiz en kısa sürede dönüş yapsın.
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Sizi Arayalım Modal */}
      {callOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <div className="text-2xl font-extrabold text-slate-900">Sizi Arayalım</div>
                <p className="mt-1 text-sm text-slate-600">
                  Sizi aramamızı isterseniz, aşağıdaki bilgileri doldurmanız yeterli.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCallOpen(false)}
                aria-label="Kapat"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Adınız</label>
                  <input
                    value={callForm.firstName}
                    onChange={(e) => setCallForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Adınızı giriniz"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Soyadınız</label>
                  <input
                    value={callForm.lastName}
                    onChange={(e) => setCallForm((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Soyadınızı giriniz"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Telefon Numaranız</label>
                  <input
                    value={callForm.phone}
                    onChange={(e) => setCallForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0 (5__) ___ __ __"
                    inputMode="tel"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">E-posta (opsiyonel)</label>
                  <input
                    value={callForm.email}
                    onChange={(e) => setCallForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@ornek.com"
                    inputMode="email"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Talep Konunuz</label>
                  <select
                    value={callForm.topic}
                    onChange={(e) => setCallForm((p) => ({ ...p, topic: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>İlan Hakkında Bilgi</option>
                    <option>Test Sürüşü / Randevu</option>
                    <option>Fiyat / Pazarlık</option>
                    <option>Diğer</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Mesaj (opsiyonel)</label>
                  <textarea
                    value={callForm.message}
                    onChange={(e) => setCallForm((p) => ({ ...p, message: e.target.value }))}
                    className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Varsa eklemek istediğiniz not..."
                  />
                </div>
              </div>

              {callStatus ? <div className="mt-3 text-sm font-semibold text-slate-700">{callStatus}</div> : null}
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={handleSendCallMe}
                disabled={callSending}
                className="w-full rounded-2xl bg-green-500 px-6 py-4 text-base font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
              >
                {callSending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

