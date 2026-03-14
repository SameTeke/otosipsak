"use client";

import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motoYears } from '@/data/motos/brands';
import { getMotoBrandsByYear } from '@/data/motos/getMotoBrandsByYear';
import { getMotoModelsByBrand } from '@/data/motos/getMotoModelsByBrand';
import { validateImageFiles } from '@/lib/client-image-validation';
import { IMAGE_UPLOAD_REQUIREMENTS_TEXT, IMAGE_UPLOAD_RULES } from '@/lib/image-upload-rules';

type FormState = {
  year: string;
  brand: string;
  model: string;
  km: string;
  color: string;
  colorOther: string;
  tramer: '' | 'var' | 'yok';
  tramerValue: string;
  heavyDamage: '' | 'evet' | 'hayir';
  isListed: '' | 'var' | 'yok';
  listingUrl: string;
  notes: string;
  fullName: string;
  phone: string;
  city: string;
  photos: File[];
};

const initialState: FormState = {
  year: '',
  brand: '',
  model: '',
  km: '',
  color: '',
  colorOther: '',
  tramer: 'yok',
  tramerValue: '',
  heavyDamage: 'hayir',
  isListed: 'yok',
  listingUrl: '',
  notes: '',
  fullName: '',
  phone: '',
  city: '',
  photos: []
};

const cities = ['34 İstanbul', '06 Ankara', '35 İzmir', '16 Bursa', '41 Kocaeli'];

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 12); // +90 ile birlikte 12 hane
  const padded = digits.startsWith('90') ? digits : `90${digits}`;
  const d = padded.slice(2);
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 8);
  const e = d.slice(8, 10);
  return `+90 ${a ? `(${a}` : ''}${a ? ')' : ''}${b ? ` ${b}` : ''}${c ? ` ${c}` : ''}${e ? ` ${e}` : ''}`.trim();
}

export default function MotosikletSatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Yükleniyor...</div>}>
      <MotosikletSatInner />
    </Suspense>
  );
}

function MotosikletSatInner() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const submitLockRef = useRef(false);
  const searchParams = useSearchParams();

  const brandOptions = useMemo(
    () => (form.year ? getMotoBrandsByYear(form.year) : []),
    [form.year]
  );
  const modelOptions = useMemo(
    () => (form.brand ? getMotoModelsByBrand(form.brand) : []),
    [form.brand]
  );

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'year' ? { brand: '', model: '' } : {}),
      ...(key === 'brand' ? { model: '' } : {})
    }));
  };

  const handlePhotosChange = async (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const validationError = await validateImageFiles(incoming, {
      maxFiles: IMAGE_UPLOAD_RULES.maxVehiclePhotos,
      currentCount: form.photos.length
    });

    if (validationError) {
      setErrors((prev) => ({ ...prev, photos: validationError }));
      return;
    }

    setErrors((prev) => ({ ...prev, photos: undefined }));
    setForm((prev) => {
      const next = [...prev.photos, ...incoming].slice(0, 6);
      return { ...prev, photos: next };
    });
  };

  const handleRemovePhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setForm((prev) => ({
      ...prev,
      photos: moveItem(prev.photos, fromIndex, toIndex)
    }));
  };

  useEffect(() => {
    const yearParam = searchParams.get('year');
    const brandParam = searchParams.get('brand');
    const modelParam = searchParams.get('model');

    if (!yearParam && !brandParam && !modelParam) return;

    const yearValid = yearParam && !Number.isNaN(Number(yearParam)) ? String(yearParam) : '';
    const availableBrands = yearValid ? getMotoBrandsByYear(yearValid) : [];
    const brandValid = brandParam && availableBrands.includes(brandParam) ? brandParam : '';
    const availableModels = brandValid ? getMotoModelsByBrand(brandValid) : [];
    const modelValid = brandValid && modelParam && availableModels.includes(modelParam) ? modelParam : '';

    setForm((prev) => ({
      ...prev,
      year: yearValid || prev.year,
      brand: brandValid || (yearValid ? '' : prev.brand),
      model: modelValid || (brandValid ? '' : prev.model)
    }));
  }, [searchParams]);

  useEffect(() => {
    const urls = form.photos.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.photos]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.year) nextErrors.year = 'Model yılı zorunlu';
    if (!form.brand) nextErrors.brand = 'Marka zorunlu';
    if (!form.model) nextErrors.model = 'Model zorunlu';
    if (!form.km) nextErrors.km = 'Kilometre zorunlu';
    if (!form.color) nextErrors.color = 'Renk zorunlu';
    if (form.color === 'Diğer' && !form.colorOther.trim()) nextErrors.colorOther = 'Renk belirtiniz';
    if (!form.tramer) nextErrors.tramer = 'Tramer kaydı zorunlu';
    if (form.tramer === 'var' && !form.tramerValue.trim()) nextErrors.tramerValue = 'Tramer değeri zorunlu';
    if (!form.heavyDamage) nextErrors.heavyDamage = 'Ağır hasar bilgisi zorunlu';
    if (!form.isListed) nextErrors.isListed = 'İlan durumu zorunlu';
    if (form.isListed === 'var' && !form.listingUrl.trim()) nextErrors.listingUrl = 'İlan linki zorunlu';
    if (!form.fullName) nextErrors.fullName = 'Ad Soyad zorunlu';
    if (!form.city) nextErrors.city = 'İl zorunlu';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length !== 12 || !digits.startsWith('90')) {
      nextErrors.phone = 'Telefon geçersiz (+90 ve 10 hane olmalı)';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const uploadPhotos = async () => {
    if (!form.photos.length) return [];
    setUploading(true);
    setErrors((prev) => ({ ...prev, photos: undefined }));
    const fd = new FormData();
    form.photos.forEach((f) => fd.append('file', f));
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors((prev) => ({ ...prev, photos: data.error || 'Fotograflar yuklenemedi.' }));
      return [];
    }
    const data = await res.json();
    return data.files?.map((f: any) => f.url) ?? [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || submitted) return;
    if (!validate()) return;
    submitLockRef.current = true;
    const imageUrls = await uploadPhotos();
    fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType: 'motosiklet-sat', phone: form.phone, payload: { ...form, imageUrls } })
    }).catch(() => {
      submitLockRef.current = false;
    });
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-16 text-slate-900 sm:pt-20">
      <Header />

      <section className="bg-slate-100 py-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-primary">
              Anasayfa
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">Motosiklet Sat</span>
          </div>
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden bg-cover bg-center py-16 text-white"
        style={{ backgroundImage: "url('/images/ornekMotorResmi.png')" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Motosiklet Sat</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-100">
            2017 ve sonrası motosikletiniz için hızlı değerleme ve güvenli satış süreci. Model yılını,
            markayı ve modeli seçin; bilgileri tamamlayın.
          </p>
        </div>
      </section>

      <section className="relative -mt-10 pb-16">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 px-4 py-8 sm:px-10">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Satış Bilgileri */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">Satış Bilgileri</h2>
              <p className="text-sm text-slate-600">
                Model yılını (2017+), markayı ve modeli seçin; temel bilgileri girin.
              </p>
              <div className="mt-4 grid gap-6 lg:grid-cols-[2fr_1.4fr]">
                <div className="space-y-4 rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Model Yılı</label>
                      <select
                        value={form.year}
                        onChange={(e) => handleChange('year', e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold uppercase text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Seçiniz</option>
                        {motoYears.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Marka</label>
                      <select
                        value={form.brand}
                        onChange={(e) => handleChange('brand', e.target.value)}
                        disabled={!form.year}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold uppercase text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Seçiniz</option>
                        {brandOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                      {errors.brand && <p className="mt-1 text-xs text-red-600">{errors.brand}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Model</label>
                      <select
                        value={form.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                        disabled={!form.brand}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold uppercase text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Seçiniz</option>
                        {modelOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      {errors.model && <p className="mt-1 text-xs text-red-600">{errors.model}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Kilometre</label>
                      <input
                        type="number"
                        min={0}
                        max={300000}
                        value={form.km}
                        onChange={(e) => handleChange('km', e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Örn: 12000"
                      />
                      {errors.km && <p className="mt-1 text-xs text-red-600">{errors.km}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Renk</label>
                      <select
                        value={form.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Seçiniz</option>
                        {[
                          'Siyah',
                          'Beyaz',
                          'Gri',
                          'Kırmızı',
                          'Mavi',
                          'Yeşil',
                          'Sarı',
                          'Turuncu',
                          'Kahverengi',
                          'Mor',
                          'Diğer'
                        ].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      {errors.color && <p className="mt-1 text-xs text-red-600">{errors.color}</p>}
                      {form.color === 'Diğer' && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={form.colorOther}
                            onChange={(e) => handleChange('colorOther', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Renk belirtiniz"
                          />
                          {errors.colorOther && (
                            <p className="mt-1 text-xs text-red-600">{errors.colorOther}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Notlar</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Eklemek istediğiniz bilgiler"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-slate-800">Fotoğraf Yükle</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handlePhotosChange(e.target.files)}
                        className="mt-2 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-slate-600">
                          Maksimum 6 fotoğraf ekleyebilirsiniz. İlk fotoğraf kapak olur.
                        </div>
                        <div className="text-xs text-slate-500">Fotoğrafları sürükleyip bırakarak sıralayabilirsiniz.</div>
                        <div className="text-xs text-slate-500">{IMAGE_UPLOAD_REQUIREMENTS_TEXT}</div>
                        {errors.photos ? <p className="text-xs text-red-600">{errors.photos}</p> : null}
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                          {previewUrls.map((url, idx) => (
                            <div
                              key={url}
                              draggable
                              onDragStart={() => setDraggedPhotoIndex(idx)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => {
                                if (draggedPhotoIndex === null) return;
                                handleMovePhoto(draggedPhotoIndex, idx);
                                setDraggedPhotoIndex(null);
                              }}
                              onDragEnd={() => setDraggedPhotoIndex(null)}
                              className={`relative aspect-square overflow-hidden rounded-xl border bg-slate-100 ${
                                draggedPhotoIndex === idx ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200'
                              }`}
                            >
                              <img src={url} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white text-xs"
                                aria-label="Fotoğrafı kaldır"
                              >
                                ×
                              </button>
                              {idx === 0 && (
                                <span className="absolute left-1 bottom-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase text-white">
                                  Kapak
                                </span>
                              )}
                            </div>
                          ))}
                          {Array.from({ length: Math.max(0, 6 - previewUrls.length) }).map((_, i) => (
                            <div
                              key={`placeholder-${i}`}
                              className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11.5a2 2 0 100-4 2 2 0 000 4z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13l-1.586-1.586a2 2 0 00-2.828 0L7 15" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div>
                    <label className="text-sm font-semibold text-slate-800">Tramer Kaydı</label>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {[
                        { value: 'var', label: 'Var' },
                        { value: 'yok', label: 'Yok' }
                      ].map((opt) => (
                        <label key={opt.value} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <input
                            type="radio"
                            name="tramer"
                            value={opt.value}
                            checked={form.tramer === opt.value}
                            onChange={(e) => handleChange('tramer', e.target.value)}
                            className="h-4 w-4"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    {errors.tramer && <p className="mt-1 text-xs text-red-600">{errors.tramer}</p>}
                    {form.tramer === 'var' && (
                      <div className="mt-2">
                        <input
                          type="number"
                          min={0}
                          value={form.tramerValue}
                          onChange={(e) => handleChange('tramerValue', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Tramer tutarı (TL)"
                        />
                        {errors.tramerValue && (
                          <p className="mt-1 text-xs text-red-600">{errors.tramerValue}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-800">Ağır Hasar Kaydı</label>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {[
                        { value: 'evet', label: 'Evet' },
                        { value: 'hayir', label: 'Hayır' }
                      ].map((opt) => (
                        <label key={opt.value} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <input
                            type="radio"
                            name="heavyDamage"
                            value={opt.value}
                            checked={form.heavyDamage === opt.value}
                            onChange={(e) => handleChange('heavyDamage', e.target.value)}
                            className="h-4 w-4"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    {errors.heavyDamage && (
                      <p className="mt-1 text-xs text-red-600">{errors.heavyDamage}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-800">İlan Durumu</label>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {[
                        { value: 'var', label: 'İlanda' },
                        { value: 'yok', label: 'İlanda Değil' }
                      ].map((opt) => (
                        <label key={opt.value} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <input
                            type="radio"
                            name="isListed"
                            value={opt.value}
                            checked={form.isListed === opt.value}
                            onChange={(e) => handleChange('isListed', e.target.value)}
                            className="h-4 w-4"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    {errors.isListed && <p className="mt-1 text-xs text-red-600">{errors.isListed}</p>}
                    {form.isListed === 'var' && (
                      <div className="mt-2">
                        <input
                          type="url"
                          value={form.listingUrl}
                          onChange={(e) => handleChange('listingUrl', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="İlan linki"
                        />
                        {errors.listingUrl && (
                          <p className="mt-1 text-xs text-red-600">{errors.listingUrl}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* İletişim */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">İletişim ve Konum</h2>
              <p className="text-sm text-slate-600">
                Teklif ve randevu için temel iletişim bilgilerinizi bırakın.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">Ad Soyad</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">İl</label>
                  <select
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seçiniz</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">Telefon</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+90 (5xx) xxx xx xx"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Formu gönderdiğinizde uzman ekibimiz en kısa sürede dönüş yapar.
              </p>
              <button
                type="submit"
                disabled={uploading || submitted}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
              >
                {uploading ? 'Gönderiliyor...' : submitted ? 'Gönderildi' : 'Teklif Al'}
              </button>
            </div>

            {submitted && (
              <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
                Talebiniz alındı. Bilgileriniz incelendikten sonra sizinle iletişime geçeceğiz.
              </div>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}

