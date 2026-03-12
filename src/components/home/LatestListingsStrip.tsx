"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Listing = {
  id: number;
  brand: string;
  model: string;
  price: number;
  year: number;
  city: string;
  fuelType: string;
  transmission: string;
  mileage: number;
  images: { url: string }[];
};

export default function LatestListingsStrip() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(() => listings.slice(0, 10), [listings]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/listings", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "İlanlar alınamadı");
        const mapped: Listing[] = (data.listings || []).map((l: any) => ({
          id: Number(l.id),
          brand: String(l.brand || ""),
          model: String(l.model || ""),
          price: Number(l.price || 0),
          year: Number(l.year || 0),
          city: String(l.city || ""),
          fuelType: String(l.fuelType || ""),
          transmission: String(l.transmission || ""),
          mileage: Number(l.mileage || 0),
          images: Array.isArray(l.images) ? l.images.map((im: any) => ({ url: String(im?.url || "") })) : []
        }));
        setListings(mapped);
      } catch (e) {
        setError(e instanceof Error ? e.message : "İlanlar alınamadı");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const scrollByCards = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(320, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="bg-white" data-reveal>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Araba Al</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">En Yeni Fırsat Arabalar</h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/araba-al"
              className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Tümünü Gör
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCards("left")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Sola kaydır"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollByCards("right")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Sağa kaydır"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {loading ? <p className="text-sm text-slate-600">Yükleniyor...</p> : null}
          {!loading && !error && items.length === 0 ? (
            <p className="text-sm text-slate-600">Henüz ilan bulunamadı.</p>
          ) : null}

          <div
            ref={scrollerRef}
            className="mt-4 flex gap-5 overflow-x-auto pb-2 pr-1 scroll-smooth [scrollbar-width:thin] [scrollbar-color:rgba(15,23,42,0.2)_transparent]"
          >
            {items.map((car) => (
              <Link
                key={car.id}
                href={`/araba-al/${car.id}`}
                className="group flex w-[280px] flex-none flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-[320px]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={car.images[0]?.url || "/images/otosipsak-hero-banner-araba-degerleme.webp"}
                    alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow">
                    {car.year}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-xl font-bold text-primary">{car.price.toLocaleString("tr-TR")} ₺</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>Kilometre</div>
                    <div className="text-right font-semibold text-slate-800">
                      {car.mileage.toLocaleString("tr-TR")} km
                    </div>
                    <div>Yakıt</div>
                    <div className="text-right font-semibold text-slate-800">{car.fuelType}</div>
                    <div>Vites</div>
                    <div className="text-right font-semibold text-slate-800">{car.transmission}</div>
                    <div>Konum</div>
                    <div className="text-right font-semibold text-slate-800">{car.city}</div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-green-600">Sertifikalı / Ekspertizli</span>
                    <span className="text-xs text-primary underline">Detaya git</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


