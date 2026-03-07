import Link from 'next/link';

const columnClasses = 'space-y-2 text-sm text-gray-200';

export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="space-y-3 text-sm text-gray-200">
            <div className="text-lg font-semibold text-white">Hizmetlerimiz</div>
            <Link href="/araba-al" className="block transition hover:text-primary">
              Araba Alın
            </Link>
            <Link href="/arac-sat" className="block transition hover:text-primary">
              Araba Satın
            </Link>
            <Link href="/motosiklet" className="block transition hover:text-primary">
              Motosiklet Alın
            </Link>
          </div>

          <div className={columnClasses}>
            <div className="text-lg font-semibold text-white">Kurumsal</div>
            <Link href="/hakkimizda" className="block transition hover:text-primary">
              Hakkımızda
            </Link>
          </div>

          <div className={columnClasses}>
            <div className="text-lg font-semibold text-white">Gelişmeler</div>
            <Link href="/blog" className="block transition hover:text-primary">
              Blog
            </Link>
            <Link href="/haberler" className="block transition hover:text-primary">
              Haberler ve Duyurular
            </Link>
          </div>

          <div className={columnClasses}>
            <div className="text-lg font-semibold text-white">Gizlilik ve Kullanım</div>
            <Link href="/gizlilik-ve-sartlar" className="block transition hover:text-primary">
              Hüküm ve Koşullar
            </Link>
            <Link href="/cerez-politikasi" className="block transition hover:text-primary">
              Çerez Politikası
            </Link>
          </div>

          <div className={columnClasses}>
            <div className="text-lg font-semibold text-white">Destek</div>
            <Link href="/iletisim" className="block transition hover:text-primary">
              İletişim
            </Link>
            <Link href="/iletisim" className="block transition hover:text-primary">
              Müşteri İletişim Formu
            </Link>
            <Link href="/sss" className="block transition hover:text-primary">
              Sıkça Sorulan Sorular
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-8 text-sm text-gray-300">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-base font-semibold text-white">Otosipsak A.Ş.</div>
              <p className="mt-1 text-gray-400">
                Copyright © 2025 — Tüm hakları saklıdır.
              </p>
            </div>
            <div className="text-gray-400">
              Müşteri Hattı: 0850 XXX XX XX
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Canlı Destek - tüm sayfalarda sabit */}
      <a
        href="https://wa.me/905322084837"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp canlı destek"
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
      >
        <img
          src="/images/whatsappicon.png"
          alt="WhatsApp"
          className="h-9 w-9 animate-pulse"
        />
      </a>
    </footer>
  );
}