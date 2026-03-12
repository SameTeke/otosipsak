"use client";

import { useEffect, useMemo, useState } from 'react';
import { validateImageFiles } from '@/lib/client-image-validation';
import { IMAGE_UPLOAD_REQUIREMENTS_TEXT } from '@/lib/image-upload-rules';

type BlogStatus = 'draft' | 'published';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnailUrl: string | null;
  heroImageUrl: string | null;
  readingTime: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  id: 0,
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  thumbnailUrl: '',
  heroImageUrl: '',
  readingTime: '',
  status: 'draft' as BlogStatus,
  publishedAt: ''
};

function slugifyTR(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uploadSingle(file: File): Promise<string> {
  const validationError = await validateImageFiles([file], { maxFiles: 1 });
  if (validationError) {
    throw new Error(validationError);
  }

  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Gorsel yuklenemedi.');
  }
  return data.files?.[0]?.url ?? '';
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all');
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState<'icerik' | 'gorseller'>('icerik');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/blog');
      if (!res.ok) {
        setPosts([]);
        setLoadError('Blog yazıları yüklenemedi.');
        return;
      }
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
      setLoadError('Blog yazıları yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return `${p.title} ${p.slug}`.toLowerCase().includes(q);
    });
  }, [posts, query, statusFilter]);

  const resetAll = () => {
    setForm(emptyForm);
    setTab('icerik');
    setError(null);
  };

  const startEdit = (p: BlogPost) => {
    setForm({
      ...emptyForm,
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? '',
      content: p.content ?? '',
      thumbnailUrl: p.thumbnailUrl ?? '',
      heroImageUrl: p.heroImageUrl ?? '',
      readingTime: p.readingTime ?? '',
      status: p.status,
      publishedAt: p.publishedAt ? String(p.publishedAt).slice(0, 10) : ''
    });
    setTab('icerik');
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const slug = form.slug?.trim() ? slugifyTR(form.slug) : slugifyTR(form.title);
    if (!form.title.trim()) {
      setError('Başlık zorunlu');
      setSaving(false);
      return;
    }
    if (!slug) {
      setError('Slug üretilemedi');
      setSaving(false);
      return;
    }
    if (!form.content.trim()) {
      setError('İçerik zorunlu');
      setSaving(false);
      return;
    }

    const payload: any = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt?.trim() ? form.excerpt.trim() : null,
      content: form.content,
      thumbnailUrl: form.thumbnailUrl?.trim() ? form.thumbnailUrl.trim() : null,
      heroImageUrl: form.heroImageUrl?.trim() ? form.heroImageUrl.trim() : null,
      readingTime: form.readingTime?.trim() ? form.readingTime.trim() : null,
      status: form.status,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null
    };

    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/admin/blog/${form.id}` : '/api/admin/blog';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(out.error || 'Kaydedilemedi');
      setSaving(false);
      return;
    }

    resetAll();
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu yazı silinsin mi?')) return;
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    await load();
    if (form.id === id) resetAll();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      {/* Sol: Liste */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Blog Yazıları</h2>
            <p className="text-xs text-slate-500">Toplam: {posts.length} · Gösterilen: {filtered.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Yeni Yazı
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
              placeholder="Ara: başlık / slug..."
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
          ) : loadError ? (
            <div className="p-4 text-sm font-semibold text-red-600">{loadError}</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-slate-600">Kayıt bulunamadı.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filtered.map((p) => {
                const active = form.id === p.id;
                return (
                  <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${active ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
                    <button type="button" className="flex-1 text-left" onClick={() => startEdit(p)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900">{p.title}</div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {p.status === 'published' ? 'Yayında' : 'Taslak'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">{p.slug}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
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

      {/* Sağ: Form */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-20">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{form.id ? 'Yazıyı Düzenle' : 'Yeni Yazı'}</h3>
              <p className="text-xs text-slate-500">{form.id ? `ID: ${form.id}` : 'Yeni içerik ekleyin.'}</p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {[
              { key: 'icerik', label: 'İçerik' },
              { key: 'gorseller', label: 'Görseller' }
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
          {tab === 'icerik' ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Başlık</label>
                  <input
                    value={form.title}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setForm((p) => ({ ...p, title: nextTitle, slug: p.slug ? p.slug : slugifyTR(nextTitle) }));
                    }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Başlık"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ornek-slug"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Kısa Açıklama</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                    className="min-h-[72px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Liste ekranında görünen kısa açıklama..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Okuma Süresi</label>
                  <input
                    value={form.readingTime}
                    onChange={(e) => setForm((p) => ({ ...p, readingTime: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Örn: 5 dk"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Yayın Tarihi</label>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => setForm((p) => ({ ...p, publishedAt: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Durum</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as BlogStatus }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="draft">Taslak</option>
                    <option value="published">Yayında</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">İçerik</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    className="min-h-[240px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Blog içeriği..."
                  />
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'gorseller' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Küçük Resim</div>
                <p className="mt-1 text-xs text-slate-500">Blog listesinde gösterilir. {IMAGE_UPLOAD_REQUIREMENTS_TEXT}</p>
                {form.thumbnailUrl ? (
                  <img src={form.thumbnailUrl} alt="" className="mt-3 h-28 w-full rounded-xl border object-cover" />
                ) : null}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Resim URL (opsiyonel)"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const url = await uploadSingle(f);
                        if (url) {
                          setError(null);
                          setForm((p) => ({ ...p, thumbnailUrl: url }));
                        }
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Gorsel yuklenemedi.');
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Blog Görseli (Kapak)</div>
                <p className="mt-1 text-xs text-slate-500">Blog detay sayfasında üstte gösterilir. {IMAGE_UPLOAD_REQUIREMENTS_TEXT}</p>
                {form.heroImageUrl ? (
                  <img src={form.heroImageUrl} alt="" className="mt-3 h-36 w-full rounded-xl border object-cover" />
                ) : null}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input
                    value={form.heroImageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, heroImageUrl: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Resim URL (opsiyonel)"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const url = await uploadSingle(f);
                        if (url) {
                          setError(null);
                          setForm((p) => ({ ...p, heroImageUrl: url }));
                        }
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Gorsel yuklenemedi.');
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
                  />
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


