"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ArabaAlPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Yükleniyor...</div>}>
      <ArabaAlInner />
    </Suspense>
  );
}

function ArabaAlInner() {
  type Listing = {
    id: number;
    title: string;
    brand: string;
    model: string;
    price: number;
    year: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    city: string;
    images: { url: string }[];
  };

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    fuel: '',
    transmission: '',
    city: '',
    yearFrom: '',
    yearTo: '',
    kmMin: '',
    kmMax: '',
    priceMin: '',
    priceMax: '',
    paintClean: false,
    replaceClean: false,
    tramerClean: false,
    listingNo: ''
  });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [mobileFiltersMounted, setMobileFiltersMounted] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchParams = useSearchParams();

  const openMobileFilters = () => {
    setShowFiltersMobile(true);
    setMobileFiltersMounted(true);
    // mount sonrası animasyonun çalışması için bir frame bekle
    requestAnimationFrame(() => setMobileFiltersOpen(true));
  };

  const closeMobileFilters = () => {
    setMobileFiltersOpen(false);
    setShowFiltersMobile(false);
    // kapanış animasyonu bitsin diye biraz bekle
    window.setTimeout(() => setMobileFiltersMounted(false), 220);
  };

  // Mobil filtre açıkken body scroll'u kilitle
  useEffect(() => {
    if (!mobileFiltersMounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileFiltersMounted]);

  // ESC ile kapat
  useEffect(() => {
    if (!mobileFiltersMounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileFilters();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileFiltersMounted]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch('/api/listings');
      const data = await res.json();
      const mapped: Listing[] = (data.listings || []).map((l: any) => ({
        id: l.id,
        title: `${l.brand} ${l.model}`,
        brand: l.brand,
        model: l.model,
        price: l.price,
        year: l.year,
        mileage: l.mileage,
        fuelType: l.fuelType,
        transmission: l.transmission,
        city: l.city,
        images: l.images ?? []
      }));
      setListings(mapped);
      setLoading(false);
    };
    load();
  }, []);

  const brandModelMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    listings.forEach(({ brand, model }) => {
      if (!brand) return;
      if (!map.has(brand)) {
        map.set(brand, new Set());
      }
      if (model) {
        map.get(brand)?.add(model);
      }
    });
    return map;
  }, [listings]);

  const brands = useMemo(() => Array.from(brandModelMap.keys()), [brandModelMap]);
  const fuels = useMemo(() => Array.from(new Set(listings.map((c) => c.fuelType))), [listings]);
  const transmissions = useMemo(() => Array.from(new Set(listings.map((c) => c.transmission))), [listings]);
  const cities = useMemo(
    () => [
      '01 Adana', '02 Adıyaman', '03 Afyonkarahisar', '04 Ağrı', '05 Amasya', '06 Ankara', '07 Antalya', '08 Artvin',
      '09 Aydın', '10 Balıkesir', '11 Bilecik', '12 Bingöl', '13 Bitlis', '14 Bolu', '15 Burdur', '16 Bursa',
      '17 Çanakkale', '18 Çankırı', '19 Çorum', '20 Denizli', '21 Diyarbakır', '22 Edirne', '23 Elazığ', '24 Erzincan',
      '25 Erzurum', '26 Eskişehir', '27 Gaziantep', '28 Giresun', '29 Gümüşhane', '30 Hakkari', '31 Hatay',
      '32 Isparta', '33 Mersin', '34 İstanbul', '35 İzmir', '36 Kars', '37 Kastamonu', '38 Kayseri', '39 Kırklareli',
      '40 Kırşehir', '41 Kocaeli', '42 Konya', '43 Kütahya', '44 Malatya', '45 Manisa', '46 Kahramanmaraş', '47 Mardin',
      '48 Muğla', '49 Muş', '50 Nevşehir', '51 Niğde', '52 Ordu', '53 Rize', '54 Sakarya', '55 Samsun', '56 Siirt',
      '57 Sinop', '58 Sivas', '59 Tekirdağ', '60 Tokat', '61 Trabzon', '62 Tunceli', '63 Şanlıurfa', '64 Uşak',
      '65 Van', '66 Yozgat', '67 Zonguldak', '68 Aksaray', '69 Bayburt', '70 Karaman', '71 Kırıkkale', '72 Batman',
      '73 Şırnak', '74 Bartın', '75 Ardahan', '76 Iğdır', '77 Yalova', '78 Karabük', '79 Kilis', '80 Osmaniye', '81 Düzce'
    ],
    []
  );

  const modelOptions = useMemo(() => {
    const options = filters.brand ? Array.from(brandModelMap.get(filters.brand) ?? []) : [];
    if (filters.model && filters.brand && !options.includes(filters.model)) {
      return [filters.model, ...options];
    }
    return options;
  }, [brandModelMap, filters.brand, filters.model]);

  useEffect(() => {
    const yearParam = searchParams.get('year');
    const brandParam = searchParams.get('brand');
    const modelParam = searchParams.get('model');

    if (!yearParam && !brandParam && !modelParam) return;

    setFilters((prev) => {
      const next = { ...prev };

      if (brandParam && brands.includes(brandParam)) {
        next.brand = brandParam;
        next.model = modelParam ?? '';
      } else {
        next.brand = '';
        next.model = '';
      }

      if (yearParam) {
        const yearNum = Number(yearParam);
        if (!Number.isNaN(yearNum)) {
          next.yearFrom = String(yearNum);
          next.yearTo = String(yearNum + 1);
        }
      }

      return next;
    });
  }, [brands, searchParams]);

  const filtered = useMemo(() => {
    return listings.filter((c) => {
      if (filters.brand && c.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      if (filters.model && c.model.toLowerCase() !== filters.model.toLowerCase()) return false;
      if (filters.fuel && c.fuelType !== filters.fuel) return false;
      if (filters.transmission && c.transmission !== filters.transmission) return false;
      if (filters.city && !c.city.toLowerCase().startsWith(filters.city.toLowerCase())) return false;
      if (filters.yearFrom && c.year < Number(filters.yearFrom)) return false;
      if (filters.yearTo && c.year > Number(filters.yearTo)) return false;
      if (filters.kmMin && c.mileage < Number(filters.kmMin)) return false;
      if (filters.kmMax && c.mileage > Number(filters.kmMax)) return false;
      if (filters.priceMin && c.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && c.price > Number(filters.priceMax)) return false;
      return true;
    });
  }, [filters, listings]);

  return (
    <main className="min-h-screen bg-slate-50 pt-16 text-slate-900 sm:pt-20">
      <Header />

      <section className="bg-slate-100 py-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-primary">
              Anasayfa
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">Araba Al</span>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <div className="text-sm font-semibold text-slate-900">Filtreler</div>
            <button
              type="button"
              onClick={openMobileFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm"
            >
              <span>Filtreleri Aç</span>
            </button>
          </div>

          {/* Mobil filtre drawer (sağdan açılır) */}
          {mobileFiltersMounted && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
              <button
                type="button"
                aria-label="Filtreyi kapat"
                className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${mobileFiltersOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={closeMobileFilters}
              />

              <div
                className={`absolute inset-y-0 right-0 w-[92vw] max-w-sm bg-white shadow-2xl transition-transform duration-200 ease-out ${
                  mobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <button
                    type="button"
                    onClick={closeMobileFilters}
                    className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Geri
                  </button>
                  <div className="text-sm font-semibold text-slate-900">Filtreler</div>
                  <button
                    type="button"
                    onClick={closeMobileFilters}
                    className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    aria-label="Kapat"
                  >
                    Kapat
                  </button>
                </div>

                {/* Content: sadece burası scroll */}
                <div className="h-[calc(100vh-112px)] overflow-y-auto px-4 py-4">
                  <div className="space-y-4 text-sm text-slate-800">
                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">İlan No</div>
                      <input
                        type="text"
                        value={filters.listingNo}
                        onChange={(e) => setFilters((p) => ({ ...p, listingNo: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Örn: 06337701"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">Marka</div>
                      <select
                        value={filters.brand}
                        onChange={(e) => setFilters((p) => ({ ...p, brand: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Tümü</option>
                        {brands.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">Model</div>
                      <select
                        value={filters.model}
                        onChange={(e) => setFilters((p) => ({ ...p, model: e.target.value }))}
                        disabled={!filters.brand}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Tümü</option>
                        {modelOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">Fiyat</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={filters.priceMin}
                          onChange={(e) => setFilters((p) => ({ ...p, priceMin: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={filters.priceMax}
                          onChange={(e) => setFilters((p) => ({ ...p, priceMax: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">Yıl (min / max)</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={filters.yearFrom}
                          onChange={(e) => setFilters((p) => ({ ...p, yearFrom: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="2016"
                        />
                        <input
                          type="number"
                          value={filters.yearTo}
                          onChange={(e) => setFilters((p) => ({ ...p, yearTo: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">Şehir</div>
                      <select
                        value={filters.city}
                        onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Tümü</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">Yakıt</div>
                      <select
                        value={filters.fuel}
                        onChange={(e) => setFilters((p) => ({ ...p, fuel: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Tümü</option>
                        {fuels.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">Vites</div>
                      <select
                        value={filters.transmission}
                        onChange={(e) => setFilters((p) => ({ ...p, transmission: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Tümü</option>
                        {transmissions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">Kilometre</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={filters.kmMin}
                          onChange={(e) => setFilters((p) => ({ ...p, kmMin: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          value={filters.kmMax}
                          onChange={(e) => setFilters((p) => ({ ...p, kmMax: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-slate-900">Boya, Değişen, Tramer Kaydı</div>
                      <div className="space-y-2 rounded-lg border border-slate-200 px-3 py-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <input
                            type="checkbox"
                            checked={filters.paintClean}
                            onChange={(e) => setFilters((p) => ({ ...p, paintClean: e.target.checked }))}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          Boyasız
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <input
                            type="checkbox"
                            checked={filters.replaceClean}
                            onChange={(e) => setFilters((p) => ({ ...p, replaceClean: e.target.checked }))}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          Değişensiz
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <input
                            type="checkbox"
                            checked={filters.tramerClean}
                            onChange={(e) => setFilters((p) => ({ ...p, tramerClean: e.target.checked }))}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          Tramer Kaydı Yok
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFilters({
                          brand: '',
                          model: '',
                          fuel: '',
                          transmission: '',
                          city: '',
                          yearFrom: '',
                          yearTo: '',
                          kmMin: '',
                          kmMax: '',
                          priceMin: '',
                          priceMax: '',
                          paintClean: false,
                          replaceClean: false,
                          tramerClean: false,
                          listingNo: ''
                        })
                      }
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Temizle
                    </button>
                    <button
                      type="button"
                      onClick={closeMobileFilters}
                      className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm"
                    >
                      Uygula
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Sol filtre paneli */}
            <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
              <div className="mb-4 text-sm font-semibold text-slate-900">Filtrele</div>
              <div className="space-y-4 text-sm text-slate-800">
                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">İlan No</div>
                  <input
                    type="text"
                    value={filters.listingNo}
                    onChange={(e) => setFilters((p) => ({ ...p, listingNo: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Örn: 06337701"
                  />
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">Marka</div>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Tümü</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">Model</div>
                  <select
                    value={filters.model}
                    onChange={(e) => setFilters((p) => ({ ...p, model: e.target.value }))}
                    disabled={!filters.brand}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Tümü</option>
                    {modelOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">Fiyat</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.priceMin}
                      onChange={(e) => setFilters((p) => ({ ...p, priceMin: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={filters.priceMax}
                      onChange={(e) => setFilters((p) => ({ ...p, priceMax: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">Yıl (min / max)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.yearFrom}
                      onChange={(e) => setFilters((p) => ({ ...p, yearFrom: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="2016"
                    />
                    <input
                      type="number"
                      value={filters.yearTo}
                      onChange={(e) => setFilters((p) => ({ ...p, yearTo: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="2024"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">Şehir</div>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Tümü</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">Yakıt</div>
                  <select
                    value={filters.fuel}
                    onChange={(e) => setFilters((p) => ({ ...p, fuel: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Tümü</option>
                    {fuels.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">Vites</div>
                  <select
                    value={filters.transmission}
                    onChange={(e) => setFilters((p) => ({ ...p, transmission: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Tümü</option>
                    {transmissions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">Kilometre</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.kmMin}
                      onChange={(e) => setFilters((p) => ({ ...p, kmMin: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={filters.kmMax}
                      onChange={(e) => setFilters((p) => ({ ...p, kmMax: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Kasa Tipi / Renk (placeholder) */}
                {['Kasa Tipi', 'Renk'].map((label) => (
                  <div key={label} className="space-y-2">
                    <div className="font-semibold text-slate-900">{label}</div>
                    <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500">
                      Yakında eklenecek
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <div className="font-semibold text-slate-900">Boya, Değişen, Tramer Kaydı</div>
                  <div className="space-y-2 rounded-lg border border-slate-200 px-3 py-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={filters.paintClean}
                        onChange={(e) => setFilters((p) => ({ ...p, paintClean: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      Boyasız
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={filters.replaceClean}
                        onChange={(e) => setFilters((p) => ({ ...p, replaceClean: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      Değişensiz
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={filters.tramerClean}
                        onChange={(e) => setFilters((p) => ({ ...p, tramerClean: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      Tramer Kaydı Yok
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      brand: '',
                      model: '',
                      fuel: '',
                      transmission: '',
                      city: '',
                      yearFrom: '',
                      yearTo: '',
                      kmMin: '',
                      kmMax: '',
                      priceMin: '',
                      priceMax: '',
                      paintClean: false,
                      replaceClean: false,
                      tramerClean: false,
                      listingNo: ''
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Filtreyi Temizle
                </button>
              </div>
            </aside>

            {/* İlan grid */}
            <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((car) => (
                <Link
                  key={car.id}
                  href={`/araba-al/${car.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={car.images[0]?.url ?? '/images/otosipsak-hero-banner-araba-degerleme.webp'}
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
                    <p className="text-xl font-bold text-primary">{car.price.toLocaleString('tr-TR')} ₺</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>Kilometre</div>
                      <div className="text-right font-semibold text-slate-800">
                        {car.mileage.toLocaleString('tr-TR')} km
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
              {!loading && filtered.length === 0 ? (
                <p className="text-sm text-slate-600">Uygun ilan bulunamadı.</p>
              ) : null}
              {loading ? <p className="text-sm text-slate-600">Yükleniyor...</p> : null}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}