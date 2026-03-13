const kaportaStatusLabels: Record<number, string> = {
  1: 'Orijinal',
  2: 'Lokal Boyalı',
  3: 'Boyalı',
  4: 'Değişen'
};

function title(value: string) {
  if (!value) return '-';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function yesNo(value: string | boolean | null | undefined) {
  if (value === true || value === 'evet' || value === 'var') return 'Evet';
  if (value === false || value === 'hayir' || value === 'yok') return 'Hayır';
  return value ? String(value) : '-';
}

function listed(value: string | null | undefined) {
  if (value === 'var') return 'İlanda';
  if (value === 'yok') return 'İlanda değil';
  return value ? String(value) : '-';
}

function formatNumber(value: string | number | null | undefined, suffix = '') {
  if (value === null || value === undefined || value === '') return '-';
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/\./g, '').replace(',', '.'));
  if (Number.isNaN(parsed)) return String(value);
  return `${parsed.toLocaleString('tr-TR')}${suffix}`;
}

function line(label: string, value: string) {
  return `- ${label}: ${value}`;
}

function renderSection(titleText: string, lines: string[]) {
  return [titleText, ...lines].join('\n');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textToHtml(text: string) {
  const sections = text.split('\n\n');
  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a">
      ${sections
        .map((section) => {
          const [heading, ...rest] = section.split('\n');
          return `
            <div style="margin-bottom:20px">
              <div style="font-size:16px;font-weight:700;margin-bottom:8px">${escapeHtml(heading)}</div>
              ${rest.map((item) => `<div>${escapeHtml(item)}</div>`).join('')}
            </div>
          `;
        })
        .join('')}
    </div>
  `.trim();
}

export function formatOfferMail(payload: any) {
  const step1 = payload?.step1 ?? {};
  const step3 = payload?.step3 ?? {};
  const step4 = payload?.step4 ?? {};
  const step5 = payload?.step5 ?? {};

  const vehicleSection = renderSection('Araç Bilgileri', [
    line('Yıl', step1.year || '-'),
    line('Marka', step1.brand || '-'),
    line('Model', step1.model || '-'),
    line('Kasa Tipi', step1.bodyType || '-'),
    line('Yakıt', step1.fuelType || '-'),
    line('Vites', step1.transmission || '-'),
    line('Kilometre', formatNumber(step1.kilometre, ' km')),
    line('Tramer', yesNo(step1.tramer)),
    line('Tramer Tutarı', formatNumber(step1.tramerValue, ' TL')),
    line('Ağır Hasar', yesNo(step1.heavyDamage))
  ]);

  const kaportaLines = Object.entries(step3).map(([key, value]) => {
    if (key.startsWith('shasi-')) {
      return line(key.replace('shasi-', ''), yesNo(String(value)));
    }

    return line(key, kaportaStatusLabels[Number(value)] ?? String(value));
  });
  const kaportaSection = renderSection('Kaporta ve Şasi', kaportaLines.length ? kaportaLines : [line('Bilgi', '-')]);

  const extraSection = renderSection('Ek Bilgiler', [
    line('Renk', title(step4.color || '-')),
    line('Donanım', step4.equipment || '-'),
    line('İlan Durumu', listed(step4.isListed)),
    line('İlan Linki', step4.listingUrl || '-'),
    line('Panoramik Tavan', yesNo(step4.roofPanoramic)),
    line('Cam Tavan', yesNo(step4.roofGlass)),
    line('Sunroof', yesNo(step4.roofSunroof)),
    line('Ekstra', step4.extra || '-')
  ]);

  const contactSection = renderSection('İletişim Bilgileri', [
    line('Ad Soyad', step5.fullName || '-'),
    line('Şehir', step5.city || '-'),
    line('Telefon', step5.phone || '-')
  ]);

  const text = ['Yeni Araç Satış Talebi', vehicleSection, kaportaSection, extraSection, contactSection].join('\n\n');
  return { text, html: textToHtml(text) };
}

export function formatCallMeMail(payload: any) {
  const contact = payload?.contact ?? {};
  const listingSection = renderSection('İlan Bilgileri', [
    line('İlan ID', payload?.listingId ? String(payload.listingId) : '-'),
    line('Başlık', payload?.listingTitle || '-'),
    line('Fiyat', formatNumber(payload?.listingPrice, ' TL')),
    line('Şehir', payload?.listingCity || '-')
  ]);

  const contactSection = renderSection('İletişim Bilgileri', [
    line('Ad', contact.firstName || '-'),
    line('Soyad', contact.lastName || '-'),
    line('Telefon', contact.phone || '-'),
    line('E-posta', contact.email || '-')
  ]);

  const requestSection = renderSection('Talep Detayı', [
    line('Konu', payload?.topic || '-'),
    line('Mesaj', payload?.message || '-'),
    line('Tarih', payload?.createdAt || '-')
  ]);

  const text = ['Yeni Sizi Arayalım Talebi', listingSection, contactSection, requestSection].join('\n\n');
  return { text, html: textToHtml(text) };
}
