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

export default function HakkimizdaPage() {
  return (
    <main className="min-h-screen bg-white pt-16 sm:pt-20">
      <Header />
      <section className="mx-auto flex max-w-screen-2xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Hakkımızda</h1>
          <p className="text-sm text-slate-600">
            Borusan Otomotiv Grubu&apos;nun çoklu marka ve kanal stratejisi vizyonuyla hayata geçirilen Otosipsak A.Ş.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_2.1fr]">
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

          <article className="prose prose-slate max-w-none">
            <p>
              Borusan Otomotiv Grubu&apos;nun çoklu marka ve kanal stratejisi vizyonuyla hayata geçirilmiş olan Otosipsak A.Ş.;
              kendi lokasyonlarında güven, hız ve müşteri deneyimi odaklı bir anlayışla belirlenen kriterlere uygun
              her marka, model ve yaştaki ikinci el otomobil için; nakit alım, takas, satış ve servis hizmetlerinin yanı
              sıra iş ortakları aracılığıyla finansman ve sigorta çözümleri sunar.
            </p>
            <p>
              Müşterilerine hızlı, güvenilir ve etkileşimli bir alışveriş deneyimi sunarak müşteri memnuniyetini en üst
              düzeye çıkarmayı amaçlayan Otosipsak A.Ş., iletişim merkezi ile haftanın 7 günü boyunca, 08.00-18.00
              saatleri arasında kesintisiz hizmet verir.
            </p>
            <p>
              Nakit alım, takas ve satış hizmetlerinin yanı sıra Otosipsak A.Ş. Servis ile İstanbul&apos;da Kağıthane ve
              Ankara&apos;da Balgat lokasyonlarında her marka ve model otomobil için Borusan güvencesi ve avantajlı
              fiyatlarla bakım, onarım ve arıza tespit hizmetleri sunar.
            </p>
            <p>
              2.el araba arayanlar için güvenilir adres olmaya devam eden Otosipsak A.Ş., aynı zamanda tamamen ekspertizli
              2. el motosikletleri de İstanbul’da Kağıthane’de ve Ankara’da Balgat lokasyonlarında sergiler.
            </p>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}

