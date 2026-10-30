import NepaliDate from 'nepali-date-converter';

export function getBikramSambatDate(date = new Date()) {
  const bsDate = NepaliDate.fromAD(date);
  const year = bsDate.getYear();
  const month = bsDate.getMonth();
  const day = bsDate.getDate();

  return {
    year,
    month,
    day,
    monthName: bsDate.format('MMMM'),
    formatted: bsDate.format('DD MMMM YYYY'),
    numeric: bsDate.format('YYYY/MM/DD'),
  };
}

export function formatSystemDate(value, options = {}) {
  if (!value) return '-';

  const date = value instanceof Date
    ? value
    : /^\d{4}-\d{2}-\d{2}$/.test(String(value))
      ? new Date(`${value}T12:00:00`)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  if (localStorage.getItem('mediking_date_system') === 'BS') {
    const bsDate = NepaliDate.fromAD(date);
    return options.weekday
      ? bsDate.format('ddd, DD MMMM YYYY')
      : bsDate.format('DD MMMM YYYY');
  }

  return date.toLocaleDateString('en-GB', options);
}

export function toAdDateString(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

export function toBsDateString(adDate) {
  if (!adDate) return '';
  const date = new Date(`${String(adDate).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return NepaliDate.fromAD(date).format('YYYY/MM/DD');
}

export function toAdDateFromBs(bsDate) {
  const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(bsDate);
  if (!match) return null;

  try {
    const nepaliDate = new NepaliDate(bsDate);
    if (nepaliDate.format('YYYY/MM/DD') !== bsDate) return null;
    return toAdDateString(nepaliDate.toJsDate());
  } catch {
    return null;
  }
}
