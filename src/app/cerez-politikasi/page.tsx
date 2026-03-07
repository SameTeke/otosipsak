"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

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

export default function CerezPolitikasiPage() {
  return (
    <main className="min-h-screen bg-white pt-16 sm:pt-20">
      <Header />
      <section className="mx-auto flex max-w-screen-2xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Çerez Politikası</h1>
          <p className="text-sm text-slate-600">
            Otosipsak A.Ş. sitesinde kullanılan çerezlere ve gizlilik uygulamalarına dair bilgilendirme.
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

          {/* Content */}
          <article className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2>1. Amaç</h2>
            <p>
              Bu Çerez Politikası, Otosipsak A.Ş. web sitesinde kullanılan çerezlerin türleri, kullanım amaçları ve
              kullanıcıların çerez tercihlerini nasıl yönetebilecekleri hakkında bilgi vermek için hazırlanmıştır.
              Çerezler; site deneyimini iyileştirmek, performansı artırmak, ziyaretçi istatistiklerini izlemek ve
              tercihlerinizin hatırlanmasını sağlamak için kullanılır.
            </p>

            <h2>2. Çerez Nedir?</h2>
            <p>
              Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınıza veya cihazınıza kaydedilen küçük metin
              dosyalarıdır. Oturum çerezleri, kalıcı çerezler, analitik/performans çerezleri, işlevsel çerezler ve
              hedefleme/reklam çerezleri gibi türleri bulunur.
            </p>

            <h2>3. Kullanılan Çerez Türleri</h2>
            <ul>
              <li><strong>Zorunlu çerezler:</strong> Sitenin temel işlevleri için gereklidir.</li>
              <li><strong>Analitik/performans çerezleri:</strong> Ziyaretçi davranışlarını anonim olarak ölçer.</li>
              <li><strong>İşlevsel çerezler:</strong> Tercih ve dil seçimi gibi ayarları hatırlar.</li>
              <li><strong>Hedefleme/reklam çerezleri:</strong> İlgi alanlarına uygun içerik ve reklam sunulmasını sağlar.</li>
            </ul>

            <h2>4. Çerezlerin Kullanım Amaçları</h2>
            <ul>
              <li>Sitenin güvenli ve düzgün çalışmasını sağlamak</li>
              <li>Performans ve kullanım istatistiklerini analiz etmek</li>
              <li>Kullanıcı tercihlerini hatırlamak ve deneyimi kişiselleştirmek</li>
              <li>İlgili içerik ve kampanyaları göstermek</li>
            </ul>

            <h2>5. Çerez Yönetimi ve Rıza</h2>
            <p>
              Tarayıcınızın ayarları üzerinden çerezleri kabul edebilir, reddedebilir veya silebilirsiniz. Ancak bazı
              zorunlu çerezlerin devre dışı bırakılması, sitenin doğru çalışmamasına neden olabilir. Çerez tercihlerinizi
              dilediğiniz zaman güncelleyebilirsiniz.
            </p>

            <h2>6. Üçüncü Taraf Çerezleri</h2>
            <p>
              Analitik araçlar veya reklam sağlayıcıları tarafından yerleştirilen üçüncü taraf çerezler de
              kullanılabilir. Bu çerezler, ilgili üçüncü tarafların gizlilik politikalarına tabidir.
            </p>

            <h2>7. Veri Güvenliği</h2>
            <p>
              Çerezler aracılığıyla toplanan veriler, KVKK ve ilgili mevzuata uygun olarak korunur; yetkisiz erişime
              karşı gerekli teknik ve idari önlemler alınır.
            </p>

            <h2>8. İletişim</h2>
            <p>
              Çerezler ve kişisel verilerinize ilişkin sorularınız için <a href="mailto:info@mailadresi.com">info@mailadresi.com</a> adresinden
              bize ulaşabilirsiniz.
            </p>

            <p className="text-xs text-slate-500">
              Bu metin örnek olarak hazırlanmıştır; yayına alınmadan önce güncellenecek ve nihai metinle değiştirilecektir.
            </p>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}

