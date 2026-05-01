let HijriDate: any = null;

export interface HijriDateObject {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameAr: string;
}

export interface GregorianDateObject {
  year: number;
  month: number;
  day: number;
}

// Noms des mois hégiriens en français et arabe
export const HIJRI_MONTHS = [
  { fr: 'Mouharram', ar: 'محرم' },
  { fr: 'Safar', ar: 'صفر' },
  { fr: 'Rabi Al Awwal', ar: 'ربيع الأول' },
  { fr: 'Rabi Al Thani', ar: 'ربيع الثاني' },
  { fr: 'Joumada Al Awwal', ar: 'جمادى الأولى' },
  { fr: 'Joumada Al Thani', ar: 'جمادى الثانية' },
  { fr: 'Rajab', ar: 'رجب' },
  { fr: 'Chaaban', ar: 'شعبان' },
  { fr: 'Ramadan', ar: 'رمضان' },
  { fr: 'Chawwal', ar: 'شوال' },
  { fr: 'Dhou Al Qaada', ar: 'ذو القعدة' },
  { fr: 'Dhou Al Hijja', ar: 'ذو الحجة' },
];

// Convertir une date grégorienne vers hégirienne
export function gregorianToHijri(gregorianDate: Date): HijriDateObject {
  // Utiliser directement notre algorithme intégré (plus fiable que la librairie externe)
  return getApproximateHijriDate(gregorianDate);
}

// Algorithme de conversion grégorien vers hégirien (basé sur le calendrier islamique tabulaire)
function getApproximateHijriDate(gregorianDate: Date): HijriDateObject {
  // Convertir la date grégorienne en Julian Day Number
  const jd = gregorianToJulianDay(gregorianDate);

  // Époque islamique en Julian Day Number (16 juillet 622 CE = JD 1948440)
  const islamicEpochJD = 1948440;

  // Jours depuis l'époque islamique
  const daysSinceEpoch = jd - islamicEpochJD;

  // Calcul de l'année hégirienne en utilisant la formule du calendrier islamique tabulaire
  // 1 cycle islamique = 30 ans = 10631 jours
  const islamicCycleDays = 10631;
  const islamicCycleYears = 30;

  const completeCycles = Math.floor(daysSinceEpoch / islamicCycleDays);
  const remainingDaysInCycle = daysSinceEpoch - (completeCycles * islamicCycleDays);

  // Années bissextiles dans le cycle de 30 ans (algorithme Kuwaiti)
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];

  let yearInCycle = 1;
  let remainingDays = remainingDaysInCycle;

  // Trouver l'année dans le cycle
  while (yearInCycle <= 30 && remainingDays >= 0) {
    const isLeapYear = leapYears.includes(yearInCycle);
    const daysInYear = isLeapYear ? 355 : 354;

    if (remainingDays >= daysInYear) {
      remainingDays -= daysInYear;
      yearInCycle++;
    } else {
      break;
    }
  }

  const hijriYear = (completeCycles * islamicCycleYears) + yearInCycle;

  // Calcul du mois et du jour
  const isCurrentYearLeap = leapYears.includes(yearInCycle);
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, isCurrentYearLeap ? 30 : 29];

  let hijriMonth = 1;
  let hijriDay = remainingDays + 1;

  for (let month = 0; month < 12; month++) {
    if (hijriDay > monthLengths[month]) {
      hijriDay -= monthLengths[month];
      hijriMonth++;
    } else {
      break;
    }
  }

  return {
    year: hijriYear,
    month: hijriMonth,
    day: hijriDay,
    monthName: HIJRI_MONTHS[hijriMonth - 1]?.fr || 'Mouharram',
    monthNameAr: HIJRI_MONTHS[hijriMonth - 1]?.ar || 'محرم',
  };
}

// Fonction utilitaire pour convertir une date grégorienne en Julian Day Number
function gregorianToJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const day = date.getDate();

  let a = Math.floor((14 - month) / 12);
  let y = year - a;
  let m = month + 12 * a - 3;

  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
}

// Convertir une date hégirienne vers grégorienne
export function hijriToGregorian(hijriYear: number, hijriMonth: number, hijriDay: number): Date {
  // Utiliser directement notre algorithme intégré (plus fiable que la librairie externe)
  return getApproximateGregorianDate(hijriYear, hijriMonth, hijriDay);
}

// Algorithme de conversion hégirien vers grégorien (cohérent avec l'algorithme inverse)
function getApproximateGregorianDate(hijriYear: number, hijriMonth: number, hijriDay: number): Date {
  // Vérifications d'entrée
  hijriYear = Math.max(1, Math.floor(hijriYear));
  hijriMonth = Math.max(1, Math.min(12, Math.floor(hijriMonth)));
  hijriDay = Math.max(1, Math.min(30, Math.floor(hijriDay)));

  // Époque islamique en Julian Day Number (16 juillet 622 CE = JD 1948440)
  const islamicEpochJD = 1948440;

  // Calculer le cycle et l'année dans le cycle
  const completeCycles = Math.floor((hijriYear - 1) / 30);
  const yearInCycle = ((hijriYear - 1) % 30) + 1;

  // Années bissextiles dans le cycle de 30 ans (algorithme Kuwaiti)
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];

  // Calculer les jours depuis l'époque jusqu'au début de l'année courante
  let totalDays = completeCycles * 10631; // 10631 jours par cycle de 30 ans

  // Ajouter les jours des années dans le cycle actuel
  for (let year = 1; year < yearInCycle; year++) {
    const isLeapYear = leapYears.includes(year);
    totalDays += isLeapYear ? 355 : 354;
  }

  // Ajouter les jours des mois de l'année courante
  const isCurrentYearLeap = leapYears.includes(yearInCycle);
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, isCurrentYearLeap ? 30 : 29];

  for (let month = 1; month < hijriMonth; month++) {
    totalDays += monthLengths[month - 1];
  }

  // Ajouter les jours du mois courant
  totalDays += hijriDay - 1;

  // Convertir en Julian Day Number
  const jd = islamicEpochJD + totalDays;

  // Convertir Julian Day Number vers date grégorienne
  return julianDayToGregorian(jd);
}

// Fonction utilitaire pour convertir Julian Day Number vers date grégorienne
function julianDayToGregorian(jd: number): Date {
  const a = jd + 32044;
  const b = (4 * a + 3) / 146097;
  const c = a - (146097 * b) / 4;
  const d = (4 * c + 3) / 1461;
  const e = c - (1461 * d) / 4;
  const m = (5 * e + 2) / 153;

  const day = e - (153 * m + 2) / 5 + 1;
  const month = m + 3 - 12 * (m / 10);
  const year = 100 * b + d - 4800 + m / 10;

  return new Date(Math.floor(year), Math.floor(month) - 1, Math.floor(day));
}

// Formater une date hégirienne
export function formatHijriDate(hijriDate: HijriDateObject): string {
  return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}`;
}

// Formater une date hégirienne en arabe
export function formatHijriDateArabic(hijriDate: HijriDateObject): string {
  return `${hijriDate.day} ${hijriDate.monthNameAr} ${hijriDate.year}`;
}

// Parser une date hégirienne depuis un string API (ex: "6 Rabi Al Awwal 1448")
export function parseHijriDateString(hijriString: string): HijriDateObject | null {
  try {
    // Format attendu: "6 Rabi Al Awwal 1448" ou "6 ربيع الأول 1448"
    const parts = hijriString.trim().split(' ');
    if (parts.length < 3) return null;

    const day = parseInt(parts[0]);
    const year = parseInt(parts[parts.length - 1]);

    // Trouver le mois en cherchant dans notre tableau HIJRI_MONTHS
    const monthPart = parts.slice(1, -1).join(' ');
    let month = -1;

    for (let i = 0; i < HIJRI_MONTHS.length; i++) {
      if (HIJRI_MONTHS[i].fr === monthPart || HIJRI_MONTHS[i].ar === monthPart) {
        month = i + 1;
        break;
      }
    }

    if (month === -1 || isNaN(day) || isNaN(year)) return null;

    return {
      year,
      month,
      day,
      monthName: HIJRI_MONTHS[month - 1].fr,
      monthNameAr: HIJRI_MONTHS[month - 1].ar,
    };
  } catch (error) {
    console.error('Erreur lors du parsing de la date hégirienne:', error);
    return null;
  }
}

// Obtenir la date hégirienne actuelle
export function getCurrentHijriDate(): HijriDateObject {
  return gregorianToHijri(new Date());
}

// Obtenir la date hégirienne dans 1 an (basé sur une date donnée ou l'actuelle)
export function getNextYearHijriDate(fromDate?: HijriDateObject): HijriDateObject {
  const current = fromDate || getCurrentHijriDate();

  try {
    // Convertir vers grégorien, ajouter environ 355 jours (année hégirienne), puis reconvertir
    const gregorianDate = hijriToGregorian(current.year, current.month, current.day);

    // Ajouter 355 jours (année hégirienne moyenne avec marge)
    const nextYearGregorian = new Date(gregorianDate);
    nextYearGregorian.setDate(nextYearGregorian.getDate() + 355);

    // Reconvertir vers hégirien
    return gregorianToHijri(nextYearGregorian);
  } catch (error) {
    console.error('Erreur calcul +1 an hégirien:', error);
    // Fallback simple si le calcul échoue
    return {
      ...current,
      year: current.year + 1,
    };
  }
}

// Valider une date hégirienne
export function isValidHijriDate(year: number, month: number, day: number): boolean {
  try {
    if (year < 1 || year > 9999) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1) return false;

    // Vérifier le nombre de jours dans le mois
    const daysInMonth = getHijriDaysInMonth(year, month);
    return day <= daysInMonth;
  } catch {
    return false;
  }
}

// Obtenir le nombre de jours dans un mois hégirien
export function getHijriDaysInMonth(year: number, month: number): number {
  try {
    // Valider les entrées
    year = Math.max(1, Math.floor(year));
    month = Math.max(1, Math.min(12, Math.floor(month)));

    // Calculer le cycle et l'année dans le cycle
    const yearInCycle = ((year - 1) % 30) + 1;

    // Années bissextiles dans le cycle de 30 ans (algorithme Kuwaiti)
    const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
    const isLeapYear = leapYears.includes(yearInCycle);

    // Pattern standard des mois : alternance 30/29 jours
    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, isLeapYear ? 30 : 29];

    return monthLengths[month - 1];
  } catch {
    // Valeurs par défaut pour les mois hégiriens (alternance 30/29 jours)
    return month % 2 === 1 ? 30 : 29;
  }
}