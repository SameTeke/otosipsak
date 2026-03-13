function normalizePlateChars(value: string) {
  return value
    .toLocaleUpperCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

export function formatTurkishPlateInput(value: string) {
  const normalized = normalizePlateChars(value);
  const digits = normalized.replace(/[A-Z]/g, '');
  const letters = normalized.replace(/\d/g, '').slice(0, 3);

  const cityCode = digits.slice(0, 2);
  const serial = digits.slice(2, 6);

  return [cityCode, letters, serial].filter(Boolean).join(' ').trim();
}

export function isValidTurkishPlate(value: string) {
  return /^\d{2}\s[A-Z]{1,3}\s\d{1,4}$/.test(formatTurkishPlateInput(value));
}
