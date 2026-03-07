"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const quickLinks = [
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Sıkça Sorulan Sorular', href: '/sss' },
  { label: 'İletişim', href: '/iletisim' },
  { label: 'Kariyer Olanakları', href: '/kariyer' },
  { label: 'Gizlilik ve Şartlar', href: '/gizlilik-ve-sartlar' },
  { label: 'Çerez Politikası', href: '/cerez-politikasi' },
  { label: 'Satış ve Ödeme Koşulları', href: '/satis-ve-odeme-kosullari' },
  { label: 'Ekspertiz Koşulları', href: '/ekspertiz-kosullari' }
];

type DocKey = 'hukuk' | 'aydinlatma' | 'kvkk';

const docs: Record<DocKey, { title: string; content: string }> = {
  hukuk: {
    title: 'Hüküm ve Koşullar',
    content: `Bu metin demo amaçlıdır. Buraya hizmet şartları, kullanım koşulları, site ve ürün politikaları eklenecektir. 
    Sözleşme maddeleri, kullanıcı yükümlülükleri, sorumluluk sınırları ve fesih koşulları belirtilecektir. 
    Daha sonra gerçek metinle değiştirilecektir.`
  },
  aydinlatma: {
    title: 'Aydınlatma Metni',
    content: `Bu alan aydınlatma metni içindir. Kişisel verilerin hangi amaçlarla işlendiği, hukuki dayanak, 
    toplanma yöntemi ve veri sahibinin hakları burada açıklanacaktır. Demo içerik, ileride gerçek metinle değiştirilecektir.`
  },
  kvkk: {
    title: 'Kişisel Verilerin İşlenmesi Hakkında Aydınlatma Metni',
    content: `KVKK kapsamındaki bilgilendirmeler burada yer alacaktır. Veri güvenliği, saklama süreleri, 
    üçüncü taraf aktarımı ve başvuru süreçleri örnek olarak yazılmıştır. İçerik, final metinle güncellenecektir.`
  }
};

export default function GizlilikVeSartlarPage() {
  const [open, setOpen] = useState<DocKey | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <main className="min-h-screen bg-white pt-16 sm:pt-20">
      <Header />
      <section className="mx-auto flex max-w-screen-2xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Gizlilik ve Şartlar</h1>
          <p className="text-sm text-slate-600">
            Otosipsak A.Ş.&apos;te sunulan gizlilik ve kullanım koşullarına ait düzenlemeler aşağıda yer alır.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_2.1fr]">
          {/* Left quick nav */}
          <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm h-fit">
            <h3 className="text-sm font-semibold text-slate-900">Hızlı Gezinme</h3>
            <nav className="flex flex-col space-y-2 text-sm text-slate-700">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <h4 className="text-base font-semibold text-slate-900">{docs.hukuk.title}</h4>
              <button
                type="button"
                onClick={() => setOpen('hukuk')}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Görüntüle
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <h4 className="text-base font-semibold text-slate-900">{docs.aydinlatma.title}</h4>
              <button
                type="button"
                onClick={() => setOpen('aydinlatma')}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Görüntüle
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:col-span-2">
              <h4 className="text-base font-semibold text-slate-900">{docs.kvkk.title}</h4>
              <button
                type="button"
                onClick={() => setOpen('kvkk')}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Görüntüle
              </button>
            </div>
          </div>
        </div>
      </section>
      <Footer />

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              aria-label="Kapat"
            >
              ✕
            </button>
            <div className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
              <h2 className="text-xl font-bold text-slate-900">{docs[open].title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                {docs[open].content.split('\n').map((p, idx) => (
                  <p key={idx}>{p.trim()}</p>
                ))}
                <p>
                  Bu içerik örnek amaçlıdır. Yayına alınmadan önce güncellenecek ve nihai yasal metinlerle
                  değiştirilecektir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

