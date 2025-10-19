export function formatCurrency(value: number, currency = 'EUR', locale = 'fr-FR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatNumber(value: number, locale = 'fr-FR') {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(value: string | Date, locale = 'fr-FR') {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}
