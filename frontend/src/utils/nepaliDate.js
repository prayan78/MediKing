// Approximate Nepali Bikram Sambat (B.S.) date utility
const nepaliMonths = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

export function getBikramSambatDate(date = new Date()) {
  // Approximate standard BS difference (+56 years, 8 months, 15 days roughly)
  // Reference: 2021-08-30 was Bhadra 14, 2078
  const refAD = new Date(2021, 7, 30); // 30 Aug 2021
  const refBSYear = 2078;
  const refBSMonth = 4; // Bhadra (0-indexed: Baisakh=0, Jestha=1, Ashadh=2, Shrawan=3, Bhadra=4)
  const refBSDay = 14;

  const diffTime = date.getTime() - refAD.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Approximate calculation
  let totalDays = refBSDay + diffDays;
  let year = refBSYear;
  let month = refBSMonth;

  while (totalDays > 30) {
    totalDays -= 30; // standard month avg
    month++;
    if (month >= 12) {
      month = 0;
      year++;
    }
  }

  while (totalDays <= 0) {
    totalDays += 30;
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
  }

  return {
    year,
    monthName: nepaliMonths[month] || 'Bhadra',
    day: Math.max(1, totalDays),
    formatted: `${nepaliMonths[month]?.toUpperCase() || 'BHADRA'} ${Math.max(1, totalDays)}, ${year}`,
  };
}

