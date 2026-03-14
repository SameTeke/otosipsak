"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Step1, { Step1Errors, Step1State } from '@/components/arac-sat/Step1';
import Step3, { Step3Errors, Step3State } from '@/components/arac-sat/Step3';
import Step4, { Step4Errors, Step4State } from '@/components/arac-sat/Step4';
import Step4Consign from '@/components/arac-sat/Step4Consign';
import Step5, { Step5Errors, Step5State } from '@/components/arac-sat/Step5';
import { getBrandsByYear } from '@/data/cars/getBrandsByYear';
import { getModelsByBrand } from '@/data/cars/getModelsByBrand';
import { formatTurkishPlateInput, isValidTurkishPlate } from '@/lib/plate';

const years = Array.from({ length: 21 }, (_, i) => String(2005 + i));
const bodyTypes = ['Sedan', 'Hatchback', 'SUV', 'Coupé', 'Station Wagon', 'MPV', 'Pickup'];
const fuelTypes = ['Benzin', 'Dizel', 'Hybrid', 'Elektrik', 'LPG'];
const transmissions = ['Manuel', 'Otomatik', 'Yarı Otomatik', 'CVT'];
const requiredParts = [
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
const shasiKeys = ['shasi-Sol Ön Şasi', 'shasi-Sağ Ön Şasi', 'shasi-Sol Arka Şasi', 'shasi-Sağ Arka Şasi'];

const steps = ['Araç Bilgileri', 'Kaporta Durumu', 'Araç Rengi & İlan', 'Konum'];

const initialStep3: Step3State = {
  ...requiredParts.reduce<Record<string, number>>((acc, part) => {
    acc[part] = 1;
    return acc;
  }, {}),
  ...shasiKeys.reduce<Record<string, string>>((acc, key) => {
    acc[key] = 'yok';
    return acc;
  }, {})
};

const initialStep1: Step1State = {
  year: '',
  brand: '',
  model: '',
  bodyType: '',
  fuelType: '',
  transmission: '',
  kilometre: '',
  tramer: 'yok',
  tramerValue: '',
  heavyDamage: 'hayir'
};

const initialStep4: Step4State = {
  color: '',
  equipment: '',
  isListed: 'yok',
  listingUrl: '',
  roofPanoramic: 'yok',
  roofGlass: 'yok',
  roofSunroof: 'yok',
  extra: '',
  askPrice: '',
  minPrice: '',
  consignPeriod: '',
  plate: ''
};

const initialStep5: Step5State = {
  fullName: '',
  city: '',
  phone: ''
};

export default function KonsinyeBirakPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Yükleniyor...</div>}>
      <KonsinyeBirakInner />
    </Suspense>
  );
}

function KonsinyeBirakInner() {
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState(1);

  const [step1, setStep1] = useState<Step1State>(initialStep1);

  const [step3, setStep3] = useState<Step3State>(initialStep3);
  const [step4, setStep4] = useState<Step4State>(initialStep4);
  const [step5, setStep5] = useState<Step5State>(initialStep5);

  const [errors1, setErrors1] = useState<Step1Errors>({});
  const [errors3, setErrors3] = useState<Step3Errors>({});
  const [errors4, setErrors4] = useState<Step4Errors>({});
  const [errors5, setErrors5] = useState<Step5Errors>({});

  useEffect(() => {
    const year = searchParams.get('year') ?? '';
    const brand = searchParams.get('brand') ?? '';
    const model = searchParams.get('model') ?? '';
    if (year || brand || model) {
      setStep1((prev) => ({
        ...prev,
        year: year || prev.year,
        brand: brand || prev.brand,
        model: model || prev.model
      }));
    }
  }, [searchParams]);

  const availableBrands = useMemo(() => (step1.year ? getBrandsByYear(step1.year) : []), [step1.year]);
  const availableModels = useMemo(
    () => (step1.brand && step1.year ? getModelsByBrand(step1.brand) : []),
    [step1.brand, step1.year]
  );

  const handleStep1Change = (field: keyof Step1State, value: string) => {
    setStep1((prev) => {
      if (field === 'year') {
        return { ...prev, year: value, brand: '', model: '' };
      }
      if (field === 'brand') {
        return { ...prev, brand: value, model: '' };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleStep3Change = (part: string, value: number | string | boolean) => {
    setStep3((prev) => ({ ...prev, [part]: value }));
  };

  const handleStep4Change = (field: keyof Step4State, value: string) => {
    setStep4((prev) => ({
      ...prev,
      [field]: field === 'plate' ? formatTurkishPlateInput(value) : value
    }));
  };
  const handleStep5Change = (field: keyof Step5State, value: string) => {
    setStep5((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = (): boolean => {
    const errs: Step1Errors = {};
    if (!step1.year) errs.year = 'Zorunlu alan';
    if (!step1.brand) errs.brand = 'Zorunlu alan';
    if (!step1.model) errs.model = 'Zorunlu alan';
    if (!step1.bodyType) errs.bodyType = 'Zorunlu alan';
    if (!step1.fuelType) errs.fuelType = 'Zorunlu alan';
    if (!step1.transmission) errs.transmission = 'Zorunlu alan';
    const km = Number(step1.kilometre);
    if (!step1.kilometre || Number.isNaN(km) || km < 6001 || km > 300000) {
      errs.kilometre = 'Kilometre 6.001 - 300.000 aralığında olmalı';
    }
    if (!step1.tramer) errs.tramer = 'Seçim yapınız';
    if (step1.tramer === 'var' && !step1.tramerValue) errs.tramerValue = 'Tramer değeri giriniz';
    if (!step1.heavyDamage) errs.heavyDamage = 'Seçim yapınız';
    setErrors1(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errs: Step3Errors = {};
    requiredParts.forEach((part) => {
      if (!step3[part]) errs[part] = 'Seçim yapınız';
    });
    shasiKeys.forEach((key) => {
      if (!step3[key]) errs[key] = 'İşlem var/yok seçiniz';
    });
    setErrors3(errs);
    return Object.keys(errs).length === 0;
  };

  const goStep1Next = () => {
    if (!validateStep1()) return;
    setActiveStep(2);
  };

  const goStep3Next = () => {
    if (!validateStep3()) return;
    setActiveStep(3);
  };

  const validateStep4 = (): boolean => {
    const errs: Step4Errors = {};
    if (!step4.color) errs.color = 'Renk seçiniz';
    if (step4.isListed === 'var' && !step4.listingUrl) errs.listingUrl = 'İlan linki giriniz';

    const askVal = Number(step4.askPrice);
    if (!step4.askPrice || Number.isNaN(askVal) || askVal < 100000) {
      errs.askPrice = 'İstenen fiyat en az 100.000 olmalı';
    }
    const minVal = Number(step4.minPrice);
    if (!step4.minPrice || Number.isNaN(minVal) || minVal < 100000) {
      errs.minPrice = 'Minimum fiyat en az 100.000 olmalı';
    } else if (!errs.askPrice && minVal >= askVal) {
      errs.minPrice = 'Minimum fiyat, istenen fiyattan düşük olmalı';
    }

    const periodVal = Number(step4.consignPeriod);
    if (!step4.consignPeriod || Number.isNaN(periodVal) || periodVal < 14) {
      errs.consignPeriod = 'Süre en az 14 gün olmalı';
    }

    const plate = formatTurkishPlateInput(step4.plate || '');
    if (!plate || !isValidTurkishPlate(plate)) {
      errs.plate = 'Geçerli bir plaka giriniz (örn: 34 ABC 123)';
    }

    setErrors4(errs);
    return Object.keys(errs).length === 0;
  };

  const goStep4Next = () => {
    if (!validateStep4()) return;
    setActiveStep(4);
  };

  const validateStep5 = (): boolean => {
    const errs: Step5Errors = {};
    if (!step5.fullName.trim()) errs.fullName = 'Ad soyad giriniz';
    if (!step5.city) errs.city = 'İl seçiniz';
    const phoneRegex = /^90\d{10}$/;
    if (!phoneRegex.test(step5.phone)) errs.phone = 'Geçerli telefon giriniz (+90XXXXXXXXXX)';
    setErrors5(errs);
    return Object.keys(errs).length === 0;
  };

  const goStep5Next = () => {
    if (!validateStep5()) return;
  };

  const resetForm = () => {
    setStep1(initialStep1);
    setStep3(initialStep3);
    setStep4(initialStep4);
    setStep5(initialStep5);
    setErrors1({});
    setErrors3({});
    setErrors4({});
    setErrors5({});
    setActiveStep(1);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 pt-16 sm:pt-20">
      <Header />

      <section className="bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10 xl:px-12">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            {steps.map((label, idx) => {
              const stepNum = idx + 1;
              const active = stepNum === activeStep;
              const done = stepNum < activeStep;
              return (
                <div key={label} className="flex min-w-[200px] flex-1 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                      active
                        ? 'border-primary bg-primary text-white'
                        : done
                          ? 'border-primary text-primary'
                          : 'border-slate-300 text-slate-500'
                    }`}
                  >
                    {stepNum}
                  </div>
                  <div className="flex-1 text-sm font-semibold text-slate-800">{label}</div>
                  {stepNum < steps.length && <div className="hidden flex-1 border-t border-dashed border-slate-200 sm:block" />}
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Konsinye Bırak</p>
                  <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Aracınızı Konsinye Bırakın</h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Aracınızı bizde listeleyelim, hedef fiyatınızla satarken süreçleri sizin yerinize yönetelim.
                  </p>
                </div>
                <div className="hidden text-right text-sm text-slate-500 sm:block">
                  <p>Adım {activeStep} / {steps.length}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Neden Konsinye?</p>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">Siz belirleyin, biz yönetin</h2>
                      <p className="mt-2 text-sm text-slate-600">
                        Hedef fiyatınızı siz seçin; profesyonel fotoğraf, ilan yönetimi ve satış süreci bizden.
                      </p>
                    </div>
                    <div className="hidden text-right text-sm text-slate-500 sm:block">
                      <p>Adım {activeStep} / {steps.length}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">Avantajlar</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Profesyonel fotoğraf ve ilan</li>
                      <li>• Doğru fiyatlama & hızlı geri dönüş</li>
                      <li>• Noter ve teslimat desteği</li>
                      <li>• Sertifikalı ekspertiz</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                    <p className="font-semibold">Bilgilendirme</p>
                    <p className="mt-1 text-xs">
                      Konsinye süresi boyunca minimum kabul ettiğiniz fiyatla pazarlık sınırınızı netleştirin; hedef fiyatınızı biz takip edelim.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {activeStep === 1 && (
              <Step1
                value={step1}
                errors={errors1}
                years={years}
                brands={availableBrands}
                models={availableModels}
                bodyTypes={bodyTypes}
                fuelTypes={fuelTypes}
                transmissions={transmissions}
                onChange={handleStep1Change}
                onNext={goStep1Next}
              />
            )}

            {activeStep === 2 && (
              <Step3 value={step3} errors={errors3} onChange={handleStep3Change} onPrev={() => setActiveStep(1)} onNext={goStep3Next} />
            )}

            {activeStep === 3 && (
              <Step4Consign
                value={step4}
                errors={errors4}
                onChange={handleStep4Change}
                onPrev={() => setActiveStep(2)}
                onNext={goStep4Next}
              />
            )}

            {activeStep === 4 && (
              <Step5
                value={step5}
                errors={errors5}
                onChange={handleStep5Change}
                onPrev={() => setActiveStep(3)}
                onValidate={() => validateStep5()}
                onSuccess={resetForm}
                offerPayload={{ formType: 'konsinye', step1, step3, step4, step5 }}
              />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

