'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface GoldPriceData {
  price?: number;
}

interface HijriDateData {
  hijri?: string;
}

export default function Home() {
  const [goldPrice, setGoldPrice] = useState<number>(92.45);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { user, signOut } = useAuth();

  const updateHijriDate = async () => {
    // Vérifier le cache d'abord
    const today = new Date().toDateString();
    const cachedDate = localStorage.getItem('hijri_date_cache');
    const cachedTimestamp = localStorage.getItem('hijri_date_timestamp');

    if (cachedDate && cachedTimestamp && cachedTimestamp === today) {
      const parsedCache = JSON.parse(cachedDate);
      setHijriDate(parsedCache.formatted);
      return;
    }

    try {
      const res = await fetch("https://dypkjnewrldcnpsegwxo.functions.supabase.co/hijri-date", {
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""}`
        }
      });
      const data: HijriDateData = await res.json();

      if (data.hijri) {
        setHijriDate(data.hijri);

        // Sauver en cache avec l'objet parsé de l'API pour cohérence
        try {
          const { parseHijriDateString } = await import('@/lib/hijri-utils');
          const parsedHijriObject = parseHijriDateString(data.hijri);
          const cacheData = {
            formatted: data.hijri,
            object: parsedHijriObject
          };
          localStorage.setItem('hijri_date_cache', JSON.stringify(cacheData));
          localStorage.setItem('hijri_date_timestamp', today);
        } catch (parseError) {
          console.error('Erreur parsing date hégirienne:', parseError);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la date hijri:', error);
      // Fallback vers notre calcul local seulement si l'API échoue
      try {
        const { getCurrentHijriDate, formatHijriDate } = await import('@/lib/hijri-utils');
        const currentHijri = getCurrentHijriDate();
        const formattedDate = formatHijriDate(currentHijri);
        setHijriDate(formattedDate);
      } catch (localError) {
        console.error('Erreur calcul date hégirienne locale:', localError);
        setHijriDate('Date non disponible');
      }
    }
  };

  const updateData = async () => {
    // Vérifier le cache d'abord
    const today = new Date().toDateString();
    const cachedPrice = localStorage.getItem('gold_price_cache');
    const cachedTimestamp = localStorage.getItem('gold_price_timestamp');

    if (cachedPrice && cachedTimestamp && cachedTimestamp === today) {
      const price = parseFloat(cachedPrice);
      setGoldPrice(price);
      setIsLoading(false);
      return;
    }

    try {
      // Utiliser un timeout pour éviter les appels trop longs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch('https://dypkjnewrldcnpsegwxo.supabase.co/functions/v1/gold-price', {
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""}`
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Lancer les deux appels en parallèle
    updateData();
    updateHijriDate();

    // Marquer comme chargé après un délai minimal pour éviter le flash
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const nissabGrams = 85;
  const nissab = (goldPrice * nissabGrams).toFixed(2);

  return (
    <div className="main-container">
      {/* Header */}
      <div className="header">
        <div className="site-title">
          MON RAPPEL ZAKAT
        </div>
        {user && (
          <button
            className="btn btn-outline-light btn-sm"
            onClick={signOut}
            style={{ fontSize: '14px' }}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            Déconnexion
          </button>
        )}
      </div>

      {/* Zone de contenu */}
      <div className="content-area">
        {/* Carte de date */}
        <div className="date-card">
          {/* Section date */}
          <div className="date-section">
            <div className="date-title">Aujourd&apos;hui, nous sommes le</div>
            <div className="hijri-date">
              {hijriDate || (
                <span style={{ opacity: 0.6 }}>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Calcul en cours...
                </span>
              )}
            </div>
          </div>

          {/* Section informations */}
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

        <button
          className="toggle-info-btn"
          type="button"
          onClick={() => setShowInfo(!showInfo)}
        >
          <i className="fas fa-info-circle me-2"></i>
          Comprendre la Zakat et le Nissab
        </button>

        {showInfo && (
          <div className="info-text-card">
            <p>La <b>Zakat</b>, l&apos;un des cinq piliers de l&apos;Islam, est une obligation religieuse pour tout
              musulman dont les biens atteignent un seuil minimal appelé <b>Nissab</b>, généralement calculé
              sur la base de la valeur de l&apos;or. Elle a pour objectif de purifier les biens du croyant et de
              contribuer à une redistribution juste des richesses en faveur des plus démunis. Grâce à notre
              site, vous pouvez estimer facilement la valeur actuelle du Nissab selon le cours de l&apos;or, et
              savoir ainsi si vous êtes redevable de cette aumône purificatrice. Mieux encore, vous pouvez
              recevoir un rappel gratuit à la date exacte où vous devez vous acquitter de votre Zakat.</p>
          </div>
        )}

        {user ? (
          <Link href="/dashboard">
            <button className="remind-btn">
              <i className="fas fa-tachometer-alt me-2"></i>
              Accéder à mon tableau de bord
            </button>
          </Link>
        ) : (
          <Link href="/login">
            <button className="remind-btn">
              <i className="fas fa-bell me-2"></i>
              Recevoir un rappel !
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}