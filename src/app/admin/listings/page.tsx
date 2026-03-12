"use client";

import { useEffect, useMemo, useState } from 'react';
import { Listing, ListingStatus } from '@prisma/client';
import { validateImageFiles } from '@/lib/client-image-validation';
import { IMAGE_UPLOAD_REQUIREMENTS_TEXT, IMAGE_UPLOAD_RULES } from '@/lib/image-upload-rules';

type ListingWithImages = Listing & { images: { id: number; url: string }[] };

const brandOptions = ['BMW', 'Audi', 'Mercedes', 'Toyota', 'Volkswagen', 'Volvo', 'Renault', 'Peugeot', 'Hyundai', 'Kia'];
const modelOptions: Record<string, string[]> = {
  BMW: ['3 Serisi', '5 Serisi', 'X3', 'X5'],
  Audi: ['A3', 'A4', 'A6', 'Q5'],
  Mercedes: ['C200', 'E200', 'GLC', 'GLA'],
  Toyota: ['Corolla', 'Camry', 'CHR', 'RAV4'],
  Volkswagen: ['Passat', 'Golf', 'Tiguan'],
  Volvo: ['XC40', 'XC60', 'S60'],
  Renault: ['Clio', 'Megane', 'Taliant'],
  Peugeot: ['208', '308', '3008'],
  Hyundai: ['i20', 'i30', 'Tucson'],
  Kia: ['Rio', 'Cerato', 'Sportage']
};

const yearOptions = Array.from({ length: 26 }, (_, i) => String(2025 - i));
const cityOptions = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Kocaeli', 'Adana', 'Konya'];
const fuelOptions = ['Benzin', 'Dizel', 'Hybrid', 'Elektrik', 'LPG'];
const transmissionOptions = ['Manuel', 'Otomatik', 'Yarı Otomatik', 'CVT'];
const bodyOptions = ['Sedan', 'Hatchback', 'SUV', 'Coupé', 'Station Wagon', 'MPV', 'Pickup'];
const colorOptions = ['Beyaz', 'Siyah', 'Gri', 'Kırmızı', 'Mavi', 'Yeşil', 'Turuncu', 'Lacivert'];

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
];

const shasiKeys = ['shasi-Sol Ön Şasi', 'shasi-Sağ Ön Şasi', 'shasi-Sol Arka Şasi', 'shasi-Sağ Arka Şasi'] as const;

const kaportaStatusOptions = [
  { value: 1, label: 'Orijinal' },
  { value: 2, label: 'Lokal Boyalı' },
  { value: 3, label: 'Boyalı' },
  { value: 4, label: 'Değişen' }
];

const kaportaStatusBadge: Record<number, string> = {
  1: 'bg-slate-100 text-slate-800',
  2: 'bg-amber-100 text-amber-800',
  3: 'bg-blue-100 text-blue-800',
  4: 'bg-red-100 text-red-800'
};

const buildDefaultKaporta = () => {
  const obj: Record<string, any> = {};
  kaportaParts.forEach((p) => (obj[p] = 1));
  shasiKeys.forEach((k) => (obj[k] = 'yok'));
  return obj;
};

const emptyForm = {
  id: 0,
  brand: '',
  model: '',
  price: '',
  year: '',
  city: '',
  fuelType: '',
  transmission: '',
  mileage: '',
  bodyType: '',
  color: '',
  paintDamageInfo: buildDefaultKaporta() as any,
  tramerHasRecord: false,
  tramerAmount: '',
  heavyDamage: false,
  status: 'draft' as ListingStatus,
  imageFiles: [] as File[],
  existingImages: [] as { id: number; url: string }[]
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [tab, setTab] = useState<'genel' | 'medya' | 'kaporta'>('genel');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/listings');
    const data = await res.json();
    setListings(data.listings || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const selectedImagePreviews = useMemo(
    () =>
      form.imageFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file)
      })),
    [form.imageFiles]
  );

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [selectedImagePreviews]);

  const resetAll = () => {
    setForm(emptyForm);
    setError(null);
    setTab('genel');
  };

  const startEdit = (item: ListingWithImages) => {
    setForm({
      ...emptyForm,
      id: item.id,
      brand: item.brand,
      model: item.model,
      price: String(item.price),
      year: String(item.year),
      city: item.city,
      fuelType: item.fuelType,
      transmission: item.transmission,
      mileage: String(item.mileage),
      bodyType: item.bodyType,
      color: item.color,
      paintDamageInfo: (item as any).paintDamageInfo ? (item as any).paintDamageInfo : buildDefaultKaporta(),
      tramerHasRecord: item.tramerHasRecord,
      tramerAmount: item.tramerAmount ? String(item.tramerAmount) : '',
      heavyDamage: item.heavyDamage,
      status: item.status,
      existingImages: item.images
    });
  };

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${l.brand} ${l.model} ${l.year} ${l.city}`.toLowerCase();
      return hay.includes(q);
    });
  }, [listings, query, statusFilter]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload: any = {
      brand: form.brand,
      model: form.model,
      price: Number(form.price),
      year: Number(form.year),
      city: form.city,
      fuelType: form.fuelType,
      transmission: form.transmission,
      mileage: Number(form.mileage),
      bodyType: form.bodyType,
      color: form.color,
      paintDamageInfo: form.paintDamageInfo ?? null,
      tramerHasRecord: form.tramerHasRecord,
      tramerAmount: form.tramerAmount ? Number(form.tramerAmount) : null,
      heavyDamage: form.heavyDamage,
      status: form.status
    };

    if (!payload.brand || !payload.model || Number.isNaN(payload.price)) {
      setError('Marka, model ve fiyat zorunlu');
      setSaving(false);
      return;
    }

    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/admin/listings/${form.id}` : '/api/admin/listings';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Kaydedilemedi');
      setSaving(false);
      return;
    }

    const out = await res.json().catch(() => ({}));
    const id = form.id || out?.id;

    if (form.imageFiles.length && id) {
      const fd = new FormData();
      form.imageFiles.forEach((f) => fd.append('files', f));
      const uploadRes = await fetch(`/api/admin/listings/${id}/images`, { method: 'POST', body: fd });
      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json().catch(() => ({}));
        setError(uploadData.error || 'Ilan kaydedildi fakat gorseller yuklenemedi.');
        await load();
        setSaving(false);
        setForm((prev) => ({ ...prev, id, imageFiles: [] }));
        return;
      }
    }

    resetAll();
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Silinsin mi?')) return;
    await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
    await load();
    if (form.id === id) resetAll();
  };

  const activeId = form.id || null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      {/* Liste */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">İlanlar</h2>
            <p className="text-xs text-slate-500">
              Toplam: {listings.length} · Gösterilen: {filteredListings.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Yeni İlan
            </button>
            <button
              type="button"
              onClick={load}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Yenile
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara: marka, model, yıl, şehir..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center gap-2">
              {[
                { key: 'all', label: 'Tümü' },
                { key: 'published', label: 'Yayında' },
                { key: 'draft', label: 'Taslak' }
              ].map((x) => {
                const active = statusFilter === (x.key as any);
                return (
                  <button
                    key={x.key}
                    type="button"
                    onClick={() => setStatusFilter(x.key as any)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {x.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-h-[calc(100vh-230px)] overflow-auto">
          {loading ? (
            <div className="p-4 text-sm text-slate-600">Yükleniyor...</div>
          ) : filteredListings.length === 0 ? (
            <div className="p-4 text-sm text-slate-600">Kayıt bulunamadı.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredListings.map((l) => {
                const isActive = activeId === l.id;
                return (
                  <div key={l.id} className={`flex items-center gap-3 px-4 py-3 ${isActive ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        startEdit(l);
                        setTab('genel');
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900">
                          {l.brand} {l.model}
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{l.year}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            l.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {l.status === 'published' ? 'Yayında' : 'Taslak'}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span>{l.city}</span>
                        <span>·</span>
                        <span>{l.fuelType}</span>
                        <span>·</span>
                        <span>{l.transmission}</span>
                        <span>·</span>
                        <span>{l.mileage.toLocaleString('tr-TR')} km</span>
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-primary">{l.price.toLocaleString('tr-TR')} ₺</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(l.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-20">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{form.id ? 'İlanı Düzenle' : 'Yeni İlan'}</h3>
              <p className="text-xs text-slate-500">{form.id ? `ID: ${form.id}` : 'Yeni kayıt oluşturun.'}</p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {[
              { key: 'genel', label: 'Genel' },
              { key: 'medya', label: 'Medya' },
              { key: 'kaporta', label: 'Kaporta' }
            ].map((t) => {
              const active = tab === (t.key as any);
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key as any)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          {tab === 'genel' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Marka</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value, model: '' })}
                >
                  <option value="">Seçiniz</option>
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Model</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  disabled={!form.brand}
                >
                  <option value="">Seçiniz</option>
                  {(modelOptions[form.brand] || []).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Fiyat</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  type="number"
                  placeholder="Fiyat"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Yıl</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                >
                  <option value="">Seçiniz</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Şehir</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  <option value="">Seçiniz</option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Yakıt</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.fuelType}
                  onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                >
                  <option value="">Seçiniz</option>
                  {fuelOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Vites</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.transmission}
                  onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                >
                  <option value="">Seçiniz</option>
                  {transmissionOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kilometre</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  type="number"
                  placeholder="Kilometre"
                  value={form.mileage}
                  onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kasa Tipi</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.bodyType}
                  onChange={(e) => setForm({ ...form, bodyType: e.target.value })}
                >
                  <option value="">Seçiniz</option>
                  {bodyOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Renk</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                >
                  <option value="">Seçiniz</option>
                  {colorOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={form.tramerHasRecord}
                      onChange={(e) => setForm({ ...form, tramerHasRecord: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40"
                    />
                    Tramer Kaydı Var
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={form.heavyDamage}
                      onChange={(e) => setForm({ ...form, heavyDamage: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40"
                    />
                    Ağır Hasar Var
                  </label>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {form.tramerHasRecord ? (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Tramer Tutarı</label>
                      <input
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        type="number"
                        placeholder="Tramer Tutarı"
                        value={form.tramerAmount}
                        onChange={(e) => setForm({ ...form, tramerAmount: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500">
                      Tramer kaydı yoksa tutar alanı gizli kalır.
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Durum</label>
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as ListingStatus })}
                    >
                      <option value="draft">Taslak</option>
                      <option value="published">Yayında</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'medya' ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Görseller</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) {
                      setForm({ ...form, imageFiles: [] });
                      return;
                    }

                    const validationError = await validateImageFiles(files, {
                      maxFiles: IMAGE_UPLOAD_RULES.maxVehiclePhotos
                    });

                    if (validationError) {
                      setError(validationError);
                      e.currentTarget.value = '';
                      return;
                    }

                    setError(null);
                    setForm({ ...form, imageFiles: files });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-slate-500">{IMAGE_UPLOAD_REQUIREMENTS_TEXT}</p>
              </div>
              {selectedImagePreviews.length ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-700">Kaydedilecek yeni görseller</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImagePreviews.map((img) => (
                      <div key={img.url} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <img src={img.url} alt={img.name} className="h-20 w-28 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {form.existingImages.length ? (
                <div className="flex flex-wrap gap-2">
                  {form.existingImages.map((img) => (
                    <img key={img.id} src={img.url} alt="" className="h-20 w-28 rounded-xl border object-cover" />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Henüz görsel yok.</div>
              )}
            </div>
          ) : null}

          {tab === 'kaporta' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Toplu seçim:</span>
                {kaportaStatusOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => {
                        const next = { ...(p.paintDamageInfo as any) };
                        kaportaParts.forEach((pt) => (next[pt] = o.value));
                        return { ...p, paintDamageInfo: next };
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {o.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, paintDamageInfo: buildDefaultKaporta() as any }))}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Sıfırla
                </button>
              </div>

              <div className="grid gap-2">
                {kaportaParts.map((part) => {
                  const val = Number((form.paintDamageInfo as any)?.[part] ?? 1);
                  return (
                    <div key={part} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
                      <div className="text-sm font-semibold text-slate-800">{part}</div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${kaportaStatusBadge[val] ?? 'bg-slate-100 text-slate-700'}`}>
                          {kaportaStatusOptions.find((x) => x.value === val)?.label ?? '—'}
                        </span>
                        <select
                          value={val}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              paintDamageInfo: { ...(prev.paintDamageInfo as any), [part]: Number(e.target.value) }
                            }))
                          }
                          className="rounded-lg border border-slate-200 px-2 py-2 text-sm font-semibold text-slate-800"
                        >
                          {kaportaStatusOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Şasi Bilgisi</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {shasiKeys.map((key) => {
                    const label = key.replace('shasi-', '');
                    const v = String((form.paintDamageInfo as any)?.[key] ?? 'yok');
                    return (
                      <div key={key} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
                        <div className="text-sm font-semibold text-slate-800">{label}</div>
                        <select
                          value={v}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              paintDamageInfo: { ...(prev.paintDamageInfo as any), [key]: e.target.value }
                            }))
                          }
                          className="rounded-lg border border-slate-200 px-2 py-2 text-sm font-semibold text-slate-800"
                        >
                          <option value="yok">İşlem Yok</option>
                          <option value="var">İşlem Var</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              disabled={saving}
            >
              Temizle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


