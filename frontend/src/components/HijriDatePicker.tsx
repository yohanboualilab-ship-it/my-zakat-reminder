'use client';

import { useState, useEffect } from 'react';
import { 
  HIJRI_MONTHS, 
  getCurrentHijriDate, 
  getNextYearHijriDate, 
  isValidHijriDate, 
  getHijriDaysInMonth, 
  hijriToGregorian,
  formatHijriDate,
  HijriDateObject 
} from '@/lib/hijri-utils';

interface HijriDatePickerProps {
  value?: HijriDateObject;
  onChange: (hijriDate: HijriDateObject, gregorianDate: Date) => void;
  label?: string;
  placeholder?: string;
  minDate?: HijriDateObject;
  currentHijriDate?: HijriDateObject; // Date hégirienne actuelle depuis l'API
  className?: string;
}

export default function HijriDatePicker({ 
  value, 
  onChange, 
  label = "Date hégirienne",
  placeholder = "Date suggérée : Aujourd'hui + 1 an",
  minDate,
  currentHijriDate,
  className = ""
}: HijriDatePickerProps) {
  // Initialiser avec des valeurs par défaut sûres
  const getDefaultHijriDate = () => {
    try {
      // Utiliser la date hégirienne actuelle si disponible, sinon calculer
      if (currentHijriDate) {
        return getNextYearHijriDate(currentHijriDate);
      }
      return getNextYearHijriDate();
    } catch {
      return { year: 1447, month: 1, day: 1, monthName: 'Mouharram', monthNameAr: 'محرم' };
    }
  };

  const defaultDate = getDefaultHijriDate();
  const [selectedYear, setSelectedYear] = useState<number>(value?.year || defaultDate.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(value?.month || defaultDate.month);
  const [selectedDay, setSelectedDay] = useState<number>(value?.day || defaultDate.day);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Mettre à jour les valeurs internes quand la prop value change
  useEffect(() => {
    if (value) {
      setSelectedYear(value.year);
      setSelectedMonth(value.month);
      setSelectedDay(value.day);
    }
  }, [value]);

  // Re-calculer la date par défaut quand currentHijriDate change et qu'aucune valeur n'est fournie
  useEffect(() => {
    if (!value && currentHijriDate) {
      try {
        const defaultFromCurrent = getNextYearHijriDate(currentHijriDate);
        setSelectedYear(defaultFromCurrent.year);
        setSelectedMonth(defaultFromCurrent.month);
        setSelectedDay(defaultFromCurrent.day);
      } catch (error) {
        console.error('Erreur calcul date par défaut depuis API:', error);
      }
    }
  }, [currentHijriDate, value]);

  // Générer les années (année courante + 10 ans dans le futur)
  const getCurrentYear = () => {
    try {
      // Utiliser UNIQUEMENT la date passée en prop
      if (currentHijriDate) {
        return currentHijriDate.year;
      }
      // Sinon fallback vers une année par défaut
      return 1447;
    } catch {
      return 1447; // Année de fallback
    }
  };
  
  const currentHijriYear = getCurrentYear();
  const years = Array.from({ length: 11 }, (_, i) => currentHijriYear + i);

  // Générer les jours selon le mois sélectionné
  const daysInSelectedMonth = getHijriDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  // Valider et appeler onChange
  const handleDateChange = (newYear: number, newMonth: number, newDay: number) => {
    setError('');
    
    if (!isValidHijriDate(newYear, newMonth, newDay)) {
      setError('Date invalide');
      return;
    }

    // Vérifier la date minimale
    if (minDate) {
      const minTime = hijriToGregorian(minDate.year, minDate.month, minDate.day).getTime();
      const selectedTime = hijriToGregorian(newYear, newMonth, newDay).getTime();
      
      if (selectedTime < minTime) {
        setError('La date doit être postérieure à la date minimale');
        return;
      }
    }

    const hijriDate: HijriDateObject = {
      year: newYear,
      month: newMonth,
      day: newDay,
      monthName: HIJRI_MONTHS[newMonth - 1].fr,
      monthNameAr: HIJRI_MONTHS[newMonth - 1].ar,
    };

    const gregorianDate = hijriToGregorian(newYear, newMonth, newDay);
    onChange(hijriDate, gregorianDate);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    handleDateChange(year, selectedMonth, selectedDay);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    // Ajuster le jour si nécessaire
    const maxDays = getHijriDaysInMonth(selectedYear, month);
    const adjustedDay = Math.min(selectedDay, maxDays);
    setSelectedDay(adjustedDay);
    handleDateChange(selectedYear, month, adjustedDay);
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
    handleDateChange(selectedYear, selectedMonth, day);
  };

  const displayValue = value ? formatHijriDate(value) : placeholder;

  return (
    <div className={`hijri-date-picker ${className}`}>
      {label && (
        <label className="form-label d-flex align-items-center">
          <i className="fas fa-calendar-alt me-2" style={{ color: '#2c5530' }}></i>
          {label}
        </label>
      )}
      
      <div className="dropdown">
        <button
          className={`form-control text-start d-flex justify-content-between align-items-center ${error ? 'is-invalid' : ''}`}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          style={{ border: '1px solid #ced4da' }}
        >
          <span>{displayValue}</span>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: '#6c757d' }}></i>
        </button>

        {isOpen && (
          <div className="dropdown-menu show w-100 p-3" style={{ minWidth: '350px' }}>
            <div className="row g-2">
              {/* Sélection de l'année */}
              <div className="col-4">
                <label className="form-label small">Année H.</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Sélection du mois */}
              <div className="col-5">
                <label className="form-label small">Mois</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                >
                  {HIJRI_MONTHS.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month.fr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection du jour */}
              <div className="col-3">
                <label className="form-label small">Jour</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedDay}
                  onChange={(e) => handleDayChange(parseInt(e.target.value))}
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>


            {/* Bouton fermer */}
            <div className="mt-3 text-end">
              <button
                type="button"
                className="btn btn-sm"
                style={{ backgroundColor: '#2c5530', color: 'white' }}
                onClick={() => setIsOpen(false)}
              >
                <i className="fas fa-check me-1"></i>
                OK
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="invalid-feedback d-block">
          <i className="fas fa-exclamation-triangle me-1"></i>
          {error}
        </div>
      )}
    </div>
  );
}