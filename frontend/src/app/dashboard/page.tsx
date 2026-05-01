'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HijriDatePicker from '@/components/HijriDatePicker';
import { HijriDateObject, getCurrentHijriDate, getNextYearHijriDate, formatHijriDate } from '@/lib/hijri-utils';

interface GoldPriceData {
  price?: number;
}

interface HijriDateData {
  hijri?: string;
}

export default function Dashboard() {
  const [goldPrice, setGoldPrice] = useState<number>(92.45);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [currentHijriObject, setCurrentHijriObject] = useState<HijriDateObject | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Initialiser avec la date par défaut (aujourd'hui + 1 an hégirien basé sur l'API)
  const [selectedHijriDate, setSelectedHijriDate] = useState<HijriDateObject | null>(null);

  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  const updateHijriDate = async () => {
    // Vérifier le cache d'abord
    const today = new Date().toDateString();
    const cachedDate = localStorage.getItem('hijri_date_cache');
    const cachedTimestamp = localStorage.getItem('hijri_date_timestamp');

    if (cachedDate && cachedTimestamp && cachedTimestamp === today) {
      const parsedCache = JSON.parse(cachedDate);
      setHijriDate(parsedCache.formatted);
      setCurrentHijriObject(parsedCache.object);

      // Initialiser la date de rappel par défaut (même date + 1 an) depuis le cache
      if (!selectedHijriDate && parsedCache.object) {
        try {
          const nextYear = getNextYearHijriDate(parsedCache.object);
          setSelectedHijriDate(nextYear);
        } catch (error) {
          // Fallback simple si getNextYearHijriDate échoue
          const nextYear = {
            ...parsedCache.object,
            year: parsedCache.object.year + 1
          };
          setSelectedHijriDate(nextYear);
        }
      }

      return;
    }

    try {
      const res = await fetch("https://dypkjnewrldcnpsegwxo.functions.supabase.co/hijri-date", {
        headers: {
          "Authorization": "Bearer " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });
      const data: HijriDateData = await res.json();

      if (data.hijri) {
        setHijriDate(data.hijri);

        // Parser la date API pour créer l'objet HijriDateObject
        try {
          const { parseHijriDateString } = await import('@/lib/hijri-utils');
          const parsedHijriObject = parseHijriDateString(data.hijri);

          if (parsedHijriObject) {
            setCurrentHijriObject(parsedHijriObject);

            // Initialiser la date de rappel par défaut (même date + 1 an) si pas encore définie
            if (!selectedHijriDate) {
              try {
                const nextYear = getNextYearHijriDate(parsedHijriObject);
                setSelectedHijriDate(nextYear);
              } catch (error) {
                // Fallback simple si getNextYearHijriDate échoue
                const nextYear = {
                  ...parsedHijriObject,
                  year: parsedHijriObject.year + 1
                };
                setSelectedHijriDate(nextYear);
              }
            }

            // Sauver en cache
            const cacheData = {
              formatted: data.hijri,
              object: parsedHijriObject
            };
            localStorage.setItem('hijri_date_cache', JSON.stringify(cacheData));
            localStorage.setItem('hijri_date_timestamp', today);
          } else {
            // Fallback si le parsing échoue
            const currentHijri = getCurrentHijriDate();
            setCurrentHijriObject(currentHijri);
          }
        } catch (parseError) {
          console.error('Erreur parsing date hégirienne:', parseError);
          // Fallback si le parsing échoue
          const currentHijri = getCurrentHijriDate();
          setCurrentHijriObject(currentHijri);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la date hijri:', error);
      // Fallback vers notre calcul local seulement si l'API échoue
      try {
        const currentHijri = getCurrentHijriDate();
        const formatted = formatHijriDate(currentHijri);
        setHijriDate(formatted);
        setCurrentHijriObject(currentHijri);
      } catch (localError) {
        console.error('Erreur calcul date hégirienne locale:', localError);
        setHijriDate('Date non disponible');
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      // Lancer les appels API en arrière-plan sans bloquer l'affichage
      updateData();
      updateHijriDate();

      // Plus besoin d'initialiser la date grégorienne
    }
  }, [user]);

  const updateData = async () => {
    // Vérifier le cache d'abord
    const today = new Date().toDateString();
    const cachedPrice = localStorage.getItem('gold_price_cache');
    const cachedTimestamp = localStorage.getItem('gold_price_timestamp');

    if (cachedPrice && cachedTimestamp && cachedTimestamp === today) {
      const price = parseFloat(cachedPrice);
      setGoldPrice(price);
      return;
    }

    try {
      // Utiliser un timeout pour éviter les appels trop longs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch('https://dypkjnewrldcnpsegwxo.supabase.co/functions/v1/gold-price', {
        signal: controller.signal,
        headers: {
          "Authorization": "Bearer " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });

      clearTimeout(timeoutId);
      const data: GoldPriceData = await res.json();
      const price = data?.price ?? 92.45;

      // Mettre à jour et sauver en cache
      setGoldPrice(price);
      localStorage.setItem('gold_price_cache', price.toString());
      localStorage.setItem('gold_price_timestamp', today);
    } catch (error) {
      console.error("Erreur lors de la récupération du prix de l'or :", error);
      // Garder le prix par défaut sans le changer
    }
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHijriDate) {
      setMessage('Veuillez sélectionner une date de rappel.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // TODO: Implement reminder creation logic with Supabase
      console.log('Programmation du rappel pour:', {
        hijriDate: selectedHijriDate,
        user: user?.email,
      });

      setMessage(`Rappel programmé avec succès pour le ${formatHijriDate(selectedHijriDate)} ! Vous recevrez un email à cette date inshaAllah.`);
      setSelectedHijriDate(null);
    } catch (error) {
      setMessage('Erreur lors de la programmation du rappel.');
    } finally {
      setLoading(false);
    }
  };

  const handleHijriDateChange = (hijriDate: HijriDateObject) => {
    setSelectedHijriDate(hijriDate);
    setMessage(''); // Clear any previous messages
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="main-container">
        <div className="content-area">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2c5530' }}></i>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const nissabGrams = 85;
  const nissab = (goldPrice * nissabGrams).toFixed(2);

  return (
    <div className="main-container">
      {/* Header */}
      <div className="header">
        <Link href="/" className="home-link">
          <i className="fas fa-home"></i>
        </Link>
        <div className="site-title">
          Mon tableau de bord
        </div>
        <button onClick={handleSignOut} className="home-link" style={{ background: 'none', border: 'none' }}>
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>

      {/* Zone de contenu */}
      <div className="content-area">
        {/* Message de bienvenue */}
        <div className="date-card mb-4">
          <div className="date-section">
            <div className="date-title">
              <i className="fas fa-user-circle me-2"></i>
              Bienvenue, {user.email}
            </div>
            <p>Gérez votre rappel de zakat et suivez les informations importantes.</p>
          </div>
        </div>

        {/* Informations actuelles */}
        <div className="date-card">
          <div className="date-section">
            <div className="date-title">Informations actuelles</div>
            <div className="hijri-date mb-3">
              {hijriDate || (
                <span style={{ opacity: 0.6 }}>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Calcul en cours...
                </span>
              )}
            </div>
          </div>

          <div className="info-section">
            {/* Prix de l'or */}
            <div className="info-row">
              <div className="d-flex align-items-center">
                <div className="info-icon gold-icon">
                  <i className="fas fa-coins"></i>
                </div>
                <div className="info-content">
                  <span className="info-label">Prix de l&apos;or (pour 1g): </span>
                  <span className="info-value">{goldPrice} €</span>
                </div>
              </div>
            </div>

            {/* Nissab */}
            <div className="info-row">
              <div className="d-flex align-items-center">
                <div className="info-icon money-icon">
                  <i className="fas fa-hand-holding-usd"></i>
                </div>
                <div className="info-content">
                  <span className="info-label">Valeur du nissab:</span>
                  <span className="info-value">{nissab} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de rappel */}
        <div className="date-card mt-4">
          <div className="date-section">
            <div className="date-title">
              <i className="fas fa-calendar-alt me-2" style={{ color: '#2c5530' }}></i>
              Programmer un rappel Zakat
            </div>
            <p className="mb-4 text-muted">
              <i className="fas fa-info-circle me-2" style={{ color: '#2c5530' }}></i>
              <strong>Date par défaut :</strong> Dans 1 an à partir d&apos;aujourd&apos;hui.
              <br />
              <small>Vous pouvez modifier cette date selon vos besoins.</small>
            </p>

            <form onSubmit={handleReminderSubmit} className="mt-3">
              {message && (
                <div className={`alert ${message.includes('succès') ? 'alert-success' : 'alert-danger'}`}>
                  <i className={`fas ${message.includes('succès') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {message}
                </div>
              )}

              <div className="mb-4">
                <HijriDatePicker
                  value={selectedHijriDate || undefined}
                  onChange={handleHijriDateChange}
                  label="Date de rappel (calendrier hégirien)"
                  placeholder="Date par défaut : Dans 1 an"
                  minDate={currentHijriObject || undefined}
                  currentHijriDate={currentHijriObject || undefined}
                />
              </div>

              {selectedHijriDate && (
                <div className="alert alert-info mb-3">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Date sélectionnée :</strong><br />
                  <span className="me-3">
                    <i className="fas fa-moon me-1"></i>
                    {formatHijriDate(selectedHijriDate)}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="remind-btn"
                disabled={loading || !selectedHijriDate}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Programmation...
                  </>
                ) : (
                  <>
                    <i className="fas fa-bell me-2"></i>
                    Programmer le rappel
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}